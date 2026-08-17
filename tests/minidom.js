// ============================================================
// DOM giả tối thiểu để chạy phần script của index.html trong Node.
// Cố ý KHÔNG dùng jsdom: sandbox không tải được package, mà phần DOM app dùng
// cũng chỉ gói gọn trong chừng này. Nếu sau này app cần API DOM khác, thêm vào
// đây chứ đừng nới lỏng bài kiểm thử.
// ============================================================

let nextUid = 1;

class ClassList {
  constructor(el) { this.el = el; this.set = new Set(); }
  add(...c) { c.forEach(x => x && this.set.add(x)); }
  remove(...c) { c.forEach(x => this.set.delete(x)); }
  contains(c) { return this.set.has(c); }
  toggle(c, force) {
    const on = force === undefined ? !this.set.has(c) : !!force;
    if (on) this.set.add(c); else this.set.delete(c);
    return on;
  }
  get value() { return [...this.set].join(' '); }
}

class El {
  constructor(tag) {
    this.tagName = String(tag).toUpperCase();
    this.uid = nextUid++;
    this.children = [];
    this.parentNode = null;
    this.classList = new ClassList(this);
    this.dataset = {};
    this.attrs = {};
    this.style = {};
    this.hidden = false;
    this.disabled = false;
    this.id = '';
    this.type = '';
    this.title = '';
    this._text = '';
    this._listeners = {};
  }

  // ---- thuộc tính ----
  set className(v) { this.classList.set = new Set(String(v).split(/\s+/).filter(Boolean)); }
  get className() { return this.classList.value; }

  setAttribute(k, v) {
    this.attrs[k] = String(v);
    if (k === 'id') this.id = String(v);
    if (k.startsWith('data-')) this.dataset[k.slice(5).replace(/-(\w)/g, (_, c) => c.toUpperCase())] = String(v);
  }
  getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }

  // ---- nội dung ----
  set textContent(v) { this._text = String(v); this.children = []; }
  get textContent() {
    if (!this.children.length) return this._text;
    return this._text + this.children.map(c => c.textContent).join('');
  }

  // innerHTML chỉ dùng để xoá sạch ('') hoặc gán HTML tĩnh trong renderScript.
  // Bản giả này giữ nguyên chuỗi để test đếm được, và coi '' là xoá con.
  set innerHTML(v) {
    this._html = String(v);
    this.children = [];
    this._text = String(v).replace(/<[^>]*>/g, '');
  }
  get innerHTML() { return this._html || ''; }

  // ---- cây ----
  appendChild(c) { c.parentNode = this; this.children.push(c); return c; }
  get childNodes() { return this.children; }

  _all() {
    const out = [];
    const walk = (n) => n.children.forEach(c => { out.push(c); walk(c); });
    walk(this);
    return out;
  }

  matches(sel) { return matchSelector(this, sel.trim()); }

  closest(sel) {
    let n = this;
    while (n) {
      if (n.matches && n.matches(sel)) return n;
      n = n.parentNode;
    }
    return null;
  }

  querySelectorAll(sel) {
    // Hỗ trợ "A B" (hậu duệ) và danh sách phân tách bởi dấu phẩy.
    const groups = String(sel).split(',').map(s => s.trim()).filter(Boolean);
    const found = new Set();
    groups.forEach(g => {
      const parts = g.split(/\s+/);
      let pool = this._all();
      // khớp phần cuối trước, rồi kiểm tra tổ tiên khớp các phần trước đó
      pool.filter(n => matchSelector(n, parts[parts.length - 1])).forEach(n => {
        let ok = true;
        for (let i = parts.length - 2; i >= 0 && ok; i--) {
          let p = n.parentNode, hit = false;
          while (p) { if (matchSelector(p, parts[i])) { hit = true; break; } p = p.parentNode; }
          ok = hit;
        }
        if (ok) found.add(n);
      });
    });
    return [...found];
  }

  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }

  // ---- sự kiện ----
  addEventListener(type, fn) { (this._listeners[type] ||= []).push(fn); }
  scrollIntoView() {}
  focus() {}

  // Bắn sự kiện có nổi bọt, giống hành vi thật để test event delegation.
  dispatch(type, extra = {}) {
    let stopped = false;
    const ev = {
      type,
      target: this,
      stopPropagation() { stopped = true; },
      preventDefault() {},
      ...extra
    };
    let n = this;
    while (n && !stopped) {
      (n._listeners[type] || []).forEach(fn => fn(ev));
      n = n.parentNode;
    }
    return ev;
  }
}

function matchSelector(el, sel) {
  if (!el || !sel || !el.tagName) return false;
  // tách: tag / #id / .class / [attr="val"]
  const re = /(^|\.|#|\[)([^.#\[\]]*)(\]|)/g;
  let m, ok = true;
  const attrRe = /\[([\w-]+)="([^"]*)"\]/g;
  let a;
  while ((a = attrRe.exec(sel))) {
    const key = a[1].startsWith('data-')
      ? a[1].slice(5).replace(/-(\w)/g, (_, c) => c.toUpperCase())
      : null;
    const got = key ? el.dataset[key] : el.getAttribute(a[1]);
    if (String(got) !== a[2]) return false;
  }
  const base = sel.replace(attrRe, '');
  const idM = base.match(/#([\w-]+)/);
  if (idM && el.id !== idM[1]) return false;
  const clsM = base.match(/\.([\w-]+)/g) || [];
  for (const c of clsM) if (!el.classList.contains(c.slice(1))) return false;
  const tagM = base.match(/^([a-zA-Z]+)/);
  if (tagM && el.tagName !== tagM[1].toUpperCase()) return false;
  return ok && (idM || clsM.length || tagM ? true : false);
}

function createDocument() {
  const doc = new El('document');
  doc.byId = new Map();
  doc.createElement = (t) => new El(t);
  doc.createTextNode = (t) => { const e = new El('#text'); e.textContent = t; return e; };
  doc.getElementById = (id) => doc.byId.get(id) || doc.querySelectorAll('#' + id)[0] || null;
  doc.body = doc.appendChild(new El('body'));
  // Đăng ký sẵn một phần tử theo id (thay cho việc parse HTML thật)
  doc.reg = (id, tag = 'div') => {
    const e = new El(tag);
    e.setAttribute('id', id);
    doc.body.appendChild(e);
    doc.byId.set(id, e);
    return e;
  };
  return doc;
}

function createLocalStorage(blocked = false) {
  const map = new Map();
  return {
    getItem(k) { if (blocked) throw new Error('blocked'); return map.has(k) ? map.get(k) : null; },
    setItem(k, v) { if (blocked) throw new Error('blocked'); map.set(k, String(v)); },
    removeItem(k) { if (blocked) throw new Error('blocked'); map.delete(k); },
    _map: map
  };
}

module.exports = { El, createDocument, createLocalStorage, matchSelector };
