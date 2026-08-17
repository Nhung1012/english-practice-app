// ============================================================
// app.js — toàn bộ giao diện và logic phía trình duyệt.
// Tách khỏi index.html ngày 2026-08-04 (Giai đoạn 3). Nội dung giữ
// nguyên, chỉ chuyển chỗ; các hàm gọi Supabase nằm ở supabase.js.
//
// Nạp ở CUỐI <body> và KHÔNG dùng defer: file này chạy
// document.getElementById(...) ngay ở cấp cao nhất nên cần DOM có sẵn.
// ============================================================
// ====== STATE ======
// Toàn bộ nội dung lấy động từ Supabase — không còn dữ liệu fix cứng nào
// trong frontend. Nếu chưa kết nối được DB, app hiển thị thông báo lỗi
// thay vì dùng nội dung mẫu.
let currentTab = "dialogue";
let currentLevel = "beginner";
let currentItem = null;

// "Phiên đọc" hiện tại. Một số trình duyệt (đặc biệt Chrome) vẫn bắn ra
// sự kiện onend/onerror của câu đang đọc dở dù đã gọi speechSynthesis.cancel()
// khi utterance đang ở trạng thái pause — khiến vòng lặp đọc câu tiếp theo
// (speakNext) tiếp tục chạy ngầm dù người dùng đã đổi chủ đề/trình độ/tab.
// Dùng số phiên tăng dần để speakNext tự huỷ nếu không còn thuộc phiên hiện tại.
let speechSession = 0;

// ====== TRẠNG THÁI PHÁT (mục 1.1) ======
// Trước đây toàn bộ việc đọc nằm gọn trong closure của speakAll(), nên không
// có cách nào từ ngoài nhảy tới câu số N hay lặp lại một câu. Nay nâng lên
// biến ngoài để các nút ⏮ ⏭ 🔁 và nút ▶ ở từng dòng đều điều khiển được.
let sentences = [];      // [{ text, speaker, vi }] — nguồn dữ liệu chung cho cả render lẫn đọc
let currentIndex = 0;    // câu đang trỏ tới / đang đọc
let isPlaying = false;
let loopOne = false;     // 🔁 lặp lại mãi câu hiện tại cho tới khi bấm Dừng
const RATE_MIN = 0.6;    // dưới 0.6 nhiều giọng TTS bị méo và nuốt âm
const RATE_MAX = 1.2;
let playRate = 1;

// ====== GIAI ĐOẠN 2 ======
// 1.4 — chế độ song ngữ: hiện bản dịch dưới MỌI câu. Lựa chọn nhớ giữa các bài.
let bilingual = false;
// 2.5 — quiz: { câu số -> đáp án đã chọn }. `quizDone` = đã nộp bài, lúc đó
// khoá lựa chọn lại để người học không sửa đáp án sau khi đã thấy kết quả.
let quizAnswers = {};
let quizDone = false;

const modal = document.getElementById('modal');
const modalBackdrop = document.getElementById('modalBackdrop');
const modalTitle = document.getElementById('modalTitle');
const modalClose = document.getElementById('modalClose');
const paneHistory = document.getElementById('paneHistory');
const paneVocab = document.getElementById('paneVocab');
const vocabList = document.getElementById('vocabList');
const reviewPanel = document.getElementById('reviewPanel');
const reviewBtn = document.getElementById('reviewBtn');
const historyList = document.getElementById('historyList');
const resumeLine = document.getElementById('resumeLine');
const openHistoryBtn = document.getElementById('openHistoryBtn');
const openVocabBtn = document.getElementById('openVocabBtn');
const openHelpBtn = document.getElementById('openHelpBtn');
const paneHelp = document.getElementById('paneHelp');
const accBtn = document.getElementById('accBtn');
const accLabel = document.getElementById('accLabel');
const accAvatar = document.getElementById('accAvatar');
const paneAccount = document.getElementById('paneAccount');
const accGuest = document.getElementById('accGuest');
const accUser = document.getElementById('accUser');
const accEmail = document.getElementById('accEmail');
const accSigninBtn = document.getElementById('accSigninBtn');
const accSignoutBtn = document.getElementById('accSignoutBtn');
const accSync = document.getElementById('accSync');
const signinBar = document.getElementById('signinBar');
const signinCount = document.getElementById('signinCount');
const signinBarBtn = document.getElementById('signinBarBtn');
const signinBarClose = document.getElementById('signinBarClose');
const favBtn = document.getElementById('favBtn');
const favFilterBtn = document.getElementById('favFilterBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const loopBtn = document.getElementById('loopBtn');
const rateRange = document.getElementById('rateRange');
const rateValue = document.getElementById('rateValue');
const topicText = document.getElementById('topicText');
const scriptBox = document.getElementById('scriptBox');
const scriptLabel = document.getElementById('scriptLabel');
const biBtn = document.getElementById('biBtn');
const quizCard = document.getElementById('quizCard');
const quizBox = document.getElementById('quizBox');
const quizSubmitBtn = document.getElementById('quizSubmitBtn');
const quizResetBtn = document.getElementById('quizResetBtn');
const quizScore = document.getElementById('quizScore');
const statusText = document.getElementById('statusText');
const randomBtn = document.getElementById('randomBtn');
const playBtn = document.getElementById('playBtn');
const topicCombo = document.getElementById('topicCombo');
const topicSearch = document.getElementById('topicSearch');
const topicSearchClear = document.getElementById('topicSearchClear');
const topicCaret = document.getElementById('topicCaret');
const topicPanel = document.getElementById('topicPanel');
const topicListbox = document.getElementById('topicListbox');
const topicCount = document.getElementById('topicCount');

function setStatus(msg, isError) {
  statusText.textContent = msg;
  statusText.classList.toggle('error', !!isError);
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

// ====== GIỌNG ĐỌC NAM (Người A) / NỮ (Người B) ======
// Web Speech API không cho chọn "giới tính" trực tiếp, nên cố gắng tìm 2
// giọng tiếng Anh khác nhau theo tên (từ khoá Male/Female hoặc tên riêng
// quen thuộc của các giọng có sẵn trên Windows/macOS/Chrome). Đồng thời
// luôn chỉnh thêm pitch (cao độ) khác nhau giữa A/B để đảm bảo 2 người luôn
// nghe khác nhau, kể cả khi máy không có sẵn giọng nam/nữ riêng biệt.
let maleVoice = null;
let femaleVoice = null;

function loadVoicesAsync() {
  return new Promise((resolve) => {
    const existing = window.speechSynthesis.getVoices();
    if (existing.length) { resolve(existing); return; }
    window.speechSynthesis.onvoiceschanged = () => {
      resolve(window.speechSynthesis.getVoices());
    };
    // Phòng khi trình duyệt không bắn sự kiện voiceschanged
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 1500);
  });
}

async function initVoices() {
  const voices = await loadVoicesAsync();
  const enVoices = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('en'));
  const pool = enVoices.length ? enVoices : voices;
  if (!pool.length) return;

  const maleKeywords = ['male', 'man', 'david', 'mark', 'daniel', 'guy', 'fred', 'alex', 'tom', 'james'];
  const femaleKeywords = ['female', 'woman', 'zira', 'samantha', 'susan', 'victoria', 'karen', 'moira', 'tessa', 'fiona'];

  maleVoice = pool.find(v => maleKeywords.some(k => v.name.toLowerCase().includes(k))) || null;
  femaleVoice = pool.find(v => v !== maleVoice && femaleKeywords.some(k => v.name.toLowerCase().includes(k))) || null;

  // Không tìm được giọng khớp tên (nhiều máy chỉ có 1-2 giọng không rõ giới
  // tính) → lấy tạm 2 giọng khác nhau trong danh sách, vẫn phân biệt được
  // A/B nhờ pitch bên dưới.
  if (!maleVoice) maleVoice = pool[0];
  if (!femaleVoice) femaleVoice = pool.find(v => v !== maleVoice) || pool[0];
}
initVoices();

function getSpeakerVoiceSettings(speaker) {
  if (speaker === 'A') return { voice: maleVoice, pitch: 0.85 };
  if (speaker === 'B') return { voice: femaleVoice, pitch: 1.25 };
  return { voice: null, pitch: 1 };
}

// ====== DANH SÁCH CHỦ ĐỀ ĐỂ CHỌN TRỰC TIẾP ======
// Danh sách chủ đề lấy hoàn toàn từ Supabase theo đúng tab + trình độ
// đang chọn, để người dùng chọn thẳng thay vì chỉ random.
let topicOptions = [];
let topicOptionsSession = 0;
// Từ khoá đang lọc trong ô tìm kiếm (đã chuẩn hoá).
let topicQuery = '';

