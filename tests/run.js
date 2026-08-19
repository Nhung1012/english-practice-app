// ============================================================
// Bộ kiểm thử cho Giai đoạn 2 (mục 1.4 dịch câu, 2.5 quiz).
// Chạy:  node tests/run.js
//
// Cách làm: nạp NGUYÊN nội dung supabase.js + app.js vào một DOM giả, thay vì
// chép lại logic ra file test. Chép lại thì test vẫn xanh khi code thật hỏng —
// đúng loại lỗi nguy hiểm nhất trong bộ test.
//
// (Trước Giai đoạn 3, hai file này còn nằm chung trong khối <script> của
// index.html và test phải bóc khối đó ra. Nay đọc thẳng file.)
// ============================================================
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { El, createDocument, createLocalStorage } = require('./minidom');

const ROOT = path.join(__dirname, '..');
const HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

const IDS = ('accAvatar accBtn accEmail accGuest accLabel accSigninBtn accSignoutBtn accSync accUser paneAccount '
  + 'accStats signinBar signinBarBtn signinBarClose signinCount '
  + 'biBtn copyBtn favBtn favList loopBtn modal modalBackdrop modalClose '
  + 'modalTitle modalBack nextBtn openHelpBtn openFavBtn openVocabBtn paneHelp paneFav paneVocab playBtn prevBtn quizBox '
  + 'vocabActions accLinks '
  + 'quizCard quizResetBtn quizScore quizSubmitBtn randomBtn rateRange rateValue '
  + 'reviewBtn reviewPanel scriptBox scriptLabel statusText topicCaret topicCombo topicCount '
  + 'topicListbox topicPanel topicSearch topicSearchClear topicText vocabList wordPopup wpClose '
  + 'wpExample wpIpa wpPos wpSave wpSpeak wpVi wpWord').split(' ');

// Nguồn của app = các file JS cục bộ, nạp ĐÚNG thứ tự index.html khai báo.
// Đọc thứ tự từ chính index.html chứ không viết cứng: nếu sau này thêm file
// mới mà quên cập nhật test, test sẽ đỏ ngay thay vì lặng lẽ bỏ sót code.
// `src` phải là đường dẫn tương đối: loại CDN (có "//") và cả script của Vercel
// Analytics (`/_vercel/...`) — những thứ đó không phải mã của app.
const JS_FILES = [...HTML.matchAll(/<script[^>]*\bsrc="([^"]+\.js)"/g)]
  .map(m => m[1])
  .filter(src => !src.startsWith('/') && !src.includes('//'));

function layMaNguon() {
  if (!JS_FILES.length) throw new Error('index.html không khai báo file .js cục bộ nào');
  return JS_FILES.map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n;\n');
}

// `let`/`const` ở cấp cao nhất KHÔNG gắn vào đối tượng global, nên từ ngoài
// không đọc/ghi được. Nối thêm một "cửa sổ" đọc/ghi vào cuối script — cửa sổ
// này chỉ tồn tại trong test, index.html thật không có dòng nào của nó.
const HOOK = `
;globalThis.__h = {
  get currentItem() { return currentItem; },  set currentItem(v) { currentItem = v; },
  get currentTab()  { return currentTab; },   set currentTab(v)  { currentTab = v; },
  get isPlaying()   { return isPlaying; },    set isPlaying(v)   { isPlaying = v; },
  get sentences()   { return sentences; },
  get quizAnswers() { return quizAnswers; },
  get quizDone()    { return quizDone; },
  get modalPane()   { return modalPane; },  set modalPane(v) { modalPane = v; },
  get phienDangNhap() { return phienDangNhap; }, set phienDangNhap(v) { phienDangNhap = v; },
  kiemTraDaiMoi, capNhatGiaoDienTaiKhoan, soBaiDaHoc,
  daTuChoiMoi, ghiNhoDaTuChoiMoi, nguoiDungHienTai, tenHienThi, anhDaiDien,
  recordLesson, rememberTitle,
  gopDuLieuLenTaiKhoan, dayLenTaiKhoan, docMocDay, daTungGop, veTrangThaiGop,
  locTuMoc, mocLonNhat, docThongKeTaiKhoan, capNhatThongKe,
  get thongKeServer() { return thongKeServer; }, set thongKeServer(v) { thongKeServer = v; },
  chuanBiDongLog, chuanBiDongVocab, readLog, readVocab, homNay,
  readSeen, markSeen, getSeenIds, getFavorites, renderFav, toggleFav, batDauPhienHoc, danhDauDaHoc,
  dungPhienHoc, nhipPhienHoc, chuyenNhatKyCu, speakFrom, recordLesson,
  veThongKe, openModal, closeModal,
  get phienHoc() { return phienHoc; }, NGUONG_GIAY,
  buildItem, buildSentences, renderScript, renderQuiz,
  setBilingual, toggleLineVi, loadBilingual, coBanDich,
  layQuiz, chamQuiz, nopQuiz, chonDapAn, logStudy,
  renderVocab, saveWord, removeWord, dueWords, gradeWord, ngayOnGanNhat, dinhDangNgay, congNgay
};
`;

function taoSandbox(opts = {}) {
  const document = createDocument();
  IDS.forEach(id => document.reg(id, /Btn|Line|Close|Save|Speak/.test(id) ? 'button' : 'div'));
  document.getElementById('rateRange').value = '1';

  const localStorage = createLocalStorage(opts.blockStorage);
  // Nạp sẵn dữ liệu TRƯỚC khi chạy mã app. Ghi sau lúc dựng sandbox là đua với
  // phần khởi động bất đồng bộ (loadNewItem → logStudy → writeLog): writeLog
  // ghi lại mảng nó đọc được từ trước, xoá mất thứ test vừa đặt vào.
  if (opts.storage) {
    Object.keys(opts.storage).forEach(k => localStorage.setItem(k, opts.storage[k]));
  }
  const win = {
    document,
    localStorage,
    // null -> supabaseClient = null, app chạy ở chế độ không có mạng.
    // Nhóm K truyền vào một Supabase giả để kiểm việc gộp dữ liệu (tuần 16).
    supabase: opts.supabase || null,
    speechSynthesis: {
      cancel() {}, speak() {}, pause() {}, resume() {}, getVoices() { return []; }
    },
    SpeechSynthesisUtterance: function (t) { this.text = t; },
    navigator: { clipboard: { writeText: async () => {} }, language: 'vi' },
    setTimeout, clearTimeout, clearInterval,
    // Phiên học tạo một `setInterval` 1 giây cho mỗi bài được mở. Timer thật
    // của Node giữ vòng lặp sự kiện sống, nên `node tests/run.js` chạy xong
    // vẫn treo, không bao giờ thoát. `unref()` cho nó chạy bình thường nhưng
    // không níu tiến trình lại.
    setInterval: (fn, ms) => {
      const id = setInterval(fn, ms);
      if (id && typeof id.unref === 'function') id.unref();
      return id;
    },
    fetch: async () => { throw new Error('offline trong test'); },
    console,
    addEventListener() {}, removeEventListener() {},
    matchMedia: () => ({ matches: false, addEventListener() {} })
  };
  win.window = win;
  const ctx = vm.createContext(win);
  vm.runInContext(layMaNguon() + HOOK, ctx, { filename: JS_FILES.join('+') });
  const h = ctx.__h;
  h.document = document;
  h.localStorage = localStorage;
  return h;
}

// ---------- khung test nhỏ ----------
let pass = 0, fail = 0;
const loi = [];
function t(ten, fn) {
  try { fn(); pass++; }
  catch (e) { fail++; loi.push(`${ten}\n    → ${e.message}`); }
}
async function ta(ten, fn) {
  try { await fn(); pass++; }
  catch (e) { fail++; loi.push(`${ten}\n    → ${e.message}`); }
}
function eq(a, b, msg) {
  const sa = JSON.stringify(a), sb = JSON.stringify(b);
  if (sa !== sb) throw new Error(`${msg || ''} nhận ${sa}, mong ${sb}`);
}
function ok(v, msg) { if (!v) throw new Error(msg || 'mong đợi true'); }

const QUIZ_MAU = [
  { q: 'Q1', a: ['a', 'b', 'c', 'd'], correct: 2, explain: 'vì vậy' },
  { q: 'Q2', a: ['a', 'b'], correct: 0, explain: '' }
];

// ============================================================
// A. buildItem — giữ được bản dịch & quiz qua CẢ HAI đường lấy bài
// ============================================================
{
  const c = taoSandbox();

  t('A1 dialogue: giữ nguyên lines kèm vi', () => {
    const it = c.buildItem({ id: 5, topic: 'T', data: { lines: [{ s: 'A', t: 'Hi', vi: 'Chào' }] } }, 'dialogue');
    eq(it.lines[0].vi, 'Chào');
    eq(it.id, 5);
  });

  t('A2 listening: giữ mảng data.vi', () => {
    const it = c.buildItem({ id: 6, topic: 'T', data: { text: 'One. Two.', vi: ['Một.', 'Hai.'] } }, 'listening');
    eq(it.vi, ['Một.', 'Hai.']);
  });

  t('A3 bài chưa soạn: vi và quiz là null, không phải undefined/[]', () => {
    const it = c.buildItem({ id: 7, topic: 'T', data: { text: 'One.' } }, 'listening');
    eq(it.vi, null);
    eq(it.quiz, null);
  });

  t('A4 quiz rỗng cũng coi như chưa có', () => {
    eq(c.buildItem({ id: 8, topic: 'T', data: { text: 'x', quiz: [] } }, 'listening').quiz, null);
  });

  t('A5 data thiếu hẳn: không ném lỗi', () => {
    const it = c.buildItem({ id: 9, topic: 'T' }, 'listening');
    eq(it.quiz, null);
  });

  t('A6 quiz lấy được cho cả loại dialogue', () => {
    const it = c.buildItem({ id: 10, topic: 'T', data: { lines: [], quiz: QUIZ_MAU } }, 'dialogue');
    eq(it.quiz.length, 2);
  });
}

// ============================================================
// B. buildSentences — gắn bản dịch đúng câu
// ============================================================
{
  const c = taoSandbox();

  t('B1 dialogue: mỗi câu mang đúng bản dịch của nó', () => {
    c.currentTab = 'dialogue';
    c.currentItem = { id: 1, lines: [{ s: 'A', t: 'Hi', vi: 'Chào' }, { s: 'B', t: 'Bye', vi: 'Tạm biệt' }] };
    const s = c.buildSentences();
    eq(s.map(x => x.vi), ['Chào', 'Tạm biệt']);
  });

  t('B2 dialogue chưa dịch: vi là chuỗi rỗng, không phải undefined', () => {
    c.currentTab = 'dialogue';
    c.currentItem = { id: 1, lines: [{ s: 'A', t: 'Hi' }] };
    eq(c.buildSentences()[0].vi, '');
  });

  t('B3 listening: mảng vi khớp số câu thì gắn theo đúng thứ tự', () => {
    c.currentTab = 'listening';
    c.currentItem = { id: 2, text: 'One. Two. Three.', vi: ['Một.', 'Hai.', 'Ba.'] };
    const s = c.buildSentences();
    eq(s.length, 3);
    eq(s.map(x => x.vi), ['Một.', 'Hai.', 'Ba.']);
  });

  t('B4 listening: LỆCH số câu thì bỏ hết bản dịch (thà thiếu còn hơn sai chỗ)', () => {
    c.currentTab = 'listening';
    c.currentItem = { id: 2, text: 'One. Two. Three.', vi: ['Một.', 'Hai.'] };
    eq(c.buildSentences().map(x => x.vi), ['', '', '']);
  });

  t('B5 listening: câu cuối không có dấu chấm vẫn được tính (lỗi cũ của regex)', () => {
    c.currentTab = 'listening';
    c.currentItem = { id: 2, text: 'One. Two', vi: ['Một.', 'Hai'] };
    const s = c.buildSentences();
    eq(s.length, 2);
    eq(s[1].vi, 'Hai');
  });

  t('B6 vi không phải mảng thì bỏ qua, không ném lỗi', () => {
    c.currentTab = 'listening';
    c.currentItem = { id: 2, text: 'One.', vi: 'Một.' };
    eq(c.buildSentences()[0].vi, '');
  });

  t('B7 chưa có bài nào thì trả mảng rỗng', () => {
    c.currentItem = null;
    eq(c.buildSentences(), []);
  });
}

