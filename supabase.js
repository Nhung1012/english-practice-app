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

// ============================================================
// TUẦN 14–15 — ĐĂNG NHẬP (Supabase Auth, provider Google)
//
// ⚠️ NGUYÊN TẮC BẤT DI BẤT DỊCH: app phải dùng được KHÔNG CẦN đăng nhập.
// Không tính năng nào bị khoá sau đăng nhập. Đăng nhập chỉ là để dữ liệu
// theo được sang máy khác (tuần 16–17). Bắt đăng nhập từ đầu sẽ giết lượng
// người dùng vốn đã ít — mục 2.1 kế hoạch.
//
// ⚠️ Ở tuần này việc đăng nhập CHƯA đồng bộ dữ liệu. Sổ từ và lịch sử vẫn
// nằm nguyên trong localStorage. Tuyệt đối KHÔNG xoá localStorage ở đây.
// ============================================================

// Phiên hiện tại: null = đang ở chế độ khách. Chỉ đọc từ app.js.
let phienDangNhap = null;

function nguoiDungHienTai() {
  return phienDangNhap ? phienDangNhap.user : null;
}

// Tên hiển thị ngắn gọn cho nút tài khoản. Google trả về `name`/`full_name`
// tuỳ trường hợp; không có thì lấy phần trước @ của email.
function tenHienThi(user) {
  if (!user) return '';
  const m = user.user_metadata || {};
  return m.full_name || m.name || (user.email || '').split('@')[0] || 'Tài khoản';
}

function anhDaiDien(user) {
  const m = (user && user.user_metadata) || {};
  return m.avatar_url || m.picture || '';
}

async function dangNhapGoogle() {
  if (!supabaseClient) return { error: new Error('Chưa cấu hình Supabase') };
  // redirectTo dùng window.location.origin chứ KHÔNG viết cứng tên miền:
  // nhờ vậy chạy đúng ở cả localhost, bản preview của Vercel lẫn tên miền
  // thật, không phải sửa code mỗi lần đổi. Nhớ khai báo cả ba trong
  // Supabase → Authentication → URL Configuration → Redirect URLs.
  return supabaseClient.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin }
  });
}

async function dangXuat() {
  if (!supabaseClient) return;
  // KHÔNG đụng tới localStorage. Người dùng đăng xuất vẫn phải thấy nguyên
  // sổ từ và lịch sử của mình — đây là dữ liệu của máy, không phải của
  // tài khoản (ít nhất là cho tới tuần 17).
  await supabaseClient.auth.signOut();
}

// Tạo dòng `profiles` ở lần đăng nhập đầu tiên.
// Dùng upsert + ignoreDuplicates: chạy lại mỗi lần đăng nhập vẫn an toàn và
// KHÔNG ghi đè daily_goal / streak người dùng đã có.
async function taoHoSoNeuChua(user) {
  if (!supabaseClient || !user) return false;
  try {
    const { error } = await supabaseClient
      .from('profiles')
      .upsert({ id: user.id, display_name: tenHienThi(user) },
              { onConflict: 'id', ignoreDuplicates: true });
    if (error) throw error;
    return true;
  } catch (err) {
    // Không tạo được hồ sơ thì app vẫn phải chạy bình thường ở chế độ khách.
    console.warn('Chưa tạo được hồ sơ người dùng:', err.message || err);
    return false;
  }
}

// Theo dõi phiên. `onThayDoi` được gọi một lần lúc khởi động (với phiên đã
// khôi phục từ localStorage của thư viện supabase-js, hoặc null), rồi mỗi
// lần đăng nhập/đăng xuất.
async function khoiTaoAuth(onThayDoi) {
  if (!supabaseClient) { onThayDoi(null); return; }
  try {
    const { data } = await supabaseClient.auth.getSession();
    phienDangNhap = data ? data.session : null;
  } catch (err) {
    phienDangNhap = null;
  }
  onThayDoi(phienDangNhap);

  supabaseClient.auth.onAuthStateChange((sukien, phien) => {
    phienDangNhap = phien || null;
    onThayDoi(phienDangNhap);
  });
}