// Chuẩn hoá chuỗi để tìm kiếm "dễ tính": bỏ dấu tiếng Việt, đưa về chữ
// thường, gộp khoảng trắng. Nhờ vậy gõ "ve may bay" vẫn ra "vé máy bay",
// và gõ "Sức Khỏe" hay "suc khoe" đều tìm được như nhau.
function normalizeForSearch(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // bỏ dấu thanh + dấu mũ
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

// Khớp khi TẤT CẢ các từ trong ô tìm kiếm đều xuất hiện trong tên chủ đề
// (không cần đúng thứ tự). Vd "ve bay" khớp "Hỏi cách đổi vé máy bay".
function matchTopic(normalizedTopic, terms) {
  return terms.every(term => normalizedTopic.includes(term));
}

// Trả về danh sách chủ đề khớp từ khoá hiện tại. Kết quả có thêm `html` —
// tên chủ đề đã bôi vàng (<mark>) đúng đoạn khớp để mắt bắt nhanh hơn.
function getFilteredTopics() {
  const terms = topicQuery ? topicQuery.split(' ').filter(Boolean) : [];
  const result = [];
  topicOptions.forEach((opt) => {
    if (!terms.length || matchTopic(opt.search, terms)) result.push(opt);
  });
  return result;
}

// Bôi vàng các đoạn khớp. So khớp trên chuỗi đã bỏ dấu nhưng cắt trên chuỗi
// gốc — hai chuỗi cùng độ dài vì normalize chỉ đổi ký tự 1-1 (bỏ dấu, đổi đ→d).
function highlightTopic(opt, terms) {
  if (!terms.length || opt.search.length !== opt.topic.length) return escapeHtml(opt.topic);
  const marks = new Array(opt.topic.length).fill(false);
  terms.forEach((term) => {
    let from = 0, at;
    while ((at = opt.search.indexOf(term, from)) !== -1) {
      for (let i = at; i < at + term.length; i++) marks[i] = true;
      from = at + 1;
    }
  });
  let html = '', open = false;
  for (let i = 0; i < opt.topic.length; i++) {
    if (marks[i] && !open) { html += '<mark>'; open = true; }
    if (!marks[i] && open) { html += '</mark>'; open = false; }
    html += escapeHtml(opt.topic[i]);
  }
  return open ? html + '</mark>' : html;
}

// ---- Trạng thái của combobox ----
let comboOpen = false;
let comboFiltered = [];   // danh sách đang hiển thị
let comboActive = -1;     // dòng đang được đánh dấu (điều hướng bằng phím)

function renderTopicList() {
  const terms = topicQuery ? topicQuery.split(' ').filter(Boolean) : [];
  comboFiltered = getFilteredTopics();

  const currentTopic = currentItem ? currentItem.topic : null;
  if (comboActive >= comboFiltered.length) comboActive = comboFiltered.length - 1;
  // Chưa điều hướng bằng phím → tự đánh dấu chủ đề đang mở (nếu còn trong
  // danh sách), để mở ra là thấy ngay mình đang ở đâu.
  if (comboActive < 0 && currentTopic) {
    comboActive = comboFiltered.findIndex(opt => opt.topic === currentTopic);
  }

  if (!topicOptions.length) {
    topicListbox.innerHTML = '<li class="tc-empty">Đang tải danh sách chủ đề...</li>';
  } else if (!comboFiltered.length) {
    topicListbox.innerHTML = '<li class="tc-empty">Không tìm thấy chủ đề nào.<br>Thử từ khoá ngắn hơn nhé.</li>';
  } else {
    topicListbox.innerHTML = comboFiltered.map((opt, i) => {
      const isCurrent = opt.topic === currentTopic;
      const cls = ['tc-item', i === comboActive ? 'active' : '', isCurrent ? 'current' : '']
        .filter(Boolean).join(' ');
      return `<li class="${cls}" role="option" data-i="${i}" id="tc-opt-${i}"`
        + ` aria-selected="${isCurrent}">`
        + `<span class="tc-check">${isCurrent ? '✓' : ''}</span>`
        + `<span>${highlightTopic(opt, terms)}</span></li>`;
    }).join('');
  }

  topicSearch.setAttribute('aria-activedescendant',
    comboActive >= 0 && comboFiltered.length ? `tc-opt-${comboActive}` : '');
  updateTopicCount(comboFiltered.length);
  scrollActiveIntoView();
}

function updateTopicCount(shownCount) {
  const total = topicOptions.length;
  if (!total) {
    topicCount.textContent = 'Đang tải...';
    topicCount.classList.remove('empty');
    return;
  }
  if (!topicQuery) {
    topicCount.textContent = `${total} chủ đề — gõ để tìm nhanh (không cần dấu)`;
    topicCount.classList.remove('empty');
    return;
  }
  topicCount.textContent = shownCount
    ? `Tìm thấy ${shownCount}/${total} chủ đề`
    : `Không có chủ đề nào khớp “${topicQuery}”`;
  topicCount.classList.toggle('empty', shownCount === 0);
}

function scrollActiveIntoView() {
  const el = topicListbox.querySelector('.tc-item.active');
  if (el) el.scrollIntoView({ block: 'nearest' });
}

function openCombo() {
  if (comboOpen) return;
  comboOpen = true;
  comboActive = -1;
  topicCombo.classList.add('open');
  topicPanel.hidden = false;
  topicSearch.setAttribute('aria-expanded', 'true');
  renderTopicList();
}

function closeCombo() {
  if (!comboOpen) return;
  comboOpen = false;
  topicCombo.classList.remove('open');
  topicPanel.hidden = true;
  topicSearch.setAttribute('aria-expanded', 'false');
  topicSearch.removeAttribute('aria-activedescendant');
  // Đóng lại thì bỏ luôn từ khoá, lần mở sau là danh sách đầy đủ.
  clearTopicQuery();
}

function clearTopicQuery() {
  topicSearch.value = '';
  topicQuery = '';
  topicSearchClear.hidden = true;
}

function applyTopicQuery(raw) {
  topicQuery = normalizeForSearch(raw);
  topicSearchClear.hidden = !raw;
  comboActive = raw ? 0 : -1;   // có từ khoá → sẵn sàng Enter chọn kết quả đầu
  openCombo();
  renderTopicList();
}

function moveComboActive(step) {
  if (!comboFiltered.length) return;
  const last = comboFiltered.length - 1;
  if (comboActive < 0) comboActive = step > 0 ? 0 : last;
  else comboActive = Math.min(last, Math.max(0, comboActive + step));
  renderTopicList();
}

function chooseComboItem(i) {
  const opt = comboFiltered[i];
  if (!opt) return;
  closeCombo();
  topicSearch.blur();
  loadSelectedTopic(opt);
}

// Danh sách vừa đổi (đổi tab/trình độ, hoặc tải xong) → vẽ lại nếu đang mở.
function refreshComboIfOpen() {
  if (comboOpen) renderTopicList();
}

// ====== NHẬT KÝ HỌC (localStorage) ======
// Ghi lại các bài đã mở để (a) "Đổi chủ đề" không random trúng bài cũ, và
// (b) làm sẵn dữ liệu cho tính năng "Lịch sử học" sau này.
//
// QUAN TRỌNG: hình dạng mỗi bản ghi được đặt TRÙNG ĐÚNG cột của bảng
// `study_log` trong Supabase (xem KE_HOACH_PHAT_TRIEN.md mục 10). Nhờ vậy khi
// làm tính năng đăng nhập, việc đẩy dữ liệu cũ lên tài khoản chỉ là insert
// thẳng mảng này, không phải viết hàm chuyển đổi. Đừng đổi tên trường.
const LOG_KEY = 'ep:log';
const LOG_MAX = 2000; // cắt bớt bản ghi cũ nhất để không làm phình localStorage

function readLog() {
  try {
    const raw = JSON.parse(localStorage.getItem(LOG_KEY));
    return Array.isArray(raw) ? raw : [];
  } catch (err) {
    return []; // localStorage bị chặn hoặc dữ liệu hỏng -> coi như chưa học gì
  }
}

function writeLog(entries) {
  try {
    localStorage.setItem(LOG_KEY, JSON.stringify(entries.slice(-LOG_MAX)));
  } catch (err) {
    // Hết dung lượng hoặc trình duyệt chặn: bỏ qua, app vẫn chạy bình thường.
  }
}

// mode: 'read' | 'listen' | 'quiz' — khớp ràng buộc check của bảng study_log.
// score: tỉ lệ đúng 0–1 cho bài quiz, null với các mode khác. Giữ đúng kiểu
// `numeric` của cột study_log.score để tuần 16 đẩy thẳng lên Supabase.
function logStudy(contentId, mode, score) {
  if (!contentId) return;
  const entries = readLog();
  entries.push({
    content_id: contentId,
    mode: mode || 'read',
    score: typeof score === 'number' && isFinite(score) ? score : null,
    seconds: null,
    created_at: new Date().toISOString()
  });
  writeLog(entries);
}

function getSeenIds() {
  return new Set(readLog().map(e => e.content_id));
}

// Chọn ngẫu nhiên 1 chủ đề CHƯA HỌC trong danh sách của tab/trình độ hiện tại.
// Trả về { opt, exhausted } — exhausted = true nghĩa là đã học hết, đang vào
// vòng ôn lại (lúc đó chỉ tránh lặp lại đúng bài đang mở).
function pickUnseenOption() {
  if (!topicOptions.length) return null;

  const seen = getSeenIds();
  const currentId = currentItem ? currentItem.id : null;

  let pool = topicOptions.filter(opt => !seen.has(opt.id) && opt.id !== currentId);
  let exhausted = false;

  if (!pool.length) {
    exhausted = true;
    pool = topicOptions.filter(opt => opt.id !== currentId);
    if (!pool.length) pool = topicOptions; // chỉ còn đúng 1 chủ đề ở mức này
  }

  return { opt: pool[Math.floor(Math.random() * pool.length)], exhausted };
}

// ====== LỊCH SỬ HỌC & ĐÁNH DẤU (mục 1.5) ======
// Hai kho lưu RIÊNG, cố ý không nhét thêm trường vào `ep:log`:
//  - ep:titles — bộ nhớ đệm tên bài { id: {topic, type, level} }, để vẽ lịch sử
//    tức thì không cần gọi mạng.
//  - ep:fav    — mảng id các chủ đề đã đánh dấu ⭐.
// Lý do tách: `ep:log` phải giữ đúng 5 cột của bảng study_log (mục 7 kế hoạch),
// thêm trường vào đó sẽ làm hỏng việc đẩy thẳng dữ liệu lên Supabase sau này.
const TITLE_KEY = 'ep:titles';
const FAV_KEY = 'ep:fav';
const TITLE_MAX = 600;

function readJson(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return v === null || v === undefined ? fallback : v;
  } catch (err) {
    return fallback;
  }
}

function writeJson(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (err) { /* bỏ qua */ }
}

function rememberTitle(id, topic, type, level) {
  if (!id || !topic) return;
  const titles = readJson(TITLE_KEY, {});
  titles[id] = { topic, type, level };
  const keys = Object.keys(titles);
  // Xoá bớt mục cũ nhất nếu vượt trần (chỉ là cache, mất cũng không sao).
  for (let i = 0; i < keys.length - TITLE_MAX; i++) delete titles[keys[i]];
  writeJson(TITLE_KEY, titles);
}

function isFav(id) {
  return readJson(FAV_KEY, []).indexOf(id) !== -1;
}

function toggleFav(id) {
  if (!id) return false;
  const favs = readJson(FAV_KEY, []);
  const i = favs.indexOf(id);
  if (i === -1) favs.push(id); else favs.splice(i, 1);
  writeJson(FAV_KEY, favs);
  return i === -1;
}

// Lịch sử = duyệt ngược nhật ký, mỗi bài chỉ lấy lần học GẦN NHẤT.
function getHistory(limit, logArr) {
  const titles = readJson(TITLE_KEY, {});
  const log = logArr || readLog();
  const seen = new Set();
  const out = [];
  for (let i = log.length - 1; i >= 0; i--) {
    const id = log[i].content_id;
    if (seen.has(id)) continue;
    seen.add(id);
    const meta = titles[id];
    if (!meta) continue; // chưa có tên trong cache -> để backfillTitles() bổ sung sau
    out.push({ id: id, topic: meta.topic, type: meta.type, level: meta.level, at: log[i].created_at });
    if (limit && out.length >= limit) break;
  }
  return out;
}

function getFavorites() {
  const titles = readJson(TITLE_KEY, {});
  return readJson(FAV_KEY, [])
    .map(id => titles[id] ? { id: id, topic: titles[id].topic, type: titles[id].type, level: titles[id].level } : null)
    .filter(Boolean)
    .reverse();
}

const LEVEL_LABEL = { beginner: 'Cơ bản', intermediate: 'Trung cấp', advanced: 'Nâng cao' };
const TYPE_ICON = { dialogue: '💬', listening: '🎙️' };

function timeAgo(iso) {
  const ms = Date.now() - new Date(iso).getTime();
  if (!isFinite(ms) || ms < 0) return '';
  const phut = Math.floor(ms / 60000);
  if (phut < 1) return 'vừa xong';
  if (phut < 60) return phut + ' phút trước';
  const gio = Math.floor(phut / 60);
  if (gio < 24) return gio + ' giờ trước';
  const ngay = Math.floor(gio / 24);
  if (ngay === 1) return 'hôm qua';
  if (ngay < 30) return ngay + ' ngày trước';
  return new Date(iso).toLocaleDateString('vi-VN');
}

// ====== SỔ TỪ VỰNG + ÔN TẬP NGẮT QUÃNG (mục 1.3) ======
// Mỗi mục có ĐÚNG các cột của bảng `vocab` trong Supabase (mục 10 kế hoạch),
// trừ `id`/`user_id` do DB tự sinh. Giữ nguyên tên trường để tuần 16 chỉ cần
// insert thẳng mảng này lên, không phải viết hàm chuyển đổi.
const VOCAB_KEY = 'ep:vocab';

// Hộp Leitner: nhớ -> lên hộp cao hơn, khoảng cách ôn giãn dần (ngày).
// Quên -> rơi thẳng về hộp 1, ôn lại ngay trong phiên.
const LEITNER_DAYS = [1, 3, 7, 14, 30];
const BOX_MAX = 5;

