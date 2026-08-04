// ============================================================
// supabase.js — cấu hình kết nối + MỌI hàm đọc dữ liệu từ Supabase.
// Tách khỏi index.html ngày 2026-08-04 (Giai đoạn 3).
//
// Nạp TRƯỚC app.js. Đây là script cổ điển (không phải module) nên các
// khai báo const/let ở cấp cao nhất nằm chung một phạm vi toàn cục với
// app.js — app.js dùng thẳng `supabaseClient`, không cần import/export.
//
// Tuần 13–17 (Auth + đồng bộ) sẽ thêm code vào ĐÂY, không phải app.js.
// ============================================================
// ====== CẤU HÌNH SUPABASE ======
// URL và anon key đều là thông tin CÔNG KHAI, an toàn để để trong frontend
// vì bảng "content" chỉ cho phép SELECT (xem supabase_schema.sql, policy
// "Public read access"). KHÔNG bao giờ đặt service_role key ở đây.
const SUPABASE_URL = "https://jlczlapfhqvfiktcpdwf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_KAmDWtIWM3CzA8xrDRu19A_5Xtf0A1u";

const supabaseClient = (SUPABASE_URL.includes("YOUR-PROJECT-REF") || !window.supabase)
  ? null
  : window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Dựng `currentItem` từ một bản ghi Supabase.
// Tách thành hàm riêng vì có HAI đường lấy bài (chọn theo id và random qua RPC).
// Trước đây mỗi đường tự dựng lấy, nên chỉ cần quên một chỗ là bài mở bằng
// đường kia sẽ mất bản dịch/quiz mà không báo lỗi gì.
//   - dialogue : bản dịch nằm trong từng phần tử lines[i].vi
//   - listening: bản dịch nằm ở mảng data.vi, xếp đúng thứ tự câu
// `quiz` dùng chung cho cả hai loại. Bài chưa soạn thì các trường này là null
// và giao diện tự ẩn nút — không báo lỗi (mục 14 kế hoạch).
function buildItem(row, type) {
  const d = row.data || {};
  const item = {
    id: row.id,
    topic: row.topic,
    quiz: Array.isArray(d.quiz) && d.quiz.length ? d.quiz : null
  };
  if (type === 'dialogue') {
    item.lines = d.lines;
  } else {
    item.text = d.text;
    item.vi = Array.isArray(d.vi) && d.vi.length ? d.vi : null;
  }
  return item;
}

// Lấy 1 bản ghi theo id, trả về đúng hình dạng của `currentItem` (luôn kèm id).
// Dùng chung cho cả "chọn chủ đề trong danh sách" lẫn "đổi chủ đề ngẫu nhiên".
async function fetchContentById(id, type) {
  const { data, error } = await supabaseClient
    .from('content')
    .select('id, topic, data')
    .eq('id', id)
    .single();
  if (error || !data) throw error || new Error('Không tìm thấy chủ đề');
  return buildItem(data, type);
}

// Lấy 1 bản ghi ngẫu nhiên từ Supabase qua RPC get_random_content
// (xem hàm trong supabase_schema.sql). Trả về null nếu lỗi/không cấu hình.
async function fetchFromSupabase(type, level) {
  if (!supabaseClient) return null;
  try {
    const { data, error } = await supabaseClient
      .rpc('get_random_content', { p_type: type, p_level: level });
    if (error) throw error;
    if (!data || data.length === 0) return null;
    const row = data[0];
    // Giữ lại `id` (trước đây bị bỏ mất) — không có nó thì không ghi được
    // nhật ký học và không biết bài nào đã xem để loại trừ.
    return buildItem(row, type);
  } catch (err) {
    console.warn('Không lấy được dữ liệu từ Supabase, dùng nội dung dự phòng:', err.message || err);
    return null;
  }
}

// Gemini đôi khi sinh trùng tên chủ đề giữa các lần chạy khác ngày (cùng
// type/level), nên danh sách có thể có 2 bản ghi khác id nhưng cùng tên
// chủ đề. Lọc bớt (so sánh không phân biệt hoa/thường), giữ bản đầu tiên.
function dedupeByTopic(options) {
  const seen = new Set();
  return options.filter((opt) => {
    const key = (opt.topic || '').trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function loadTopicOptions() {
  topicOptionsSession++;
  const mySession = topicOptionsSession;

  topicOptions = [];
  comboActive = -1;
  refreshComboIfOpen();

  if (!supabaseClient) return;
  try {
    const { data, error } = await supabaseClient
      .from('content')
      .select('id, topic')
      .eq('type', currentTab)
      .eq('level', currentLevel)
      .order('id', { ascending: true });
    // Nếu người dùng đã đổi tab/trình độ khác trong lúc chờ, bỏ qua kết quả này.
    if (mySession !== topicOptionsSession) return;
    if (error || !data) return;
    topicOptions = dedupeByTopic(
      data.map(row => ({ topic: row.topic, id: row.id, search: normalizeForSearch(row.topic) }))
    );
    refreshComboIfOpen();
  } catch (err) {
    console.warn('Không lấy được danh sách chủ đề từ Supabase:', err);
  }
}

// Nhật ký từ tuần 1 chỉ có content_id, chưa có tên bài. Gọi 1 lần lúc khởi động
// để lấp tên cho các id còn thiếu, nhờ vậy lịch sử hiện được ngay từ lần đầu.
async function backfillTitles() {
  if (!supabaseClient) return false;
  const titles = readJson(TITLE_KEY, {});
  const missing = [...new Set(readLog().map(e => e.content_id))]
    .filter(id => id && !titles[id])
    .slice(-60); // chỉ lấp các bài gần đây nhất, tránh query quá to
  if (!missing.length) return false;
  try {
    const { data, error } = await supabaseClient
      .from('content').select('id, topic, type, level').in('id', missing);
    if (error || !data) return false;
    data.forEach(r => { titles[r.id] = { topic: r.topic, type: r.type, level: r.level }; });
    writeJson(TITLE_KEY, titles);
    return true;
  } catch (err) {
    return false;
  }
}