// ============================================================
// TUẦN 16 — GỘP DỮ LIỆU localStorage LÊN TÀI KHOẢN (một chiều, một lần)
//
// Mục đích: người dùng đã học ở chế độ khách nhiều tháng, đăng nhập xong mà
// sổ từ trống trơn thì họ tưởng mất dữ liệu và bỏ app — rủi ro "Cao" số 1 ở
// mục 9 kế hoạch. Đây cũng là cây cầu một chiều để tuần 17 có cái mà đồng bộ
// hai chiều.
//
// ⚠️ HÀM Ở ĐÂY KHÔNG ĐỌC VÀ KHÔNG XOÁ localStorage. Dữ liệu được app.js đọc
// rồi truyền vào dưới dạng mảng, kết quả trả về là con số. Tách như vậy để
// (a) phần gọi DB nằm gọn trong file này đúng quy ước ở đầu file, và (b) test
// kiểm được logic lọc/chuyển đổi mà không phải giả lập localStorage.
// ============================================================

const GOP_LO_INSERT = 500; // số dòng mỗi lệnh insert
const GOP_LO_KIEM_ID = 300; // số id mỗi lệnh kiểm tra tồn tại
const MODE_HOP_LE = new Set(['read', 'listen', 'quiz']); // khớp check của study_log

// Trả về Set các id CÒN TỒN TẠI trong bảng `content`.
//
// ⚠️ Vì sao bắt buộc phải có bước này: `study_log.content_id` và
// `vocab.source_content_id` đều là khoá ngoại trỏ tới `content(id)`, mà đối
// chiếu bảng sao lưu 27/7 cho thấy **178 id từng tồn tại nay đã bị xoá**.
// Người dùng học từ tháng 7 thì nhật ký của họ chắc chắn có id thuộc nhóm đó,
// và chỉ một dòng như vậy là **hỏng cả lệnh insert** — đúng vào tuần nguy hiểm
// nhất của lộ trình. `on delete set null` của vocab KHÔNG cứu được: nó chỉ chạy
// khi xoá, còn insert vẫn bị chặn như thường.
async function locIdConTonTai(ids) {
  const con = new Set();
  const canKiem = [...new Set(ids.filter(id => id !== null && id !== undefined && id !== ''))];
  for (let i = 0; i < canKiem.length; i += GOP_LO_KIEM_ID) {
    const lo = canKiem.slice(i, i + GOP_LO_KIEM_ID);
    const { data, error } = await supabaseClient.from('content').select('id').in('id', lo);
    if (error) throw error;
    (data || []).forEach(r => con.add(r.id));
  }
  return con;
}

// Chuyển mảng `ep:log` thành các dòng `study_log` hợp lệ.
// Trả về { dong, boQua } — `boQua` là số bản ghi bị loại, để báo lại cho người dùng.
function chuanBiDongLog(userId, nhatKy, conSong) {
  const dong = [];
  const daCo = new Set(); // chống trùng ngay trong chính mảng cục bộ
  let boQua = 0;

  nhatKy.forEach((e) => {
    if (!e || !conSong.has(e.content_id) || !MODE_HOP_LE.has(e.mode)) { boQua++; return; }

    // created_at là một phần của khoá chống trùng (user_id, content_id,
    // created_at). Bản ghi không có mốc thời gian đọc được thì vừa vô dụng cho
    // lịch sử lẫn thống kê, vừa phá khoá đó — nên loại hẳn thay vì bịa ngày.
    const moc = new Date(e.created_at);
    if (!e.created_at || isNaN(moc.getTime())) { boQua++; return; }
    const created_at = moc.toISOString();

    const khoa = `${e.content_id}|${created_at}`;
    if (daCo.has(khoa)) { boQua++; return; }
    daCo.add(khoa);

    dong.push({
      user_id: userId,
      content_id: e.content_id,
      mode: e.mode,
      score: typeof e.score === 'number' && isFinite(e.score) ? e.score : null,
      seconds: typeof e.seconds === 'number' && isFinite(e.seconds) ? e.seconds : null,
      created_at: created_at
    });
  });

  return { dong, boQua };
}