function homNay() {
  const d = new Date();
  // Dùng ngày theo giờ địa phương (không phải UTC) để "hôm nay" đúng với
  // cảm nhận của người học; định dạng YYYY-MM-DD khớp kiểu `date` của Postgres.
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function congNgay(soNgay) {
  const d = new Date();
  d.setDate(d.getDate() + soNgay);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function readVocab() {
  const v = readJson(VOCAB_KEY, []);
  return Array.isArray(v) ? v : [];
}

function writeVocab(list) {
  writeJson(VOCAB_KEY, list);
}

// DB có ràng buộc unique (user_id, lower(word)) nên ở đây cũng so khớp
// không phân biệt hoa/thường để không tạo hai mục trùng nhau.
function findVocab(word) {
  const w = String(word || '').toLowerCase();
  return readVocab().find(v => String(v.word).toLowerCase() === w) || null;
}

function isSaved(word) {
  return !!findVocab(word);
}

function saveWord(word, info, sourceId) {
  if (!word) return false;
  const list = readVocab();
  const w = String(word).toLowerCase();
  if (list.some(v => String(v.word).toLowerCase() === w)) return false;
  list.push({
    word: word,
    ipa: info && info.ipa ? info.ipa : '',
    pos: info && info.pos ? info.pos : '',
    meaning_vi: info && info.vi ? info.vi : '',
    example: info && info.example ? info.example : '',
    source_content_id: sourceId || null,
    box: 1,
    due_date: homNay(),   // lưu xong là ôn được ngay hôm nay
    created_at: new Date().toISOString()
  });
  writeVocab(list);
  return true;
}

function removeWord(word) {
  const w = String(word || '').toLowerCase();
  writeVocab(readVocab().filter(v => String(v.word).toLowerCase() !== w));
}

function dueWords() {
  const t = homNay();
  return readVocab().filter(v => !v.due_date || v.due_date <= t);
}

// Ngày đến hạn gần nhất trong tương lai (YYYY-MM-DD), hoặc '' nếu sổ trống.
// Dùng để trả lời câu hỏi "vậy khi nào tôi ôn tiếp?" ngay trong sổ từ.
function ngayOnGanNhat() {
  const ngay = readVocab().map(v => v.due_date).filter(Boolean).sort();
  return ngay.length ? ngay[0] : '';
}

// '2026-08-10' -> '10/08/2026'. Trả nguyên chuỗi nếu dữ liệu không đúng dạng.
function dinhDangNgay(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ''));
  return m ? `${m[3]}/${m[2]}/${m[1]}` : String(s || '');
}

// Chấm một từ sau khi ôn. remembered = true -> lên hộp, false -> về hộp 1.
function gradeWord(word, remembered) {
  const list = readVocab();
  const w = String(word || '').toLowerCase();
  const item = list.find(v => String(v.word).toLowerCase() === w);
  if (!item) return null;
  if (remembered) {
    item.box = Math.min(BOX_MAX, (item.box || 1) + 1);
    item.due_date = congNgay(LEITNER_DAYS[item.box - 1]);
  } else {
    item.box = 1;
    item.due_date = homNay(); // rơi về hộp 1 và ôn lại ngay trong phiên này
  }
  writeVocab(list);
  return item;
}

// ====== VẼ KHUNG LỊCH SỬ ======
// resumeTarget được chốt MỘT LẦN lúc khởi động, trước khi loadNewItem() mở bài
// ngẫu nhiên mới. Nếu không, "bài gần nhất" sẽ luôn là bài vừa tự mở ra và ô
// "Học tiếp" trở nên vô nghĩa.
let resumeTarget = null;
let favFilter = false;

// Hai danh sách này dài nên không nằm trong luồng chính nữa mà hiện trong
// popup chung. Màn hình chính chỉ giữ 2 nút mở + 1 dòng "Học tiếp".
let modalPane = null; // 'history' | 'vocab' | 'help' | 'account' | null

function openModal(pane) {
  modalPane = pane;
  paneHistory.hidden = pane !== 'history';
  paneVocab.hidden = pane !== 'vocab';
  paneHelp.hidden = pane !== 'help';
  paneAccount.hidden = pane !== 'account';
  modal.hidden = false;
  document.body.style.overflow = 'hidden'; // khoá cuộn nền khi popup đang mở
  // Ngăn các khung tĩnh mở kèm nút của Sổ từ / Lịch sử: cả favFilterBtn lẫn
  // reviewBtn đều nằm ở hàng tiêu đề dùng chung, closeModal() mới ẩn chúng.
  if (pane === 'history') renderHistory();
  else if (pane === 'vocab') renderVocab();
  else {
    favFilterBtn.hidden = true;
    reviewBtn.hidden = true;
    // Hai khung này là HTML tĩnh viết sẵn trong index.html, không sinh từ
    // dữ liệu, nên ở đây chỉ cần đặt tiêu đề.
    modalTitle.textContent = pane === 'account' ? 'Tài khoản' : 'Hướng dẫn nhanh';
  }
  modalClose.focus();
}

function closeModal() {
  modalPane = null;
  modal.hidden = true;
  document.body.style.overflow = '';
  favFilterBtn.hidden = true;
  reviewBtn.hidden = true;
  // Thoát popup thì dừng luôn phiên ôn đang dở, tránh việc quay lại thấy
  // hàng đợi cũ mà không nhớ mình đang ôn tới đâu.
  reviewQueue = [];
  reviewPanel.hidden = true;
}

function makeHistRow(item, isCurrent) {
  const row = document.createElement('div');
  row.className = 'hist-item';

  const star = document.createElement('button');
  star.type = 'button';
  star.className = 'hist-fav' + (isFav(item.id) ? ' on' : '');
  star.textContent = isFav(item.id) ? '★' : '☆';
  star.title = 'Đánh dấu chủ đề này';
  star.setAttribute('aria-label', 'Đánh dấu chủ đề này');
  star.addEventListener('click', () => {
    toggleFav(item.id);
    if (currentItem && currentItem.id === item.id) syncFavButton();
    renderHistory();
  });

  const open = document.createElement('button');
  open.type = 'button';
  open.className = 'hist-open';

  const name = document.createElement('span');
  name.className = 'hist-topic' + (isCurrent ? ' hist-now' : '');
  name.textContent = (TYPE_ICON[item.type] || '') + ' ' + item.topic + (isCurrent ? ' (đang mở)' : '');

  const badge = document.createElement('span');
  badge.className = 'hist-badge';
  badge.textContent = LEVEL_LABEL[item.level] || item.level || '';

  open.appendChild(name);
  open.appendChild(badge);
  if (item.at) {
    const meta = document.createElement('span');
    meta.className = 'hist-meta';
    meta.textContent = timeAgo(item.at);
    open.appendChild(meta);
  }
  open.addEventListener('click', () => openLesson(item.id, item.type, item.level));

  row.appendChild(star);
  row.appendChild(open);
  return row;
}

// Gọn trong đúng một dòng, bấm cả dòng là mở lại bài dở.
function renderResumeLine() {
  // Ẩn nếu bài gần nhất chính là bài đang mở — không có gì để "tiếp".
  if (!resumeTarget || (currentItem && currentItem.id === resumeTarget.id)) {
    resumeLine.hidden = true;
    return;
  }
  resumeLine.innerHTML = '';

  const nhan = document.createElement('span');
  nhan.textContent = '↩️ Học tiếp:';

  const topic = document.createElement('span');
  topic.className = 'rl-topic';
  topic.textContent = (TYPE_ICON[resumeTarget.type] || '') + ' ' + resumeTarget.topic;

  const time = document.createElement('span');
  time.className = 'rl-time';
  time.textContent = timeAgo(resumeTarget.at);

  resumeLine.appendChild(nhan);
  resumeLine.appendChild(topic);
  resumeLine.appendChild(time);
  resumeLine.hidden = false;
}

function renderHistory() {
  const items = favFilter ? getFavorites() : getHistory(10);
  const soFav = readJson(FAV_KEY, []).length;
  const soLichSu = getHistory(10).length;

  renderResumeLine();

  // Nút ở màn hình chính: chỉ hiện khi đã có gì đó để xem.
  openHistoryBtn.hidden = soLichSu === 0 && soFav === 0;
  openHistoryBtn.textContent = '🕘 Học gần đây' + (soLichSu ? ' (' + soLichSu + ')' : '');

  // Phần còn lại chỉ có ý nghĩa khi popup đang mở ở tab lịch sử.
  if (modalPane !== 'history') return;

  favFilterBtn.hidden = soFav === 0;
  favFilterBtn.classList.toggle('on', favFilter);
  favFilterBtn.setAttribute('aria-pressed', String(favFilter));
  reviewBtn.hidden = true;
  modalTitle.textContent = (favFilter ? 'Chủ đề đã đánh dấu' : 'Học gần đây')
    + ' (' + items.length + ')';

  historyList.innerHTML = '';

  if (!items.length) {
    const p = document.createElement('div');
    p.className = 'hist-empty';
    p.textContent = favFilter
      ? 'Chưa đánh dấu chủ đề nào. Bấm ☆ cạnh tên chủ đề để đánh dấu.'
      : 'Chưa có bài nào. Học một bài là nó xuất hiện ở đây.';
    historyList.appendChild(p);
  } else {
    items.forEach(it => {
      historyList.appendChild(makeHistRow(it, !!(currentItem && currentItem.id === it.id)));
    });
  }

}

// ====== VẼ SỔ TỪ & PHIÊN ÔN TẬP ======
let reviewQueue = [];   // hàng đợi từ cần ôn trong phiên hiện tại
let reviewShow = false; // đã lật đáp án chưa

function renderVocab() {
  const list = readVocab();
  const due = dueWords();

  // Nút ở màn hình chính, kèm chấm đỏ số từ đến hạn để nhắc ôn.
  // Cố ý LUÔN hiện kể cả khi sổ từ trống: nếu ẩn đi thì người dùng mới sẽ
  // không bao giờ biết app có tính năng này.
  openVocabBtn.hidden = false;
  openVocabBtn.innerHTML = '';
  openVocabBtn.appendChild(document.createTextNode(
    '📒 Sổ từ' + (list.length ? ' (' + list.length + ')' : '')));
  if (due.length) {
    const dot = document.createElement('span');
    dot.className = 'quick-dot';
    dot.textContent = due.length + ' cần ôn';
    openVocabBtn.appendChild(dot);
  }

  if (modalPane !== 'vocab') return;

  favFilterBtn.hidden = true;
  modalTitle.textContent = 'Sổ từ (' + list.length + ')';

  // Nút ôn tập LUÔN hiện khi sổ có từ, chỉ **mờ đi** khi chưa tới hạn ôn.
  // Trước đây nút bị ẩn hẳn lúc `due.length === 0`, nên người dùng ôn hết một
  // lượt là tính năng biến mất và họ tưởng app không có nó — đúng lỗi đã rút ra
  // ở nút "Sổ từ" trước đây: KHÔNG ẩn lối vào của một tính năng chỉ vì nó đang trống.
  reviewBtn.hidden = reviewQueue.length > 0 || list.length === 0;
  reviewBtn.disabled = due.length === 0;
  reviewBtn.textContent = '🎯 Ôn tập (' + due.length + ')';
  reviewBtn.title = due.length
    ? 'Ôn ' + due.length + ' từ đến hạn hôm nay'
    : 'Hôm nay chưa có từ nào tới hạn ôn';

  if (!list.length) {
    reviewPanel.hidden = true;
    vocabList.innerHTML = '';
    const p = document.createElement('div');
    p.className = 'hist-empty';
    p.textContent = 'Sổ từ đang trống. Bấm vào một từ tiếng Anh trong bài, '
      + 'rồi bấm ☆ ở góc popup để lưu từ đó vào đây học dần.';
    vocabList.appendChild(p);
    return;
  }

  vocabList.innerHTML = '';

  // Sổ có từ nhưng chưa tới hạn ôn: nói rõ ngày quay lại, thay vì để người dùng
  // nhìn nút mờ mà không hiểu vì sao bấm không được.
  if (!due.length) {
    const note = document.createElement('div');
    note.className = 'hist-empty';
    const ngay = ngayOnGanNhat();
    note.textContent = ngay
      ? 'Hôm nay không có từ nào tới hạn ôn. Lượt ôn kế tiếp: ' + dinhDangNgay(ngay) + '.'
      : 'Hôm nay không có từ nào tới hạn ôn.';
    vocabList.appendChild(note);
  }

  // Từ đến hạn lên đầu, còn lại theo thứ tự lưu gần nhất.
  const t = homNay();
  const sorted = list.slice().sort((a, b) => {
    const da = (!a.due_date || a.due_date <= t) ? 0 : 1;
    const db = (!b.due_date || b.due_date <= t) ? 0 : 1;
    if (da !== db) return da - db;
    return String(b.created_at).localeCompare(String(a.created_at));
  });

  sorted.forEach(v => {
    const denHan = !v.due_date || v.due_date <= t;
    const row = document.createElement('div');
    row.className = 'vocab-item';

    const main = document.createElement('div');
    main.className = 'vocab-main';
    const top = document.createElement('div');
    const w = document.createElement('span');
    w.className = 'vocab-word';
    w.textContent = v.word;
    top.appendChild(w);
    if (v.ipa) {
      const ipa = document.createElement('span');
      ipa.className = 'vocab-ipa';
      ipa.textContent = v.ipa;
      top.appendChild(ipa);
    }
    const vi = document.createElement('div');
    vi.className = 'vocab-vi';
    vi.textContent = v.meaning_vi || '(chưa có nghĩa)';
    main.appendChild(top);
    main.appendChild(vi);

    const box = document.createElement('span');
    box.className = 'vocab-box' + (denHan ? ' due' : '');
    box.textContent = denHan ? 'Cần ôn' : 'Hộp ' + (v.box || 1);
    box.title = denHan ? 'Đến hạn ôn' : 'Ôn lại ngày ' + v.due_date;

    const speak = document.createElement('button');
    speak.type = 'button';
    speak.className = 'vocab-del';
    speak.textContent = '🔊';
    speak.title = 'Nghe phát âm';
    speak.addEventListener('click', () => speakWord(v.word));

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'vocab-del';
    del.textContent = '🗑';
    del.title = 'Xoá khỏi sổ từ';
    del.addEventListener('click', () => {
      removeWord(v.word);
      reviewQueue = reviewQueue.filter(x => x !== v.word);
      if (currentPopupWord === v.word) syncSaveButton();
      if (reviewQueue.length) renderReview(); else { reviewPanel.hidden = true; }
      renderVocab();
    });

    row.appendChild(main);
    row.appendChild(box);
    row.appendChild(speak);
    row.appendChild(del);
    vocabList.appendChild(row);
  });
}