// ============================================================
// C. renderScript + nút 👁 + chế độ song ngữ
// ============================================================
{
  const c = taoSandbox();
  const box = c.document.getElementById('scriptBox');
  const bi = c.document.getElementById('biBtn');

  const datBaiCoDich = () => {
    c.currentTab = 'dialogue';
    c.currentItem = {
      id: 1,
      lines: [{ s: 'A', t: 'Hi', vi: 'Chào' }, { s: 'B', t: 'Bye', vi: 'Tạm biệt' }]
    };
    c.renderScript();
  };

  t('C1 mỗi câu có dịch được dựng đúng 1 nút 👁 và 1 khung dịch', () => {
    datBaiCoDich();
    eq(box.querySelectorAll('.line-eye').length, 2);
    eq(box.querySelectorAll('.line-vi').length, 2);
  });

  t('C2 mặc định bản dịch bị ẩn', () => {
    datBaiCoDich();
    ok(box.querySelectorAll('.line-vi').every(e => e.hidden === true));
  });

  t('C3 bấm 👁 hiện bản dịch của ĐÚNG câu đó, câu khác không đổi', () => {
    datBaiCoDich();
    const eyes = box.querySelectorAll('.line-eye');
    eyes[1].dispatch('click');
    const vis = box.querySelectorAll('.line-vi');
    eq(vis[0].hidden, true, 'câu 1 phải vẫn ẩn:');
    eq(vis[1].hidden, false, 'câu 2 phải hiện:');
  });

  t('C4 bấm 👁 lần nữa thì ẩn lại', () => {
    datBaiCoDich();
    const eye = box.querySelectorAll('.line-eye')[0];
    eye.dispatch('click');
    eye.dispatch('click');
    eq(box.querySelectorAll('.line-vi')[0].hidden, true);
  });

  t('C5 bấm 👁 KHÔNG làm dừng phần đang đọc', () => {
    datBaiCoDich();
    c.isPlaying = true;
    box.querySelectorAll('.line-eye')[0].dispatch('click');
    eq(c.isPlaying, true, 'vẫn phải đang đọc:');
  });

  t('C6 bài KHÔNG có bản dịch: không nút 👁 nào, nút bật song ngữ tự ẩn', () => {
    c.currentTab = 'dialogue';
    c.currentItem = { id: 2, lines: [{ s: 'A', t: 'Hi' }] };
    c.renderScript();
    eq(box.querySelectorAll('.line-eye').length, 0);
    eq(bi.hidden, true);
  });

  t('C7 bài có bản dịch thì nút bật song ngữ hiện ra', () => {
    datBaiCoDich();
    eq(bi.hidden, false);
  });

  t('C8 bật song ngữ: mọi câu hiện dịch cùng lúc', () => {
    datBaiCoDich();
    c.setBilingual(true);
    ok(box.querySelectorAll('.line-vi').every(e => e.hidden === false));
    eq(bi.getAttribute('aria-pressed'), 'true');
  });

  t('C9 lựa chọn song ngữ được nhớ sang bài kế tiếp', () => {
    datBaiCoDich();
    c.setBilingual(true);
    datBaiCoDich(); // "mở bài mới"
    ok(box.querySelectorAll('.line-vi').every(e => e.hidden === false), 'bài mới phải hiện sẵn bản dịch');
  });

  t('C10 tắt song ngữ thì ẩn hết trở lại', () => {
    datBaiCoDich();
    c.setBilingual(true);
    c.setBilingual(false);
    ok(box.querySelectorAll('.line-vi').every(e => e.hidden === true));
  });

  t('C11 lựa chọn song ngữ được ghi vào localStorage đúng khoá', () => {
    c.setBilingual(true);
    eq(c.localStorage.getItem('ep:bilingual'), '1');
    c.setBilingual(false);
    eq(c.localStorage.getItem('ep:bilingual'), '0');
  });

  t('C12 toggleLineVi ở câu không tồn tại trả null, không ném lỗi', () => {
    datBaiCoDich();
    eq(c.toggleLineVi(99), null);
  });

  t('C13 bản dịch dựng bằng textContent, không phải HTML (chống XSS từ DB)', () => {
    c.currentTab = 'dialogue';
    c.currentItem = { id: 3, lines: [{ s: 'A', t: 'Hi', vi: '<img src=x onerror=1>' }] };
    c.renderScript();
    const el = box.querySelectorAll('.line-vi')[0];
    eq(el.textContent, '<img src=x onerror=1>');
    eq(el.innerHTML, '');
  });
}

// ============================================================
// D. Quiz — dựng, chọn, chấm
// ============================================================
{
  const c = taoSandbox();
  const qbox = c.document.getElementById('quizBox');
  const qcard = c.document.getElementById('quizCard');
  const nop = c.document.getElementById('quizSubmitBtn');
  const lam = c.document.getElementById('quizResetBtn');
  const diem = c.document.getElementById('quizScore');

  const datBaiCoQuiz = () => {
    c.currentTab = 'dialogue';
    c.currentItem = { id: 42, lines: [{ s: 'A', t: 'Hi' }], quiz: JSON.parse(JSON.stringify(QUIZ_MAU)) };
    c.renderScript();
  };

  t('D1 bài không có quiz thì khung tự ẩn', () => {
    c.currentItem = { id: 1, lines: [{ s: 'A', t: 'Hi' }] };
    c.renderScript();
    eq(qcard.hidden, true);
  });

  t('D2 bài có quiz: hiện khung, dựng đủ câu và đủ lựa chọn', () => {
    datBaiCoQuiz();
    eq(qcard.hidden, false);
    eq(qbox.querySelectorAll('.quiz-q').length, 2);
    eq(qbox.querySelectorAll('.quiz-opt').length, 6);
  });

  t('D3 chưa trả lời hết thì không cho nộp', () => {
    datBaiCoQuiz();
    eq(nop.disabled, true);
    qbox.querySelectorAll('.quiz-opt[data-q="0"]')[0].dispatch('click');
    eq(nop.disabled, true, 'mới trả lời 1/2 câu:');
  });

  t('D4 trả lời đủ thì mới bật nút nộp', () => {
    datBaiCoQuiz();
    qbox.querySelectorAll('.quiz-opt[data-q="0"]')[0].dispatch('click');
    qbox.querySelectorAll('.quiz-opt[data-q="1"]')[0].dispatch('click');
    eq(nop.disabled, false);
  });

  t('D5 đổi ý trước khi nộp: chỉ một lựa chọn được đánh dấu', () => {
    datBaiCoQuiz();
    const opts = qbox.querySelectorAll('.quiz-opt[data-q="0"]');
    opts[0].dispatch('click');
    opts[3].dispatch('click');
    eq(opts.filter(o => o.classList.contains('picked')).length, 1);
    ok(opts[3].classList.contains('picked'));
  });

  t('D6 chấm đúng hết = 1.0', () => {
    datBaiCoQuiz();
    qbox.querySelectorAll('.quiz-opt[data-q="0"]')[2].dispatch('click');
    qbox.querySelectorAll('.quiz-opt[data-q="1"]')[0].dispatch('click');
    eq(c.nopQuiz(), { dung: 2, tong: 2, diem: 1 });
  });

  t('D7 chấm sai một nửa = 0.5', () => {
    datBaiCoQuiz();
    qbox.querySelectorAll('.quiz-opt[data-q="0"]')[0].dispatch('click');
    qbox.querySelectorAll('.quiz-opt[data-q="1"]')[0].dispatch('click');
    eq(c.nopQuiz().diem, 0.5);
  });

  t('D8 sau khi nộp: đáp án đúng tô xanh, chỗ chọn sai tô đỏ', () => {
    datBaiCoQuiz();
    qbox.querySelectorAll('.quiz-opt[data-q="0"]')[0].dispatch('click');
    qbox.querySelectorAll('.quiz-opt[data-q="1"]')[1].dispatch('click');
    c.nopQuiz();
    const q0 = qbox.querySelectorAll('.quiz-opt[data-q="0"]');
    ok(q0[2].classList.contains('right'), 'đáp án đúng phải xanh');
    ok(q0[0].classList.contains('wrong'), 'chỗ chọn sai phải đỏ');
  });

  t('D9 đáp án đúng vẫn tô xanh kể cả khi người học chọn đúng', () => {
    datBaiCoQuiz();
    qbox.querySelectorAll('.quiz-opt[data-q="0"]')[2].dispatch('click');
    qbox.querySelectorAll('.quiz-opt[data-q="1"]')[0].dispatch('click');
    c.nopQuiz();
    ok(qbox.querySelectorAll('.quiz-opt[data-q="0"]')[2].classList.contains('right'));
  });

  t('D10 nộp xong thì khoá lại, không sửa được đáp án', () => {
    datBaiCoQuiz();
    qbox.querySelectorAll('.quiz-opt[data-q="0"]')[0].dispatch('click');
    qbox.querySelectorAll('.quiz-opt[data-q="1"]')[0].dispatch('click');
    c.nopQuiz();
    const truoc = JSON.stringify(c.quizAnswers);
    qbox.querySelectorAll('.quiz-opt[data-q="0"]')[3].dispatch('click');
    eq(JSON.stringify(c.quizAnswers), truoc);
  });

  t('D11 nộp hai lần không cộng điểm/ghi log lần hai', () => {
    datBaiCoQuiz();
    qbox.querySelectorAll('.quiz-opt[data-q="0"]')[2].dispatch('click');
    qbox.querySelectorAll('.quiz-opt[data-q="1"]')[0].dispatch('click');
    c.nopQuiz();
    eq(c.nopQuiz(), null);
  });

  t('D12 nộp khi chưa trả lời hết trả về null', () => {
    datBaiCoQuiz();
    qbox.querySelectorAll('.quiz-opt[data-q="0"]')[0].dispatch('click');
    eq(c.nopQuiz(), null);
  });

  t('D13 giải thích hiện ra sau khi nộp, cho MỌI câu có explain', () => {
    datBaiCoQuiz();
    qbox.querySelectorAll('.quiz-opt[data-q="0"]')[2].dispatch('click');
    qbox.querySelectorAll('.quiz-opt[data-q="1"]')[0].dispatch('click');
    eq(qbox.querySelectorAll('.quiz-explain').length, 0, 'trước khi nộp:');
    c.nopQuiz();
    eq(qbox.querySelectorAll('.quiz-explain').length, 1, 'chỉ câu 1 có explain:');
  });

  t('D14 hiện điểm dạng "Đúng x/y"', () => {
    datBaiCoQuiz();
    qbox.querySelectorAll('.quiz-opt[data-q="0"]')[2].dispatch('click');
    qbox.querySelectorAll('.quiz-opt[data-q="1"]')[0].dispatch('click');
    c.nopQuiz();
    ok(/Đúng 2\/2/.test(diem.textContent), `nhận "${diem.textContent}"`);
  });

  t('D15 "Làm lại" xoá sạch đáp án và kết quả cũ', () => {
    datBaiCoQuiz();
    qbox.querySelectorAll('.quiz-opt[data-q="0"]')[2].dispatch('click');
    qbox.querySelectorAll('.quiz-opt[data-q="1"]')[0].dispatch('click');
    c.nopQuiz();
    lam.dispatch('click');
    eq(c.quizAnswers, {});
    eq(c.quizDone, false);
    eq(qbox.querySelectorAll('.quiz-explain').length, 0);
    eq(diem.textContent, '');
    eq(nop.hidden, false);
  });

  t('D16 câu hỏi hỏng bị loại, các câu còn lại vẫn dùng được', () => {
    c.currentTab = 'dialogue';
    c.currentItem = {
      id: 43, lines: [{ s: 'A', t: 'Hi' }],
      quiz: [
        { q: 'ok', a: ['x', 'y'], correct: 1 },
        { q: 'thiếu lựa chọn', a: ['x'], correct: 0 },
        { q: 'correct ngoài mảng', a: ['x', 'y'], correct: 9 },
        { q: '', a: ['x', 'y'], correct: 0 },
        { a: ['x', 'y'], correct: 0 }
      ]
    };
    c.renderScript();
    eq(c.layQuiz().length, 1);
    eq(qbox.querySelectorAll('.quiz-q').length, 1);
  });

  t('D17 quiz hỏng hoàn toàn -> ẩn khung, không hiện khung rỗng', () => {
    c.currentTab = 'dialogue';
    c.currentItem = { id: 44, lines: [{ s: 'A', t: 'Hi' }], quiz: [{ q: 'x', a: ['a'], correct: 0 }] };
    c.renderScript();
    eq(qcard.hidden, true);
  });

  t('D18 đổi bài thì quiz bài cũ biến mất hoàn toàn', () => {
    datBaiCoQuiz();
    qbox.querySelectorAll('.quiz-opt[data-q="0"]')[2].dispatch('click');
    c.currentItem = { id: 45, lines: [{ s: 'A', t: 'Hi' }] };
    c.renderScript();
    eq(qcard.hidden, true);
    eq(qbox.querySelectorAll('.quiz-opt').length, 0);
    eq(c.quizAnswers, {});
  });
}

