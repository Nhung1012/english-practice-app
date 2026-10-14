// ============================================================
// import.js — "📥 Chủ đề của tôi": người dùng tự nhập bài để học (2026-10-14).
//
// File này chỉ có hai phần THUẦN (không đụng DOM, không gọi mạng):
//   1. Bộ đọc file .txt / .json -> một bài cùng hình dạng `data` của bảng
//      `content`, để mọi tính năng sẵn có (nghe từng câu, tra từ, song ngữ,
//      quiz) chạy y như bài hệ thống.
//   2. Kho `ep:mine` trong localStorage.
// Phần gọi Supabase nằm ở supabase.js, giao diện nằm ở app.js — đúng quy ước
// đầu file supabase.js. Nạp SAU supabase.js và TRƯỚC app.js.
//
// ⚠️ NGUYÊN TẮC CỦA BỘ ĐỌC .txt: người dùng sẽ không viết đúng mẫu. Nên đọc
// "dễ tính" hết mức có thể, và mọi thứ đoán ra đều phải hiện ở màn xem trước
// để người dùng sửa — KHÔNG bao giờ lưu âm thầm một thứ đoán sai.
// ============================================================

// Id của bài tự nhập luôn là CHUỖI có tiền tố này, bài hệ thống là SỐ.
// Hai loại id không bao giờ trùng nhau, và mọi chỗ đẩy dữ liệu lên server
// nhận ra ngay bài nào không được đụng vào khoá ngoại content(id).
const MINE_PREFIX = 'my:';
const MINE_KEY = 'ep:mine';

const GIOI_HAN_NHAP = {
  soCau: 300,          // số dòng nội dung tối đa của một bài
  kyTuMotCau: 1000,    // một dòng dài hơn thế gần như chắc chắn là dán nhầm
  kyTuTenBai: 120,
  kichThuocFile: 300 * 1024,
  soBai: 200           // số bài tự nhập tối đa mỗi người
};

function laBaiCuaToi(id) {
  return typeof id === 'string' && id.indexOf(MINE_PREFIX) === 0;
}

// Bài công khai của NGƯỜI KHÁC (2026-10-14): 'pub:<id của dòng user_content>'.
// Bài của chính mình vẫn đi đường 'my:' (kho trên máy), không đi đường này.
const PUB_PREFIX = 'pub:';
function laBaiCongDong(id) {
  return typeof id === 'string' && id.indexOf(PUB_PREFIX) === 0;
}