function batDauOnTap() {
  reviewQueue = dueWords().map(v => v.word);
  reviewShow = false;
  renderReview();
  renderVocab();
}

function renderReview() {
  reviewPanel.innerHTML = '';
  if (!reviewQueue.length) {
    reviewPanel.hidden = true;
    return;
  }
  reviewPanel.hidden = false;

  const item = findVocab(reviewQueue[0]);
  if (!item) { // từ đã bị xoá giữa chừng
    reviewQueue.shift();
    renderReview();
    return;
  }

  const box = document.createElement('div');
  box.className = 'review-box';

  const prog = document.createElement('div');
  prog.className = 'review-progress';
  prog.textContent = 'Còn ' + reviewQueue.length + ' từ · Hộp ' + (item.box || 1) + '/' + BOX_MAX;
  box.appendChild(prog);

  const w = document.createElement('div');
  w.className = 'review-word';
  w.textContent = item.word;
  box.appendChild(w);

  if (item.ipa) {
    const ipa = document.createElement('div');
    ipa.className = 'review-ipa';
    ipa.textContent = item.ipa;
    box.appendChild(ipa);
  }

  const actions = document.createElement('div');
  actions.className = 'review-actions';

  const speak = document.createElement('button');
  speak.type = 'button';
  speak.className = 'btn secondary ctrl-btn';
  speak.textContent = '🔊';
  speak.title = 'Nghe phát âm';
  speak.addEventListener('click', () => speakWord(item.word));
  actions.appendChild(speak);

  if (!reviewShow) {
    const show = document.createElement('button');
    show.type = 'button';
    show.className = 'btn';
    show.textContent = 'Hiện nghĩa';
    show.addEventListener('click', () => { reviewShow = true; renderReview(); });
    actions.appendChild(show);
  } else {
    const ans = document.createElement('div');
    ans.className = 'review-answer';
    const vi = document.createElement('div');
    vi.className = 'review-vi';
    vi.textContent = item.meaning_vi || '(chưa có nghĩa)';
    ans.appendChild(vi);
    if (item.example) {
      const ex = document.createElement('div');
      ex.className = 'review-example';
      ex.textContent = '“' + item.example + '”';
      ans.appendChild(ex);
    }
    box.appendChild(ans);

    const quen = document.createElement('button');
    quen.type = 'button';
    quen.className = 'btn forgot';
    quen.textContent = '😕 Quên';
    quen.addEventListener('click', () => chamTu(false));

    const nho = document.createElement('button');
    nho.type = 'button';
    nho.className = 'btn knew';
    nho.textContent = '🙂 Nhớ';
    nho.addEventListener('click', () => chamTu(true));

    actions.appendChild(quen);
    actions.appendChild(nho);
  }

  const thoat = document.createElement('button');
  thoat.type = 'button';
  thoat.className = 'btn secondary ctrl-btn';
  thoat.textContent = '✕';
  thoat.title = 'Thoát ôn tập';
  thoat.addEventListener('click', () => {
    reviewQueue = [];
    reviewPanel.hidden = true;
    renderVocab();
  });
  actions.appendChild(thoat);

  box.appendChild(actions);
  reviewPanel.appendChild(box);
}

function chamTu(nho) {
  const word = reviewQueue.shift();
  const item = gradeWord(word, nho);
  // Quên -> đẩy xuống cuối hàng đợi để gặp lại ngay trong phiên này.
  if (!nho) reviewQueue.push(word);
  reviewShow = false;

  if (!reviewQueue.length) {
    reviewPanel.hidden = false;
    reviewPanel.innerHTML = '';
    const done = document.createElement('div');
    done.className = 'review-box review-done';
    done.textContent = '🎉 Xong rồi! Hẹn gặp lại các từ này vào lúc chúng đến hạn.';
    reviewPanel.appendChild(done);
    setTimeout(() => { reviewPanel.hidden = true; renderVocab(); }, 2500);
    renderVocab();
    return;
  }
  renderReview();
  renderVocab();
}

// Người dùng hay bấm ⭐ ngay khi popup vừa mở, lúc nghĩa/phiên âm chưa tải xong.
// Khi API trả về thì bổ sung nốt vào mục đã lưu, để sổ từ không bị trống nghĩa.
function boSungNghiaChoSoTu(word, info) {
  const list = readVocab();
  const w = String(word || '').toLowerCase();
  const item = list.find(v => String(v.word).toLowerCase() === w);
  if (!item) return;
  let doi = false;
  if (!item.ipa && info.ipa) { item.ipa = info.ipa; doi = true; }
  if (!item.pos && info.pos) { item.pos = info.pos; doi = true; }
  if (!item.example && info.example) { item.example = info.example; doi = true; }
  if (!item.meaning_vi && info.vi) { item.meaning_vi = info.vi; doi = true; }
  if (doi) { writeVocab(list); renderVocab(); }
}

function syncSaveButton() {
  const on = !!(currentPopupWord && isSaved(currentPopupWord));
  wpSave.textContent = on ? '★' : '☆';
  wpSave.classList.toggle('on', on);
  wpSave.title = on ? 'Đã có trong sổ từ — bấm để bỏ' : 'Lưu vào sổ từ';
}

function syncFavButton() {
  const on = !!(currentItem && isFav(currentItem.id));
  favBtn.textContent = on ? '★' : '☆';
  favBtn.classList.toggle('on', on);
  favBtn.setAttribute('aria-pressed', String(on));
  favBtn.disabled = !currentItem;
}

// Ghi nhận một bài vừa được mở: vừa vào nhật ký (đúng cột study_log), vừa vào
// cache tên bài để lịch sử vẽ được mà không cần gọi mạng.
function recordLesson() {
  if (!currentItem || !currentItem.id) return;
  logStudy(currentItem.id, 'read');
  rememberTitle(currentItem.id, currentItem.topic, currentTab, currentLevel);
  syncFavButton();
  renderHistory();
  kiemTraDaiMoi();
}

// ============================================================
// TÀI KHOẢN (tuần 14–15)
// Đăng nhập KHÔNG mở khoá tính năng nào — app vẫn chạy đủ ở chế độ khách.
// Phần này chỉ đổi nhãn nút và quyết định lúc nào hiện dải mời.
// ============================================================
const SIGNIN_HINT_KEY = 'ep:signinHint'; // 'tu-choi' = đã bấm ✕, không mời lại
const SIGNIN_MIN_BAI = 3;                // mục 2.1: chỉ mời sau 2–3 bài

function daTuChoiMoi() {
  try { return localStorage.getItem(SIGNIN_HINT_KEY) === 'tu-choi'; }
  catch (err) { return false; }
}

function ghiNhoDaTuChoiMoi() {
  try { localStorage.setItem(SIGNIN_HINT_KEY, 'tu-choi'); } catch (err) {}
}

// Đếm số bài KHÁC NHAU đã học, không phải số dòng nhật ký. Mở lại cùng một
// bài mười lần không có nghĩa là đã học mười bài — đếm kiểu đó thì dải mời
// bật lên ngay lần đầu vào trang và mất hết ý nghĩa "đã dùng thử rồi".
function soBaiDaHoc() {
  return getSeenIds().size; // getSeenIds() trả về Set, không phải mảng
}

function kiemTraDaiMoi() {
  if (!signinBar) return;
  const nen = !nguoiDungHienTai() && !daTuChoiMoi() && soBaiDaHoc() >= SIGNIN_MIN_BAI;
  if (nen) signinCount.textContent = String(soBaiDaHoc());
  signinBar.hidden = !nen;
}

function capNhatGiaoDienTaiKhoan() {
  const user = nguoiDungHienTai();
  accLabel.textContent = user ? tenHienThi(user) : 'Đăng nhập';
  const anh = user ? anhDaiDien(user) : '';
  accAvatar.hidden = !anh;
  accAvatar.style.backgroundImage = anh ? `url("${anh}")` : '';
  accGuest.hidden = !!user;
  accUser.hidden = !user;
  if (user) accEmail.textContent = user.email || tenHienThi(user);
  veTrangThaiGop();
  // Đăng nhập xong thì dải mời không còn lý do tồn tại.
  kiemTraDaiMoi();
}

// ============================================================
// GỘP DỮ LIỆU LÊN TÀI KHOẢN (tuần 16)
//
// Phần gọi DB nằm ở supabase.js (`gopDuLieuLenTaiKhoan`). Ở đây chỉ lo:
// đọc localStorage, nhớ đã gộp chưa, và vẽ dòng trạng thái.
//
// ⚠️ TUYỆT ĐỐI KHÔNG XOÁ localStorage sau khi gộp. Cho tới hết tuần 17,
// localStorage vẫn là nguồn đọc DUY NHẤT của toàn bộ giao diện — xoá đi là
// người dùng đăng nhập xong thấy sổ từ trống trơn, đúng thứ việc gộp này sinh
// ra để tránh. Test K7 canh điều đó.
// ============================================================
const MERGED_PREFIX = 'ep:merged:'; // + user.id, vì một máy có thể có nhiều tài khoản
let dangGopDuLieu = false;          // chống chạy chồng: onAuthStateChange bắn nhiều lần

function docTomTatGop(userId) {
  if (!userId) return null;
  const t = readJson(MERGED_PREFIX + userId, null);
  return t && typeof t === 'object' ? t : null;
}

function ghiNhoDaGop(userId, ketQua) {
  writeJson(MERGED_PREFIX + userId, {
    soLuot: ketQua.soLuot, soTu: ketQua.soTu, luc: new Date().toISOString()
  });
}

