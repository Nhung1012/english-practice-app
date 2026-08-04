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

const IDS = ('accAvatar accBtn accEmail accGuest accLabel accSigninBtn accSignoutBtn accUser paneAccount '
  + 'signinBar signinBarBtn signinBarClose signinCount '
  + 'biBtn copyBtn favBtn favFilterBtn historyList loopBtn modal modalBackdrop modalClose '
  + 'modalTitle nextBtn openHelpBtn openHistoryBtn openVocabBtn paneHelp paneHistory paneVocab playBtn prevBtn quizBox '
  + 'quizCard quizResetBtn quizScore quizSubmitBtn randomBtn rateRange rateValue resumeLine '
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
  buildItem, buildSentences, renderScript, renderQuiz,
  setBilingual, toggleLineVi, loadBilingual, coBanDich,
  layQuiz, chamQuiz, nopQuiz, chonDapAn, logStudy,
  renderVocab, saveWord, dueWords, gradeWord, ngayOnGanNhat, dinhDangNgay, congNgay
};
`;

function taoSandbox(opts = {}) {
  const document = createDocument();
  IDS.forEach(id => document.reg(id, /Btn|Line|Close|Save|Speak/.test(id) ? 'button' : 'div'));
  document.getElementById('rateRange').value = '1';

  const localStorage = createLocalStorage(opts.blockStorage);
  const win = {
    document,
    localStorage,
    supabase: null, // -> supabaseClient = null, app chạy ở chế độ không có mạng
    speechSynthesis: {
      cancel() {}, speak() {}, pause() {}, resume() {}, getVoices() { return []; }
    },
    SpeechSynthesisUtterance: function (t) { this.text = t; },
    navigator: { clipboard: { writeText: async () => {} }, language: 'vi' },
    setTimeout, clearTimeout, setInterval, clearInterval,
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
  const paneHistory = d.getElementById('paneHistory');

  t('I1 bấm ❓ mở đúng khung hướng dẫn, hai khung kia đóng', () => {
    helpBtn.dispatch('click');
    eq(c.modalPane, 'help');
    eq([paneHelp.hidden, paneHistory.hidden, paneVocab.hidden], [false, true, true]);
    eq(d.getElementById('modal').hidden, false);
  });

  t('I2 mở hướng dẫn thì KHÔNG kèm nút của Sổ từ / Lịch sử', () => {
    // Hàng tiêu đề dùng chung cho cả 3 khung; quên ẩn là hiện nút "🎯 Ôn tập"
    // ngay trong trang hướng dẫn, bấm vào thì lạc sang phiên ôn tập.
    helpBtn.dispatch('click');
    eq(d.getElementById('reviewBtn').hidden, true);
    eq(d.getElementById('favFilterBtn').hidden, true);
    eq(d.getElementById('modalTitle').textContent, 'Hướng dẫn nhanh');
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

// ---------- kết quả ----------
console.log(`\n${pass} qua, ${fail} hỏng (tổng ${pass + fail})`);
if (loi.length) {
  console.log('\n❌ Chi tiết:');
  loi.forEach(l => console.log('  - ' + l));
  process.exit(1);
}
console.log('✅ Tất cả đều qua');