// ============================================================
// E. Nhật ký học — vẫn ĐÚNG 5 cột của bảng study_log
// ============================================================
{
  const c = taoSandbox();
  const qbox = c.document.getElementById('quizBox');
  const COT = ['content_id', 'mode', 'score', 'seconds', 'created_at'];

  t('E1 làm quiz xong ghi 1 bản ghi mode="quiz" kèm điểm', () => {
    c.localStorage.setItem('ep:log', '[]');
    c.currentTab = 'dialogue';
    c.currentItem = { id: 77, lines: [{ s: 'A', t: 'Hi' }], quiz: JSON.parse(JSON.stringify(QUIZ_MAU)) };
    c.renderScript();
    qbox.querySelectorAll('.quiz-opt[data-q="0"]')[2].dispatch('click');
    qbox.querySelectorAll('.quiz-opt[data-q="1"]')[0].dispatch('click');
    c.nopQuiz();
    const log = JSON.parse(c.localStorage.getItem('ep:log'));
    const cuoi = log[log.length - 1];
    eq(cuoi.mode, 'quiz');
    eq(cuoi.content_id, 77);
    eq(cuoi.score, 1);
  });

  t('E2 bản ghi vẫn ĐÚNG 5 cột study_log, không thừa trường nào', () => {
    const log = JSON.parse(c.localStorage.getItem('ep:log'));
    log.forEach(e => eq(Object.keys(e).sort(), COT.slice().sort()));
  });

  t('E3 mode "read" vẫn có score = null (không phải undefined)', () => {
    c.localStorage.setItem('ep:log', '[]');
    c.logStudy(5, 'read');
    eq(JSON.parse(c.localStorage.getItem('ep:log'))[0].score, null);
  });

  t('E4 score không hợp lệ (NaN/chuỗi) bị quy về null', () => {
    c.localStorage.setItem('ep:log', '[]');
    c.logStudy(5, 'quiz', NaN);
    c.logStudy(6, 'quiz', 'giỏi');
    JSON.parse(c.localStorage.getItem('ep:log')).forEach(e => eq(e.score, null));
  });

  t('E5 logStudy không có id thì không ghi gì', () => {
    c.localStorage.setItem('ep:log', '[]');
    c.logStudy(null, 'quiz', 1);
    eq(JSON.parse(c.localStorage.getItem('ep:log')).length, 0);
  });
}

// ============================================================
// F. localStorage bị chặn -> app vẫn chạy
// ============================================================
{
  t('F1 localStorage bị chặn: nạp trang và dựng bài không ném lỗi', () => {
    const c = taoSandbox({ blockStorage: true });
    c.currentTab = 'dialogue';
    c.currentItem = { id: 1, lines: [{ s: 'A', t: 'Hi', vi: 'Chào' }], quiz: QUIZ_MAU };
    c.renderScript();
    c.setBilingual(true);
    eq(c.loadBilingual(), false, 'không đọc được thì về mặc định tắt:');
  });
}

// ============================================================
// G. Nút "🎯 Ôn tập" — lối vào tính năng SRS
// Từng bị ẩn hẳn khi chưa có từ tới hạn, khiến người dùng tưởng app không có
// tính năng này. Nhóm test này giữ cho lỗi đó không quay lại.
// ============================================================
{
  const c = taoSandbox();
  const btn = c.document.getElementById('reviewBtn');
  const list = c.document.getElementById('vocabList');

  const moSoTu = () => { c.modalPane = 'vocab'; c.renderVocab(); };

  t('G1 sổ từ trống: ẩn nút, và hiện hướng dẫn cách lưu từ', () => {
    c.localStorage.setItem('ep:vocab', '[]');
    moSoTu();
    eq(btn.hidden, true);
    ok(/bấm ☆/.test(list.textContent), `nhận "${list.textContent.slice(0, 60)}"`);
  });

  t('G2 vừa lưu từ: nút hiện, bấm được ngay, đếm đúng số từ', () => {
    c.localStorage.setItem('ep:vocab', '[]');
    c.saveWord('straight', { ipa: '/streɪt/', vi: 'thẳng' }, 1);
    moSoTu();
    eq(btn.hidden, false);
    eq(btn.disabled, false);
    ok(/\(1\)/.test(btn.textContent), `nhận "${btn.textContent}"`);
  });

  t('G3 ôn hết rồi: nút VẪN hiện (chỉ mờ đi), không biến mất', () => {
    c.localStorage.setItem('ep:vocab', '[]');
    c.saveWord('straight', {}, 1);
    c.gradeWord('straight', true); // nhớ -> đẩy sang hộp 2, 3 ngày sau mới ôn lại
    moSoTu();
    eq(btn.hidden, false, 'đây chính là lỗi cũ — nút không được phép biến mất:');
    eq(btn.disabled, true);
    ok(/\(0\)/.test(btn.textContent), `nhận "${btn.textContent}"`);
  });

  t('G4 chưa tới hạn: nói rõ ngày ôn kế tiếp thay vì để nút mờ không lý do', () => {
    c.localStorage.setItem('ep:vocab', '[]');
    c.saveWord('straight', {}, 1);
    c.gradeWord('straight', true);
    moSoTu();
    const ngay = c.dinhDangNgay(c.congNgay(3)); // hộp 2 = 3 ngày
    ok(list.textContent.includes(ngay), `mong thấy "${ngay}" trong "${list.textContent.slice(0, 90)}"`);
  });

  t('G5 ngayOnGanNhat trả ngày sớm nhất, sổ trống thì trả chuỗi rỗng', () => {
    c.localStorage.setItem('ep:vocab', '[]');
    eq(c.ngayOnGanNhat(), '');
    c.localStorage.setItem('ep:vocab', JSON.stringify([
      { word: 'a', due_date: '2026-09-01' },
      { word: 'b', due_date: '2026-08-20' },
      { word: 'c', due_date: '2026-12-31' }
    ]));
    eq(c.ngayOnGanNhat(), '2026-08-20');
  });

  t('G6 dinhDangNgay đổi sang dd/mm/yyyy, dữ liệu hỏng thì trả nguyên chuỗi', () => {
    eq(c.dinhDangNgay('2026-08-20'), '20/08/2026');
    eq(c.dinhDangNgay('hỏng'), 'hỏng');
    eq(c.dinhDangNgay(null), '');
  });

  t('G7 đang trong phiên ôn thì ẩn nút (tránh bấm chồng phiên)', () => {
    c.localStorage.setItem('ep:vocab', '[]');
    c.saveWord('straight', {}, 1);
    moSoTu();
    c.document.getElementById('reviewBtn').dispatch('click'); // bắt đầu ôn
    eq(btn.hidden, true);
  });
}

// ============================================================
// H. Cấu trúc file sau Giai đoạn 3 — canh cho việc tách file không bị đổ lại
// ============================================================
{
  t('H1 index.html nạp đúng supabase.js rồi tới app.js', () => {
    eq(JS_FILES, ['supabase.js', 'app.js']);
  });

  t('H2 index.html không còn logic viết thẳng trong trang', () => {
    // Chỉ còn duy nhất một khối inline: shim `window.va` của Vercel Analytics.
    const inline = [...HTML.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)]
      .map(m => m[1].trim());
    eq(inline.length, 1);
    ok(inline[0].includes('window.va'), 'khối inline duy nhất phải là Vercel Analytics');
    ok(inline[0].split('\n').length <= 3, 'không được nhét thêm code vào index.html');
  });

  t('H3 index.html không còn CSS viết thẳng trong trang', () => {
    ok(!/<style[\s>]/.test(HTML), 'CSS phải nằm ở styles.css');
    ok(/href="styles\.css"/.test(HTML), 'thiếu thẻ link tới styles.css');
  });

  t('H4 app.js không tự tạo client Supabase (chỉ supabase.js được làm)', () => {
    const app = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
    ok(!app.includes('createClient'), 'cấu hình kết nối phải nằm gọn ở supabase.js');
    ok(!app.includes('SUPABASE_ANON_KEY'), 'khoá kết nối phải nằm gọn ở supabase.js');
  });

  t('H5 app.js không dùng defer (nó đọc DOM ngay ở cấp cao nhất)', () => {
    ok(/<script src="app\.js"><\/script>/.test(HTML),
      'thêm defer/async vào app.js sẽ làm các getElementById ở đầu file trả null');
  });
}

// ============================================================
// I. Hướng dẫn nhanh — chuyển từ header xuống nút ❓ cuối trang (2026-08-04)
// ============================================================
{
  const c = taoSandbox();
  const d = c.document;
  const helpBtn = d.getElementById('openHelpBtn');
  const paneHelp = d.getElementById('paneHelp');
  const paneVocab = d.getElementById('paneVocab');
  const paneFav = d.getElementById('paneFav');

  t('I1 bấm ❓ mở đúng khung hướng dẫn, hai khung kia đóng', () => {
    helpBtn.dispatch('click');
    eq(c.modalPane, 'help');
    eq([paneHelp.hidden, paneFav.hidden, paneVocab.hidden], [false, true, true]);
    eq(d.getElementById('modal').hidden, false);
  });

  t('I2 hàng tiêu đề popup chỉ còn quay-lại / tên khung / đóng', () => {
    // Trước 2026-08-19 nút "🎯 Ôn tập" nằm ở hàng tiêu đề DÙNG CHUNG, nên quên
    // ẩn là nó hiện ngay trong trang Hướng dẫn và bấm vào thì lạc sang phiên
    // ôn tập. Nay nút đã nằm trong thân khung Sổ từ, không thể rò sang khung
    // khác được nữa — đó là cách sửa chắc hơn việc nhớ ẩn ở mọi nhánh.
    //
    // minidom đăng ký phần tử PHẲNG, không có quan hệ cha–con, nên việc "nằm
    // trong khung nào" chỉ kiểm được bằng cách đọc thẳng index.html (bài học
    // của N8).
    const head = HTML.match(/<div class="modal-head">([\s\S]*?)<\/div>\s*<div class="modal-body">/);
    ok(head, 'không tìm thấy hàng tiêu đề popup');
    ok(!/id="reviewBtn"/.test(head[1]), 'nút Ôn tập vẫn nằm ở hàng tiêu đề dùng chung');
    ok(/id="modalBack"/.test(head[1]) && /id="modalClose"/.test(head[1]),
      'hàng tiêu đề phải có nút quay lại và nút đóng');

    const paneVocab = HTML.match(/<div id="paneVocab" hidden>([\s\S]*?)<div id="paneAccount"/);
    ok(paneVocab && /id="reviewBtn"/.test(paneVocab[1]),
      'nút Ôn tập phải nằm trong thân khung Sổ từ');

    helpBtn.dispatch('click');
    eq(d.getElementById('modalTitle').textContent, 'Hướng dẫn nhanh');
    eq(d.getElementById('modalBack').hidden, true,
      'khung Hướng dẫn mở thẳng từ màn hình chính, không có chỗ nào để quay lại');
  });

  t('I3 mở Sổ từ sau đó thì khung hướng dẫn phải đóng lại', () => {
    helpBtn.dispatch('click');
    d.getElementById('openVocabBtn').dispatch('click');
    eq(c.modalPane, 'vocab');
    eq(paneHelp.hidden, true);
  });

  t('I4 nút ❓ LUÔN hiện, không bị ẩn theo trạng thái nào', () => {
    // Đã hai lần mắc lỗi ẩn lối vào của một tính năng (mục 10 kế hoạch).
    ok(!/id="openHelpBtn"[^>]*\shidden/.test(HTML), 'nút hướng dẫn không được có thuộc tính hidden');
    ok(!fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8').includes('openHelpBtn.hidden'),
      'không được ẩn nút hướng dẫn từ code');
  });

  t('I5 header không còn dòng hướng dẫn dài, nội dung đã nằm trong popup', () => {
    const header = HTML.match(/<header>([\s\S]*?)<\/header>/)[1];
    ok(!header.includes('phiên âm'), 'hướng dẫn phải rời khỏi header');
    ok(header.split('<p').length - 1 <= 1, 'header chỉ nên còn 1 dòng mô tả');
    const help = HTML.match(/id="paneHelp"([\s\S]*?)<\/div>\s*<\/div>/)[1];
    ['phiên âm', '👁', '🎯 Ôn tập', '🇻🇳'].forEach(k =>
      ok(help.includes(k), `hướng dẫn thiếu mục "${k}"`));
  });
}