// trangThai: 'dang-chay' | 'xong' | 'hong' | null (ẩn hẳn)
function veTrangThaiGop(trangThai, tomTat) {
  if (!accSync) return;
  const user = nguoiDungHienTai();
  if (!user) { accSync.hidden = true; return; }

  // Không truyền gì thì tự tra lại lần gộp trước — nhờ vậy mở khung Tài khoản
  // ở những lần vào trang sau vẫn thấy kết quả, không phải khoảng trống khó hiểu.
  const tt = trangThai || (docTomTatGop(user.id) ? 'xong' : null);
  const tk = tomTat || docTomTatGop(user.id);

  accSync.className = 'acc-sync' + (tt ? ' ' + tt : '');
  if (tt === 'dang-chay') {
    accSync.textContent = '⏳ Đang đưa dữ liệu trên máy này lên tài khoản…';
  } else if (tt === 'xong') {
    accSync.textContent = tk
      ? `✅ Đã đưa ${tk.soLuot} lượt học và ${tk.soTu} từ lên tài khoản.`
      : '✅ Đã đưa dữ liệu lên tài khoản.';
  } else if (tt === 'hong') {
    accSync.textContent = '⚠️ Chưa đưa được dữ liệu lên tài khoản. '
      + 'Dữ liệu trên máy vẫn còn nguyên, lần đăng nhập sau sẽ tự thử lại.';
  }
  accSync.hidden = !tt;
}

// Gọi sau mỗi lần có phiên đăng nhập. Chỉ thực sự chạy đúng MỘT lần cho mỗi
// tài khoản trên mỗi máy — `khoiTaoAuth` bắn callback cả lúc khôi phục phiên
// từ lần trước, không riêng lúc bấm đăng nhập.
async function gopNeuCanThiet(user) {
  if (!user || dangGopDuLieu) return null;
  if (docTomTatGop(user.id)) { veTrangThaiGop(); return null; }

  dangGopDuLieu = true;
  veTrangThaiGop('dang-chay');
  try {
    const kq = await gopDuLieuLenTaiKhoan(user, readLog(), readVocab());
    if (kq && kq.ok) {
      // Chỉ đặt cờ khi CẢ HAI bảng đã chèn xong. Hỏng giữa chừng thì không
      // đặt, lần sau chạy lại — an toàn nhờ unique index của study_log và
      // nhờ sổ từ được đọc trước rồi mới lọc.
      ghiNhoDaGop(user.id, kq);
      veTrangThaiGop('xong', kq);
    } else {
      veTrangThaiGop('hong');
    }
    return kq;
  } finally {
    dangGopDuLieu = false;
  }
}

// Mở lại một bài từ lịch sử: phải chỉnh tab + trình độ cho khớp rồi mới tải,
// nếu không nội dung sẽ được dựng sai hình dạng (lines với text khác nhau).
function setTabAndLevel(tab, level) {
  if (tab && tab !== currentTab) {
    currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  }
  if (level && level !== currentLevel) {
    currentLevel = level;
    document.querySelectorAll('.level-btn').forEach(b => b.classList.toggle('active', b.dataset.level === level));
  }
}

async function openLesson(id, tab, level) {
  stopSpeaking();
  // Chọn bài xong thì đóng popup lại, nếu không người dùng vẫn bị popup che
  // mất chính cái bài vừa chọn.
  if (!modal.hidden) closeModal();
  setTabAndLevel(tab, level);
  loadTopicOptions(); // làm mới danh sách cho combobox, không cần chờ
  await loadSelectedTopic({ id: id });
}

async function loadSelectedTopic(opt) {
  speechSession++;
  window.speechSynthesis.cancel();
  setPlayButton('idle');
  setStatus('Đang tải chủ đề...');

  try {
    if (!supabaseClient) throw new Error('Chưa cấu hình Supabase');

    currentItem = await fetchContentById(opt.id, currentTab);
    recordLesson();
    topicText.textContent = currentItem.topic;
    renderScript();
    refreshComboIfOpen();
    setStatus('Nhấn "Nghe" để bắt đầu');
  } catch (err) {
    console.error('Lỗi khi tải chủ đề đã chọn:', err);
    setStatus('Có lỗi khi tải chủ đề đã chọn, vui lòng thử lại.', true);
  }
}

async function loadNewItem() {
  speechSession++; // vô hiệu hoá mọi vòng lặp speakNext còn sót lại từ chủ đề cũ
  window.speechSynthesis.cancel();
  setPlayButton('idle');
  randomBtn.disabled = true;
  setStatus('Đang tải chủ đề mới...');

  // Chốt tab/trình độ tại thời điểm bắt đầu. Nếu người dùng đổi tab hoặc trình
  // độ trong lúc đang chờ mạng, lần chạy này phải tự bỏ đi — nếu không sẽ hiển
  // thị nội dung của tab cũ, hoặc dựng sai hình dạng (lines vs text).
  const myTab = currentTab;
  const myLevel = currentLevel;
  const isStale = () => myTab !== currentTab || myLevel !== currentLevel;

  try {
    // Phải CHỜ danh sách chủ đề rồi mới chọn được bài chưa học.
    // (Trước đây gọi song song không chờ, nên không có gì để loại trừ.)
    await loadTopicOptions();
    if (isStale()) return;

    let newItem = null;
    let exhausted = false;

    const picked = pickUnseenOption();
    if (picked) {
      exhausted = picked.exhausted;
      newItem = await fetchContentById(picked.opt.id, myTab);
    } else {
      // Dự phòng: không lấy được danh sách chủ đề (mất mạng, DB pause...).
      // Quay về cách random cũ qua RPC để app vẫn dùng được.
      newItem = await fetchFromSupabase(myTab, myLevel);
    }
    if (isStale()) return;

    if (!newItem) {
      topicText.textContent = '—';
      scriptBox.innerHTML = '';
      currentItem = null;
      setStatus('Chưa tải được nội dung từ Supabase. Kiểm tra kết nối mạng hoặc thử lại sau.', true);
      return;
    }

    currentItem = newItem;
    recordLesson();
    topicText.textContent = currentItem.topic;
    renderScript();
    refreshComboIfOpen();
    setStatus(exhausted
      ? `Bạn đã học hết ${topicOptions.length} chủ đề ở mức này — bắt đầu vòng ôn lại. Nhấn "Nghe" để bắt đầu`
      : 'Nhấn "Nghe" để bắt đầu');
  } catch (err) {
    console.error('Lỗi khi tải chủ đề mới:', err);
    setStatus('Có lỗi khi tải chủ đề mới, vui lòng thử lại.', true);
  } finally {
    // Luôn bật lại nút dù thành công hay lỗi, tránh việc nút bị kẹt "disabled"
    // khiến người dùng bấm "Đổi chủ đề" mà không thấy phản ứng gì.
    randomBtn.disabled = false;
  }
}

// Tách một đoạn text thành HTML, mỗi từ tiếng Anh được bọc trong
// <span class="word"> để bấm tra phiên âm/nghĩa; dấu câu & khoảng trắng
// giữ nguyên. Trả về chuỗi HTML đã escape an toàn.
function tokenizeWords(text) {
  // Chia thành các đoạn: từ (chữ cái, có thể kèm ' hoặc - ở giữa) và phần còn lại.
  const parts = String(text).split(/([A-Za-z]+(?:[''\-][A-Za-z]+)*)/);
  return parts.map((part, i) => {
    // Các phần tử ở chỉ số lẻ là "từ" đã bắt được trong nhóm regex.
    if (i % 2 === 1 && part) {
      return `<span class="word">${escapeHtml(part)}</span>`;
    }
    return escapeHtml(part);
  }).join('');
}

// Tách nội dung hiện tại thành danh sách câu. Dùng CHUNG cho cả việc vẽ script
// lẫn việc đọc, nên chỉ số câu trên màn hình luôn khớp với chỉ số câu đang đọc.
function buildSentences() {
  if (!currentItem) return [];
  if (currentTab === 'dialogue') {
    return currentItem.lines.map(l => ({ text: l.t, speaker: l.s, vi: l.vi || '' }));
  }
  // `[.!?]*` (không phải `+`) để giữ lại đoạn cuối khi bài viết không kết thúc
  // bằng dấu câu — regex cũ `[^.!?]+[.!?]+` nuốt mất câu cuối trong trường hợp
  // đó, khiến câu này biến mất khỏi cả script hiển thị lẫn phần đọc.
  const parts = currentItem.text.match(/[^.!?]+[.!?]*/g) || [];
  const list = parts.map(s => ({ text: s.trim(), speaker: null, vi: '' })).filter(s => s.text);

  // Bài nghe lưu bản dịch ở mảng `data.vi` xếp theo đúng thứ tự câu. Chỉ gắn
  // khi số phần tử KHỚP TUYỆT ĐỐI: lệch một câu là mọi câu phía sau bị dịch
  // sai chỗ, mà người học không có cách nào phát hiện. Thà không hiện bản dịch
  // còn hơn hiện bản dịch của câu khác.
  const vi = currentItem.vi;
  if (Array.isArray(vi) && vi.length === list.length) {
    list.forEach((s, i) => { s.vi = String(vi[i] || ''); });
  }
  return list;
}

function renderScript() {
  scriptBox.innerHTML = '';
  sentences = buildSentences();
  currentIndex = 0;
  scriptLabel.textContent = currentTab === 'dialogue' ? 'Hội thoại' : 'Script luyện nghe';

  sentences.forEach((s, i) => {
    const div = document.createElement('div');
    div.className = 'line' + (s.speaker ? '' : ' listen-line');
    div.id = 'line-' + i;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'line-play';
    btn.dataset.i = String(i);
    btn.title = 'Đọc câu này';
    btn.setAttribute('aria-label', 'Đọc câu này');
    btn.textContent = '▶';

    const textEl = document.createElement('div');
    textEl.className = 'line-text';
    if (s.speaker) {
      const label = s.speaker === 'A' ? 'Người A' : 'Người B';
      const cls = s.speaker === 'A' ? 'speaker-a' : 'speaker-b';
      textEl.innerHTML = `<span class="${cls}">${label}:</span> ${tokenizeWords(s.text)}`;
    } else {
      textEl.innerHTML = tokenizeWords(s.text);
    }

    div.appendChild(btn);
    div.appendChild(textEl);

    // 1.4 — bản dịch cả câu. Chỉ dựng cho câu ĐÃ CÓ bản dịch: bài chưa soạn thì
    // không có nút 👁 nào, người dùng không thấy một tính năng bấm vào không
    // chạy được. Dùng textContent (không phải innerHTML) vì bản dịch là dữ liệu
    // từ DB — tokenizeWords chỉ dành cho phần tiếng Anh cần bấm tra từ.
    if (s.vi) {
      const viEl = document.createElement('div');
      viEl.className = 'line-vi';
      viEl.textContent = s.vi;
      viEl.hidden = !bilingual;
      textEl.appendChild(viEl);

      const eye = document.createElement('button');
      eye.type = 'button';
      eye.className = 'line-eye';
      eye.dataset.i = String(i);
      eye.title = 'Hiện/ẩn bản dịch câu này';
      eye.setAttribute('aria-label', 'Hiện hoặc ẩn bản dịch câu này');
      eye.setAttribute('aria-pressed', bilingual ? 'true' : 'false');
      eye.textContent = '👁';
      div.appendChild(eye);
    }

    scriptBox.appendChild(div);
  });

  syncBilingualButton();
  renderQuiz();
  markCurrent(false);
}

// ============================================================
// 1.4 — Dịch cả câu (bật/tắt)
// Bản dịch được soạn sẵn và lưu trong cột `data` của Supabase. Cố ý KHÔNG gọi
// API dịch máy lúc chạy: dịch realtime hay sai, chậm, và bị chặn theo IP —
// dự án đã gặp đúng vấn đề đó với API từ điển.
// ============================================================
const BILINGUAL_KEY = 'ep:bilingual';