// Bỏ dấu + chữ thường để so khớp nhãn "Chủ đề", "chu de", "CHỦ ĐỀ"... như nhau.
// Không dùng `normalizeForSearch` của app.js: file này nạp trước app.js.
function boDauNhap(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Các tên nhãn được chấp nhận, đã bỏ dấu. Thêm từ mới thì thêm vào đây.
const NHAN_NHAP = {
  topic: ['chu de', 'ten chu de', 'ten bai', 'tieu de', 'bai', 'topic', 'title', 'name', 'ten'],
  // Không có "dang" trơn: Đặng là họ người Việt, "Đặng: Hello" là lời thoại.
  type: ['loai', 'loai bai', 'kieu', 'kieu bai', 'dang bai', 'the loai', 'type', 'kind'],
  level: ['trinh do', 'muc', 'muc do', 'cap do', 'do kho', 'level', 'cefr'],
  // "vi"/"vn" cũng có thể là tên người (Vi, Vy) — xem `laDongDich`.
  vi: ['vi', 'vn', 'dich', 'ban dich', 'nghia', 'tieng viet', 'translation', 'trans']
};

// "VI: ..." là dòng dịch. Nhưng "Vi: Hello" là lời của một người tên Vi:
// nhãn vi/vn chỉ tính là dòng dịch khi viết HOA, hoặc nội dung là tiếng Việt.
function laDongDich(khoa, giaTri) {
  if (nhanLaGi(khoa) !== 'vi') return false;
  const k = boDauNhap(khoa);
  if (k !== 'vi' && k !== 'vn') return true;
  return /^(VI|VN)$/.test(String(khoa).trim()) || laTiengViet(giaTri);
}

function nhanLaGi(khoa) {
  const k = boDauNhap(khoa);
  return Object.keys(NHAN_NHAP).find(ten => NHAN_NHAP[ten].indexOf(k) !== -1) || null;
}

const LEVEL_NHAP = ['beginner', 'intermediate', 'advanced'];

// Câu tiếng Việt? Chữ "mạnh" (ạ, ơ, ư, đ...) không có trong tiếng Anh hay
// tiếng Pháp nên một chữ là đủ. Chữ "yếu" (é, à...) có cả trong "café",
// "résumé" — chỉ tính khi PHẦN LỚN các từ đều mang dấu, như câu tiếng Việt.
const CHU_VIET_MANH = /[ạảãằắẳẵặầấẩẫậẻẽẹềếểễệỉĩịỏõọồốổỗộờớởỡợủũụừứửữựỳỷỹỵđăơư]/i;
const CHU_VIET_YEU = /[àáâèéêìíòóôùúý]/i;
function laTiengViet(s) {
  const str = String(s || '');
  if (CHU_VIET_MANH.test(str)) return true;
  const tu = str.split(/\s+/).filter(Boolean);
  const coDau = tu.filter(w => CHU_VIET_YEU.test(w)).length;
  return coDau >= 2 && coDau / tu.length >= 0.5;
}

// Tách câu ĐÚNG như `buildSentences()` của app.js, kèm vị trí bắt đầu.
// Phải giống hệt: lệch một câu là bản dịch của bài nghe bị bỏ hẳn (app chỉ gắn
// bản dịch khi số phần tử khớp tuyệt đối).
function tachCauNhap(text) {
  const re = /[^.!?]+[.!?]*/g;
  const out = [];
  let m;
  while ((m = re.exec(text))) {
    const t = m[0].trim();
    // `at` = vị trí chữ đầu tiên của câu (bỏ khoảng trắng đứng trước).
    if (t) out.push({ text: t, at: m.index + (m[0].length - m[0].replace(/^\s+/, '').length) });
  }
  return out;
}

const RE_GACH_NGANG = /^\s*([-=*_~#])\1{2,}\s*$/;      // ---  ===  ***
const RE_DAU_DONG = /^\s*(?:[-*•–—]\s+|\d{1,3}[.)]\s+)/; // gạch đầu dòng, đánh số
const RE_KHOA = /^\s*([^:：]{1,30}?)\s*[:：]\s*(.*)$/;
// Tên người nói: bắt đầu bằng chữ cái, tối đa 3 từ, không chứa số.
const RE_TEN = /^[A-Za-zÀ-ỹ][A-Za-zÀ-ỹ.'’-]*(?: [A-Za-zÀ-ỹ][A-Za-zÀ-ỹ.'’-]*){0,2}$/;
const RE_NGOAC = /^\s*[(\[（](.+)[)\]）]\s*$/;

// ------------------------------------------------------------
// Đầu vào chung của hai bộ đọc. Trả về:
//   { ok, loi, bai: {topic, type, level, data}, thieu: [...], canhBao: [...],
//     doan: {...} }
// `loi`     : lý do không dùng được (khi ok = false).
// `thieu`   : các trường người dùng phải tự chọn ở màn xem trước ('topic', 'level').
// `canhBao` : [{ dong, lyDo }] — dòng nào đoán, dòng nào bỏ qua. `dong` = 0
//             nghĩa là cảnh báo chung, không gắn với dòng nào.
// `doan`    : những gì đã TỰ ĐOÁN (để màn xem trước nói ra), vd { type: true }.
//
// `tuyChon.loai` / `tuyChon.trinhDo` / `tuyChon.ten`: người dùng đã chọn ở màn
// xem trước. Tên, trình độ và loại bài CHỈ lấy từ các ô bên dưới (2026-10-14,
// bạn chọn): dòng "Chủ đề:" / "Trình độ:" / "Loại:" trong file vẫn được nhận
// ra là dòng tiêu đề (không lẫn vào bài) nhưng bị bỏ qua. Ô tên trống thì lấy
// theo tên file; không chọn loại thì app tự đoán theo nội dung.
// ------------------------------------------------------------
function phanTichChuDe(noiDung, tuyChon) {
  const o = tuyChon || {};
  let text = String(noiDung == null ? '' : noiDung);
  if (text.length > GIOI_HAN_NHAP.kichThuocFile) {
    return thatBai('File quá lớn (tối đa ' + Math.round(GIOI_HAN_NHAP.kichThuocFile / 1024) + ' KB). Hãy chia thành nhiều chủ đề nhỏ hơn.');
  }
  text = text.replace(/^﻿/, '').replace(/\r\n?/g, '\n'); // BOM của Notepad, xuống dòng Windows
  if (!text.trim()) return thatBai('Nội dung đang trống.');

  const kq = /^\s*[{[]/.test(text) ? phanTichJson(text) : phanTichTxt(text);
  if (!kq.ok) return kq;
  return hoanThien(kq, o);
}

function thatBai(loi) {
  return { ok: false, loi: loi, bai: null, thieu: [], canhBao: [], doan: {} };
}

// ---------------- .txt ----------------
function phanTichTxt(text) {
  const dongs = text.split('\n');
  const canhBao = [];
  const dau = {};          // topic / type / level đọc được từ phần đầu
  const cac = [];          // { dong, ten, text } (tiếng Anh) | { dong, vi }
  let daQuaDau = false;    // đã sang phần nội dung (gặp --- hoặc dòng nội dung đầu tiên)

  dongs.forEach((goc, i) => {
    const so = i + 1;
    const dong = goc.trim();
    if (!dong) return;
    if (RE_GACH_NGANG.test(dong)) { daQuaDau = true; return; }

    // "# Tên bài" kiểu Markdown ở đầu file.
    if (!daQuaDau && !dau.topic && /^#{1,3}\s+\S/.test(dong)) {
      dau.topic = { v: dong.replace(/^#+\s*/, ''), dong: so };
      return;
    }

    const bo = dong.replace(RE_DAU_DONG, '');
    const m = bo.match(RE_KHOA);
    const nhan = m ? nhanLaGi(m[1]) : null;

    // Nhãn Chủ đề/Loại/Trình độ được nhận Ở BẤT KỲ ĐÂU, không chỉ đầu file —
    // người dùng hay viết thêm "Trình độ: B1" ở cuối.
    if (nhan === 'topic' || nhan === 'type' || nhan === 'level') {
      if (!m[2].trim()) { canhBao.push({ dong: so, lyDo: 'Dòng "' + m[1].trim() + '" chưa có giá trị, đã bỏ qua.' }); return; }
      if (dau[nhan]) {
        canhBao.push({ dong: so, lyDo: 'Có hai dòng "' + m[1].trim() + '", dùng dòng đầu tiên (dòng ' + dau[nhan].dong + ').' });
        return;
      }
      dau[nhan] = { v: m[2].trim(), dong: so };
      return;
    }
    daQuaDau = true;

    if (nhan === 'vi' && laDongDich(m[1], m[2])) {
      if (m[2].trim()) cac.push({ dong: so, vi: m[2].trim() });
      return;
    }
    const ngoac = bo.match(RE_NGOAC);
    if (ngoac && laTiengViet(ngoac[1])) { cac.push({ dong: so, vi: ngoac[1].trim() }); return; }

    let ten = null, noi = bo;
    if (m && RE_TEN.test(m[1].trim()) && m[2].trim()) {
      ten = m[1].trim();
      noi = m[2].trim();
    }
    // Câu tiếng Việt (kể cả "B: Vâng, cỡ nào ạ?") = bản dịch của câu ngay trên.
    if (laTiengViet(noi)) { cac.push({ dong: so, vi: noi }); return; }
    cac.push({ dong: so, ten: ten, text: noi });
  });

  const tiengAnh = cac.filter(x => x.text !== undefined);
  if (!tiengAnh.length) return thatBai('Không tìm thấy câu tiếng Anh nào trong nội dung.');

  return {
    ok: true,
    nguon: 'txt',
    dau: dau,
    cac: cac,
    canhBao: canhBao
  };
}

// ---------------- .json ----------------
function phanTichJson(text) {
  let obj;
  try {
    obj = JSON.parse(text);
  } catch (err) {
    return thatBai('File JSON bị lỗi cú pháp: ' + (err.message || err) + '. Kiểm tra dấu phẩy, ngoặc và dấu nháy kép.');
  }
  if (Array.isArray(obj)) {
    if (obj.length !== 1) return thatBai('File JSON có ' + obj.length + ' chủ đề. Mỗi lần chỉ import được một chủ đề.');
    obj = obj[0];
  }
  if (!obj || typeof obj !== 'object') return thatBai('File JSON phải là một đối tượng { ... }.');

  const d = obj.data && typeof obj.data === 'object' ? obj.data : obj;
  const lay = (...ks) => { for (const k of ks) if (obj[k] !== undefined && obj[k] !== null) return obj[k]; return undefined; };
  const dau = {};
  const topic = lay('topic', 'title', 'chu_de', 'name');
  if (topic !== undefined) dau.topic = { v: String(topic), dong: 0 };

  const canhBao = [];
  const cac = [];
  if (Array.isArray(d.lines)) {
    d.lines.forEach((l, i) => {
      if (typeof l === 'string') {
        const m = l.match(RE_KHOA);
        if (m && RE_TEN.test(m[1].trim())) cac.push({ dong: 0, ten: m[1].trim(), text: m[2].trim() });
        else cac.push({ dong: 0, ten: null, text: l.trim() });
        return;
      }
      const t = l && (l.t !== undefined ? l.t : l.text);
      if (!l || typeof t !== 'string' || !t.trim()) {
        canhBao.push({ dong: 0, lyDo: 'Phần tử lines[' + i + '] không có câu tiếng Anh, đã bỏ qua.' });
        return;
      }
      const ten = l.n || l.s || l.speaker || null;
      cac.push({ dong: 0, ten: ten ? String(ten) : null, text: t.trim() });
      if (typeof l.vi === 'string' && l.vi.trim()) cac.push({ dong: 0, vi: l.vi.trim() });
    });
  } else if (typeof d.text === 'string' || Array.isArray(d.text)) {
    const doan = Array.isArray(d.text) ? d.text.map(String) : [d.text];
    const vi = Array.isArray(d.vi) ? d.vi : null;
    // Bài nghe JSON giữ nguyên `text` + `vi` như bảng content — đã khớp câu sẵn.
    return {
      ok: true,
      nguon: 'json',
      dau: dau,
      cauTruc: 'listening',
      text: doan.join(' ').trim(),
      vi: vi,
      quiz: d.quiz,
      cac: [],
      canhBao: canhBao
    };
  } else {
    return thatBai('File JSON thiếu nội dung: cần "lines" (hội thoại) hoặc "text" (luyện nghe).');
  }

  if (!cac.some(x => x.text !== undefined)) return thatBai('Không tìm thấy câu tiếng Anh nào trong file JSON.');
  return { ok: true, nguon: 'json', dau: dau, cauTruc: 'dialogue', cac: cac, quiz: d.quiz, canhBao: canhBao };
}

// ---------------- dựng bài từ kết quả đọc ----------------
function hoanThien(kq, o) {
  const canhBao = kq.canhBao.slice();
  const doan = {};
  const thieu = [];

  // Tên bài: người dùng gõ > trong file > tên file.
  let topic = String(o.ten || '').trim();
  if (!topic && o.tenFile) {
    topic = String(o.tenFile).replace(/\.[^.]+$/, '').replace(/[_]+/g, ' ').trim();
    if (topic) doan.topic = true;
  }
  if (topic.length > GIOI_HAN_NHAP.kyTuTenBai) {
    topic = topic.slice(0, GIOI_HAN_NHAP.kyTuTenBai).trim();
    canhBao.push({ dong: 0, lyDo: 'Tên chủ đề dài quá, đã cắt còn ' + GIOI_HAN_NHAP.kyTuTenBai + ' ký tự.' });
  }
  if (!topic) thieu.push('topic');

  // Trình độ: chỉ lấy từ ô chọn.
  const level = LEVEL_NHAP.indexOf(o.trinhDo) !== -1 ? o.trinhDo : null;
  if (!level) thieu.push('level');

  // Loại bài: ô chọn > hình dạng file JSON (lines / text) > tự đoán.
  let type = o.loai === 'dialogue' || o.loai === 'listening' ? o.loai : (kq.cauTruc || null);
  const tiengAnh = kq.cac.filter(x => x.text !== undefined);
  if (!type) {
    const coTen = tiengAnh.filter(x => x.ten).length;
    type = coTen >= 2 && coTen / tiengAnh.length >= 0.6 ? 'dialogue' : 'listening';
    doan.type = true;
  }

  let data;
  if (kq.text !== undefined) {
    data = dungBaiNgheJson(kq, type, canhBao);
  } else {
    data = type === 'dialogue' ? dungHoiThoai(kq.cac, canhBao) : dungBaiNghe(kq.cac, canhBao);
  }
  if (typeof data === 'string') return thatBai(data);

  const quiz = locQuizNhap(kq.quiz, canhBao);
  if (quiz) data.quiz = quiz;

  return {
    ok: true,
    loi: null,
    bai: { topic: topic, type: type, level: level, data: data },
    thieu: thieu,
    canhBao: canhBao,
    doan: doan
  };
}

function kiemDoDai(cac) {
  const tiengAnh = cac.filter(x => x.text !== undefined);
  if (tiengAnh.length > GIOI_HAN_NHAP.soCau) {
    return 'Bài có ' + tiengAnh.length + ' câu, tối đa ' + GIOI_HAN_NHAP.soCau + '. Hãy chia thành nhiều chủ đề.';
  }
  const dai = tiengAnh.find(x => x.text.length > GIOI_HAN_NHAP.kyTuMotCau);
  if (dai) return 'Dòng ' + (dai.dong || '?') + ' dài quá ' + GIOI_HAN_NHAP.kyTuMotCau + ' ký tự. Hãy xuống dòng giữa các câu.';
  return null;
}

// App chỉ có hai giọng (A trầm, B cao — getSpeakerVoiceSettings). Tên thật
// (Tom, Mary...) được giữ ở trường `n` để hiển thị; giọng thì chia A/B theo
// thứ tự xuất hiện, người thứ ba trở đi luân phiên A/B.
function dungHoiThoai(cac, canhBao) {
  const loiDai = kiemDoDai(cac);
  if (loiDai) return loiDai;

  const coTen = cac.some(x => x.text !== undefined && x.ten);
  const thuTu = [];  // tên đã gặp, theo thứ tự
  const lines = [];
  let doanAB = 0;

  cac.forEach((x) => {
    if (x.vi !== undefined) {
      const cuoi = lines[lines.length - 1];
      if (!cuoi) { canhBao.push({ dong: x.dong, lyDo: 'Bản dịch đứng trước mọi câu tiếng Anh, đã bỏ qua.' }); return; }
      cuoi.vi = cuoi.vi ? cuoi.vi + ' ' + x.vi : x.vi;
      return;
    }
    if (!x.ten) {
      if (!coTen) {
        // Không dòng nào ghi tên người nói: chia A/B xen kẽ.
        lines.push({ s: doanAB++ % 2 === 0 ? 'A' : 'B', t: x.text });
        return;
      }
      const cuoi = lines[lines.length - 1];
      if (cuoi) {
        cuoi.t = cuoi.t + ' ' + x.text;
        canhBao.push({ dong: x.dong, lyDo: 'Không có tên người nói, đã nối vào câu ngay trên.' });
      } else {
        lines.push({ s: 'A', t: x.text });
        canhBao.push({ dong: x.dong, lyDo: 'Không có tên người nói, đã gán cho người A.' });
      }
      return;
    }
    const khoa = boDauNhap(x.ten);
    let i = thuTu.indexOf(khoa);
    if (i === -1) { thuTu.push(khoa); i = thuTu.length - 1; }
    const line = { s: i % 2 === 0 ? 'A' : 'B', t: x.text };
    // A/B viết sẵn thì không cần lưu tên riêng — hiện "Người A" như bài hệ thống.
    if (!/^[ab]$/.test(khoa)) line.n = x.ten;
    lines.push(line);
  });

  if (!coTen) canhBao.push({ dong: 0, lyDo: 'Không dòng nào ghi tên người nói, đã chia xen kẽ người A / người B.' });
  if (thuTu.length > 2) canhBao.push({ dong: 0, lyDo: 'Có ' + thuTu.length + ' người nói; app chỉ có 2 giọng nên người thứ 3 trở đi dùng chung giọng.' });
  if (thuTu.length && thuTu.length < 2 && coTen) canhBao.push({ dong: 0, lyDo: 'Chỉ có một người nói. Nếu đây là bài đọc, hãy chọn loại "Luyện nghe".' });
  return { lines: lines };
}

// Bài nghe: nối các dòng thành một đoạn, rồi gắn bản dịch của mỗi DÒNG vào
// câu đầu tiên của dòng đó. Tính trên đoạn văn đã nối (không phải từng dòng)
// để số câu khớp tuyệt đối với cách app tách câu lúc hiển thị.
function dungBaiNghe(cac, canhBao) {
  const loiDai = kiemDoDai(cac);
  if (loiDai) return loiDai;

  const dongs = []; // { text, vi, dong }
  cac.forEach((x) => {
    if (x.vi !== undefined) {
      const cuoi = dongs[dongs.length - 1];
      if (!cuoi) { canhBao.push({ dong: x.dong, lyDo: 'Bản dịch đứng trước mọi câu tiếng Anh, đã bỏ qua.' }); return; }
      cuoi.vi = cuoi.vi ? cuoi.vi + ' ' + x.vi : x.vi;
      return;
    }
    let t = x.ten ? x.ten + ': ' + x.text : x.text;
    // Dòng không có dấu kết câu (tiêu đề, câu quên chấm) -> thêm dấu chấm, nếu
    // không nó dính vào câu sau và giọng đọc đọc liền một hơi.
    if (!/[.!?]["'”’)\]]*$/.test(t)) t += '.';
    dongs.push({ text: t, vi: '', dong: x.dong });
  });

  let text = '';
  const batDau = [];
  dongs.forEach((d, i) => {
    if (i) text += ' ';
    batDau.push(text.length);
    text += d.text;
  });

  const cau = tachCauNhap(text);
  const vi = cau.map(() => '');
  let coDich = false;
  dongs.forEach((d, i) => {
    if (!d.vi) return;
    const tu = batDau[i], den = i + 1 < batDau.length ? batDau[i + 1] : text.length + 1;
    const k = cau.findIndex(c => c.at >= tu && c.at < den);
    if (k === -1) return;
    vi[k] = vi[k] ? vi[k] + ' ' + d.vi : d.vi;
    coDich = true;
    const soCauDong = cau.filter(c => c.at >= tu && c.at < den).length;
    if (soCauDong > 1) canhBao.push({ dong: d.dong, lyDo: 'Dòng này có ' + soCauDong + ' câu nhưng một bản dịch; bản dịch hiện dưới câu đầu tiên.' });
  });

  const data = { text: text };
  if (coDich) data.vi = vi;
  return data;
}

function dungBaiNgheJson(kq, type, canhBao) {
  if (type === 'dialogue') {
    // Người dùng đổi một bài nghe JSON sang hội thoại ở màn xem trước.
    const cac = tachCauNhap(kq.text).map(c => ({ dong: 0, ten: null, text: c.text }));
    return dungHoiThoai(cac, canhBao);
  }
  if (!kq.text) return 'File JSON có "text" nhưng đang trống.';
  if (kq.text.length > GIOI_HAN_NHAP.soCau * GIOI_HAN_NHAP.kyTuMotCau / 10) {
    return 'Bài quá dài. Hãy chia thành nhiều chủ đề.';
  }
  const data = { text: kq.text };
  if (Array.isArray(kq.vi) && kq.vi.length) {
    const soCau = tachCauNhap(kq.text).length;
    if (kq.vi.length === soCau) data.vi = kq.vi.map(v => String(v == null ? '' : v));
    else canhBao.push({ dong: 0, lyDo: '"vi" có ' + kq.vi.length + ' câu nhưng bài có ' + soCau + ' câu; lệch nhau nên bỏ bản dịch.' });
  }
  return data;
}

// Cùng luật với `layQuiz()` của app.js: câu nào sai hình dạng thì bỏ, có báo.
function locQuizNhap(quiz, canhBao) {
  if (quiz === undefined || quiz === null) return null;
  if (!Array.isArray(quiz)) { canhBao.push({ dong: 0, lyDo: '"quiz" phải là một mảng, đã bỏ qua.' }); return null; }
  const tot = [];
  quiz.forEach((q, i) => {
    const hop = q && typeof q.q === 'string' && q.q.trim() &&
      Array.isArray(q.a) && q.a.length >= 2 &&
      Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.a.length;
    if (!hop) { canhBao.push({ dong: 0, lyDo: 'Câu hỏi quiz số ' + (i + 1) + ' thiếu q / a / correct, đã bỏ qua.' }); return; }
    tot.push({ q: q.q, a: q.a.map(String), correct: q.correct, explain: typeof q.explain === 'string' ? q.explain : '' });
  });
  return tot.length ? tot : null;
}

// ============================================================
// KHO `ep:mine` — mảng các bài tự nhập:
//   { id: 'my:xxx', owner: <user id> | null, type, level, topic, data,
//     created_at, synced: bool }
//
// `owner` null = bài của khách. Khi đăng nhập, bài của khách được đẩy lên tài
// khoản và đổi owner — từ đó chỉ hiện khi đăng nhập đúng tài khoản đó. Nhờ vậy
// người dùng chung máy không thấy bài của nhau sau khi đăng xuất.
// `synced` false = chưa lên server (mất mạng lúc lưu), lần đồng bộ sau sẽ đẩy.
// ============================================================
function docKhoCuaToi() {
  try {
    const v = JSON.parse(localStorage.getItem(MINE_KEY));
    return Array.isArray(v) ? v.filter(x => x && laBaiCuaToi(x.id)) : [];
  } catch (err) {
    return [];
  }
}

function ghiKhoCuaToi(list) {
  try {
    localStorage.setItem(MINE_KEY, JSON.stringify(list));
    return true;
  } catch (err) {
    return false; // hết dung lượng / bị chặn — nơi gọi báo cho người dùng
  }
}

function taoIdCuaToi() {
  return MINE_PREFIX + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Bài của người đang dùng máy: đúng tài khoản, hoặc khách.
function baiCuaToi(userId) {
  const chu = userId || null;
  return docKhoCuaToi().filter(x => (x.owner || null) === chu);
}

function timBaiCuaToi(id) {
  return docKhoCuaToi().find(x => x.id === id) || null;
}

// Trùng tên trong cùng loại + trình độ -> thêm " (2)", " (3)"... thay vì chặn.
// Ô chọn chủ đề hiển thị theo tên; hai dòng y hệt nhau thì không biết bấm cái nào.
function tenKhongTrung(topic, type, level, userId) {
  const daCo = new Set(baiCuaToi(userId)
    .filter(x => x.type === type && x.level === level)
    .map(x => boDauNhap(x.topic)));
  if (!daCo.has(boDauNhap(topic))) return topic;
  for (let n = 2; ; n++) {
    const ten = topic + ' (' + n + ')';
    if (!daCo.has(boDauNhap(ten))) return ten;
  }
}

// Thêm một bài vào kho. Trả về bài đã lưu, hoặc { loi } nếu không lưu được.
function themBaiCuaToi(bai, userId) {
  const list = docKhoCuaToi();
  if (baiCuaToi(userId).length >= GIOI_HAN_NHAP.soBai) {
    return { loi: 'Đã có ' + GIOI_HAN_NHAP.soBai + ' chủ đề tự nhập. Xoá bớt bài cũ rồi thử lại.' };
  }
  const moi = {
    id: taoIdCuaToi(),
    owner: userId || null,
    type: bai.type,
    level: bai.level,
    topic: tenKhongTrung(bai.topic, bai.type, bai.level, userId),
    data: bai.data,
    created_at: new Date().toISOString(),
    synced: false
  };
  list.push(moi);
  if (!ghiKhoCuaToi(list)) return { loi: 'Trình duyệt không cho lưu (hết dung lượng hoặc đang ở chế độ ẩn danh).' };
  return moi;
}

function xoaBaiCuaToiKho(id) {
  ghiKhoCuaToi(docKhoCuaToi().filter(x => x.id !== id));
}

function suaBaiCuaToiKho(id, patch) {
  const list = docKhoCuaToi();
  const b = list.find(x => x.id === id);
  if (!b) return null;
  Object.assign(b, patch);
  ghiKhoCuaToi(list);
  return b;
}

// Bài mẫu điền sẵn khi mở màn nhập (moManNhap) — giữ khớp với file mau_import.txt.
const MAU_NHAP_TEN = 'Ordering coffee';
const MAU_NHAP_TXT = [
  'A: Hi, can I get a latte, please?',
  'VI: Chào bạn, cho tôi một ly latte nhé?',
  'B: Sure. What size would you like?',
  'VI: Được ạ. Bạn muốn cỡ nào?',
  'A: A medium one, please.',
  'B: That will be four dollars.',
  ''
].join('\n');