// ============================================================
// J. Đăng nhập (tuần 14–15) — chế độ khách và dải mời
// ============================================================
{
  const c = taoSandbox();
  const d = c.document;
  const bar = d.getElementById('signinBar');

  // Giả lập đã học N bài KHÁC NHAU bằng cách ghi thẳng nhật ký.
  const hocNBai = (n) => {
    const log = [];
    for (let i = 1; i <= n; i++) {
      log.push({ content_id: i, mode: 'read', score: null, seconds: null,
                 created_at: new Date().toISOString() });
    }
    c.localStorage.setItem('ep:log', JSON.stringify(log));
  };
  const khach = () => { c.phienDangNhap = null; };
  const daDangNhap = () => {
    c.phienDangNhap = { user: { id: 'u1', email: 'an@example.com',
                                user_metadata: { full_name: 'An Nguyễn' } } };
  };

  t('J1 chưa đăng nhập thì app vẫn chạy đủ, không khoá gì', () => {
    khach();
    eq(c.nguoiDungHienTai(), null);
    // vẫn lưu được từ, vẫn ghi được nhật ký, vẫn chấm được quiz
    c.localStorage.setItem('ep:vocab', '[]');
    eq(c.saveWord('straight', {}, 1), true);
    c.localStorage.setItem('ep:log', '[]');
    c.logStudy(7, 'read');
    eq(JSON.parse(c.localStorage.getItem('ep:log')).length, 1);
    // vẫn chấm được quiz
    c.currentItem = { id: 7, topic: 'x', lines: [], quiz: QUIZ_MAU };
    c.currentTab = 'dialogue';
    c.renderQuiz();
    c.chonDapAn(0, 2); c.chonDapAn(1, 0);
    eq(c.chamQuiz().dung, 2);
    // vẫn ôn được từ
    ok(c.dueWords().length >= 1, 'từ vừa lưu phải tới hạn ôn ngay');
  });

  t('J2 học 2 bài thì CHƯA mời, đủ 3 bài mới mời', () => {
    khach();
    c.localStorage.removeItem('ep:signinHint');
    hocNBai(2); c.kiemTraDaiMoi(); eq(bar.hidden, true);
    hocNBai(3); c.kiemTraDaiMoi(); eq(bar.hidden, false);
    eq(d.getElementById('signinCount').textContent, '3');
  });

  t('J3 mở đi mở lại CÙNG một bài không tính là học nhiều bài', () => {
    // Đếm theo số dòng nhật ký thì dải mời bật ngay lần đầu vào trang,
    // vì app tự mở một bài rồi người dùng bấm "Đổi chủ đề" vài lần.
    khach();
    c.localStorage.removeItem('ep:signinHint');
    c.localStorage.setItem('ep:log', JSON.stringify(
      [1, 1, 1, 1, 1].map(id => ({ content_id: id, mode: 'read', score: null,
        seconds: null, created_at: new Date().toISOString() }))));
    eq(c.soBaiDaHoc(), 1);
    c.kiemTraDaiMoi();
    eq(bar.hidden, true);
  });

  t('J4 bấm ✕ là không mời lại, kể cả khi học thêm bài', () => {
    khach();
    c.localStorage.removeItem('ep:signinHint');
    hocNBai(3); c.kiemTraDaiMoi(); eq(bar.hidden, false);
    d.getElementById('signinBarClose').dispatch('click');
    eq(bar.hidden, true);
    eq(c.daTuChoiMoi(), true);
    hocNBai(20); c.kiemTraDaiMoi();
    eq(bar.hidden, true);
  });

  t('J5 đã đăng nhập thì không bao giờ mời nữa', () => {
    c.localStorage.removeItem('ep:signinHint');
    hocNBai(10);
    daDangNhap();
    c.kiemTraDaiMoi();
    eq(bar.hidden, true);
  });

  t('J6 nút tài khoản đổi nhãn theo trạng thái, tên lấy đúng thứ tự ưu tiên', () => {
    khach(); c.capNhatGiaoDienTaiKhoan();
    eq(d.getElementById('accLabel').textContent, 'Đăng nhập');
    eq(d.getElementById('accGuest').hidden, false);
    eq(d.getElementById('accUser').hidden, true);

    daDangNhap(); c.capNhatGiaoDienTaiKhoan();
    eq(d.getElementById('accLabel').textContent, 'An Nguyễn');
    eq(d.getElementById('accEmail').textContent, 'an@example.com');
    eq(d.getElementById('accGuest').hidden, true);
    eq(d.getElementById('accUser').hidden, false);
  });

  t('J7 không có full_name thì lấy phần trước @ chứ không để trống', () => {
    eq(c.tenHienThi({ email: 'binh@example.com', user_metadata: {} }), 'binh');
    eq(c.tenHienThi({ email: '', user_metadata: {} }), 'Tài khoản');
    eq(c.tenHienThi(null), '');
    eq(c.anhDaiDien({ user_metadata: { picture: 'https://x/y.png' } }), 'https://x/y.png');
  });

  t('J8 nút tài khoản LUÔN hiện, không ẩn theo trạng thái nào', () => {
    ok(!/id="accBtn"[^>]*\shidden/.test(HTML), 'nút tài khoản không được có hidden');
    const app = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
    ok(!app.includes('accBtn.hidden'), 'không được ẩn nút tài khoản từ code');
  });

  t('J9 đăng nhập/đăng xuất KHÔNG được xoá localStorage', () => {
    // Tuần 16 mới làm việc gộp dữ liệu. Ở tuần này mà lỡ xoá thì người dùng
    // đăng nhập xong mất sạch sổ từ — rủi ro "Cao" số 1 ở mục 9.
    const nguon = fs.readFileSync(path.join(ROOT, 'supabase.js'), 'utf8')
                + fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
    ok(!/localStorage\.clear\s*\(/.test(nguon), 'không được gọi localStorage.clear()');
    ['ep:log', 'ep:vocab', 'ep:titles', 'ep:fav'].forEach(k =>
      ok(!new RegExp(`removeItem\\(\\s*['"\`]${k}`).test(nguon),
        `không được xoá khoá ${k}`));
  });

  t('J10 Supabase hỏng thì vẫn vào được chế độ khách, không ném lỗi', () => {
    // taoSandbox() chạy với supabase: null -> supabaseClient = null.
    const c2 = taoSandbox();
    eq(c2.nguoiDungHienTai(), null);
    eq(c2.document.getElementById('accLabel').textContent, 'Đăng nhập');
    eq(c2.document.getElementById('signinBar').hidden, true);
  });
}

// ============================================================
// L. `hidden` trong JS phải thật sự ẩn được trên trình duyệt
//
// Lỗi có thật (17/8): đăng nhập rồi mà dải mời đăng nhập vẫn hiện. Code đúng —
// `signinBar.hidden = true` chạy chuẩn và test J5 vẫn xanh — nhưng
// `.signin-bar { display: flex }` đè lên luật ẩn mặc định của trình duyệt, nên
// thuộc tính `hidden` không có tác dụng gì về mặt hình ảnh.
//
// Đây là loại lỗi bộ test cũ KHÔNG THỂ bắt, vì DOM giả chỉ có thuộc tính chứ
// không có tầng CSS. Nên hai test dưới đọc thẳng file CSS.
// ============================================================
{
  const CSS = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8');
  const APP = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
  const coLuatToanCuc = /\[hidden\]\s*\{[^}]*display\s*:\s*none\s*!important/.test(CSS);

  t('L1 styles.css phải có luật [hidden] toàn cục', () => {
    ok(coLuatToanCuc,
      'thiếu `[hidden] { display: none !important; }` — mọi phần tử có class đặt '
      + 'display sẽ không ẩn được bằng JS, mà không báo lỗi gì');
  });

  t('L2 không phần tử nào bị CSS ép hiện dù JS đã bật hidden', () => {
    // map biến -> id, rồi id -> class trong index.html
    const bien = {};
    [...APP.matchAll(/const\s+([A-Za-z0-9_]+)\s*=\s*document\.getElementById\('([^']+)'\)/g)]
      .forEach(m => { bien[m[1]] = m[2]; });
    const bat = [...new Set([...APP.matchAll(/\b([A-Za-z0-9_]+)\.hidden\s*=/g)].map(m => m[1]))];

    const xau = [];
    bat.forEach((v) => {
      const id = bien[v];
      if (!id) return;
      const the = (HTML.match(new RegExp('<[^>]*id="' + id + '"[^>]*>')) || [''])[0];
      const classes = ((the.match(/class="([^"]+)"/) || [])[1] || '').split(/\s+/).filter(Boolean);
      classes.forEach((cl) => {
        const datDisplay = new RegExp('\\.' + cl + '\\s*\\{[^}]*display\\s*:').test(CSS);
        const coLuatRieng = new RegExp('\\.' + cl + '\\[hidden\\]').test(CSS);
        if (datDisplay && !coLuatRieng && !coLuatToanCuc) xau.push(`${id} (.${cl})`);
      });
    });
    eq(xau, [], 'các phần tử này bật hidden nhưng CSS vẫn ép hiện:');
  });
}

// ============================================================
// K. Gộp dữ liệu localStorage lên tài khoản (tuần 16)
//
// Supabase giả dưới đây cố ý ÁP ĐÚNG các ràng buộc thật của DB: khoá ngoại
// tới content(id), unique (user_id, lower(word)), check mode và check box.
// Nếu chỉ nuốt mọi thứ rồi trả về ok thì test sẽ xanh trong khi bản thật hỏng
// ngay lệnh insert đầu tiên — đúng loại test vô dụng nhất.
// ============================================================
function taoSupabaseGia(opts = {}) {
  const db = {
    contentIds: opts.contentIds || [],   // id CÒN TỒN TẠI trong bảng content
    study_log: [],
    vocab: (opts.vocabTrenServer || []).map(v =>
      typeof v === 'string' ? { word: v, box: 1 } : v)
  };
  const dem = { kiemId: 0, upsertLog: 0, docVocab: 0, insertVocab: 0, rpcThongKe: 0,
                xoaVocab: 0, capNhatVocab: 0 };

  const loiFK = { message: 'insert or update violates foreign key constraint' };
  const khoaLog = r => `${r.user_id}|${r.content_id}|${r.created_at}`;

  const client = {
    auth: {
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange() {}
    },
    from(bang) {
      return {
        select() {
          return {
            in(col, vals) {
              dem.kiemId++;
              return Promise.resolve({
                data: db.contentIds.filter(id => vals.includes(id)).map(id => ({ id })),
                error: null
              });
            },
            eq() {
              dem.docVocab++;
              if (opts.loiDocVocab) return Promise.resolve({ data: null, error: { message: 'loi doc vocab' } });
              return Promise.resolve({ data: db.vocab.map(v => ({ word: v.word })), error: null });
            }
          };
        },
        upsert(rows, o) {
          dem.upsertLog++;
          if (opts.loiUpsertLog) return Promise.resolve({ error: { message: 'loi upsert' } });
          for (const r of rows) {
            if (!db.contentIds.includes(r.content_id)) return Promise.resolve({ error: loiFK });
            if (!['read', 'listen', 'quiz'].includes(r.mode)) {
              return Promise.resolve({ error: { message: 'violates check constraint study_log_mode_check' } });
            }
            // ON CONFLICT (user_id, content_id, created_at) DO NOTHING
            if (o && o.ignoreDuplicates && db.study_log.some(x => khoaLog(x) === khoaLog(r))) continue;
            db.study_log.push(r);
          }
          return Promise.resolve({ error: null });
        },
        insert(rows) {
          dem.insertVocab++;
          if (opts.loiInsertVocab) return Promise.resolve({ error: { message: 'loi insert vocab' } });
          for (const r of rows) {
            if (r.source_content_id !== null && !db.contentIds.includes(r.source_content_id)) {
              return Promise.resolve({ error: loiFK });
            }
            if (!(r.box >= 1 && r.box <= 5)) {
              return Promise.resolve({ error: { message: 'violates check constraint vocab_box_check' } });
            }
            if (db.vocab.some(v => String(v.word).toLowerCase() === String(r.word).toLowerCase())) {
              return Promise.resolve({ error: { message: 'duplicate key value violates uq_vocab_user_word_lower' } });
            }
            db.vocab.push(r);
          }
          return Promise.resolve({ error: null });
        },
        // .delete().eq(...).ilike('word', w) — xoá từ trên tài khoản (tuần 17)
        delete() {
          dem.xoaVocab++;
          return { eq() { return this; },
                   ilike(col, w) {
                     if (opts.loiXoaVocab) return Promise.resolve({ error: { message: 'loi xoa' } });
                     const k = String(w).toLowerCase();
                     db.vocab = db.vocab.filter(v => String(v.word).toLowerCase() !== k);
                     return Promise.resolve({ error: null });
                   } };
        },
        // .update({...}).eq(...).ilike('word', w) — đẩy tiến độ ôn (tuần 17)
        update(patch) {
          dem.capNhatVocab++;
          return { eq() { return this; },
                   ilike(col, w) {
                     const k = String(w).toLowerCase();
                     db.vocab.forEach(v => {
                       if (String(v.word).toLowerCase() === k) Object.assign(v, patch);
                     });
                     return Promise.resolve({ error: null });
                   } };
        }
      };
    },
    // RPC. `get_random_content` không dùng trong nhóm K; ở đây chỉ cần
    // `thong_ke_tai_khoan` — và nó phải đếm ĐÚNG như hàm SQL thật, nếu không
    // test sẽ xanh trong khi bản thật trả số khác.
    rpc(ten, args) {
      if (ten !== 'thong_ke_tai_khoan') return Promise.resolve({ data: null, error: null });
      dem.rpcThongKe++;
      if (opts.loiRpcThongKe) {
        return Promise.resolve({ data: null, error: { message: 'loi rpc' } });
      }
      const homNay = (args && args.p_today) || '9999-12-31';
      return Promise.resolve({
        data: {
          so_bai: new Set(db.study_log.filter(r => r.counted !== false)
                                      .map(r => r.content_id)).size,
          so_tu: db.vocab.length,
          can_on: db.vocab.filter(v => !v.due_date || v.due_date <= homNay).length
        },
        error: null
      });
    }
  };
  return { supabase: { createClient: () => client }, db, dem };
}

const U1 = { id: 'u1', email: 'an@example.com', user_metadata: { full_name: 'An' } };
const U2 = { id: 'u2', email: 'binh@example.com', user_metadata: {} };
const moc = (s) => new Date(Date.UTC(2026, 7, s)).toISOString();

// Dựng sandbox cho nhóm K rồi CHỜ phần khởi động bất đồng bộ lắng xuống.
// `khoiTaoAuth()` chạy `await getSession()` rồi gán `phienDangNhap` — nếu test
// đặt phiên trước lúc đó, giá trị của test sẽ bị ghi đè bằng null và mọi khẳng
// định về giao diện tài khoản đều sai một cách khó hiểu.
async function sandboxGop(gia, storage) {
  // Bật sẵn cờ đã-chuyển-đổi: nếu không, `chuyenNhatKyCu()` chạy lúc khởi động
  // sẽ dọn sạch `ep:log` mà test vừa nạp vào, và mọi khẳng định về việc gộp
  // đều thành 0. Nhóm K kiểm việc GỘP, việc chuyển đổi do nhóm M kiểm.
  const kho = Object.assign({ 'ep:migr:seen': '1' }, storage || {});
  const c = taoSandbox({ supabase: gia.supabase, storage: kho });
  await new Promise(r => setTimeout(r, 0));
  return c;
}

async function nhomK() {
  // ---- K1 ----
  await ta('K1 bản ghi trỏ tới bài ĐÃ XOÁ bị lọc, phần còn lại vẫn lên', async () => {
    const gia = taoSupabaseGia({ contentIds: [10, 20] });
    const c = await sandboxGop(gia, {
      'ep:log': JSON.stringify([
        { content_id: 10, mode: 'read', score: null, seconds: null, created_at: moc(1) },
        { content_id: 999, mode: 'read', score: null, seconds: null, created_at: moc(2) }, // đã xoá
        { content_id: 20, mode: 'quiz', score: 0.75, seconds: null, created_at: moc(3) }
      ]),
      'ep:vocab': '[]'
    });
    const kq = await c.dayLenTaiKhoan(U1);
    eq(kq.ok, true, 'phải thành công chứ không hỏng vì 1 dòng chết:');
    eq(kq.soLuot, 2);
    eq(gia.db.study_log.length, 2);
    eq(gia.db.study_log.map(r => r.content_id).sort(), [10, 20]);
    eq(gia.db.study_log[1].score, 0.75, 'score phải giữ nguyên cho thống kê tuần 20:');
  });

  // ---- K2 ----
  await ta('K2 source_content_id trỏ tới bài đã xoá được null hoá, TỪ VẪN LÊN', async () => {
    const gia = taoSupabaseGia({ contentIds: [10] });
    const c = await sandboxGop(gia, {
      'ep:log': '[]',
      'ep:vocab': JSON.stringify([
        { word: 'straight', ipa: '/streɪt/', pos: 'adv', meaning_vi: 'thẳng',
          example: 'go straight', source_content_id: 777, box: 3, due_date: '2026-09-01',
          created_at: moc(1) },
        { word: 'lease', ipa: '', pos: '', meaning_vi: 'thuê', example: '',
          source_content_id: 10, box: 1, due_date: '2026-08-20', created_at: moc(2) }
      ])
    });
    const kq = await c.dayLenTaiKhoan(U1);
    eq(kq.ok, true);
    eq(kq.soTu, 2, 'mất ngữ cảnh thì được, mất cả từ thì không:');
    eq(gia.db.vocab.find(v => v.word === 'straight').source_content_id, null);
    eq(gia.db.vocab.find(v => v.word === 'lease').source_content_id, 10);
    eq(gia.db.vocab.find(v => v.word === 'straight').box, 3, 'giữ nguyên hộp Leitner:');
  });

  // ---- K3 ----
  await ta('K3 chạy LẠI hàm gộp không nhân đôi dữ liệu', async () => {
    const gia = taoSupabaseGia({ contentIds: [10] });
    const log = [{ content_id: 10, mode: 'read', score: null, seconds: null, created_at: moc(1) }];
    const c = await sandboxGop(gia, {
      'ep:log': JSON.stringify(log),
      'ep:vocab': JSON.stringify([
        { word: 'lease', source_content_id: 10, box: 1, due_date: '2026-08-20', created_at: moc(1) }
      ])
    });
    // Gọi thẳng hàm DB hai lần: mô phỏng lần gộp trước hỏng giữa chừng nên
    // cờ chưa được đặt, lần đăng nhập sau chạy lại từ đầu.
    await c.gopDuLieuLenTaiKhoan(U1, log, c.readVocab());
    const lan2 = await c.gopDuLieuLenTaiKhoan(U1, log, c.readVocab());
    eq(lan2.ok, true);
    eq(gia.db.study_log.length, 1, 'nhật ký bị nhân đôi:');
    eq(gia.db.vocab.length, 1, 'sổ từ bị nhân đôi:');
    eq(lan2.soTu, 0, 'lần 2 không được chèn từ nào nữa:');
  });

  // ---- K4 ----
  await ta('K4 chèn hỏng thì KHÔNG dời mốc, lần sau còn thử lại được', async () => {
    const gia = taoSupabaseGia({ contentIds: [10], loiUpsertLog: true });
    const c = await sandboxGop(gia, {
      'ep:log': JSON.stringify([
        { content_id: 10, mode: 'read', score: null, seconds: null, created_at: moc(1) }
      ]),
      'ep:vocab': '[]'
    });
    c.phienDangNhap = { user: U1 };
    const kq = await c.dayLenTaiKhoan(U1);
    eq(kq.ok, false);
    eq(c.docMocDay('u1'), '', 'hỏng mà vẫn dời mốc thì phần này không bao giờ lên được:');
    eq(c.document.getElementById('accSync').hidden, false);
    ok(c.document.getElementById('accSync').textContent.includes('Chưa đưa được'),
      'phải báo cho người dùng biết, không im lặng');
    // dữ liệu gốc còn nguyên
    eq(JSON.parse(c.localStorage.getItem('ep:log')).length, 1);
  });

  // ---- K5 ----
  await ta('K5 từ đã có trên server KHÔNG bị ghi đè bằng bản box 1 của máy này', async () => {
    const gia = taoSupabaseGia({
      contentIds: [10],
      vocabTrenServer: [{ word: 'Straight', box: 4, due_date: '2026-12-01' }]
    });
    const c = await sandboxGop(gia, {
      'ep:log': '[]',
      'ep:vocab': JSON.stringify([
        { word: 'straight', source_content_id: 10, box: 1, due_date: '2026-08-17', created_at: moc(1) },
        { word: 'lease', source_content_id: 10, box: 1, due_date: '2026-08-17', created_at: moc(2) }
      ])
    });
    const kq = await c.dayLenTaiKhoan(U1);
    eq(kq.ok, true);
    eq(kq.soTu, 1, 'chỉ được chèn từ CHƯA có:');
    // so khớp không phân biệt hoa/thường, đúng như unique index lower(word)
    eq(gia.db.vocab.find(v => String(v.word).toLowerCase() === 'straight').box, 4,
      'đè box 4 xuống 1 là xoá sạch tiến độ ôn tập ở máy khác:');
  });

  // ---- K6 ----
  //
  // ⚠️ Test này ĐẢO NGƯỢC so với bản tuần 16 (2026-08-19). Bản cũ khẳng định
  // "gộp xong đặt cờ, lần sau bỏ qua hẳn" — và chính điều đó là lỗi: cờ nằm ở
  // localStorage nên nó là của MÁY. Máy đăng nhập lúc sổ còn trống sẽ gộp 0
  // dòng, đặt cờ, rồi vĩnh viễn không đẩy gì nữa (đúng chuyện đã xảy ra trên
  // iPhone: "Đã đưa 0 lượt học và 0 từ", trong khi máy tính báo 45 lượt).
  // Nay yêu cầu ngược lại: bài học MỚI phải lên được ở những lần sau.
  await ta('K6 đẩy lần sau vẫn lên được phần MỚI, không bị cờ chặn vĩnh viễn', async () => {
    const gia = taoSupabaseGia({ contentIds: [10, 20] });
    const c = await sandboxGop(gia, {
      'ep:log': JSON.stringify([
        { content_id: 10, mode: 'listen', score: null, seconds: null, created_at: moc(1) }
      ]),
      'ep:vocab': '[]'
    });
    c.phienDangNhap = { user: U1 };
    await c.dayLenTaiKhoan(U1);
    eq(gia.db.study_log.length, 1);
    ok(c.docMocDay('u1'), 'phải nhớ mốc đã đẩy tới đâu');

    // Người dùng học thêm một bài rồi mở lại trang.
    c.logStudy(20, 'read', null, 70);
    const kq2 = await c.dayLenTaiKhoan(U1);
    ok(kq2 && kq2.ok, 'lần hai phải chạy, không được trả null vì "đã gộp rồi"');
    eq(gia.db.study_log.length, 2, 'bài học mới KHÔNG lên được server:');
    eq(gia.db.study_log.map(r => r.content_id).sort(), [10, 20]);
  });

  // ---- K6b ----
  await ta('K6b mốc giúp bỏ qua phần đã đẩy, không quét lại từ đầu', async () => {
    const gia = taoSupabaseGia({ contentIds: [10, 20] });
    const c = await sandboxGop(gia, {
      'ep:log': JSON.stringify([
        { content_id: 10, mode: 'read', score: null, seconds: null, created_at: moc(1) }
      ]),
      'ep:vocab': '[]'
    });
    await c.dayLenTaiKhoan(U1);
    const truoc = gia.dem.upsertLog;
    const kq = await c.dayLenTaiKhoan(U1); // không có gì mới
    eq(kq.soLuot, 0, 'không có bài mới mà vẫn chèn:');
    eq(gia.dem.upsertLog, truoc, 'không có gì mới thì đừng gọi upsert:');
  });

  // ---- K6c ----
  await ta('K6c locTuMoc giữ bản ghi mới hơn mốc, giữ cả bản ghi hỏng ngày', () => {
    const c = taoSandbox({ storage: { 'ep:migr:seen': '1' } });
    const log = [
      { content_id: 1, created_at: moc(1) },
      { content_id: 2, created_at: moc(5) },
      { content_id: 3, created_at: 'hôm qua' } // để chuanBiDongLog loại, không loại ở đây
    ];
    eq(c.locTuMoc(log, moc(1)).map(e => e.content_id), [2, 3]);
    eq(c.locTuMoc(log, '').length, 3, 'chưa có mốc thì phải lấy hết');
    eq(c.mocLonNhat(log), moc(5));
  });

  // ---- K7 ----
  await ta('K7 gộp xong TUYỆT ĐỐI không xoá localStorage', async () => {
    const gia = taoSupabaseGia({ contentIds: [10] });
    const c = await sandboxGop(gia, {
      'ep:log': JSON.stringify([{ content_id: 10, mode: 'read', score: null, seconds: null, created_at: moc(1) }]),
      'ep:vocab': JSON.stringify([{ word: 'lease', source_content_id: 10, box: 2, due_date: '2026-08-20', created_at: moc(1) }]),
      'ep:fav': '[1,2]',
      'ep:titles': '{"10":{"topic":"x","type":"dialogue","level":"intermediate"}}'
    });
    await c.dayLenTaiKhoan(U1);
    // localStorage vẫn là NGUỒN ĐỌC DUY NHẤT cho tới hết tuần 17
    eq(c.readLog().length, 1, 'nhật ký bị xoá sau khi gộp:');
    eq(c.readVocab().length, 1, 'sổ từ bị xoá sau khi gộp:');
    eq(c.localStorage.getItem('ep:fav'), '[1,2]');
    ok(c.localStorage.getItem('ep:titles'), 'ep:titles bị xoá');
  });

  // ---- K8 ----
  await ta('K8 created_at hỏng và mode lạ bị loại, không phá khoá chống trùng', async () => {
    const gia = taoSupabaseGia({ contentIds: [10] });
    const c = await sandboxGop(gia, { 'ep:log': '[]', 'ep:vocab': '[]' });
    const log = [
      { content_id: 10, mode: 'read', score: null, seconds: null, created_at: 'hôm qua' },
      { content_id: 10, mode: 'read', score: null, seconds: null, created_at: null },
      { content_id: 10, mode: 'ngủ', score: null, seconds: null, created_at: moc(1) },
      { content_id: 10, mode: 'read', score: 'chín điểm', seconds: null, created_at: moc(2) },
      // trùng y hệt nhau trong chính mảng cục bộ
      { content_id: 10, mode: 'read', score: null, seconds: null, created_at: moc(3) },
      { content_id: 10, mode: 'read', score: null, seconds: null, created_at: moc(3) }
    ];
    const kq = await c.gopDuLieuLenTaiKhoan(U1, log, []);
    eq(kq.ok, true);
    eq(kq.soLuot, 2, 'chỉ 2 dòng hợp lệ được lên:');
    eq(kq.boQua, 4);
    eq(gia.db.study_log.length, 2);
    eq(gia.db.study_log[0].score, null, 'score sai kiểu phải quy về null:');
  });

  // ---- K9 ----
  await ta('K9 mốc theo TỪNG tài khoản: người thứ hai trên cùng máy vẫn được đẩy', async () => {
    const gia = taoSupabaseGia({ contentIds: [10] });
    const c = await sandboxGop(gia, {
      'ep:log': JSON.stringify([
        { content_id: 10, mode: 'read', score: null, seconds: null, created_at: moc(1) }
      ]),
      'ep:vocab': '[]'
    });
    await c.dayLenTaiKhoan(U1);
    const kq2 = await c.dayLenTaiKhoan(U2);
    ok(kq2 && kq2.ok, 'tài khoản thứ hai phải được gộp, không bị cờ của người kia chặn');
    eq(gia.db.study_log.length, 2);
    eq(gia.db.study_log.map(r => r.user_id).sort(), ['u1', 'u2']);
  });

  // ---- K10 ----
  await ta('K10 chưa đăng nhập / sổ trống thì không gọi DB, không hiện dòng trạng thái', async () => {
    const gia = taoSupabaseGia({ contentIds: [10] });
    const c = await sandboxGop(gia, { 'ep:log': '[]', 'ep:vocab': '[]' });
    c.phienDangNhap = null;
    c.veTrangThaiGop();
    eq(c.document.getElementById('accSync').hidden, true);
    eq(await c.dayLenTaiKhoan(null), null);
    eq(gia.dem.kiemId, 0, 'chưa đăng nhập mà đã gọi DB:');

    const kq = await c.gopDuLieuLenTaiKhoan(U1, [], []);
    eq(kq, { ok: true, soLuot: 0, soTu: 0, boQua: 0, mocMoi: '' });
    eq(gia.dem.kiemId, 0, 'không có gì để gộp thì đừng gọi mạng:');
  });

  // ---- K12 ----
  // Đây là bài test cho đúng triệu chứng người dùng báo: một tài khoản, hai
  // máy, hai con số. Nếu thống kê còn đọc localStorage thì test này đỏ.
  await ta('K12 số hiển thị lấy từ TÀI KHOẢN, không phải localStorage của máy', async () => {
    const gia = taoSupabaseGia({ contentIds: [10, 20, 30] });
    // "iPhone": localStorage gần như trống, mới học đúng 1 bài.
    const c = await sandboxGop(gia, {
      'ep:log': JSON.stringify([
        { content_id: 30, mode: 'read', score: null, seconds: 70, created_at: moc(9) }
      ]),
      'ep:vocab': '[]'
    });
    // "máy tính" đã đẩy 2 bài + 1 từ lên tài khoản từ trước.
    gia.db.study_log.push(
      { user_id: 'u1', content_id: 10, mode: 'read', created_at: moc(1), counted: true },
      { user_id: 'u1', content_id: 20, mode: 'listen', created_at: moc(2), counted: true });
    gia.db.vocab.push({ user_id: 'u1', word: 'lease', box: 1, due_date: '2026-01-01' });

    c.phienDangNhap = { user: U1 };
    await c.dayLenTaiKhoan(U1);

    const html = c.document.getElementById('accStats').innerHTML;
    ok(/>3</.test(html), `máy này chỉ có 1 bài trong localStorage nhưng tài khoản có 3 — `
      + `phải hiện 3, nhận: ${html.slice(0, 120)}`);
    ok(/>1<\/b> từ trong sổ/.test(html), 'số từ cũng phải lấy từ tài khoản');
    ok(/mọi thiết bị/.test(html), 'phải nói rõ con số này tính trên tài khoản');
  });

  // ---- K13 ----
  await ta('K13 dòng nhật ký luật cũ (counted=false) KHÔNG bị đếm là đã học', async () => {
    const gia = taoSupabaseGia({ contentIds: [10] });
    const c = await sandboxGop(gia, { 'ep:log': '[]', 'ep:vocab': '[]' });
    // 37 bài "đã MỞ" đẩy lên hồi tuần 16 theo luật cũ.
    for (let i = 100; i < 137; i++) {
      gia.db.study_log.push({ user_id: 'u1', content_id: i, mode: 'read',
                              created_at: moc(1), counted: false });
    }
    c.phienDangNhap = { user: U1 };
    await c.capNhatThongKe();
    const html = c.document.getElementById('accStats').innerHTML;
    ok(/Chưa có bài nào/.test(html),
      `đếm cả dòng luật cũ là quay lại đúng con số sai bản 17/8 vừa dẹp, nhận: ${html.slice(0, 120)}`);
  });

  // ---- K14 ----
  await ta('K14 mạng hỏng thì GIỮ số cũ và nói rõ, không nháy về số của máy', async () => {
    const gia = taoSupabaseGia({ contentIds: [10], loiRpcThongKe: true });
    const c = await sandboxGop(gia, { 'ep:log': '[]', 'ep:vocab': '[]' });
    c.phienDangNhap = { user: U1 };
    c.thongKeServer = { soBai: 12, soTu: 3, canOn: 0 };
    await c.capNhatThongKe();
    const html = c.document.getElementById('accStats').innerHTML;
    ok(/>12</.test(html), 'RPC hỏng mà đã vứt số cũ đi, người dùng thấy tiến độ tụt về 0');
  });

  // ---- K15 ----
  await ta('K15 xoá từ / chấm ôn phải đi tới tài khoản, không chỉ nằm ở máy', async () => {
    const gia = taoSupabaseGia({
      contentIds: [10],
      vocabTrenServer: [{ word: 'lease', box: 1, due_date: '2026-01-01' },
                        { word: 'straight', box: 1, due_date: '2026-01-01' }]
    });
    const c = await sandboxGop(gia, {
      'ep:log': '[]',
      'ep:vocab': JSON.stringify([
        { word: 'lease', source_content_id: 10, box: 1, due_date: '2026-01-01', created_at: moc(1) },
        { word: 'straight', source_content_id: 10, box: 1, due_date: '2026-01-01', created_at: moc(1) }
      ])
    });
    c.phienDangNhap = { user: U1 };

    c.gradeWord('lease', true);   // nhớ -> lên hộp 2, dời ngày ôn
    await new Promise(r => setTimeout(r, 0));
    eq(gia.db.vocab.find(v => v.word === 'lease').box, 2,
      'ôn ở máy này mà server vẫn hộp 1 thì số "cần ôn" hai máy lệch nhau:');

    c.removeWord('straight');
    await new Promise(r => setTimeout(r, 0));
    eq(gia.db.vocab.map(v => v.word), ['lease'],
      'xoá từ ở máy này mà server vẫn giữ thì "số từ trong sổ" lệch:');
  });

  // ---- K11 ----
  await ta('K11 nguồn không chứa lệnh xoá dữ liệu người dùng (mở rộng J9)', async () => {
    const nguon = fs.readFileSync(path.join(ROOT, 'supabase.js'), 'utf8')
                + fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
    ok(!/localStorage\.clear\s*\(/.test(nguon), 'không được gọi localStorage.clear()');
    ['ep:log', 'ep:vocab', 'ep:titles', 'ep:fav'].forEach(k =>
      ok(!new RegExp(`removeItem\\(\\s*['"\`]${k}`).test(nguon), `không được xoá khoá ${k}`));
    // supabase.js chỉ nhận dữ liệu qua tham số, không tự đọc localStorage
    const sb = fs.readFileSync(path.join(ROOT, 'supabase.js'), 'utf8');
    const phanGop = sb.slice(sb.indexOf('TUẦN 16'));
    // Chỉ soi LỆNH thật, vì phần chú thích có nhắc chữ localStorage.
    ok(!/localStorage\s*\.\s*(get|set|remove)Item|localStorage\s*\.\s*clear/.test(phanGop),
      'phần gộp trong supabase.js không được chạm localStorage');
  });
}

// ============================================================
// M. "Đã học" phải là đã HỌC, không phải đã MỞ (17/8)
//
// Luật cũ: bài tải xong là ghi thẳng một dòng `read`. Mà app tự mở một bài
// ngẫu nhiên ngay lúc vào trang, nên mỗi lần mở trang là +1 "bài đã học".
// Luật mới: chỉ tính khi bấm phát, hoặc ở lại đủ 60 giây, hoặc làm quiz.
// ============================================================
{
  const moKho = (them) => Object.assign({ 'ep:migr:seen': '1', 'ep:log': '[]', 'ep:seen': '[]' }, them || {});
  const moBai = (c, id) => {
    c.currentItem = { id: id, topic: 'Bài ' + id, lines: [{ s: 'A', t: 'Hello there.' }] };
    c.currentTab = 'dialogue';
    c.recordLesson();
  };

  t('M1 MỞ bài không tính là đã học, nhưng có vào ep:seen', () => {
    const c = taoSandbox({ storage: moKho() });
    moBai(c, 11); moBai(c, 12); moBai(c, 13);
    eq(c.soBaiDaHoc(), 0, 'mở 3 bài mà đã tính là học 3 bài:');
    eq(c.readLog().length, 0);
    eq(c.readSeen().map(e => e.content_id), [11, 12, 13]);
    eq([...c.getSeenIds()].sort(), [11, 12, 13], 'random vẫn phải loại trừ bài đã mở:');
  });

  t('M2 bấm phát là tính ngay, không phải chờ đủ 60 giây', () => {
    const c = taoSandbox({ storage: moKho() });
    moBai(c, 11);
    c.renderScript();          // dựng sentences[]
    c.speakFrom(0);            // cửa chung của MỌI nút phát
    eq(c.soBaiDaHoc(), 1);
    eq(c.readLog()[0].mode, 'read');
    eq(c.readLog()[0].content_id, 11);
  });

  t('M3 ở lại đủ 60 giây thì tính, 59 giây thì chưa', () => {
    const c = taoSandbox({ storage: moKho() });
    moBai(c, 11);
    for (let i = 0; i < 59; i++) c.nhipPhienHoc();
    eq(c.soBaiDaHoc(), 0, '59 giây chưa được tính:');
    c.nhipPhienHoc();
    eq(c.soBaiDaHoc(), 1);
    eq(c.readLog()[0].seconds, 60, 'phải ghi cả số giây cho thống kê tuần 20:');
  });

  t('M4 tab bị ẩn thì đồng hồ dừng — mở tab rồi bỏ đó không phải là học', () => {
    const c = taoSandbox({ storage: moKho() });
    moBai(c, 11);
    c.document.hidden = true;
    for (let i = 0; i < 200; i++) c.nhipPhienHoc();
    eq(c.soBaiDaHoc(), 0, 'đếm cả lúc tab ẩn:');
    c.document.hidden = false;
    for (let i = 0; i < 60; i++) c.nhipPhienHoc();
    eq(c.soBaiDaHoc(), 1);
  });

  t('M5 một lần mở chỉ ghi ĐÚNG MỘT dòng, dù bấm phát nhiều lần', () => {
    const c = taoSandbox({ storage: moKho() });
    moBai(c, 11);
    c.renderScript();
    c.speakFrom(0); c.speakFrom(1); c.speakFrom(0);
    for (let i = 0; i < 200; i++) c.nhipPhienHoc();
    eq(c.readLog().length, 1, 'một bài nghe 3 lần thành 3 dòng thì thống kê hỏng:');
  });

  t('M6 đổi bài thì đồng hồ bài cũ dừng hẳn, không ghi nhầm sang bài mới', () => {
    const c = taoSandbox({ storage: moKho() });
    moBai(c, 11);
    for (let i = 0; i < 30; i++) c.nhipPhienHoc(); // bỏ dở giữa chừng
    moBai(c, 12);
    for (let i = 0; i < 60; i++) c.nhipPhienHoc();
    eq(c.readLog().length, 1);
    eq(c.readLog()[0].content_id, 12, 'giây của bài cũ bị cộng dồn sang bài mới:');
  });

  t('M7 mở bài vẫn ghi ep:seen (random cần) nhưng KHÔNG tính là đã học', () => {
    // "Học gần đây" đã gỡ 2026-08-19, nhưng `ep:seen` phải sống tiếp: hàm
    // random dựa vào nó để khỏi trả lại đúng bài vừa mở.
    const c = taoSandbox({ storage: moKho() });
    moBai(c, 11); moBai(c, 12);
    eq([...c.getSeenIds()].sort(), [11, 12], 'mở bài phải được ghi vào ep:seen:');
    eq(c.soBaiDaHoc(), 0, 'mở bài không có nghĩa là đã học:');
  });

  t('M8 chuyển nhật ký cũ: ep:log về 0, ep:seen giữ đủ, bản gốc được cất lại', () => {
    const cu = [
      { content_id: 11, mode: 'read', score: null, seconds: null, created_at: '2026-08-01T00:00:00.000Z' },
      { content_id: 12, mode: 'read', score: null, seconds: null, created_at: '2026-08-02T00:00:00.000Z' },
      { content_id: 11, mode: 'quiz', score: 0.5, seconds: null, created_at: '2026-08-03T00:00:00.000Z' }
    ];
    const c = taoSandbox({ storage: { 'ep:log': JSON.stringify(cu) } });
    eq(c.soBaiDaHoc(), 0, 'phải đếm lại từ 0 theo lựa chọn của người dùng:');
    eq([...c.getSeenIds()].sort(), [11, 12], 'việc loại trừ bài trùng lúc random không được mất:');
    // KHÔNG vứt dữ liệu đi — cất nguyên bản gốc, lấy lại được
    eq(JSON.parse(c.localStorage.getItem('ep:log_truoc_2026-08-17')).length, 3);
    eq(c.localStorage.getItem('ep:migr:seen'), '1');
  });

  t('M9 chuyển đổi chỉ chạy MỘT lần, không nuốt dữ liệu học mới', () => {
    const c = taoSandbox({ storage: { 'ep:log': JSON.stringify([
      { content_id: 11, mode: 'read', score: null, seconds: null, created_at: '2026-08-01T00:00:00.000Z' }
    ]) } });
    // học thật một bài SAU khi đã chuyển đổi
    c.logStudy(99, 'read', null, 61);
    eq(c.chuyenNhatKyCu(), false, 'chạy lần hai phải là không-làm-gì:');
    eq(c.readLog().length, 1, 'lần chạy thứ hai đã nuốt mất bài học mới:');
    eq(c.readLog()[0].content_id, 99);
  });

  t('M10 quiz vẫn tính là đã học kể cả khi chưa bấm phát', () => {
    const c = taoSandbox({ storage: moKho() });
    moBai(c, 11);
    c.currentItem = { id: 11, topic: 'x', lines: [], quiz: QUIZ_MAU };
    c.renderQuiz();
    c.chonDapAn(0, 2); c.chonDapAn(1, 0);
    c.nopQuiz();
    eq(c.soBaiDaHoc(), 1);
    eq(c.readLog()[0].mode, 'quiz');
  });
}

// ============================================================
// N. Bộ đếm tiến độ phải NHÌN THẤY ĐƯỢC (17/8)
//
// Lỗi có thật: đổi luật đếm "đã học" xong nhưng con số chỉ xuất hiện trong dải
// mời đăng nhập — dải đó ẩn hẳn sau khi đăng nhập. Người dùng đã đăng nhập
// không có chỗ nào nhìn thấy tiến độ, nên tưởng tính năng hỏng.
//
// Bài học chung với nhóm L: có logic đúng mà không có chỗ hiển thị thì với
// người dùng là chưa làm gì cả.
// ============================================================
{
  const moKho = (them) => Object.assign(
    { 'ep:migr:seen': '1', 'ep:log': '[]', 'ep:seen': '[]', 'ep:vocab': '[]' }, them || {});
  const nBai = (n) => JSON.stringify(
    Array.from({ length: n }, (_, i) => ({
      content_id: i + 1, mode: 'read', score: null, seconds: 60,
      created_at: new Date(Date.UTC(2026, 7, i + 1)).toISOString()
    })));

  t('N1 ĐÃ ĐĂNG NHẬP vẫn thấy được số bài đã học', () => {
    // Đây chính là lỗi cũ: dải mời ẩn khi đăng nhập, và đó là chỗ DUY NHẤT
    // hiển thị con số.
    const c = taoSandbox({ storage: moKho({ 'ep:log': nBai(4) }) });
    c.phienDangNhap = { user: { id: 'u1', email: 'a@b.c', user_metadata: {} } };
    c.capNhatGiaoDienTaiKhoan();
    const el = c.document.getElementById('accStats');
    ok(/Đã học/.test(el.innerHTML), 'khung Tài khoản phải nói số bài đã học');
    ok(/>4</.test(el.innerHTML), `mong thấy số 4, nhận "${el.innerHTML.slice(0, 80)}"`);
    eq(c.document.getElementById('signinBar').hidden, true, 'dải mời vẫn phải ẩn:');
  });

  t('N2 CHƯA đăng nhập cũng thấy, không phụ thuộc trạng thái tài khoản', () => {
    const c = taoSandbox({ storage: moKho({ 'ep:log': nBai(2) }) });
    c.phienDangNhap = null;
    c.capNhatGiaoDienTaiKhoan();
    ok(/>2</.test(c.document.getElementById('accStats').innerHTML));
  });

  t('N3 chưa học gì thì nói rõ ĐIỀU KIỆN được tính, không để trống', () => {
    // Người dùng mở bài rồi thấy số không nhúc nhích sẽ tưởng app hỏng.
    const c = taoSandbox({ storage: moKho() });
    c.capNhatGiaoDienTaiKhoan();
    const html = c.document.getElementById('accStats').innerHTML;
    ok(/Nghe/.test(html) && /phút/.test(html),
      `phải nêu điều kiện, nhận "${html.slice(0, 100)}"`);
  });

  t('N4 mở bài KHÔNG làm số tăng, bấm Nghe thì tăng — thấy được ngay trên UI', () => {
    const c = taoSandbox({ storage: moKho() });
    c.currentItem = { id: 11, topic: 'Bài 11', lines: [{ s: 'A', t: 'Hello there.' }] };
    c.currentTab = 'dialogue';
    c.recordLesson();
    c.veThongKe();
    ok(/Chưa có bài nào/.test(c.document.getElementById('accStats').innerHTML),
      'mở bài mà đã tính là học');

    c.renderScript();
    c.speakFrom(0);
    c.veThongKe();
    ok(/>1</.test(c.document.getElementById('accStats').innerHTML), 'bấm Nghe phải tính');
  });

  t('N5 mở khung Tài khoản là vẽ lại số liệu, không dùng số cũ từ lúc khởi động', () => {
    const c = taoSandbox({ storage: moKho() });
    c.capNhatGiaoDienTaiKhoan();
    const truoc = c.document.getElementById('accStats').innerHTML;
    c.localStorage.setItem('ep:log', nBai(7));
    c.openModal('account');
    const sau = c.document.getElementById('accStats').innerHTML;
    ok(truoc !== sau && />7</.test(sau), 'vừa học xong mở ra phải thấy số mới');
  });

  t('N6 đếm bài KHÁC NHAU, không đếm số dòng nhật ký', () => {
    const c = taoSandbox({ storage: moKho({ 'ep:log': JSON.stringify(
      [1, 1, 1, 2].map((id, i) => ({ content_id: id, mode: 'read', score: null, seconds: 60,
        created_at: new Date(Date.UTC(2026, 7, i + 1)).toISOString() }))) }) });
    c.veThongKe();
    ok(/>2</.test(c.document.getElementById('accStats').innerHTML), 'phải là 2 bài, không phải 4');
  });

  t('N8 accStats KHÔNG được nằm trong accGuest/accUser', () => {
    // DOM giả đăng ký phần tử theo id một cách phẳng, không có quan hệ cha–con,
    // nên `accUser.hidden = true` không kéo theo phần tử con — N1/N2 vẫn xanh
    // dù đặt nhầm chỗ. Chỉ có cách đọc thẳng HTML mới bắt được.
    const pane = HTML.match(/<div id="paneAccount"[^>]*>([\s\S]*?)\n      <\/div>/);
    ok(pane, 'không tìm thấy khung paneAccount trong index.html');
    ok(/id="accStats"/.test(pane[1]), 'accStats phải nằm trong paneAccount');

    const trong = (id) => {
      const m = HTML.match(new RegExp('<div id="' + id + '"[^>]*>([\\s\\S]*?)\\n        </div>'));
      return m ? m[1] : '';
    };
    ok(!/id="accStats"/.test(trong('accGuest')),
      'nằm trong accGuest thì người ĐÃ đăng nhập không thấy — đúng lỗi cũ');
    ok(!/id="accStats"/.test(trong('accUser')),
      'nằm trong accUser thì khách không thấy');
  });

  t('N7 có sổ từ và từ tới hạn thì hiện đủ ba con số', () => {
    const c = taoSandbox({ storage: moKho({ 'ep:log': nBai(1) }) });
    c.saveWord('lease', { vi: 'thuê' }, 1);   // lưu xong là tới hạn ôn ngay
    c.veThongKe();
    const html = c.document.getElementById('accStats').innerHTML;
    ok(/từ trong sổ/.test(html), 'thiếu số từ trong sổ');
    ok(/cần ôn/.test(html), 'thiếu số từ cần ôn');
  });
}

// ============================================================
// P. Gỡ "Học tiếp" / "Học gần đây", dồn "cần ôn" về khung Tài khoản
//    (2026-08-19)
//
// Gỡ tính năng thì phải gỡ SẠCH: còn sót phần tử trong index.html hay lời nhắc
// trong Hướng dẫn là người dùng đi tìm một nút không tồn tại. Nhóm này canh
// đúng chỗ đó, cộng thêm việc con số "cần ôn" phải nằm ĐÚNG MỘT nơi.
// ============================================================
function nhomP() {
  const moKho = (them) => Object.assign({ 'ep:migr:seen': '1' }, them || {});
  const TIEU_DE = { 11: { topic: 'Mua thuốc', type: 'dialogue', level: 'intermediate' },
                    12: { topic: 'Đặt phòng', type: 'dialogue', level: 'intermediate' } };

  t('P1 index.html không còn dấu vết "Học tiếp" / "Học gần đây"', () => {
    // Bỏ chú thích trước khi soi: chú thích GIẢI THÍCH vì sao gỡ là thứ nên
    // giữ, chỉ có chữ người dùng nhìn thấy mới không được nhắc tính năng cũ.
    const hienThi = HTML.replace(/<!--[\s\S]*?-->/g, '');
    ok(!/id="resumeLine"/.test(hienThi), 'còn dòng Học tiếp trong HTML');
    ok(!/id="openHistoryBtn"/.test(hienThi), 'còn nút Học gần đây');
    ok(!/id="paneHistory"|id="historyList"/.test(hienThi), 'còn khung lịch sử');
    ok(!/id="favFilterBtn"/.test(hienThi), 'còn nút lọc đã đánh dấu (nay khung chỉ có 1 chế độ)');
    ok(!/Học gần đây|Học tiếp/.test(hienThi),
      'Hướng dẫn vẫn nhắc tính năng đã gỡ — người dùng sẽ đi tìm nút không có');
  });

  t('P2 Hướng dẫn chỉ người dùng tới đúng chỗ còn tồn tại', () => {
    const help = HTML.match(/<ul class="help-list">([\s\S]*?)<\/ul>/);
    ok(help, 'không tìm thấy danh sách Hướng dẫn');
    ok(/Đã đánh dấu/.test(help[1]), 'Hướng dẫn phải nói về nút ⭐ Đã đánh dấu');
    // Hai khung con nay chỉ vào được từ nút tài khoản — Hướng dẫn phải nói ra,
    // nếu không người dùng tìm chúng ở màn hình chính và không thấy đâu cả.
    ok(/tài khoản/i.test(help[1]),
      'Hướng dẫn phải chỉ ra lối vào mới: nút tài khoản ở góc trên bên phải');
  });

  t('P3 nút "Đã đánh dấu" ẩn khi chưa đánh dấu gì, hiện kèm số khi có', () => {
    const c = taoSandbox({ storage: moKho({ 'ep:titles': JSON.stringify(TIEU_DE) }) });
    c.renderFav();
    eq(c.document.getElementById('openFavBtn').hidden, true);

    c.toggleFav(11);
    c.renderFav();
    const nut = c.document.getElementById('openFavBtn');
    eq(nut.hidden, false);
    ok(/\(1\)/.test(nut.textContent), `phải kèm số lượng, nhận "${nut.textContent}"`);
  });

  t('P4 mở bài KHÔNG làm nút "Đã đánh dấu" hiện lên', () => {
    // Đây chính là khác biệt với "Học gần đây" cũ: app tự mở một bài ngẫu nhiên
    // ngay khi vào trang, nên khung cũ luôn có nội dung dù người dùng chưa làm gì.
    const c = taoSandbox({ storage: moKho({ 'ep:titles': JSON.stringify(TIEU_DE) }) });
    c.currentItem = { id: 11, topic: 'Mua thuốc', lines: [{ s: 'A', t: 'Hi.' }] };
    c.currentTab = 'dialogue';
    c.recordLesson();
    eq(c.document.getElementById('openFavBtn').hidden, true,
      'chỉ mở bài mà nút đã hiện thì lại đầy nhiễu như khung cũ:');
  });

  t('P5 khung "Đã đánh dấu" liệt kê đúng bài đã đánh dấu, mở lại được', () => {
    const c = taoSandbox({ storage: moKho({
      'ep:titles': JSON.stringify(TIEU_DE), 'ep:fav': '[11,12]' }) });
    c.openModal('fav');
    eq(c.modalPane, 'fav');
    eq(c.document.getElementById('paneFav').hidden, false);
    eq(c.document.getElementById('modalTitle').textContent, 'Chủ đề đã đánh dấu (2)');
    eq(c.getFavorites().map(x => x.id), [12, 11], 'đánh dấu gần nhất đứng trước:');
  });

  t('P6 số "cần ôn" chỉ nằm ở khung Tài khoản, KHÔNG còn cạnh nút Sổ từ', () => {
    const c = taoSandbox({ storage: moKho() });
    c.saveWord('lease', { vi: 'thuê' }, 1); // lưu xong là tới hạn ôn ngay
    c.renderVocab();
    const nut = c.document.getElementById('openVocabBtn');
    ok(!/cần ôn/.test(nut.textContent),
      `chấm đỏ "cần ôn" phải biến khỏi nút Sổ từ, nhận "${nut.textContent}"`);
    ok(/\(1\)/.test(nut.textContent), 'vẫn phải hiện số từ trong sổ');

    c.veThongKe();
    ok(/cần ôn/.test(c.document.getElementById('accStats').innerHTML),
      'gỡ khỏi nút Sổ từ mà không có ở khung Tài khoản là mất hẳn con số');
  });

  t('P7 ep:seen vẫn được ghi để random khỏi trả lại bài vừa mở', () => {
    // Gỡ giao diện KHÔNG được kéo theo dữ liệu: bỏ ep:seen thì "Đổi chủ đề"
    // lặp bài ngay lần bấm thứ hai.
    const c = taoSandbox({ storage: moKho({ 'ep:titles': JSON.stringify(TIEU_DE) }) });
    c.currentItem = { id: 11, topic: 'Mua thuốc', lines: [{ s: 'A', t: 'Hi.' }] };
    c.currentTab = 'dialogue';
    c.recordLesson();
    ok(c.getSeenIds().has(11), 'mở bài phải được ghi vào ep:seen');
  });

  t('P9 màn hình chính không còn hàng nút; hai nút nằm trong khung Tài khoản', () => {
    // minidom phẳng nên "nằm trong khung nào" phải đọc thẳng index.html (N8).
    ok(!/id="quickRow"|class="quick-row"/.test(HTML), 'còn hàng nút ở màn hình chính');
    const pane = HTML.match(/<div id="paneAccount" hidden>([\s\S]*?)<div id="paneHelp"/);
    ok(pane, 'không tìm thấy khung paneAccount');
    ok(/id="openFavBtn"/.test(pane[1]), 'nút Đã đánh dấu phải nằm trong khung Tài khoản');
    ok(/id="openVocabBtn"/.test(pane[1]), 'nút Sổ từ phải nằm trong khung Tài khoản');
    // Nằm ngoài accGuest/accUser, nếu không thì một trong hai phía mất lối vào
    // — đúng lỗi N8 đã bắt được với accStats.
    const trong = (id) => {
      const m = HTML.match(new RegExp('<div id="' + id + '"[^>]*>([\\s\\S]*?)\\n        </div>'));
      return m ? m[1] : '';
    };
    ok(!/id="openVocabBtn"/.test(trong('accGuest')) && !/id="openVocabBtn"/.test(trong('accUser')),
      'nằm trong accGuest/accUser thì một trong hai phía không thấy nút');
  });

  t('P10 mở khung Tài khoản là vẽ lại NHÃN hai nút, không dùng số cũ', () => {
    // Hai nút nay nằm trong chính khung này, không còn ai vẽ lại chúng hộ.
    const c = taoSandbox({ storage: moKho({ 'ep:titles': JSON.stringify(TIEU_DE) }) });
    c.openModal('account');
    eq(c.document.getElementById('openFavBtn').hidden, true);

    c.toggleFav(11);
    c.saveWord('lease', { vi: 'thuê' }, 11);
    c.openModal('account');
    const fav = c.document.getElementById('openFavBtn');
    const so = c.document.getElementById('openVocabBtn');
    eq(fav.hidden, false, 'đánh dấu xong mở khung Tài khoản vẫn không thấy nút:');
    ok(/\(1\)/.test(fav.textContent), `nhãn nút Đã đánh dấu phải cập nhật, nhận "${fav.textContent}"`);
    ok(/\(1\)/.test(so.textContent), `nhãn nút Sổ từ phải cập nhật, nhận "${so.textContent}"`);
  });

  t('P11 nút ← chỉ hiện ở hai khung con và đưa về đúng khung Tài khoản', () => {
    const c = taoSandbox({ storage: moKho({ 'ep:titles': JSON.stringify(TIEU_DE), 'ep:fav': '[11]' }) });
    const back = c.document.getElementById('modalBack');

    c.openModal('account');
    eq(back.hidden, true, 'khung Tài khoản không đi ra từ đâu, không cần nút quay lại:');

    c.openModal('vocab');
    eq(back.hidden, false, 'vào khung con mà không có đường về là ngõ cụt:');
    back.dispatch('click');
    eq(c.modalPane, 'account', 'bấm ← phải về khung Tài khoản:');
    eq(back.hidden, true);

    c.openModal('fav');
    eq(back.hidden, false);
    back.dispatch('click');
    eq(c.modalPane, 'account');
  });

  t('P12 đóng popup thì nút ← không kẹt lại cho lần mở sau', () => {
    const c = taoSandbox({ storage: moKho() });
    c.openModal('vocab');
    c.closeModal();
    eq(c.document.getElementById('modalBack').hidden, true);
  });

  t('P13 sổ từ trống thì ẩn cả khung bọc nút Ôn tập, không chừa khoảng trắng', () => {
    const c = taoSandbox({ storage: moKho() });
    c.openModal('vocab');
    eq(c.document.getElementById('vocabActions').hidden, true, 'sổ trống mà vẫn chừa chỗ:');

    c.saveWord('lease', { vi: 'thuê' }, 1);
    c.renderVocab();
    eq(c.document.getElementById('vocabActions').hidden, false, 'có từ rồi mà nút Ôn tập vẫn ẩn:');
  });

  t('P14 index.html không còn đoạn "Đăng nhập lần đầu…"', () => {
    ok(!/Đăng nhập lần đầu/.test(HTML), 'đoạn cảnh báo đã bỏ nhưng vẫn còn trong HTML');
    ok(!/class="acc-note acc-warn"/.test(HTML), 'còn phần tử .acc-warn');
    // Phần còn lại của khung khách không được mất theo
    ok(/id="accSigninBtn"/.test(HTML), 'nút đăng nhập bị xoá nhầm');
    ok(/chế độ khách/.test(HTML), 'câu giới thiệu chế độ khách bị xoá nhầm');
  });

  t('P8 CSS không còn luật của các phần tử đã gỡ', () => {
    const css = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8')
      .split('\n').filter(d => !/^\s*(\/\*|\*|.*\*\/)/.test(d)).join('\n');
    ok(!/\.resume-line\s*[,{]/.test(css), 'còn luật .resume-line');
    ok(!/\.quick-dot\s*[,{]/.test(css), 'còn luật .quick-dot');
    ok(!/#favFilterBtn/.test(css), 'còn luật #favFilterBtn');
    ok(!/\.quick-row\s*[,{]/.test(css), 'còn luật .quick-row');
    ok(!/\.acc-warn\s*[,{]/.test(css), 'còn luật .acc-warn');
    // Luật của phần tử MỚI thì phải có, nếu không nút quay lại và hàng nút
    // trong khung Tài khoản sẽ dính vào nhau không khoảng cách.
    ok(/\.acc-links\s*[,{]/.test(css), 'thiếu luật .acc-links');
    ok(/\.vocab-actions\s*[,{]/.test(css), 'thiếu luật .vocab-actions');
    ok(/\.modal-back\s*[,{]/.test(css), 'thiếu luật .modal-back');
  });
}

// ---------- kết quả ----------
function inKetQua() {
  console.log(`\n${pass} qua, ${fail} hỏng (tổng ${pass + fail})`);
  if (loi.length) {
    console.log('\n❌ Chi tiết:');
    loi.forEach(l => console.log('  - ' + l));
    process.exit(1);
  }
  console.log('✅ Tất cả đều qua');
}

nhomP();

// Nhóm K là nhóm test bất đồng bộ duy nhất, nên phải chờ nó xong mới in kết quả.
nhomK().then(inKetQua);