function loadBilingual() {
  try {
    return localStorage.getItem(BILINGUAL_KEY) === '1';
  } catch (err) {
    return false; // localStorage bị chặn -> mặc định tắt, app vẫn chạy
  }
}

function saveBilingual(on) {
  try {
    localStorage.setItem(BILINGUAL_KEY, on ? '1' : '0');
  } catch (err) {
    // bỏ qua: không lưu được lựa chọn thì lần sau về mặc định, không phải lỗi
  }
}

// Bài nào có ít nhất một câu đã dịch thì mới hiện nút bật/tắt song ngữ.
function coBanDich() {
  return sentences.some(s => s.vi);
}

function syncBilingualButton() {
  const co = coBanDich();
  biBtn.hidden = !co;
  biBtn.setAttribute('aria-pressed', bilingual ? 'true' : 'false');
  biBtn.classList.toggle('on', bilingual);
  biBtn.textContent = bilingual ? '🇻🇳 Ẩn bản dịch' : '🇻🇳 Bản dịch';
}

// Bật/tắt bản dịch của MỘT câu. Trả về trạng thái mới, hoặc null nếu câu đó
// không có bản dịch (bấm vào chỗ trống thì không làm gì, không ném lỗi).
function toggleLineVi(i) {
  const el = document.getElementById('line-' + i);
  if (!el) return null;
  const viEl = el.querySelector('.line-vi');
  if (!viEl) return null;
  viEl.hidden = !viEl.hidden;
  const eye = el.querySelector('.line-eye');
  if (eye) eye.setAttribute('aria-pressed', viEl.hidden ? 'false' : 'true');
  return !viEl.hidden;
}

// Bật/tắt chế độ song ngữ cho CẢ BÀI. Lựa chọn được nhớ giữa các bài và các
// lần vào trang — người học đã quen đọc song ngữ thì không phải bấm lại mỗi bài.
function setBilingual(on) {
  bilingual = !!on;
  saveBilingual(bilingual);
  document.querySelectorAll('#scriptBox .line-vi').forEach(el => { el.hidden = !bilingual; });
  document.querySelectorAll('#scriptBox .line-eye').forEach(el => {
    el.setAttribute('aria-pressed', bilingual ? 'true' : 'false');
  });
  syncBilingualButton();
}

// ============================================================
// 2.5 — Câu hỏi hiểu bài
// Bộ câu hỏi nằm trong `data.quiz` của Supabase, dạng
//   [{ q: "...", a: ["...", ...], correct: 0, explain: "..." }]
// JSONB nên không phải đổi schema. Bài chưa soạn quiz thì cả khung tự ẩn.
// ============================================================
const OPT_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

// Lọc bỏ những câu hỏi hỏng (thiếu đề, ít hơn 2 lựa chọn, `correct` trỏ ra
// ngoài mảng). Một câu hỏi hỏng không được phép làm sập cả bộ đề.
function layQuiz() {
  const raw = currentItem && Array.isArray(currentItem.quiz) ? currentItem.quiz : [];
  return raw.filter(q =>
    q && typeof q.q === 'string' && q.q.trim() &&
    Array.isArray(q.a) && q.a.length >= 2 &&
    Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.a.length
  );
}

function renderQuiz() {
  quizAnswers = {};
  quizDone = false;
  const quiz = layQuiz();

  quizCard.hidden = quiz.length === 0;
  quizBox.innerHTML = '';
  quizScore.textContent = '';
  quizResetBtn.hidden = true;
  quizSubmitBtn.hidden = false;
  quizSubmitBtn.disabled = true; // chỉ bật khi đã trả lời hết
  quizSubmitBtn.textContent = 'Nộp bài';
  if (!quiz.length) return;

  quiz.forEach((q, qi) => {
    const wrap = document.createElement('div');
    wrap.className = 'quiz-q';
    wrap.dataset.q = String(qi);

    const title = document.createElement('div');
    title.className = 'qt';
    const num = document.createElement('span');
    num.className = 'qn';
    num.textContent = `Câu ${qi + 1}.`;
    title.appendChild(num);
    title.appendChild(document.createTextNode(q.q));
    wrap.appendChild(title);

    q.a.forEach((opt, oi) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'quiz-opt';
      b.dataset.q = String(qi);
      b.dataset.o = String(oi);
      const lab = document.createElement('span');
      lab.className = 'ol';
      lab.textContent = (OPT_LABELS[oi] || String(oi + 1)) + '.';
      b.appendChild(lab);
      b.appendChild(document.createTextNode(opt));
      wrap.appendChild(b);
    });

    quizBox.appendChild(wrap);
  });
}

function chonDapAn(qi, oi) {
  if (quizDone) return; // đã nộp thì khoá lại, không cho sửa
  const quiz = layQuiz();
  if (!quiz[qi] || oi < 0 || oi >= quiz[qi].a.length) return;

  quizAnswers[qi] = oi;
  quizBox.querySelectorAll(`.quiz-opt[data-q="${qi}"]`).forEach(b => {
    b.classList.toggle('picked', Number(b.dataset.o) === oi);
  });
  // Bắt trả lời hết rồi mới cho nộp: nộp sớm sẽ tính là sai những câu chỉ vì
  // chưa kịp đọc, làm điểm số mất ý nghĩa.
  quizSubmitBtn.disabled = Object.keys(quizAnswers).length < quiz.length;
}

// Chấm điểm. Trả về { dung, tong, diem } với `diem` là tỉ lệ 0–1 — đúng kiểu
// cột `score numeric` của bảng study_log (mục 10), để tuần 16 đẩy thẳng lên
// Supabase mà không phải quy đổi.
function chamQuiz() {
  const quiz = layQuiz();
  if (!quiz.length) return null;
  let dung = 0;
  quiz.forEach((q, qi) => { if (quizAnswers[qi] === q.correct) dung++; });
  return { dung: dung, tong: quiz.length, diem: Math.round((dung / quiz.length) * 100) / 100 };
}

function nopQuiz() {
  const quiz = layQuiz();
  if (!quiz.length || quizDone) return null;
  if (Object.keys(quizAnswers).length < quiz.length) return null;

  quizDone = true;
  const kq = chamQuiz();

  quiz.forEach((q, qi) => {
    const wrap = quizBox.querySelector(`.quiz-q[data-q="${qi}"]`);
    if (!wrap) return;
    wrap.querySelectorAll('.quiz-opt').forEach(b => {
      const oi = Number(b.dataset.o);
      b.disabled = true;
      b.classList.remove('picked');
      if (oi === q.correct) b.classList.add('right');
      else if (quizAnswers[qi] === oi) b.classList.add('wrong');
    });
    // Giải thích hiện cho MỌI câu, kể cả câu làm đúng: đôi khi người học chọn
    // đúng do đoán, và đó chính là lúc cần biết vì sao.
    if (q.explain) {
      const ex = document.createElement('div');
      ex.className = 'quiz-explain';
      ex.textContent = q.explain;
      wrap.appendChild(ex);
    }
  });

  quizScore.textContent = `Đúng ${kq.dung}/${kq.tong} — ${Math.round(kq.diem * 100)}%`;
  quizScore.style.color = kq.diem >= 0.75 ? 'var(--green)' : (kq.diem >= 0.5 ? 'var(--text)' : '#dc2626');
  quizSubmitBtn.hidden = true;
  quizResetBtn.hidden = false;

  if (currentItem && currentItem.id) logStudy(currentItem.id, 'quiz', kq.diem);
  return kq;
}

function clearHighlight() {
  document.querySelectorAll('.line').forEach(el => el.classList.remove('active', 'current'));
}