// Chuyển mảng `ep:vocab` thành các dòng `vocab` chưa có trên server.
// `daCoTrenServer` là Set các từ (đã lowercase) tài khoản này đang có.
function chuanBiDongVocab(userId, soTu, conSong, daCoTrenServer) {
  const dong = [];
  const daThem = new Set();
  let boQua = 0;

  soTu.forEach((v) => {
    const tu = String((v && v.word) || '').trim();
    if (!tu) { boQua++; return; }
    const khoa = tu.toLowerCase();
    // Đã có trên server thì GIỮ NGUYÊN bản trên server, không ghi đè. Người
    // dùng có thể đã ôn từ đó lên hộp 4 ở máy khác — đẩy bản box 1 của máy này
    // đè lên là xoá sạch tiến độ ôn tập của họ.
    if (daCoTrenServer.has(khoa) || daThem.has(khoa)) { boQua++; return; }
    daThem.add(khoa);

    const box = Math.min(5, Math.max(1, parseInt(v.box, 10) || 1)); // check (box between 1 and 5)
    dong.push({
      user_id: userId,
      word: tu,
      ipa: v.ipa || '',
      pos: v.pos || '',
      meaning_vi: v.meaning_vi || '',
      example: v.example || '',
      // Bài nguồn đã bị xoá thì để null (mất ngữ cảnh còn hơn mất cả từ).
      source_content_id: conSong.has(v.source_content_id) ? v.source_content_id : null,
      box: box,
      due_date: /^\d{4}-\d{2}-\d{2}$/.test(v.due_date) ? v.due_date : homNay(),
      created_at: v.created_at || new Date().toISOString()
    });
  });

  return { dong, boQua };
}

// Đẩy một lần dữ liệu khách lên tài khoản.
//
// CHẠY LẠI ĐƯỢC AN TOÀN — đây là yêu cầu bắt buộc, vì mạng có thể đứt giữa
// chừng: nhật ký dựa vào unique index uq_log_user_content_time + ignoreDuplicates,
// sổ từ dựa vào việc đọc trước danh sách từ đã có. Nhờ vậy lần chạy lại chỉ
// chèn đúng phần còn thiếu.
//
// Trả về { ok, soLuot, soTu, boQua } hoặc { ok: false, loi }.
async function gopDuLieuLenTaiKhoan(user, nhatKy, soTu) {
  if (!supabaseClient || !user) return { ok: false, loi: 'chua-san-sang' };
  const log = Array.isArray(nhatKy) ? nhatKy : [];
  const vocab = Array.isArray(soTu) ? soTu : [];
  if (!log.length && !vocab.length) return { ok: true, soLuot: 0, soTu: 0, boQua: 0 };

  try {
    // Một lượt kiểm id dùng chung cho CẢ HAI bảng: cả content_id lẫn
    // source_content_id đều trỏ về content(id).
    const conSong = await locIdConTonTai([
      ...log.map(e => e && e.content_id),
      ...vocab.map(v => v && v.source_content_id)
    ]);

    const kqLog = chuanBiDongLog(user.id, log, conSong);
    for (let i = 0; i < kqLog.dong.length; i += GOP_LO_INSERT) {
      const { error } = await supabaseClient
        .from('study_log')
        .upsert(kqLog.dong.slice(i, i + GOP_LO_INSERT),
                { onConflict: 'user_id,content_id,created_at', ignoreDuplicates: true });
      if (error) throw error;
    }

    // ⚠️ Không dùng upsert cho vocab: ràng buộc unique của bảng là index BIỂU
    // THỨC `(user_id, lower(word))`, PostgREST không nhận được tên cột dạng đó.
    // Nên đọc trước rồi lọc ở client.
    const { data: daCo, error: loiDoc } = await supabaseClient
      .from('vocab').select('word').eq('user_id', user.id);
    if (loiDoc) throw loiDoc;
    const coRoi = new Set((daCo || []).map(r => String(r.word || '').toLowerCase()));

    const kqVocab = chuanBiDongVocab(user.id, vocab, conSong, coRoi);
    for (let i = 0; i < kqVocab.dong.length; i += GOP_LO_INSERT) {
      const { error } = await supabaseClient
        .from('vocab').insert(kqVocab.dong.slice(i, i + GOP_LO_INSERT));
      if (error) throw error;
    }

    return {
      ok: true,
      soLuot: kqLog.dong.length,
      soTu: kqVocab.dong.length,
      boQua: kqLog.boQua + kqVocab.boQua
    };
  } catch (err) {
    // Hỏng thì KHÔNG được coi là xong: app.js sẽ không đặt cờ, lần đăng nhập
    // sau tự thử lại. Dữ liệu gốc vẫn nguyên trong localStorage.
    console.warn('Chưa đưa được dữ liệu lên tài khoản:', err.message || err);
    return { ok: false, loi: err.message || String(err) };
  }
}