// Tô sáng câu hiện tại. Đang đọc -> .active (vàng); đã dừng -> .current (xám),
// để người dùng luôn biết bấm ⏭ thì sẽ đi đâu.
function markCurrent(scroll) {
  clearHighlight();

  // Trả mọi nút về ▶ trước, rồi chỉ câu ĐANG đọc mới thành ■ (dừng).
  document.querySelectorAll('.line-play').forEach(b => {
    b.textContent = '▶';
    b.title = 'Đọc câu này';
    b.setAttribute('aria-label', 'Đọc câu này');
  });

  const el = document.getElementById('line-' + currentIndex);
  if (!el) return;
  el.classList.add(isPlaying ? 'active' : 'current');

  if (isPlaying) {
    const btn = el.querySelector('.line-play');
    if (btn) {
      btn.textContent = '■';
      btn.title = 'Dừng';
      btn.setAttribute('aria-label', 'Dừng đọc');
    }
  }

  if (scroll) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function setPlayButton(state) {
  isPlaying = state === 'playing';
  playBtn.innerHTML = isPlaying
    ? '<span class="btn-icon">⏹️ Dừng</span>'
    : '<span class="btn-icon">▶️ Nghe</span>';
}

// Dừng hẳn. Cố ý KHÔNG dùng speechSynthesis.pause()/resume(): trên Chrome
// Android có máy pause xong không resume lại được. Khi đã có ⏮ ⏭ và 🔁 thì
// pause gần như thừa — dừng rồi phát lại câu hiện tại đơn giản và chắc hơn.
function stopSpeaking(msg) {
  speechSession++;
  window.speechSynthesis.cancel();
  setPlayButton('idle');
  markCurrent(false);
  if (msg) setStatus(msg);
}

function speakFrom(index) {
  if (!sentences.length) return;

  speechSession++;
  const mySession = speechSession;
  window.speechSynthesis.cancel();
  setPlayButton('playing');
  setStatus(loopOne ? 'Đang lặp lại một câu... Bấm "Dừng" để thoát.' : 'Đang đọc...');

  const step = (i) => {
    // Người dùng đã đổi chủ đề/trình độ/tab, bấm nút khác, hoặc bấm Dừng
    // -> speechSession đã tăng -> vòng đọc cũ tự huỷ tại đây.
    if (mySession !== speechSession) return;

    if (i >= sentences.length) {
      currentIndex = 0; // đọc xong quay về đầu để bấm "Nghe" là chạy lại từ câu 1
      setPlayButton('idle');
      markCurrent(false);
      setStatus('Đã đọc xong. Nhấn "Nghe" để nghe lại.');
      return;
    }

    currentIndex = i;
    markCurrent(true);

    const s = sentences[i];
    const utter = new SpeechSynthesisUtterance(s.text);
    utter.lang = 'en-US';
    utter.rate = playRate;
    if (s.speaker) {
      const voiceSettings = getSpeakerVoiceSettings(s.speaker);
      if (voiceSettings.voice) utter.voice = voiceSettings.voice;
      utter.pitch = voiceSettings.pitch;
    }

    const goOn = () => {
      if (mySession !== speechSession) return;
      // Lặp câu: nghỉ một nhịp ngắn cho người học kịp nhắc lại theo.
      if (loopOne) setTimeout(() => step(i), 700);
      else step(i + 1);
    };
    utter.onend = goOn;
    utter.onerror = goOn;
    window.speechSynthesis.speak(utter);
  };

  step(Math.max(0, Math.min(index, sentences.length - 1)));
}

// Nhảy tới một câu rồi đọc luôn — dùng cho ⏮ ⏭ và nút ▶ ở đầu mỗi dòng.
function goToSentence(i) {
  if (!sentences.length) return;
  if (i < 0 || i >= sentences.length) return;
  speakFrom(i);
}

// ====== TỐC ĐỘ ĐỌC ======
const RATE_KEY = 'ep:rate';

function loadRate() {
  try {
    const v = parseFloat(localStorage.getItem(RATE_KEY));
    if (v >= RATE_MIN && v <= RATE_MAX) return v;
  } catch (err) { /* localStorage bị chặn -> dùng mặc định */ }
  return 1;
}

function saveRate(v) {
  try { localStorage.setItem(RATE_KEY, String(v)); } catch (err) { /* bỏ qua */ }
}

function applyRate(v, persist) {
  playRate = Math.min(RATE_MAX, Math.max(RATE_MIN, v));
  rateRange.value = String(playRate);
  rateValue.textContent = playRate.toFixed(2) + '×';
  if (persist) saveRate(playRate);
}

// ====== TRA TỪ: PHIÊN ÂM (IPA) + NGHĨA TIẾNG VIỆT ======
// Bấm vào 1 từ trong script → popup hiện phiên âm, từ loại, ví dụ (lấy từ
// dictionaryapi.dev) và nghĩa tiếng Việt (lấy từ API dịch miễn phí). Kết quả
// được cache trong phiên để không gọi lại API cho cùng một từ.
const wordPopup = document.getElementById('wordPopup');
const wpWord = document.getElementById('wpWord');
const wpIpa = document.getElementById('wpIpa');
const wpPos = document.getElementById('wpPos');
const wpVi = document.getElementById('wpVi');
const wpExample = document.getElementById('wpExample');
const wpSave = document.getElementById('wpSave');
const wpSpeak = document.getElementById('wpSpeak');
const wpClose = document.getElementById('wpClose');

// Cache 2 tầng để tăng tốc: RAM cho phiên hiện tại + localStorage để giữ lại
// kết quả qua các lần tải trang (từ đã tra 1 lần sẽ hiện tức thì mãi về sau).
const WP_CACHE_PREFIX = 'wp:';
const wordCache = {};        // từ -> { ipa, pos, example, vi, dDone, vDone }
let currentPopupWord = '';   // từ đang hiển thị (để nút 🔊 đọc)
let lookupSession = 0;       // huỷ kết quả cũ nếu người dùng bấm từ khác
let currentAbort = null;     // huỷ các request đang chạy khi bấm từ khác
const inflight = new Set();  // các từ đang được nạp trước (tránh gọi trùng)

function cacheGet(word) {
  if (wordCache[word]) return wordCache[word];
  try {
    const raw = localStorage.getItem(WP_CACHE_PREFIX + word);
    if (raw) { const v = JSON.parse(raw); wordCache[word] = v; return v; }
  } catch (e) { /* localStorage bị chặn → bỏ qua, vẫn chạy được */ }
  return null;
}
function cacheSet(word, info) {
  wordCache[word] = info;
  try { localStorage.setItem(WP_CACHE_PREFIX + word, JSON.stringify(info)); }
  catch (e) { /* hết dung lượng hoặc bị chặn → bỏ qua */ }
}

// Gộp tín hiệu huỷ của người dùng với một timeout, để request không treo mãi.
function timedSignal(signal, ms) {
  try {
    if (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) {
      const t = AbortSignal.timeout(ms);
      if (signal && AbortSignal.any) return AbortSignal.any([signal, t]);
      return t;
    }
  } catch (e) { /* trình duyệt cũ → dùng signal gốc */ }
  return signal;
}

// Bỏ dấu câu, đưa về chữ thường để tra cứu; giữ ' và - trong từ.
function normalizeWord(raw) {
  return String(raw).toLowerCase().replace(/[^a-z''\-]/g, '').replace(/^[''\-]+|[''\-]+$/g, '');
}

// Tra phiên âm IPA + từ loại + ví dụ từ dictionaryapi.dev (miễn phí, không cần key).
// Lưu ý: lỗi mạng/huỷ/timeout sẽ được ném ra (throw) để bên gọi biết mà thử lại;
// chỉ khi API trả 404 (từ không có trong từ điển) mới trả về rỗng và coi như "đã tra".
async function fetchDictionary(word, signal) {
  const res = await fetch(
    'https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(word),
    { signal: timedSignal(signal, 6000) }
  );
  if (!res.ok) return { ipa: '', pos: '', example: '' };
  const data = await res.json();
  const entry = Array.isArray(data) ? data[0] : null;
  if (!entry) return { ipa: '', pos: '', example: '' };

  let ipa = entry.phonetic || '';
  if (!ipa && Array.isArray(entry.phonetics)) {
    const p = entry.phonetics.find(x => x && x.text);
    if (p) ipa = p.text;
  }

  let pos = '', example = '';
  if (Array.isArray(entry.meanings) && entry.meanings.length) {
    pos = entry.meanings.map(m => m.partOfSpeech).filter(Boolean).slice(0, 3).join(', ');
    for (const m of entry.meanings) {
      for (const d of (m.definitions || [])) {
        if (d.example) { example = d.example; break; }
      }
      if (example) break;
    }
  }
  return { ipa, pos, example };
}

// Dịch từ sang tiếng Việt. Thử Google (gtx) trước, fallback sang MyMemory.
async function fetchTranslation(word, signal) {
  try {
    const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=' + encodeURIComponent(word);
    const res = await fetch(url, { signal: timedSignal(signal, 6000) });
    if (res.ok) {
      const j = await res.json();
      if (j && Array.isArray(j[0])) {
        const vi = j[0].map(seg => (seg && seg[0]) ? seg[0] : '').join('').trim();
        if (vi) return vi;
      }
    }
  } catch (err) {
    if (err && err.name === 'AbortError') throw err; // người dùng huỷ/timeout → không thử tiếp
    /* lỗi mạng Google → thử MyMemory bên dưới */
  }

  const url = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(word) + '&langpair=en|vi';
  const res = await fetch(url, { signal: timedSignal(signal, 6000) });
  if (res.ok) {
    const j = await res.json();
    if (j && j.responseData && j.responseData.translatedText) {
      return String(j.responseData.translatedText).trim();
    }
  }
  return '';
}

// Đọc riêng 1 từ bằng giọng đọc sẵn có (Web Speech API), không cần mạng.
function speakWord(word) {
  if (!word) return;
  speechSession++;                 // dừng vòng đọc script đang chạy (nếu có)
  window.speechSynthesis.cancel();
  setPlayButton('idle');
  markCurrent(false);              // đổi câu đang sáng vàng về trạng thái "đang trỏ tới"
  const utter = new SpeechSynthesisUtterance(word);
  utter.lang = 'en-US';
  utter.rate = 0.85;
  const v = femaleVoice || maleVoice;
  if (v) utter.voice = v;
  window.speechSynthesis.speak(utter);
}

function positionPopup(anchorEl) {
  // Hiện popup để đo kích thước thật rồi mới định vị.
  wordPopup.classList.add('show');
  const rect = anchorEl.getBoundingClientRect();
  const pw = wordPopup.offsetWidth;
  const ph = wordPopup.offsetHeight;
  const margin = 8;

  let left = rect.left + rect.width / 2 - pw / 2;
  left = Math.max(margin, Math.min(left, window.innerWidth - pw - margin));

  let top = rect.bottom + 6;            // mặc định hiện bên dưới từ
  if (top + ph > window.innerHeight - margin) {
    top = rect.top - ph - 6;            // không đủ chỗ → hiện bên trên
    if (top < margin) top = margin;
  }
  wordPopup.style.left = left + 'px';
  wordPopup.style.top = top + 'px';
}

function hideWordPopup() {
  wordPopup.classList.remove('show');
  document.querySelectorAll('.word.looking-up').forEach(el => el.classList.remove('looking-up'));
}

// Nạp trước dữ liệu 1 từ vào cache (không mở popup) — dùng khi rê chuột/chạm,
// để lúc bấm thật thì kết quả đã sẵn sàng, hiện gần như tức thì.
function prefetchWord(rawWord) {
  const word = normalizeWord(rawWord);
  if (!word) return;
  const cached = cacheGet(word);
  if (cached && cached.dDone && cached.vDone) return; // đã đủ, khỏi nạp
  if (inflight.has(word)) return;                     // đang nạp rồi
  inflight.add(word);

  const info = cached
    ? Object.assign({}, cached)
    : { ipa: '', pos: '', example: '', vi: '', dDone: false, vDone: false };
  const tasks = [];
  if (!info.dDone) tasks.push(
    fetchDictionary(word).then(d => {
      info.ipa = d.ipa; info.pos = d.pos; info.example = d.example; info.dDone = true;
      cacheSet(word, info);
    }).catch(() => {})
  );
  if (!info.vDone) tasks.push(
    fetchTranslation(word).then(vi => {
      info.vi = vi; info.vDone = true; cacheSet(word, info);
    }).catch(() => {})
  );
  Promise.allSettled(tasks).then(() => inflight.delete(word));
}

async function showWordPopup(rawWord, anchorEl) {
  const word = normalizeWord(rawWord);
  if (!word) return;

  currentPopupWord = word;
  lookupSession++;
  const mySession = lookupSession;

  // Huỷ mọi request còn dang dở của từ trước để giải phóng mạng.
  if (currentAbort) currentAbort.abort();
  currentAbort = new AbortController();
  const signal = currentAbort.signal;

  document.querySelectorAll('.word.looking-up').forEach(el => el.classList.remove('looking-up'));
  anchorEl.classList.add('looking-up');

  // Hiện ngay phần đã có trong cache (nếu có), phần thiếu để "Đang tra…".
  const cached = cacheGet(word);
  const info = cached
    ? Object.assign({}, cached)
    : { ipa: '', pos: '', example: '', vi: '', dDone: false, vDone: false };

  wpWord.textContent = word;
  renderPopupData(info);
  syncSaveButton();
  positionPopup(anchorEl);

  if (info.dDone && info.vDone) return; // đã đủ dữ liệu, không cần gọi API

  // Gọi song song, HIỂN THỊ DẦN: phần nào xong trước cập nhật trước.
  if (!info.dDone) {
    fetchDictionary(word, signal).then(d => {
      if (mySession !== lookupSession) return;
      info.ipa = d.ipa; info.pos = d.pos; info.example = d.example; info.dDone = true;
      cacheSet(word, info);
      boSungNghiaChoSoTu(word, info);
      renderPopupData(info);
      positionPopup(anchorEl);
    }).catch(() => {}); // lỗi/huỷ → giữ nguyên, lần sau bấm sẽ thử lại
  }
  if (!info.vDone) {
    fetchTranslation(word, signal).then(vi => {
      if (mySession !== lookupSession) return;
      info.vi = vi; info.vDone = true;
      cacheSet(word, info);
      boSungNghiaChoSoTu(word, info);
      renderPopupData(info);
      positionPopup(anchorEl);
    }).catch(() => {});
  }
}

function renderPopupData(info) {
  wpIpa.textContent = info.ipa ? info.ipa : (info.dDone ? '(không có phiên âm)' : '…');
  wpPos.innerHTML = info.pos ? '<span class="wp-pos">' + escapeHtml(info.pos) + '</span>' : '';
  if (info.vi) {
    wpVi.textContent = info.vi;
  } else if (info.vDone) {
    wpVi.textContent = '(chưa dịch được — kiểm tra mạng)';
  } else {
    wpVi.innerHTML = '<span class="wp-loading">Đang tra…</span>';
  }
  if (info.example) {
    wpExample.textContent = '“' + info.example + '”';
    wpExample.style.display = 'block';
  } else {
    wpExample.style.display = 'none';
  }
}

// Bấm vào từ trong script (event delegation)
scriptBox.addEventListener('click', (e) => {
  const el = e.target.closest('.word');
  if (!el) return;
  e.stopPropagation();
  showWordPopup(el.textContent, el);
});

// Nạp trước khi người dùng RÊ CHUỘT (desktop) hoặc CHẠM (mobile) vào từ,
// để khi bấm thật thì dữ liệu thường đã có sẵn.
scriptBox.addEventListener('pointerover', (e) => {
  const el = e.target.closest('.word');
  if (el) prefetchWord(el.textContent);
});
scriptBox.addEventListener('touchstart', (e) => {
  const el = e.target.closest('.word');
  if (el) prefetchWord(el.textContent);
}, { passive: true });

wpSpeak.addEventListener('click', (e) => { e.stopPropagation(); speakWord(currentPopupWord); });
wpClose.addEventListener('click', (e) => { e.stopPropagation(); hideWordPopup(); });
wordPopup.addEventListener('click', (e) => e.stopPropagation());

// Đóng popup khi bấm ra ngoài, cuộn trang, đổi kích thước hoặc nhấn Esc
document.addEventListener('click', hideWordPopup);
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  hideWordPopup();
  // Esc đóng popup Học gần đây / Sổ từ nếu đang mở.
  if (!modal.hidden) closeModal();
});
window.addEventListener('resize', hideWordPopup);
window.addEventListener('scroll', hideWordPopup, true);

// ====== EVENTS ======
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTab = btn.dataset.tab;
    loadNewItem();
  });
});

document.querySelectorAll('.level-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentLevel = btn.dataset.level;
    loadNewItem();
  });
});

function getPlainTextContent() {
  if (currentTab === 'dialogue') {
    return currentItem.lines
      .map(line => `${line.s === 'A' ? 'Người A' : 'Người B'}: ${line.t}`)
      .join('\n');
  } else {
    return currentItem.text;
  }
}

document.getElementById('copyBtn').addEventListener('click', async () => {
  if (!currentItem) return;
  const copyBtn = document.getElementById('copyBtn');
  const textToCopy = `Chủ đề: ${currentItem.topic}\n\n${getPlainTextContent()}`;
  try {
    await navigator.clipboard.writeText(textToCopy);
    copyBtn.textContent = '✅ Đã copy!';
    copyBtn.classList.add('copied');
    setTimeout(() => {
      copyBtn.textContent = '📋 Copy';
      copyBtn.classList.remove('copied');
    }, 1500);
  } catch (err) {
    const textarea = document.createElement('textarea');
    textarea.value = textToCopy;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand('copy');
      copyBtn.textContent = '✅ Đã copy!';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.textContent = '📋 Copy';
        copyBtn.classList.remove('copied');
      }, 1500);
    } catch (e) {
      copyBtn.textContent = '❌ Lỗi copy';
      setTimeout(() => { copyBtn.textContent = '📋 Copy'; }, 1500);
    }
    document.body.removeChild(textarea);
  }
});

randomBtn.addEventListener('click', loadNewItem);

// ====== COMBOBOX CHỌN / TÌM CHỦ ĐỀ ======
topicSearch.addEventListener('input', () => applyTopicQuery(topicSearch.value));
topicSearch.addEventListener('focus', openCombo);
topicSearch.addEventListener('click', openCombo);

topicSearch.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      if (!comboOpen) openCombo(); else moveComboActive(1);
      break;
    case 'ArrowUp':
      e.preventDefault();
      if (!comboOpen) openCombo(); else moveComboActive(-1);
      break;
    case 'PageDown': e.preventDefault(); moveComboActive(5); break;
    case 'PageUp': e.preventDefault(); moveComboActive(-5); break;
    case 'Home':
      if (comboOpen && !topicSearch.value) { e.preventDefault(); comboActive = 0; renderTopicList(); }
      break;
    case 'End':
      if (comboOpen && !topicSearch.value) {
        e.preventDefault();
        comboActive = comboFiltered.length - 1;
        renderTopicList();
      }
      break;
    case 'Enter':
      if (comboOpen) {
        e.preventDefault();
        chooseComboItem(comboActive >= 0 ? comboActive : 0);
      }
      break;
    case 'Escape':
      // Còn từ khoá → Esc thứ nhất xoá từ khoá; Esc tiếp theo mới đóng danh sách.
      e.stopPropagation();
      e.preventDefault();
      if (topicSearch.value) { clearTopicQuery(); comboActive = -1; renderTopicList(); }
      else { closeCombo(); topicSearch.blur(); }
      break;
    case 'Tab':
      closeCombo();
      break;
  }
});

// Dùng mousedown để chọn được item trước khi input mất focus.
topicListbox.addEventListener('mousedown', (e) => {
  const li = e.target.closest('.tc-item');
  if (!li) return;
  e.preventDefault();
  chooseComboItem(Number(li.dataset.i));
});
topicListbox.addEventListener('mousemove', (e) => {
  const li = e.target.closest('.tc-item');
  if (!li) return;
  const i = Number(li.dataset.i);
  if (i === comboActive) return;
  comboActive = i;
  topicListbox.querySelectorAll('.tc-item.active').forEach(el => el.classList.remove('active'));
  li.classList.add('active');
});

topicSearchClear.addEventListener('mousedown', (e) => {
  e.preventDefault();
  clearTopicQuery();
  comboActive = -1;
  openCombo();
  renderTopicList();
  topicSearch.focus();
});

topicCaret.addEventListener('mousedown', (e) => {
  e.preventDefault();
  if (comboOpen) { closeCombo(); topicSearch.blur(); }
  else { topicSearch.focus(); openCombo(); }
});

// Bấm ra ngoài → đóng danh sách
document.addEventListener('mousedown', (e) => {
  if (comboOpen && !topicCombo.contains(e.target)) closeCombo();
});
playBtn.addEventListener('click', () => {
  if (isPlaying) stopSpeaking('Đã dừng. Nhấn "Nghe" để đọc tiếp từ câu đang chọn.');
  else speakFrom(currentIndex);
});

prevBtn.addEventListener('click', () => goToSentence(currentIndex - 1));
nextBtn.addEventListener('click', () => goToSentence(currentIndex + 1));

loopBtn.addEventListener('click', () => {
  loopOne = !loopOne;
  loopBtn.classList.toggle('on', loopOne);
  loopBtn.setAttribute('aria-pressed', String(loopOne));
  if (isPlaying) {
    // Đọc lại chính câu này ngay để người dùng thấy hiệu lực tức thì.
    speakFrom(currentIndex);
  } else {
    setStatus(loopOne
      ? 'Đã bật lặp câu. Nhấn "Nghe" để lặp câu đang chọn.'
      : 'Đã tắt lặp câu.');
  }
});

// Nút ▶ ở đầu mỗi dòng. Dùng listener riêng, tách hẳn khỏi listener bấm từ để
// tra nghĩa: nút nằm ngoài .line-text nên hai thao tác không đè lên nhau.
scriptBox.addEventListener('click', (e) => {
  const btn = e.target.closest('.line-play');
  if (!btn) return;
  e.stopPropagation();
  const i = Number(btn.dataset.i);
  // Bấm lại đúng câu đang đọc = dừng. Bấm câu khác = nhảy sang đọc câu đó.
  if (isPlaying && i === currentIndex) stopSpeaking('Đã dừng. Bấm ▶ để đọc lại câu này.');
  else goToSentence(i);
});

// Nút 👁 ở cuối mỗi dòng — hiện/ẩn bản dịch riêng câu đó (mục 1.4).
// Cố ý KHÔNG dừng phần đang đọc: xem nghĩa không nên cắt ngang bài đang nghe,
// giống hệt cách xử lý khi bấm vào một từ để tra nghĩa.
scriptBox.addEventListener('click', (e) => {
  const eye = e.target.closest('.line-eye');
  if (!eye) return;
  e.stopPropagation();
  toggleLineVi(Number(eye.dataset.i));
});

biBtn.addEventListener('click', () => setBilingual(!bilingual));

// Quiz (mục 2.5) — event delegation, vì các nút được dựng lại sau mỗi bài.
quizBox.addEventListener('click', (e) => {
  const b = e.target.closest('.quiz-opt');
  if (!b) return;
  chonDapAn(Number(b.dataset.q), Number(b.dataset.o));
});

quizSubmitBtn.addEventListener('click', () => {
  const kq = nopQuiz();
  if (kq) quizCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

quizResetBtn.addEventListener('click', renderQuiz);

// Kéo thanh: cập nhật số ngay cho mượt, nhưng chưa lưu và chưa đọc lại.
rateRange.addEventListener('input', () => applyRate(parseFloat(rateRange.value), false));

// Thả tay: lưu lựa chọn. Web Speech không đổi được tốc độ của câu đang đọc dở,
// nên nếu đang đọc thì phát lại câu hiện tại với tốc độ mới.
rateRange.addEventListener('change', () => {
  applyRate(parseFloat(rateRange.value), true);
  if (isPlaying) speakFrom(currentIndex);
});

wpSave.addEventListener('click', (e) => {
  e.stopPropagation();
  if (!currentPopupWord) return;
  if (isSaved(currentPopupWord)) {
    removeWord(currentPopupWord);
    reviewQueue = reviewQueue.filter(x => x !== currentPopupWord);
  } else {
    saveWord(currentPopupWord, cacheGet(currentPopupWord) || {}, currentItem ? currentItem.id : null);
  }
  syncSaveButton();
  renderVocab();
});

reviewBtn.addEventListener('click', batDauOnTap);

openHistoryBtn.addEventListener('click', () => openModal('history'));
openVocabBtn.addEventListener('click', () => openModal('vocab'));
openHelpBtn.addEventListener('click', () => openModal('help'));
accBtn.addEventListener('click', () => openModal('account'));
accSigninBtn.addEventListener('click', dangNhapGoogle);
signinBarBtn.addEventListener('click', dangNhapGoogle);
accSignoutBtn.addEventListener('click', async () => {
  await dangXuat();
  closeModal();
});
signinBarClose.addEventListener('click', () => {
  ghiNhoDaTuChoiMoi();
  signinBar.hidden = true;
});
modalClose.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal);

resumeLine.addEventListener('click', () => {
  if (resumeTarget) openLesson(resumeTarget.id, resumeTarget.type, resumeTarget.level);
});

favBtn.addEventListener('click', () => {
  if (!currentItem) return;
  toggleFav(currentItem.id);
  syncFavButton();
  renderHistory();
});

favFilterBtn.addEventListener('click', () => {
  favFilter = !favFilter;
  renderHistory();
});

// init
applyRate(loadRate(), false);
bilingual = loadBilingual(); // nhớ lựa chọn song ngữ từ lần vào trước

// Ảnh chụp nhật ký NGAY LÚC MỞ TRANG, trước khi loadNewItem() mở một bài ngẫu
// nhiên mới. "Bài lần trước" luôn tính trên ảnh chụp này — nếu tính trên nhật
// ký sống, bài gần nhất sẽ luôn là bài vừa tự mở ra và ô "Học tiếp" vô nghĩa.
const logKhiKhoiDong = readLog();
resumeTarget = getHistory(1, logKhiKhoiDong)[0] || null;
syncFavButton();
renderHistory();
renderVocab();
capNhatGiaoDienTaiKhoan(); // vẽ ngay ở chế độ khách, không chờ mạng
kiemTraDaiMoi();

loadNewItem();

// Khôi phục phiên đăng nhập (nếu có) rồi cập nhật lại nút tài khoản.
// Chạy sau loadNewItem() và KHÔNG await: mạng chậm hay Supabase lỗi thì app
// vẫn dùng được bình thường ở chế độ khách, chỉ là nút vẫn ghi "Đăng nhập".
khoiTaoAuth(phien => {
  capNhatGiaoDienTaiKhoan();
  if (!phien || !phien.user) return;
  // Nối tiếp chứ không chạy song song: hai việc này cùng bắn lúc mở trang,
  // và tạo hồ sơ là việc nhẹ hơn nhiều nên để nó xong trước cho gọn.
  // Không await ở ngoài — mạng chậm thì app vẫn dùng bình thường.
  taoHoSoNeuChua(phien.user).then(() => gopNeuCanThiet(phien.user));
});

// Nhật ký cũ (ghi từ trước khi có cache tên bài) chỉ có id. Lấp tên ở chế độ
// nền rồi vẽ lại — chạy sau nên không làm chậm lần tải đầu.
backfillTitles().then(coBoSung => {
  if (!coBoSung) return;
  if (!resumeTarget) resumeTarget = getHistory(1, logKhiKhoiDong)[0] || null;
  renderHistory();
});
