# Kế hoạch phát triển — Luyện Nghe & Đọc Tiếng Anh

> **File duy nhất.** Thay thế hoàn toàn `PHAN_TICH_TINH_NANG_2026-07-31.md` và `DINH_HUONG_2026-08-03.md` (đã xoá).
> Cập nhật lần cuối: **2026-08-04** · Dựa trên `index.html` / `app.js` / `supabase.js` và `supabase_schema.sql`
>
> **Đang ở đâu:** xong Giai đoạn 1 (tuần 1–5), **phần code của Giai đoạn 2** (1.4 dịch câu, 2.5 quiz), **Giai đoạn 3** (tách file — mục 13) và **tuần 13–16** của Giai đoạn 4 (bảng + RLS, đăng nhập Google, gộp dữ liệu lên tài khoản).
> ⏳ **Toàn bộ từ tuần 5 trở đi chưa lên production** — bản đang chạy trên site thật vẫn là bản tuần 4.
> ✅ **Nợ quiz đã trả xong 2026-08-17** — toàn bộ **97/97 bài đã dịch nay đều có quiz**, đã chạy vào Supabase (mục 14).
> Còn nợ: dịch 74 bài luyện nghe (mục 12) — **đã chủ động hoãn** để ưu tiên việc khác.
> **Việc kế tiếp: tuần 17 — 2.3 đồng bộ sổ từ + tiến độ hai chiều** (3h).

---

## 1. Quyết định đã chốt

| Hạng mục | Quyết định |
|---|---|
| Hình thái sản phẩm | **Web. Không làm app điện thoại** |
| Kiến trúc | File tĩnh trên Vercel + Supabase (bổ sung Auth + 3 bảng mới) |
| Đối tượng | Người đi làm mất gốc + người đã biết cơ bản muốn duy trì |
| Mục tiêu | **Portfolio / học kỹ năng** + **có người dùng thật** |
| Nhịp làm việc | **1–3 giờ/tuần** (trung bình 2h) |
| Phạm vi | **10 tính năng** + 1 việc dọn code — xem mục 2 |
| Cách soạn nội dung | Thí điểm **80 bài** trước, sinh bằng AI, duyệt rồi mới mở rộng |
| Tổng khối lượng | **≈ 44 giờ code** + ~8 giờ soạn/duyệt nội dung |
| Thời gian dự kiến | **~5 tháng** ở nhịp 2h/tuần (8/2026 → 1/2027) |
| **Đã chốt KHÔNG làm** | Chép chính tả · Shadowing/chấm phát âm · Audio giọng người thật · PWA · App điện thoại · **SEO trang tĩnh** |

⚠️ **Hệ quả của việc không làm SEO, cần nhớ để khỏi đánh giá sai dự án:** cả 10 tính năng đều nhằm *giữ chân người đã có*, không tính năng nào *đưa người mới tới*. Người dùng thật sẽ phải đến từ việc bạn tự chia sẻ (group Facebook học tiếng Anh, VOZ, bạn bè đồng nghiệp). **Đừng coi dự án là thất bại nếu tới tuần 23 vẫn ít người dùng** — đó là hệ quả trực tiếp của việc không làm phân phối, không phải do 10 tính năng làm chưa tốt. Mục tiêu *portfolio* thì vẫn đạt trọn vẹn.

Ở nhịp 1h/tuần là ~10 tháng, 3h/tuần là ~3,5 tháng. Con số này ghi ra để bạn **không bỏ cuộc ở tháng thứ hai vì tưởng mình chậm** — bạn đúng tiến độ nếu hết tháng 9 xong Giai đoạn 1.

---

## 2. Phạm vi: 10 tính năng + 1 việc dọn code

| Mã | Tính năng | Loại | Giờ |
|---|---|---|---|
| 1.1 | Nghe theo từng câu + lặp câu + chỉnh tốc độ | Frontend | 3h |
| 1.3 | Sổ từ vựng + ôn tập SRS | Frontend | 4h |
| 1.4 | Dịch cả câu (bật/tắt) | Frontend + nội dung | 2h + nội dung |
| 1.5 | Lịch sử học + "Tiếp tục chỗ đang dở" | Frontend | 2h |
| 1.6 | Sửa "Đổi chủ đề" random hay lặp lại | Frontend | 1h |
| 2.1 | Đăng nhập + streak + mục tiêu hằng ngày | Auth + DB | 7h |
| 2.2 | Lộ trình có thứ tự thay cho 500 bài rời rạc | DB + nội dung | 3h + nội dung |
| 2.3 | Đồng bộ sổ từ + tiến độ đa thiết bị | Auth + DB | 3h |
| 2.4 | Trang thống kê tiến bộ | DB | 3h |
| 2.5 | Câu hỏi hiểu bài (3–5 câu trắc nghiệm) | Frontend + nội dung | 3h + nội dung |
| — | **Tách `index.html` thành nhiều file** | Dọn code | 3h |

**Hai điều chỉnh so với danh sách bạn gửi ngày 3/8:**

1. **Thêm lại 1.3 (sổ từ vựng).** Bạn chọn 2.3 "đồng bộ sổ từ" nhưng 1.3 — thứ *tạo ra* sổ từ — lại không có. Không có 1.3 thì 2.3 không có gì để đồng bộ.
2. **Thêm việc tách file (3h).** Không phải cho đẹp: `index.html` hiện 1330 dòng, thêm 10 tính năng này sẽ thành ~2800 dòng trong một file. Bắt buộc làm trước Auth.

---

## 3. Chi tiết 10 tính năng

### 1.1 — Nghe theo từng câu + lặp câu + chỉnh tốc độ · 3h
Hiện `speakAll()` đọc tuốt cả bài, người mất gốc không theo kịp.
- Nút ▶ nhỏ ở đầu mỗi dòng → đọc riêng câu đó
- Nút 🔁 lặp câu hiện tại, nút ⏮ ⏭ chuyển câu
- Thanh tốc độ 0.6×–1.2×, lưu lựa chọn vào `localStorage`

*Chi tiết thiết kế và các bẫy kỹ thuật: xem mục 6.*

### 1.3 — Sổ từ vựng + ôn tập SRS · 4h
Popup tra từ thêm nút ⭐ "Lưu từ". Thêm tab **Sổ từ**:
- Danh sách từ đã lưu (từ, IPA, nghĩa, **câu ví dụ lấy đúng từ bài đã gặp** — ngữ cảnh là thứ giúp nhớ)
- Ôn tập theo hộp Leitner 5 mức: nhớ → đẩy xa hơn (1 / 3 / 7 / 14 / 30 ngày), quên → về hộp 1
- Mỗi ngày hiện "Hôm nay có N từ cần ôn"

Nền tảng đã có sẵn: `wordCache` + cache localStorage. Giai đoạn đầu lưu localStorage, sau đồng bộ Supabase ở 2.3.

### 1.4 — Dịch cả câu (bật/tắt) · 2h + nội dung
- Nút 👁 ở mỗi câu → hiện bản dịch tiếng Việt bên dưới
- Nút "Hiện toàn bộ bản dịch" → chế độ song ngữ

**Dịch sẵn và lưu vào cột `data` JSONB**, dạng `{"lines":[{"s":"A","t":"...","vi":"..."}]}` — **không** gọi Google Translate lúc chạy. Lý do: dịch máy realtime hay sai, chậm, và bị chặn theo IP (dự án đã gặp vấn đề này với API dịch trong tính năng tra từ).

### 1.5 — Lịch sử học + "Tiếp tục chỗ đang dở" · 2h
Vào lại trang thấy ngay: bài gần nhất, 10 bài đã học, chủ đề đã đánh dấu ⭐.
⚠️ Đây là tuần quyết định hình dạng dữ liệu cho cả dự án — xem mục 5.

### 1.6 — Sửa "Đổi chủ đề" random hay lặp lại · 1h
`get_random_content` dùng `order by random()` thuần, không loại trừ bài đã học. Truyền danh sách id đã học lên để loại trừ, hoặc random ở client từ `topicOptions` đã tải sẵn.

### 2.1 — Đăng nhập + streak + mục tiêu hằng ngày · 7h
- Đăng nhập Google hoặc magic link email (Supabase Auth, không phải quản lý mật khẩu)
- Mục tiêu tự đặt: 1 bài / 5 từ mới / 10 phút mỗi ngày
- Streak 🔥 + lịch heatmap các ngày đã học

⚠️ **Bắt buộc giữ chế độ khách.** Cho dùng app không cần đăng nhập, chỉ mời đăng nhập sau khi họ đã học 2–3 bài. Bắt đăng nhập ngay từ đầu sẽ giết lượng người dùng vốn đã ít.

### 2.2 — Lộ trình có thứ tự · 3h + nội dung
Gom chủ đề thành **khoá 10–15 bài** theo tình huống: "Tiếng Anh công sở", "Đi du lịch", "Phỏng vấn xin việc"...
- Màn hình chính hiện đúng **một** nút: "Bài hôm nay" → bài kế tiếp trong lộ trình
- Thanh tiến độ mỗi khoá: 4/12 bài

Chỉ thêm cột `course` + `order_index` vào bảng `content`. Combobox tìm chủ đề vẫn giữ cho người thích tự chọn.

### 2.3 — Đồng bộ sổ từ + tiến độ đa thiết bị · 3h
Người ta học trên điện thoại lúc đi làm, trên máy tính lúc rảnh. Không đồng bộ = mất dữ liệu = bỏ app.

### 2.4 — Trang thống kê tiến bộ · 3h
Số bài đã học, số phút nghe, số từ đã thuộc, điểm quiz theo tuần. Biểu đồ đơn giản.
**Nhìn thấy mình tiến bộ là lý do quay lại mạnh nhất.**

### 2.5 — Câu hỏi hiểu bài · 3h + nội dung
Thêm vào `data` JSONB: `{"quiz":[{"q":"...","a":["...","..."],"correct":0}]}`. Không cần đổi schema vì JSONB linh hoạt.
Biến "nghe xong rồi thôi" thành "nghe xong biết mình hiểu bao nhiêu %".

### Việc dọn code — Tách `index.html` · 3h
Tách thành `index.html` + `app.js` + `styles.css` + `supabase.js`. Vẫn tĩnh, vẫn deploy Vercel như cũ, **không cần build tool**.

---

## 4. Lộ trình 23 tuần

Mỗi dòng là **một tuần, một việc, kết thúc bằng thứ chạy được**. Không việc nào quá 3 giờ — việc dở dang qua tuần sau là việc chết, vì bạn sẽ quên mình đang làm tới đâu.

### Giai đoạn 1 — Nền tảng nghe & thói quen (tuần 1–5, ~10h)
*Toàn bộ chạy bằng `localStorage`, chưa cần tài khoản.*

| Tuần | Việc | Giờ |
|---|---|---|
| 1 | **1.6** Sửa random lặp bài + bật Vercel Analytics | 1h |
| 2–3 | **1.1** Nghe từng câu + lặp + tốc độ *(gồm viết lại máy trạng thái phát)* | 3h |
| 4 | **1.5** Lịch sử học + "Tiếp tục chỗ đang dở" ⚠️ *đọc mục 5 trước khi làm* | 2h |
| 5 | **1.3** Sổ từ vựng + ôn tập Leitner | 4h |

### Giai đoạn 2 — Nội dung thí điểm 80 bài (tuần 6–10, ~9h)

| Tuần | Việc | Giờ |
|---|---|---|
| 6 | Chọn 80 bài tốt nhất, sinh **bản dịch từng câu** bằng AI → file SQL | 2h |
| 7 | **Bạn duyệt 10 bài mẫu.** Đạt thì chạy SQL, không đạt thì chỉnh cách sinh rồi làm lại | 1h |
| 8 | **1.4** Frontend: nút 👁 dịch từng câu + chế độ song ngữ | 2h |
| 9 | Sinh **quiz 4 câu/bài** cho đúng 80 bài đó → file SQL, bạn duyệt | 2h |
| 10 | **2.5** Frontend: hiện quiz sau bài, chấm điểm, giải thích đáp án | 2h |

> Bài chưa có dịch/quiz thì frontend **tự ẩn nút** — không báo lỗi. Không cần chờ đủ 500 bài mới ra mắt được.

### Giai đoạn 3 — Dọn nhà (tuần 11–12, ~3h) ⚠️ bắt buộc

| Tuần | Việc | Giờ |
|---|---|---|
| 11–12 | Tách `index.html` thành 4 file | 3h |

**Đừng bỏ qua giai đoạn này.** Đây là điểm lộ trình dễ chết nhất: nhồi Auth + đồng bộ + thống kê vào file 1330 dòng thì bạn sẽ mất nhiều hơn 3 giờ chỉ để tìm chỗ cần sửa, và mỗi lần sửa lại sợ vỡ chỗ khác.

### Giai đoạn 4 — Tài khoản & đồng bộ (tuần 13–19, ~14h)

| Tuần | Việc | Giờ |
|---|---|---|
| 13 | Tạo bảng `profiles` / `study_log` / `vocab` + RLS (SQL ở mục 7) | 2h |
| 14–15 | **2.1a** Supabase Auth: Google hoặc magic link. **Giữ chế độ khách** | 4h |
| 16 | **Gộp dữ liệu localStorage lên tài khoản khi đăng nhập lần đầu** | 2h |
| 17 | **2.3** Đồng bộ sổ từ + tiến độ hai chiều | 3h |
| 18–19 | **2.1b** Streak 🔥 + mục tiêu hằng ngày + lịch heatmap | 3h |

⚠️ **Tuần 16 là tuần nguy hiểm nhất của cả lộ trình.** Người dùng đã học 3 tháng bằng localStorage, đăng nhập xong mà mất sạch sổ từ thì họ đi luôn. Làm chậm, thử kỹ, **không xoá localStorage cho tới khi xác nhận dữ liệu đã lên server**.

### Giai đoạn 5 — Định hướng & đo lường (tuần 20–23, ~8h)

| Tuần | Việc | Giờ |
|---|---|---|
| 20–21 | **2.4** Trang thống kê tiến bộ | 3h |
| 22 | **2.2a** Gom 80 bài thành 6–8 khoá + thêm cột `course`, `order_index` | 2h |
| 23 | **2.2b** Frontend: nút "Bài hôm nay" + thanh tiến độ khoá | 3h |

### Vì sao thứ tự này

**1. Vì sao 1.5 và 1.3 làm bằng localStorage *trước* khi có tài khoản?**
Vì bạn cần **có thứ để đồng bộ** thì 2.3 mới có nghĩa. Quan trọng hơn: bạn kiểm chứng được logic SRS và lịch sử ngay tuần 4–5 mà không vướng đăng nhập. Làm Auth trước nghĩa là gỡ hai thứ khó cùng lúc và không biết lỗi nằm ở đâu.

**2. Vì sao 2.2 (lộ trình khoá học) nằm cuối?**
Vì nó phụ thuộc hai thứ chưa có: nội dung đã duyệt (GĐ 2) và **số liệu bài nào được học nhiều** (từ 2.4, tuần 20). Gom khoá theo cảm tính rồi phát hiện sai thứ tự thì phải làm lại toàn bộ.

**3. Vì sao tách file nằm giữa?**
Đầu thì phí — GĐ 1 chỉ sửa loanh quanh vài hàm đã có. Cuối thì quá muộn — nợ kỹ thuật đã đủ để làm chậm GĐ 4.

---

## 5. Quyết định kiến trúc quan trọng nhất: thiết kế dữ liệu MỘT lần

Đây là lời khuyên có giá trị nhất trong cả kế hoạch này.

Ngay từ **tuần 4**, khi bắt đầu ghi lịch sử vào `localStorage`, hãy đặt hình dạng dữ liệu **trùng đúng bảng Supabase sẽ tạo ở tuần 13**:

```js
// localStorage key 'log' — đúng hình dạng bảng study_log
{ content_id: 412, mode: 'listen', score: null, seconds: 180, created_at: '2026-08-24T09:12:00Z' }

// localStorage key 'vocab' — đúng hình dạng bảng vocab
{ word: 'straight', ipa: '/streɪt/', pos: 'adv', meaning_vi: 'thẳng',
  example: '...', source_content_id: 412, box: 1, due_date: '2026-08-27' }
```

Làm vậy thì tuần 16 chỉ là **đẩy thẳng mảng lên Supabase**, không phải viết hàm chuyển đổi. Nếu tuần 4 lưu tuỳ tiện kiểu `{tu:'straight', nghia:'thẳng'}` thì tuần 16 mất thêm 2–3 giờ và là nơi dễ mất dữ liệu người dùng nhất.

⚠️ **Bẫy phải xử lý ngay tuần 1:** `fetchFromSupabase()` hiện **vứt mất `id`** của bản ghi (chỉ trả `{topic, lines}` / `{topic, text}`). Không có `content_id` thì không ghi được lịch sử, không biết bài nào đã học, và 1.6 cũng không loại trừ được bài trùng. Sửa 1 dòng, nhưng rất dễ quên.

---

## 6. Chi tiết thiết kế 1.1 — nghe từng câu

**Xung đột cử chỉ — quyết định thiết kế quan trọng nhất.**
`scriptBox` hiện bắt click rồi tìm `e.target.closest('.word')`: bấm chữ là tra nghĩa. Nếu làm theo cách trực giác nhất là "bấm cả dòng để đọc câu đó" thì mọi từ đều nằm trong một dòng → một cú bấm vừa tra từ vừa phát câu.
→ **Giải pháp: nút ▶ nhỏ riêng ở đầu mỗi dòng, vùng chữ giữ nguyên 100% hành vi cũ.**

**Thay đổi cấu trúc DOM.** `.line` hiện là `div` phẳng chứa thẳng speaker + chữ, phải đổi thành `display:flex` hai cột (nút | chữ). `tokenizeWords` **không đụng tới**, nên popup tra từ và `positionPopup` không bị ảnh hưởng.

**Phần tốn công thật nằm ở chỗ không nhìn thấy được.** `speakAll()` là closure đệ quy `speakNext(index)` với `textsToSpeak` và `index` bị nhốt bên trong — không có đường nào từ ngoài nhảy tới câu số 5 hay lặp lại câu hiện tại. Phải nâng lên state ngoài: `sentences[]`, `currentIndex`, `mode ('all'|'one'|'loop')`, `rate`. Đây là viết lại máy trạng thái phát, gần như trọn 3 giờ nằm ở đây.

**Nên bỏ pause/resume nhân dịp này.** `speechSynthesis.pause()` không đáng tin trên Chrome Android (có máy pause xong không resume được). Khi đã có ⏮ ⏭ và nút lặp thì pause gần như thừa; thay bằng `cancel()` rồi phát lại câu hiện tại sẽ ít lỗi hơn hẳn.

**Ba chi tiết dễ bỏ sót:**

- Cần **hai** trạng thái tô sáng, không phải một: câu *đang phát* và câu *đang trỏ tới* (khi đã dừng). Hiện chỉ có `.line.active`. Thiếu cái thứ hai thì người dùng bấm ⏭ mà không biết sẽ đi đâu.
- Dòng chữ ở header *"Bấm vào bất kỳ từ nào để xem phiên âm"* phải sửa lại, vì giờ có hai cử chỉ trong cùng một vùng.
- Giới hạn tốc độ **0.6×–1.2×**, đừng cho xuống 0.5× (nhiều giọng TTS bị méo và nuốt âm).

Trên điện thoại thanh điều khiển tự xuống hai hàng (`.controls` đã có `flex-wrap`). **Không đụng tới Supabase, combobox chủ đề, nút Copy hay popup tra từ.**

---

## 7. Schema Supabase (chưa chạy)

> ⚠️ Bản phác thảo để bạn xem trước. Tôi chỉ chạy sau khi bạn duyệt. Dùng ở tuần 13.

```sql
-- Hồ sơ người học (1-1 với auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  daily_goal int not null default 1,
  streak_current int not null default 0,
  streak_best int not null default 0,
  last_active_date date,
  created_at timestamptz not null default now()
);

-- Lịch sử học từng bài
create table if not exists study_log (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  content_id bigint not null references content(id) on delete cascade,
  mode text not null check (mode in ('read','listen','quiz')),
  score numeric,
  seconds int,
  created_at timestamptz not null default now()
);
create index if not exists idx_study_log_user_date on study_log (user_id, created_at desc);

-- Sổ từ vựng + trạng thái SRS (hộp Leitner)
create table if not exists vocab (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  word text not null,
  ipa text, pos text, meaning_vi text, example text,
  source_content_id bigint references content(id) on delete set null,
  box int not null default 1 check (box between 1 and 5),
  due_date date not null default current_date,
  created_at timestamptz not null default now(),
  unique (user_id, lower(word))
);
create index if not exists idx_vocab_due on vocab (user_id, due_date);

-- RLS: mỗi người chỉ thấy dữ liệu của chính mình
alter table profiles  enable row level security;
alter table study_log enable row level security;
alter table vocab     enable row level security;

create policy "own profile"  on profiles  for all to authenticated
  using (id = auth.uid())      with check (id = auth.uid());
create policy "own log"      on study_log for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own vocab"    on vocab     for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Cho 2.2 (tuần 22): thêm cột vào bảng content hiện có, không phá dữ liệu cũ
alter table content add column if not exists course text;
alter table content add column if not exists order_index int;
create index if not exists idx_content_course on content (course, order_index);
```

⚠️ **Lỗi rất dễ mắc:** bảng `content` hiện chỉ có policy SELECT cho role `anon`. Sau khi thêm Auth phải bổ sung policy SELECT cho role `authenticated`, nếu không **người đăng nhập sẽ không đọc được nội dung**.

---

## 8. Ghi chú kỹ thuật đã kiểm chứng trong code

Đã đọc lại `index.html` để chắc các ước tính là thật, không phải đoán:

- **Câu đã được tách sẵn.** `speakAll()` tách hội thoại theo `lines[]`, bài nghe theo regex `[^.!?]+[.!?]+`, mỗi câu render kèm id DOM `line-{index}`; `speechSession` đã có cơ chế huỷ vòng đọc cũ → hạ tầng cho 1.1 đã xong một nửa.
- **`utter.rate` hard-code = 1** → thêm thanh tốc độ chỉ là đổi một dòng + một biến toàn cục.
- **`fetchFromSupabase()` bỏ mất `id`** → phải sửa ngay tuần 1 (xem mục 5).
- **`get_random_content` không loại trừ bài đã học** (`order by random()` thuần) → đúng như 1.6 mô tả.
- **Toàn bộ 1330 dòng nằm trong 1 file** → đúng như việc dọn code ở GĐ 3.
- **Bảng `content` dùng `data` JSONB** → thêm bản dịch (1.4) và quiz (2.5) **không cần đổi schema**.

---

## 9. Rủi ro & cách xử lý

| Rủi ro | Mức | Xử lý |
|---|---|---|
| Bắt đăng nhập quá sớm làm mất người dùng | Cao | Giữ chế độ khách, chỉ mời đăng nhập sau 2–3 bài |
| **Mất dữ liệu người dùng ở tuần 16 (gộp localStorage → tài khoản)** | Cao | Thiết kế dữ liệu một lần từ tuần 4 (mục 5); không xoá localStorage cho tới khi xác nhận đã lên server |
| Làm nhiều tính năng cùng lúc rồi bỏ dở | Cao | Mỗi tuần đúng một việc, xong mới sang việc kế |
| `index.html` phình to, khó sửa | Cao | Tách file ở GĐ 3, không được bỏ qua |
| Dịch máy sai hàng loạt (1.4, 2.5) | Trung bình | Thí điểm 80 bài, duyệt 10 bài mẫu trước khi mở rộng |
| Supabase free tier tự pause khi không hoạt động | Trung bình | Hiện thông báo lỗi thân thiện thay vì màn hình trắng |
| API từ điển miễn phí bị chặn theo IP | Trung bình | Giữ cache localStorage đang có; nghĩa cả câu đã lưu sẵn trong DB nên không phụ thuộc API |
| Ước tính 44h bị vỡ | Trung bình | Các mục độc lập nhau — nếu chậm thì cắt bớt tính năng cuối, không cắt GĐ 3 |

---

## 10. Nhật ký thực hiện

### ✅ Tuần 1 — hoàn thành 2026-08-03

**1.6 Sửa "Đổi chủ đề" random lặp bài** — đã sửa trong `index.html`, chưa deploy.

| Thay đổi | Nội dung |
|---|---|
| `fetchFromSupabase()` | Giữ lại `id` (trước đây bị vứt mất) |
| `fetchContentById(id, type)` **(mới)** | Lấy bài theo id, dùng chung cho chọn thủ công lẫn random |
| `loadSelectedTopic()` | Dùng hàm chung, ghi nhật ký học |
| `loadNewItem()` | **Đổi cách random**: thay vì gọi RPC `get_random_content`, nay chờ `loadTopicOptions()` rồi chọn ngẫu nhiên trong số chủ đề **chưa học**. Vẫn giữ RPC làm đường dự phòng khi không tải được danh sách |
| Khối nhật ký học **(mới)** | `readLog / writeLog / logStudy / getSeenIds` trên `localStorage`, key `ep:log` |
| `pickUnseenOption()` **(mới)** | Chọn bài chưa học; học hết thì báo "đã học hết N chủ đề — bắt đầu vòng ôn lại" |

**Không đổi database.** RPC `get_random_content` giữ nguyên, không chạy SQL nào.

**Đã làm sẵn cho tương lai:** mỗi bản ghi nhật ký có đúng 5 trường trùng cột bảng `study_log` (`content_id`, `mode`, `score`, `seconds`, `created_at`) theo mục 5 — nên tuần 4 (1.5 Lịch sử học) đã có sẵn dữ liệu, và tuần 16 chỉ cần insert thẳng lên Supabase.

**Đã kiểm thử** (10/10 qua): không bao giờ trả về bài đã học khi còn bài mới; hình dạng bản ghi đúng cột `study_log`; học hết thì vào vòng ôn lại thay vì kẹt; chỉ còn 1 chủ đề vẫn không lặp vô hạn; danh sách rỗng thì rơi về RPC; `localStorage` bị chặn thì app vẫn chạy.

**Vercel Analytics — đã bật 2026-08-03**, gói **Hobby miễn phí** (50.000 sự kiện/tháng, xem được lịch sử 30 ngày). Không phát sinh chi phí.

⚠️ **Bật trong dashboard là chưa đủ.** Site này là HTML tĩnh, không dùng package `@vercel/analytics`, nên đã chèn thẳng script theo dõi vào cuối `index.html` (khối có chú thích `Vercel Web Analytics`). Route `/_vercel/insights/*` **chỉ tồn tại sau lần deploy kế tiếp** — hiện kiểm tra vẫn trả 404, đúng như dự kiến.

**✅ Đã deploy và kiểm chứng xong trên site thật (2026-08-03):**

| Kiểm tra | Kết quả |
|---|---|
| Mục 1.6 chạy trên bản live | ✅ trang gọi `select=id,topic,data&id=eq.N` — đúng hàm `fetchContentById` mới |
| `/_vercel/insights/script.js` | ✅ tải được (trước đó 404) |
| Beacon `/_vercel/insights/view` | ✅ đã gửi — lượt truy cập đầu tiên được ghi nhận |
| `window.vai === true` | ✅ script thật đã khởi chạy, không phải thẻ trống |

Số liệu cần vài giờ tới một ngày mới hiện trong dashboard Vercel.

> **Mẹo kiểm tra lại về sau** (dùng cho mọi lần deploy): mở site, bấm F12 → tab Console, dán:
> `performance.getEntriesByType('resource').map(r=>r.name).filter(n=>n.includes('_vercel'))`
> Thấy đủ cả `script.js` lẫn `view` là Analytics đang chạy. Nếu chỉ thấy `script.js` mà không có `view`, thường là do trình chặn quảng cáo trên máy bạn — người dùng khác vẫn đếm bình thường.

**Xem số liệu ở đâu:** `vercel.com` → project `english-practice-app` → mục **Analytics** ở thanh bên trái
(`https://vercel.com/nhung1012s-projects/english-practice-app/analytics`). Trang Overview cũng có một thẻ tóm tắt nhỏ.

Cách đọc:

| Chỉ số | Nghĩa |
|---|---|
| **Visitors** | Số người |
| **Page Views** | Số lượt mở trang (một người mở lại nhiều lần vẫn tính nhiều lượt) |
| **Bounce Rate** | Tỉ lệ vào rồi thoát ngay |
| **Pages** | Trang nào được xem — hiện chỉ có `/` vì app là một trang duy nhất |
| **Referrers** | Nguồn dẫn tới. **Sẽ luôn trống** vì đã chốt không làm SEO (mục 1) |

⚠️ Gói Hobby chỉ giữ **lịch sử 30 ngày**. Muốn so sánh dài hơn thì phải tự chụp số liệu định kỳ.
Và nhớ rằng số liệu những ngày đầu chủ yếu là chính bạn đang test, chưa phải người dùng thật.

### ✅ Tuần 2–3 — hoàn thành 2026-08-03 · đã chạy trên production

**1.1 Nghe theo từng câu + lặp câu + chỉnh tốc độ** — đã sửa `index.html`, **không đổi database**.

**Giao diện mới:**

- Nút **▶ nhỏ ở đầu mỗi dòng** → đọc riêng câu đó. Vùng chữ giữ nguyên: bấm từ vẫn tra nghĩa
- Thanh điều khiển: **⏮ / ▶ Nghe / ⏭ / 🔁** (lặp câu, bật thì nút sáng xanh)
- **Thanh tốc độ 0.6×–1.2×**, lưu vào `localStorage` (`ep:rate`) nên lần sau vào không phải chỉnh lại
- Hai mức tô sáng: **vàng** = câu đang đọc, **xám** = câu đang trỏ tới khi đã dừng

**Thay đổi bên trong:**

| Hàm | Thay đổi |
|---|---|
| `buildSentences()` **(mới)** | Nguồn dữ liệu câu **dùng chung** cho cả render lẫn đọc → chỉ số trên màn hình luôn khớp chỉ số đang đọc |
| `renderScript()` | Mỗi dòng thành flex 2 cột: nút ▶ + `.line-text`. `tokenizeWords` không đổi |
| `speakAll()` → `speakFrom(i)` | Viết lại máy trạng thái: `sentences[]`, `currentIndex`, `isPlaying`, `loopOne`, `playRate` nâng ra biến ngoài nên nút bấm điều khiển được |
| `markCurrent()` **(mới)** | Quản lý 2 class `.active` / `.current` |
| `stopSpeaking()` **(mới)** | Thay cho pause/resume |
| `goToSentence(i)` **(mới)** | Nhảy tới câu rồi đọc luôn |

**Đã bỏ pause/resume.** `speechSynthesis.pause()` không đáng tin trên Chrome Android (có máy pause xong không resume được). Nút giữa nay là **▶ Nghe / ⏹️ Dừng**; bấm Nghe lại thì đọc tiếp từ câu đang chọn chứ không phải từ đầu.

**🐞 Sửa được một lỗi có sẵn từ trước:** regex tách câu `[^.!?]+[.!?]+` **nuốt mất câu cuối** của bài nghe nếu bài không kết thúc bằng dấu chấm — câu đó biến mất khỏi cả script hiển thị lẫn phần đọc. Đã đổi thành `[^.!?]+[.!?]*`. Lỗi này có từ bản đầu, chỉ lộ ra khi viết test.

**Đã kiểm thử 26/26 qua** (DOM giả + `speechSynthesis` giả): đọc đúng thứ tự; áp đúng tốc độ; giọng đúng theo người nói A/B; lặp câu chạy đúng và **bấm Dừng là thoát được** (không kẹt vòng vô hạn); đổi chủ đề giữa chừng thì vòng đọc cũ tự huỷ; `goToSentence` ngoài biên không làm gì; tốc độ bị kẹp đúng 0.6–1.2 và lưu/tải đúng; dữ liệu `localStorage` hỏng thì quay về mặc định; luôn chỉ một câu được tô sáng.

**✅ Đã deploy và kiểm chứng trực tiếp trên site thật (2026-08-03):**

| Kiểm tra | Kết quả |
|---|---|
| 10 dòng, 10 nút ▶, dòng là flex 2 cột | ✅ |
| Bấm nút ▶ dòng thứ 4 | ✅ `currentIndex = 3`, tô vàng đúng dòng đó, chỉ 1 câu sáng cùng lúc |
| Bật 🔁 rồi bấm Dừng | ✅ dừng hẳn, không còn vòng lặp chạy ngầm sau 1,5 giây |
| Đang đọc mà bấm "Đổi chủ đề" | ✅ đổi bài, không đọc tiếp bài cũ, `currentIndex` về 0, hết tô vàng |
| Kéo tốc độ về 0.75× | ✅ lưu vào `localStorage`, hiển thị `0.75×` |
| Vercel Analytics vẫn chạy sau khi đổi code | ✅ |

**Hai hành vi khi tra từ trong lúc đang đọc** (tôi ghi nhầm kỳ vọng ở bản trước, đây mới là đúng):

- **Bấm vào từ** → popup hiện ra, script **vẫn đọc tiếp**, câu vẫn tô vàng. Cố ý như vậy: tra nghĩa không nên cắt ngang bài đang nghe.
- **Bấm nút 🔊 trong popup** (nghe riêng từ đó) → mới dừng đọc script, câu chuyển xám. ✅ đã kiểm chứng.

### ✅ Tuần 4 — hoàn thành 2026-08-03 · đã chạy trên production

**1.5 Lịch sử học + "Tiếp tục chỗ đang dở"** — đã sửa `index.html`, **không đổi database**.

**Giao diện mới** — thêm khung "Học gần đây" dưới khung chọn chủ đề:

- Ô **"↩️ Học tiếp"** hiện bài bạn đang dở lần trước, kèm thời gian ("2 giờ trước")
- Danh sách **10 bài gần nhất**, mỗi dòng có icon loại bài, tên chủ đề, badge trình độ, thời gian — bấm là mở lại
- Nút **☆ / ★** đánh dấu chủ đề, cạnh tên chủ đề và trên từng dòng lịch sử
- Nút lọc **⭐ Đã đánh dấu** (tự ẩn khi chưa đánh dấu gì)
- Khung tự ẩn hoàn toàn khi chưa học bài nào

**Ba quyết định kỹ thuật đáng ghi lại:**

**1. Không nhét tên bài vào `ep:log`.** Nhật ký phải giữ đúng 5 cột bảng `study_log` (mục 5), thêm trường vào đó sẽ phá việc đẩy thẳng dữ liệu lên Supabase ở tuần 16. Nên tên bài nằm ở kho riêng `ep:titles` (cache `id → {topic, type, level}`), đánh dấu ở `ep:fav`. Nhờ cache này, lịch sử vẽ ra tức thì không cần gọi mạng.

**2. "Bài lần trước" tính trên ảnh chụp nhật ký lúc mở trang.** Đây là bẫy dễ mắc: app tự mở một bài ngẫu nhiên ngay khi vào trang, nên nếu tính "bài gần nhất" trên nhật ký sống thì nó luôn là bài vừa tự mở, và ô "Học tiếp" thành vô nghĩa. Phải chốt `resumeTarget` **trước** khi gọi `loadNewItem()`.

**3. `backfillTitles()` lấp tên cho nhật ký cũ.** Dữ liệu ghi từ tuần 1 chỉ có `content_id`, chưa có tên bài — nếu không xử lý, lịch sử sẽ trống trơn ở lần chạy đầu. Hàm này gọi Supabase một lần ở chế độ nền để lấp tên cho tối đa 60 bài gần nhất, rồi vẽ lại.

**Đã kiểm thử 23/23 qua** (bổ sung cho 26 test của 1.1, tổng 49): bài học nhiều lần chỉ hiện một dòng và xếp theo lần gần nhất; bài chưa có tên bị bỏ qua thay vì hiện dòng trống; ảnh chụp nhật ký cho ra đúng "bài lần trước" chứ không phải bài vừa mở; đánh dấu bật/tắt đúng, đánh dấu id lạ không làm vỡ danh sách; `timeAgo` đúng ở mọi mốc và trả chuỗi rỗng khi dữ liệu hỏng; **`ep:log` vẫn đúng 5 cột `study_log`**; `localStorage` bị chặn thì không ném lỗi.

**✅ Đã deploy và kiểm chứng trực tiếp trên site thật (2026-08-03):**

| Kiểm tra | Kết quả |
|---|---|
| `backfillTitles()` lấp tên cho nhật ký tuần 1 | ✅ 9/9 bài trong nhật ký đã có tên, lịch sử hiện đủ 9 dòng |
| Ô "Học tiếp" | ✅ hiện đúng bài lần trước ("Mua khẩu trang ở hiệu thuốc"), bấm là mở đúng bài, xong thì ô tự ẩn |
| Mở lại bài **khác tab + khác trình độ** từ lịch sử | ✅ từ `dialogue/beginner` sang `dialogue/advanced`: nút tab và nút trình độ đều sáng đúng, nhãn script đổi đúng |
| Số câu render = số câu trong máy đọc sau khi đổi nhóm | ✅ 18 = 18 (không lệch chỉ số) |
| Vẫn phát được sau khi đổi nhóm | ✅ |
| Đánh dấu ⭐ | ✅ nút sáng, lưu `ep:fav`, dòng lịch sử tương ứng cũng sáng |
| Bộ lọc "⭐ Đã đánh dấu" | ✅ lọc đúng, đổi tiêu đề khung, bỏ đánh dấu hết thì nút lọc tự ẩn |
| Dòng bài đang mở | ✅ được tô màu và ghi "(đang mở)" |

### ✅ Tuần 5 — hoàn thành 2026-08-03 · ⏳ **chưa lên production** · **Hết Giai đoạn 1**

**1.3 Sổ từ vựng + ôn tập SRS** — đã sửa `index.html`, **không đổi database**.

**Giao diện mới:**

- Popup tra từ có thêm nút **☆ / ★** để lưu từ vào sổ
- Khung **"Sổ từ (N)"** với danh sách từ đã lưu: từ, phiên âm, nghĩa, badge **Hộp 1–5** hoặc **Cần ôn**, nút 🔊 nghe lại và 🗑 xoá. Từ đến hạn được đẩy lên đầu
- Nút **🎯 Ôn tập (N)** mở phiên ôn: hiện từ → bấm "Hiện nghĩa" → chấm **😕 Quên** / **🙂 Nhớ**
- Khung tự ẩn khi chưa lưu từ nào

**Thuật toán hộp Leitner 5 mức:**

| Hộp | Nhớ thì ôn lại sau |
|---|---|
| 1 → 2 | 3 ngày |
| 2 → 3 | 7 ngày |
| 3 → 4 | 14 ngày |
| 4 → 5 | 30 ngày |
| 5 | giữ ở 30 ngày |

Quên thì rơi thẳng về **hộp 1** và được đẩy xuống cuối hàng đợi để **gặp lại ngay trong phiên đó** — đúng tinh thần Leitner: từ nào yếu thì gặp nhiều lần.

**Hai chi tiết đáng ghi lại:**

**1. Đúng cột bảng `vocab`.** Mỗi mục trong `ep:vocab` có đúng 9 trường `word, ipa, pos, meaning_vi, example, source_content_id, box, due_date, created_at` — khớp bảng `vocab` ở mục 7, trừ `id`/`user_id` do DB tự sinh. So khớp từ **không phân biệt hoa/thường**, khớp với ràng buộc `unique (user_id, lower(word))` của DB, nên tuần 17 đồng bộ lên sẽ không bị xung đột khoá.

**2. `boSungNghiaChoSoTu()`.** Người dùng hay bấm ⭐ ngay khi popup vừa mở, lúc API từ điển chưa trả về — nếu không xử lý, sổ từ sẽ đầy những mục trống nghĩa. Hàm này bổ sung nốt phiên âm/nghĩa/ví dụ khi API về, và **không ghi đè** dữ liệu đã có.

**Đã kiểm thử 27/27 qua** (tổng cả 3 mục: **76 test**, không có mục nào hỏng mục nào): Leitner đi đúng 5 mốc ngày và không vượt quá hộp 5; quên thì về hộp 1 và đến hạn ngay; không lưu trùng kể cả khác hoa/thường; mục lưu đúng 9 cột bảng `vocab`; bổ sung nghĩa muộn hoạt động và không ghi đè; chấm từ không tồn tại trả `null` thay vì ném lỗi; dữ liệu hỏng hoặc sai kiểu vẫn trả về mảng rỗng; `localStorage` bị chặn thì không vỡ.

**Bổ sung theo yêu cầu — nút dừng ngay tại từng câu:** nút ở đầu mỗi dòng nay **đổi thành ■ khi câu đó đang được đọc**, bấm lại là dừng ngay tại chỗ. Bấm sang câu khác thì nút cũ tự trả về ▶. Trước đây muốn dừng phải với lên thanh điều khiển phía trên, khá bất tiện khi đang đọc dở ở cuối bài dài.

### 🎨 Sắp xếp lại giao diện (2026-08-03)

Hai khung "Học gần đây" và "Sổ từ" chiếm quá nhiều diện tích màn hình chính. Đã thử phương án thu gọn (bấm tiêu đề để đóng/mở) nhưng vẫn còn chiếm chỗ, nên **chuyển hẳn vào popup**:

- Màn hình chính chỉ còn **2 nút nhỏ**: `🕘 Học gần đây (10)` và `📒 Sổ từ (12)` — nút Sổ từ có **chấm đỏ "N cần ôn"** khi có từ đến hạn, để không phải mở ra mới biết
- Ô "Học tiếp" thu từ khối màu xanh cao 3 dòng xuống **đúng một dòng**, bấm cả dòng là mở lại bài dở
- Popup dùng chung cho cả hai, đóng bằng nút ✕, bấm nền, hoặc phím Esc
- **Trên điện thoại popup trượt từ dưới lên** và cao tối đa 86% màn hình (`@media max-width: 560px`), thay vì hộp nổi giữa màn hình như trên máy tính
- Khoá cuộn nền khi popup mở, để cuộn danh sách dài không làm trang phía sau trôi theo

**Một quyết định nhỏ:** thoát popup thì **dừng luôn phiên ôn tập đang dở**. Nếu giữ lại, lần sau mở ra người dùng sẽ thấy hàng đợi cũ mà không nhớ mình đang ôn tới đâu — rối hơn là bắt đầu lại.

Toàn bộ **82 test vẫn qua** sau khi đổi giao diện, vì phần dữ liệu và thuật toán không bị đụng tới.

### 🐞 Hai lỗi giao diện đã sửa (2026-08-03)

**1. Popup không tự đóng khi chọn bài.** Bấm một chủ đề trong popup "Học gần đây" thì bài có đổi, nhưng popup vẫn nằm che đúng cái bài vừa chọn. Đã sửa trong `openLesson()` — hàm này là cửa vào duy nhất nên sửa một chỗ là cả dòng "Học tiếp" lẫn danh sách lịch sử đều đúng.

**2. Nút "Sổ từ" bị ẩn khi chưa lưu từ nào — thiết kế sai của tôi.** Tôi để nút tự ẩn khi sổ trống cho gọn, nhưng thành ra **người dùng mới không bao giờ biết app có tính năng này**: muốn thấy nút thì phải lưu từ trước, mà muốn biết để lưu thì phải thấy nút. Đã đổi thành luôn hiện, và khi mở ra lúc trống thì có dòng hướng dẫn "bấm vào một từ trong bài rồi bấm ☆ để lưu".

Bài học rút ra cho các mục sau: **không ẩn lối vào của một tính năng chỉ vì nó đang trống** — trạng thái trống là lúc người dùng cần hướng dẫn nhất.

### 🐞 Nút "🎯 Ôn tập" bị ẩn — đúng lỗi trên, lặp lại lần hai (2026-08-03)

Bạn báo *"chưa thấy tính năng Ôn tập (N)"*. Nguyên nhân: nút chỉ hiện khi **có từ tới hạn** (`reviewBtn.hidden = due.length === 0`). Nghĩa là sổ từ trống thì không thấy, mà ôn xong một lượt thì nút cũng biến mất luôn — người dùng tưởng app không có tính năng này.

Đây **đúng bài học vừa rút ra ở nút "Sổ từ"**, chỉ khác chỗ áp dụng. Ghi lại để nhớ rằng viết bài học vào tài liệu là chưa đủ, phải rà lại xem còn chỗ nào mắc cùng lỗi.

**Đã sửa:**

- Nút **luôn hiện** khi sổ có từ, chỉ **mờ đi** (`disabled`) khi chưa tới hạn — thay vì biến mất
- Chưa tới hạn thì trong sổ hiện một dòng: *"Hôm nay không có từ nào tới hạn ôn. Lượt ôn kế tiếp: 06/08/2026."* — để người dùng không nhìn nút mờ mà không hiểu vì sao
- Thêm `ngayOnGanNhat()` và `dinhDangNgay()`

**Nhắc lại vị trí nút** (dễ tìm nhầm): nút `🎯 Ôn tập (N)` nằm **bên trong popup `📒 Sổ từ`**, ở hàng tiêu đề cạnh nút ✕ — không nằm ngoài màn hình chính. Màn hình chính chỉ có nút `📒 Sổ từ (N)` kèm chấm đỏ "N cần ôn".

**Bổ sung 7 test (nhóm G), tổng 57/57 qua** — trong đó có một test canh đúng lỗi này: *ôn hết rồi thì nút VẪN hiện, chỉ mờ đi, không được biến mất*.

### ⚠️ Sự cố deploy: Vercel bỏ lỡ commit (2026-08-03)

Sau khi upload `index.html` lên GitHub, production vẫn chạy bản cũ. Kiểm tra ra:

- Commit **có** trên GitHub (`6e1ab41`), nội dung file đúng và đầy đủ
- Vercel **không tạo bản deploy nào** cho commit đó — production vẫn ở `9a60ad9`
- Kết nối Git trong `Settings → Git` vẫn bình thường

Kết luận: webhook GitHub → Vercel lỡ một nhịp. Không phải hỏng vĩnh viễn.

**Cách chữa, theo thứ tự nhẹ → nặng:**

1. Upload lại file lên GitHub thêm lần nữa → commit mới thường làm webhook chạy lại
2. Nếu vẫn không có dòng nào xuất hiện ở trang Deployments sau ~1 phút → vào `Settings → Git`, ngắt rồi nối lại repo

⚠️ **Bấm "Redeploy" trong Vercel KHÔNG giải quyết được** — nó chỉ dựng lại đúng commit cũ.

**Cách tự kiểm tra bản trên production có phải bản mới không** (không cần hỏi tôi): mở site, F12 → Console, dán:

```js
[...document.scripts].length && !!document.getElementById('openVocabBtn')
```

`true` là đã có bản mới nhất. Hoặc nhìn trang Deployments của Vercel xem commit trên cùng có phải commit vừa đẩy không.

**Việc của bạn:** upload `index.html` → deploy → nhắn tôi kiểm tra trên site thật.

---

## 11. Giai đoạn 2 (tuần 6–10) — nhật ký thực hiện

Hết Giai đoạn 1, app đã có: nghe từng câu, lịch sử, sổ từ + ôn tập. Toàn bộ chạy bằng `localStorage`, **chưa cần tài khoản**.

Giai đoạn 2 khác hẳn về tính chất: **phần lớn là công nội dung, không phải code**.

### ✅ Tuần 6–10 — phần code hoàn thành 2026-08-03 · ⏳ **chưa lên production**

**Chọn 80 bài thí điểm:** toàn bộ ở trình độ **intermediate** (40 dialogue + 40 listening), theo lựa chọn ngày 3/8. Lý do chọn một trình độ thay vì rải đều: người học ở cùng một mức sẽ gặp bài đã dịch liên tiếp nhau, thay vì thỉnh thoảng mới trúng một bài có dịch.

**Đã làm xong trong đợt này:**

| Việc | Trạng thái |
|---|---|
| Đường ống sinh nội dung (`gd2_batches/`) | ✅ có kiểm tra tự động, chặn dữ liệu lệch |
| **Bản dịch từng câu cho đủ 80/80 bài** (40 dialogue + 40 listening) | ✅ **đã chạy vào Supabase** |
| Quiz 4 câu — 10 bài đầu | ✅ **đã chạy vào Supabase** |
| **1.4** Frontend — nút 👁 dịch câu + chế độ song ngữ | ✅ |
| **2.5** Frontend — quiz sau bài, chấm điểm, giải thích đáp án | ✅ |
| Bộ kiểm thử tự động (`tests/`) | ✅ 50/50 qua |
| Quiz cho 70 bài còn lại | ⬜ làm tiếp theo lô |

**Đã đối chiếu lại trực tiếp trên Supabase sau khi chạy xong:**

| Kiểm tra | Kết quả |
|---|---|
| Số bài intermediate đã có bản dịch | ✅ 40 dialogue + 40 listening = **80/80** |
| Bài có số câu dịch **lệch** số câu gốc | ✅ **0** |
| Câu dịch rỗng | ✅ **0** |

**Mở rộng ngoài gói thí điểm (cùng ngày):** dịch nốt **17 hội thoại** còn lại (id 957–973, lô `d04`).

Tiến độ nội dung và cách vận hành xưởng dịch: xem **mục 12**.

---

### Cách nội dung được lưu (không đổi schema)

Vẫn dùng cột `data` JSONB của bảng `content`, đúng như dự kiến ở mục 8:

```jsonc
// dialogue — bản dịch nằm ngay trong từng lượt thoại
{ "lines": [ { "s": "A", "t": "Have you seen...", "vi": "Cậu xem... chưa?" } ],
  "quiz":  [ { "q": "...", "a": ["...", "..."], "correct": 2, "explain": "..." } ] }

// listening — bản dịch là mảng riêng, xếp đúng thứ tự câu
{ "text": "...", "vi": ["câu 1 dịch", "câu 2 dịch"], "quiz": [ ... ] }
```

**Bốn quyết định kỹ thuật đáng ghi lại:**

**1. `buildItem()` — một cửa duy nhất dựng `currentItem`.** Có **hai** đường lấy bài: chọn theo id và random qua RPC. Trước đây mỗi đường tự dựng lấy đối tượng bài, nên chỉ cần quên thêm `vi`/`quiz` ở một chỗ là bài mở bằng đường kia sẽ mất tính năng **mà không báo lỗi gì** — đúng loại lỗi khó phát hiện nhất. Nay cả hai đường đều gọi chung một hàm.

**2. Lệch số câu thì bỏ hết bản dịch, không hiện một phần.** Bài nghe lưu bản dịch ở mảng `data.vi` khớp theo vị trí. Nếu mảng dịch có 12 phần tử mà bài tách ra 13 câu, thì từ câu lệch trở đi **mọi câu đều hiện nghĩa của câu khác** — và người học không có cách nào biết. Nên frontend chỉ gắn bản dịch khi số lượng khớp tuyệt đối. Script sinh SQL cũng chặn ngay từ đầu, dùng **đúng regex** mà frontend đang dùng.

**3. Đáp án đúng luôn soạn ở vị trí 0, script tự đảo.** Nếu để nguyên, người học chỉ cần luôn chọn A là đúng hết. Việc đảo dùng seed cố định theo `id + số câu` nên chạy lại bao nhiêu lần cũng ra đúng một kết quả — file SQL lưu trong repo luôn khớp với dữ liệu đang nằm trên Supabase.

**4. Nút 👁 không cắt ngang phần đang đọc.** Giống hệt cách đã xử lý khi bấm vào một từ để tra nghĩa (ghi ở nhật ký tuần 2–3): xem nghĩa là thao tác phụ, không nên làm dừng bài đang nghe.

---

### Giao diện mới

**1.4 — dịch cả câu:**

- Nút **👁 ở cuối mỗi dòng** → hiện/ẩn bản dịch riêng câu đó. Vùng chữ giữ nguyên 100% hành vi cũ (bấm từ vẫn tra nghĩa) — nút nằm ngoài `.line-text` nên hai cử chỉ không đè lên nhau
- Nút **🇻🇳 Bản dịch** cạnh nút Copy → bật chế độ song ngữ cho cả bài. Lựa chọn lưu vào `localStorage` (`ep:bilingual`), nhớ sang cả bài sau và lần vào trang sau
- Câu chưa có bản dịch thì **không có nút 👁**; bài chưa có bản dịch nào thì **nút 🇻🇳 tự ẩn**

**2.5 — câu hỏi hiểu bài:**

- Khung **📝 Câu hỏi hiểu bài** dưới phần script, tự ẩn khi bài chưa soạn quiz
- 4 câu trắc nghiệm, mỗi câu 4 lựa chọn A–D. **Phải trả lời hết mới bấm được "Nộp bài"** — nộp sớm sẽ tính sai những câu chỉ vì chưa kịp đọc, làm điểm số mất ý nghĩa
- Nộp xong: đáp án đúng tô **xanh**, chỗ chọn sai tô **đỏ**, hiện điểm `Đúng 3/4 — 75%`
- **Giải thích hiện cho mọi câu, kể cả câu làm đúng** — vì đôi khi người học chọn đúng do đoán, và đó chính là lúc cần biết vì sao
- Nút **↻ Làm lại** để làm lại từ đầu

**Đã ghi sẵn cho tương lai:** làm quiz xong ghi một bản ghi `mode: 'quiz'` kèm `score` là tỉ lệ đúng 0–1 — đúng kiểu cột `score numeric` của bảng `study_log` (mục 7). Nhờ vậy **2.4 Trang thống kê tiến bộ** (tuần 20) đã có sẵn dữ liệu điểm quiz theo tuần, và tuần 16 vẫn chỉ là insert thẳng.

---

### Bộ kiểm thử tự động — `tests/`

Từ đợt này việc kiểm thử được **lưu thành file chạy lại được**, thay vì chạy tay rồi quên:

```bash
node tests/run.js
```

`tests/run.js` nạp **nguyên khối `<script>` của `index.html`** vào một DOM giả (`tests/minidom.js`, tự viết vì sandbox không tải được `jsdom`). Cố ý **không chép logic ra file test** — chép lại thì test vẫn xanh trong khi `index.html` đã hỏng, đúng loại lỗi nguy hiểm nhất trong một bộ test.

**50/50 qua**, gồm những trường hợp đáng chú ý:

| Nhóm | Kiểm tra gì |
|---|---|
| A (6) | `buildItem` giữ được `vi`/`quiz` qua **cả hai** đường lấy bài; bài chưa soạn trả `null` chứ không phải `undefined` |
| B (7) | Gắn bản dịch đúng câu; **lệch số câu thì bỏ hết**; câu cuối không có dấu chấm vẫn được tính |
| C (13) | Nút 👁 chỉ mở đúng câu của nó; không làm dừng bài đang đọc; ghi nhớ chế độ song ngữ; **bản dịch dựng bằng `textContent` chứ không phải HTML** (chống chèn mã từ DB) |
| D (18) | Chấm điểm đúng; chưa trả lời hết thì khoá nút nộp; nộp xong khoá đáp án; nộp hai lần không ghi log hai lần; **câu hỏi hỏng bị loại mà không làm sập cả bộ đề**; đổi bài thì quiz cũ biến mất sạch |
| E (5) | Nhật ký vẫn **đúng 5 cột `study_log`**, không thừa trường nào; `score` sai kiểu bị quy về `null` |
| F (1) | `localStorage` bị chặn thì app vẫn chạy |

---

### Việc của bạn

1. Upload `index.html` lên GitHub → chờ Vercel deploy (xem mục 10 nếu Vercel bỏ lỡ commit)
2. Mở app, chọn **trình độ Trung cấp**. Tab *Hội thoại* đã dịch **toàn bộ**, tab *Luyện nghe* đã dịch 40/114 bài.
3. Bấm 👁 vài câu, bật 🇻🇳 đọc song ngữ, và làm thử quiz ở một trong 10 bài hội thoại đầu (*Hybrid Work*, *Rác thải nhựa văn phòng*, *Team building*, *AI trong dịch vụ khách hàng*…)

Rồi **nói tôi biết bản dịch có tự nhiên không**. Ưng thì tôi soạn tiếp quiz và dịch nốt 74 bài luyện nghe. Chưa ưng thì chỉnh giọng dịch rồi chạy lại — file lô trong `gd2_batches/` sửa được từng câu, chạy lại `build_sql.py` là ra SQL mới.

---

## 12. Xưởng nội dung `gd2_batches/` — tiến độ & cách vận hành

Thư mục `gd2_batches/` chứa **nguồn** của bản dịch và bộ câu hỏi. Hai file `gd2_translations.sql` và `gd2_quiz.sql` ở thư mục gốc là **sản phẩm sinh ra**, đừng sửa tay — sửa ở file lô rồi chạy lại script.

### Tiến độ trình độ trung cấp

| Loại | Đã dịch | Tổng |
|---|---|---|
| **Hội thoại** | ✅ **57 / 57 — xong toàn bộ** | 57 |
| **Luyện nghe** | 40 / 114 | 114 |

Còn **74 bài luyện nghe** chưa dịch (id 725–788, 924–933); số câu của chúng đã lưu sẵn ở `source_counts_2.json`. Bài chưa dịch thì frontend tự ẩn nút 👁, không báo lỗi — nên mở rộng dần theo lô lúc nào cũng được.

| Lô | Bài | Dịch | Quiz |
|---|---|:---:|:---:|
| `d01` | 10 hội thoại (id 1, 3, 15, 21, 34, 40, 46, 52, 58, 64) | ✅ | ✅ |
| `d02` | 17 hội thoại (id 86–102) | ✅ | ✅ |
| `d03` | 13 hội thoại (id 914–923, 954–956) | ✅ | ✅ |
| `d04` | 17 hội thoại (id 957–973) — **hết hội thoại trung cấp** | ✅ | ✅ |
| `l01` | 10 luyện nghe (id 678–692) | ✅ | ✅ |
| `l02`–`l07` | 30 luyện nghe (id 693–724) | ✅ | ✅ |

Tất cả đã chạy vào Supabase. Đã đối chiếu lại trên DB: **0 bài lệch số câu, 0 câu dịch rỗng**.

### File trong thư mục

| File | Vai trò |
|---|---|
| `d01.json`, `d02.json`… | Lô bài **hội thoại**: bản dịch + quiz, đặt tên `d` + số thứ tự lô |
| `l01.json`, `l02.json`… | Lô bài **luyện nghe** |
| `source_counts*.json` | Kiểu bài + **số câu** của từng bài gốc. Chỉ để kiểm tra, không chứa nội dung nên rất nhẹ. Mở rộng phạm vi thì thêm file mới (`_2`, `_3`…), đừng sửa file cũ — giữ được dấu vết đợt nào thêm bài nào |
| `build_sql.py` | Kiểm tra rồi sinh 2 file SQL ở thư mục gốc |

### Hình dạng một lô

```json
{
  "<id bài trong bảng content>": {
    "vi": ["câu 1 dịch", "câu 2 dịch", "..."],
    "quiz": [
      { "q": "Câu hỏi tiếng Anh?",
        "a": ["đáp án đúng", "sai 1", "sai 2", "sai 3"],
        "correct": 0,
        "explain": "Giải thích tiếng Việt, dẫn lại câu trong bài." }
    ]
  }
}
```

Khoá `quiz` là **tuỳ chọn** — lô chỉ có bản dịch cũng hợp lệ.

Hai quy ước **bắt buộc**:

1. **`vi` phải đúng số câu của bài gốc.** Với hội thoại là số phần tử `lines`; với luyện nghe là số câu tách được bởi đúng regex frontend đang dùng (`/[^.!?]+[.!?]*/g`). `build_sql.py` chặn ngay nếu lệch — vì lệch một câu là mọi câu phía sau bị dịch sai chỗ mà người học không có cách nào phát hiện.
2. **Đáp án đúng luôn viết ở vị trí 0.** Dễ soạn, dễ soát lại. `build_sql.py` tự đảo thứ tự lựa chọn bằng seed cố định (`id-số câu`), nên chạy lại bao nhiêu lần cũng ra đúng một kết quả, và người học không thể cứ chọn A là đúng hết.

### Quy trình

```bash
python3 gd2_batches/build_sql.py     # kiểm tra + sinh gd2_translations.sql, gd2_quiz.sql
```

Script **không tạo file nếu có bất kỳ lỗi nào** và in ra danh sách lỗi. Các lỗi bị bắt: lệch số câu, câu dịch rỗng, quiz khác 4 câu, `correct` trỏ ra ngoài mảng, lựa chọn trùng nhau, thiếu đề bài.

Sau đó dán nội dung 2 file SQL vào **Supabase → SQL Editor → Run**. Cả hai file chỉ `update` cột `data` bằng phép hợp nhất JSONB, **không đổi schema, không xoá dữ liệu cũ**, chạy lại nhiều lần vẫn an toàn.

### Lấy số câu cho các bài mới

Chạy trong Supabase SQL Editor rồi lưu kết quả vào một file `source_counts_*.json` mới:

```sql
select jsonb_object_agg(id::text, jsonb_build_object('type', type, 'n', n))::text
from (
  select id, type,
    case when type='dialogue' then jsonb_array_length(data->'lines')
         else (select count(*) from regexp_matches(data->>'text', '[^.!?]+[.!?]*', 'g') m
               where btrim(m[1]) <> '')
    end as n
  from content where level='intermediate'
) t;
```

### Soạn quiz cho các lô đã dịch — ✅ xong 2026-08-17

Đã hết. **97/97 bài có bản dịch nay đều có quiz.** Cách làm: thêm khoá `quiz` vào từng mục trong file lô rồi chạy lại `build_sql.py`. Bài nào chưa có quiz thì frontend tự ẩn khung câu hỏi, nên vẫn có thể mở rộng dần theo lô nếu sau này dịch thêm.

### ⚠️ Phép kiểm mới trong `build_sql.py`: "mẹo chọn phương án dài nhất"

Từ 2026-08-17, `build_sql.py` in thêm một cảnh báo sau khi sinh file:

```
📏 Mẹo 'chọn phương án dài nhất' ăn được 236/388 = 60% số câu (đoán bừa: 25%).
```

**Không chặn sinh file** — đây là chuyện chất lượng câu hỏi, không phải dữ liệu hỏng. Nhưng phải in ra, vì không ai phát hiện được bằng mắt. Câu nào có đáp án đúng dài hơn mọi phương án sai từ **20 ký tự trở lên** thì được liệt kê riêng để sửa trước. Cách sửa: viết phương án sai dài và cụ thể ngang đáp án đúng.

---

## 13. Giai đoạn 3 (tuần 11–12) — nhật ký thực hiện

### ✅ Tách `index.html` thành 4 file — hoàn thành 2026-08-04 · ⏳ **chưa lên production**

**Không đổi một dòng logic nào.** Toàn bộ việc này là chuyển chỗ: cắt CSS và JS ra file riêng, thay bằng thẻ `<link>` / `<script src>`. Không đổi database, không thêm build tool, vẫn deploy Vercel y như cũ.

| File | Dòng | Chứa gì |
|---|---:|---|
| `index.html` | 162 | Chỉ còn HTML: khung trang, các nút, popup |
| `styles.css` | 773 | Toàn bộ giao diện |
| `supabase.js` | 137 | Cấu hình kết nối + **mọi** hàm đọc dữ liệu: `buildItem`, `fetchContentById`, `fetchFromSupabase`, `dedupeByTopic`, `loadTopicOptions`, `backfillTitles` |
| `app.js` | 2104 | Giao diện & logic: phát câu, tra từ, sổ từ, lịch sử, dịch câu, quiz |

Trước: **3154 dòng trong một file**. Giờ chỗ cần sửa nằm ở file có tên đúng việc đó.

**Bốn quyết định kỹ thuật đáng ghi lại:**

**1. Script cổ điển, không phải ES module.** Nếu dùng `<script type="module">` thì mỗi file thành một phạm vi riêng, phải viết `export`/`import` cho **hàng trăm** tên — sửa rất nhiều, rủi ro rất cao, mà đổi lại chẳng được gì cho một site tĩnh 4 file. Script cổ điển thì `const`/`let` ở cấp cao nhất của các file **dùng chung một phạm vi toàn cục**, nên `app.js` gọi thẳng `supabaseClient` của `supabase.js` như trước khi tách. Đây là lý do việc tách chỉ là cắt–dán chứ không phải viết lại.

⚠️ **Hệ quả phải nhớ:** trùng tên biến giữa hai file sẽ làm **cả trang trắng** với lỗi `Identifier has already been declared` — không phải chỉ hỏng một tính năng. Đã kiểm tra: hiện không có tên nào trùng.

**2. `app.js` KHÔNG được thêm `defer` hay `async`.** File này chạy `document.getElementById(...)` ngay ở cấp cao nhất (khoảng 40 biến DOM ở đầu file). Nó nằm cuối `<body>` nên DOM đã có sẵn; thêm `defer` thì thứ tự chạy đổi và mọi biến đó thành `null` — app hỏng im lặng, không báo lỗi rõ ràng. Đã viết một test canh đúng chuyện này (H5).

**3. `supabase.js` nạp trước `app.js`, và ôm trọn phần gọi DB.** Không phải để cho đẹp: tuần 13–17 sẽ thêm Auth, bảng mới và đồng bộ hai chiều — có một chỗ duy nhất để thêm code thì đỡ phải dò khắp file 2000 dòng. Cấu hình kết nối cũng chuyển sang đây, nên `HUONG_DAN_SETUP.md` mục 2 đã sửa lại chỗ cần dán URL/key.

**4. Bộ test tự đọc thứ tự file từ `index.html`.** `tests/run.js` trước đây bóc khối `<script>` dài nhất trong `index.html`. Nay nó đọc danh sách `<script src>` **từ chính `index.html`** rồi nạp theo đúng thứ tự đó (bỏ qua CDN và script Vercel). Cố ý không viết cứng `['supabase.js','app.js']` trong test: sau này thêm file thứ 5 mà quên cập nhật, test vẫn nạp đủ thay vì lặng lẽ bỏ sót code.

**Cách kiểm chứng đã dùng — đối chiếu máy móc, không đọc bằng mắt:**

| Kiểm tra | Kết quả |
|---|---|
| Số dòng CSS (bỏ dòng trống) gốc ↔ `styles.css` | ✅ 760 = 760, khớp từng dòng |
| Số dòng JS gốc ↔ `supabase.js` + `app.js` | ✅ 1958 = 1958, khớp từng dòng |
| Phần HTML trong `<body>` | ✅ 123 = 123, giống hệt |
| `node --check` hai file JS | ✅ cú pháp hợp lệ |
| Trùng tên khai báo giữa 2 file | ✅ không có |
| `app.js` còn sót `createClient` / khoá kết nối | ✅ không |
| Mọi đường dẫn trong `index.html` trỏ tới file có thật | ✅ 3/3 |
| **`node tests/run.js`** | ✅ **62/62 qua** (57 test cũ + 5 test mới nhóm H) |

**5 test mới — nhóm H, canh cho việc tách file không bị đổ lại:**

| Test | Canh điều gì |
|---|---|
| H1 | `index.html` nạp đúng `supabase.js` rồi mới tới `app.js` |
| H2 | `index.html` không còn logic viết thẳng bên trong — chỉ còn đúng khối shim 1 dòng của Vercel Analytics |
| H3 | Không còn thẻ `<style>`, và có thẻ `<link>` tới `styles.css` |
| H4 | `app.js` không tự tạo client Supabase, không chứa khoá kết nối |
| H5 | Thẻ `app.js` không có `defer`/`async` |

**Bản gốc trước khi tách** từng được giữ ở `luu tru/index_truoc_khi_tach_2026-08-04.html`, **đã xoá ngày 2026-08-17**: việc tách đã đối chiếu khớp từng dòng ở bảng trên, và từ đó code đã đi thêm ba tuần nên không còn gì để đối chiếu nữa.

**Tài liệu đã cập nhật theo:** `README.md` (bảng file + kiến trúc), `HUONG_DAN_SETUP.md` (mục 2 đổi sang `supabase.js`, mục 4 nhắc đẩy đủ 4 file).

### Việc của bạn

1. Đẩy lên GitHub **cả 4 file**: `index.html`, `styles.css`, `supabase.js`, `app.js` — **thiếu một file là trang trắng**. Cùng với `tests/run.js`, `README.md`, `HUONG_DAN_SETUP.md`.
2. Chờ Vercel deploy (xem mục 10 nếu Vercel bỏ lỡ commit).
3. Mở site, F12 → Console. Dán để kiểm tra nhanh:

```js
[!!document.getElementById('openVocabBtn'), typeof buildItem, typeof supabaseClient,
 getComputedStyle(document.body).fontFamily]
```

Kỳ vọng: `[true, "function", "object", "...Segoe UI..."]` — lần lượt là HTML mới, `app.js` đã nạp, `supabase.js` đã nạp, `styles.css` đã nạp. Console **không được có dòng đỏ nào**.

Xong bước này là hết Giai đoạn 3, sang **tuần 13** (tạo bảng + RLS, SQL đã viết sẵn ở mục 7).

### 🎨 Hướng dẫn chuyển xuống nút ❓ cuối trang (2026-08-04)

Dòng *"👆 Bấm vào từ để xem phiên âm & nghĩa · Nút ▶ … · Nút 👁 …"* nằm ngay dưới tiêu đề, chiếm 2 dòng trên **mọi** lần vào trang dù người dùng chỉ cần đọc đúng một lần. Đã bỏ khỏi header, chuyển thành:

- Một nút nhỏ **`❓ Hướng dẫn`** ở **cuối trang** (viền mảnh, chữ xám, không tranh chỗ với nội dung chính)
- Bấm vào mở **popup dùng chung** với "Học gần đây" / "Sổ từ" — thêm khung `#paneHelp`, không dựng popup thứ hai
- Nhân dịp này viết đủ **8 mục** thay vì 3: thêm 🇻🇳 song ngữ, 🔁 + thanh tốc độ, ⭐ đánh dấu, 🎯 ôn tập theo hộp, 📝 quiz, và một dòng nhắc dữ liệu đang lưu trên máy này chứ không phải trên tài khoản

**Hai chi tiết đáng ghi lại:**

**1. Hàng tiêu đề của popup dùng chung cho cả ba khung.** Nút `⭐ Đã đánh dấu` và `🎯 Ôn tập` nằm ở đó, và trước nay chỉ được ẩn trong `closeModal()`. Mở Sổ từ → đóng → mở Hướng dẫn thì hai nút ấy vẫn còn, bấm vào là lạc thẳng sang phiên ôn tập từ trong trang hướng dẫn. `openModal('help')` nay ẩn chúng ngay lúc mở. Test I2 canh đúng chuyện này.

**2. Nút ❓ luôn hiện, không ẩn theo trạng thái nào.** Đây là lỗi đã mắc **hai lần** ở Giai đoạn 1 (nút "Sổ từ" và nút "🎯 Ôn tập" tự ẩn khi trống). Test I4 đọc thẳng `index.html` và `app.js` để chắc không ai vô tình thêm `hidden` vào lại.

**Đã kiểm thử 67/67 qua** (62 test cũ + 5 test mới nhóm I): bấm ❓ mở đúng khung và đóng hai khung kia; mở hướng dẫn thì không kèm nút của Sổ từ / Lịch sử, tiêu đề đúng; mở Sổ từ sau đó thì khung hướng dẫn tự đóng; nút ❓ không bị ẩn ở đâu cả; header không còn dòng hướng dẫn và popup có đủ các mục.

**Cần kiểm trên site thật sau khi deploy:** trên điện thoại popup trượt từ dưới lên và cao tối đa 86% màn hình — nội dung hướng dẫn 8 mục dài hơn nên hãy thử **cuộn trong popup** xem có cuộn được tới dòng cuối không, và nền phía sau có bị trôi theo không.

---

## 14. Soạn quiz cho các lô đã dịch — nhật ký

### ✅ Lô `d02` — 17 hội thoại (id 86–102) · 2026-08-04 · **đã chạy vào Supabase**

Lý do làm việc này ngay: bạn báo *"không thấy 📝 quiz ở đâu"*. Kiểm tra ra quiz mới chỉ có ở **10/782 bài (1,3%)** — chính người viết ra tính năng còn không tìm thấy, thì người dùng thật càng không.

**68 câu hỏi** (17 bài × 4 câu), mỗi câu 4 lựa chọn + giải thích tiếng Việt **dẫn lại nguyên văn câu trong bài**. Chủ đề đời thường: xin làm từ xa, phỏng vấn marketing, thương lượng tiền thuê nhà, tiết kiệm mua nhà, hàng xóm ồn, chọn lớp tiếng Anh, nuôi thú cưng, đổi lịch họp, góp ý nhà hàng, chuẩn bị thuyết trình, mua xe, nghỉ phép, đơn hàng trễ, ăn uống lành mạnh, sinh nhật bất ngờ, chọn điện thoại, học kỹ năng mới.

**Cách soạn để câu hỏi không đoán được:** mỗi bài có ít nhất một câu mà **đáp án sai lấy từ chính bài** chứ không bịa ra — ví dụ bài thương lượng tiền thuê có cả `fifty` (mức xin ban đầu), `thirty` (mức chủ nhà đưa ra) và `forty` (mức chốt), nên người học phải nghe hết đoạn mới trả lời đúng, không đoán được bằng cách loại trừ.

**Kiểm chứng — ba tầng, không đọc bằng mắt:**

| Tầng | Kiểm tra | Kết quả |
|---|---|---|
| Lúc soạn | Đúng 4 câu/bài, 4 lựa chọn, không lựa chọn nào trùng | ✅ |
| `build_sql.py` | Lệch số câu dịch, quiz khác 4 câu, `correct` trỏ ngoài mảng, thiếu đề bài | ✅ 97 bài có dịch, 27 bài có quiz |
| **Trên Supabase sau khi chạy** | 27 bài có quiz, **27/27 đúng 4 câu**, **0 câu hỏi hỏng**, **0 lượt thoại mất bản dịch cũ** | ✅ |

Kiểm tra thêm: đáp án đúng sau khi `build_sql.py` đảo nằm rải đủ **cả 4 vị trí 0/1/2/3** — không phải cứ chọn A là đúng.

**Không đổi schema, không đổi code frontend.** Chỉ `update` cột `data` bằng hợp nhất JSONB. 67/67 test vẫn qua.

### ✅ 70 bài còn lại — `d03`, `d04`, `l01`–`l07` · 2026-08-17 · **đã chạy vào Supabase**

**280 câu hỏi mới** (70 bài × 4 câu). Hết nợ quiz: 97/97 bài có bản dịch nay đều có quiz.

| Lô | Bài | Câu hỏi |
|---|---|---:|
| `d03` | 13 hội thoại (id 914–923, 954–956) — ngân hàng, trả hàng lỗi, hỏi đường, nha khoa, thư viện, mất hành lý, thuê xe, khách sạn, khám bệnh, vé tàu, gói cước, hoá đơn điện, đặt bàn | 52 |
| `d04` | 17 hội thoại (id 957–973) — bảo hiểm du lịch, bưu điện, yoga, trả phòng, mua áo, cắt tóc, lắp internet, siêu thị, khám mắt, khoá tài khoản, bảo hành, vé phim, nghỉ ốm, taxi, gym, sửa nhà, dã ngoại | 68 |
| `l01`–`l07` | 40 bài luyện nghe (id 678–724) | 160 |

**Nguồn tiếng Anh lấy thẳng từ Supabase**, không đọc lại từ file lô — file lô chỉ có bản dịch tiếng Việt, soạn câu hỏi từ bản dịch là cách chắc chắn nhất để hỏi sai chi tiết.

**🐞 Phát hiện lớn nhất của đợt này: đáp án đúng luôn là phương án dài nhất.**

Sau khi soạn xong, đo bằng máy thì ra: **chỉ cần luôn chọn phương án dài nhất là đúng 65% số câu**, trong khi đoán bừa chỉ 25%. Nghĩa là người học ăn được điểm khá mà **không cần nghe bài**. Nguyên nhân rất tự nhiên và vì thế rất dễ mắc: đáp án đúng phải diễn đạt đầy đủ ý trong bài, còn phương án sai thì mình bịa cho nhanh nên viết ngắn.

⚠️ **Lỗi này có sẵn từ trước, không phải mới sinh ra:** lô `d01` là **82%**, `d02` là **58%** — hai lô đã được duyệt và đã chạy vào Supabase từ 2026-08-04. Ba tầng kiểm chứng ở mục trên đều không bắt được, vì cả ba chỉ kiểm *hình dạng dữ liệu* (đủ 4 câu, `correct` hợp lệ, không trùng lựa chọn), không kiểm *chất lượng câu hỏi*.

**Đã xử lý hai bước:**

1. **Thêm phép đo vào `build_sql.py`** (xem mục 12) để lần sau tự lộ ra, không phải nhớ.
2. **Sửa 59 câu lộ liễu nhất** — những câu đáp án đúng dài hơn mọi phương án sai ≥ 20 ký tự, gồm cả 17 câu thuộc `d01`/`d02`. Viết lại phương án sai cho dài và cụ thể ngang đáp án đúng, giữ nguyên đáp án đúng. Kết quả: **65% → 60%**, và **0 câu còn lệch ≥ 20 ký tự**.

**Vẫn còn nợ:** 60% vẫn cao hơn 25% rất nhiều. Muốn về gần mức đoán bừa thì phải viết lại phương án sai ở khoảng **236 câu** còn lại. Con số đã có sẵn trong output của `build_sql.py` nên không sợ quên.

**Một chi tiết đáng ghi:** script sửa hàng loạt có **phép canh so khớp đáp án đúng cũ với mới**, chỉ cho phép viết lại đáp án đúng khi đánh dấu `!` ở đầu khoá. Nó bắt được đúng một trường hợp — câu `706#4`, chỗ tôi cố ý rút ngắn đáp án đúng (99 ký tự, dài quá đáng so với phần còn lại). Không có phép canh đó thì một lần gõ nhầm là **âm thầm đổi đáp án đúng của một câu** mà không ai biết, vì test chỉ kiểm hình dạng.

**Kiểm chứng — ba tầng như lô `d02`, cộng một tầng mới:**

| Tầng | Kiểm tra | Kết quả |
|---|---|---|
| Lúc soạn | Đúng 4 câu/bài, 4 lựa chọn, không trùng, đáp án đúng ở vị trí 0, có giải thích, câu hỏi kết thúc bằng `?` | ✅ 97 bài / 388 câu |
| **Mới** | Tỉ lệ "chọn phương án dài nhất" và danh sách câu lệch ≥ 20 ký tự | ✅ 60%, 0 câu lệch nặng |
| `build_sql.py` | Lệch số câu dịch, quiz khác 4 câu, `correct` ngoài mảng, thiếu đề bài | ✅ 97 bài dịch, 97 bài quiz |
| **Trên Supabase sau khi chạy** | 97 bài có quiz, **0 bài khác 4 câu**, **0 câu hỏng**, **57 hội thoại còn đủ bản dịch từng lượt**, **40 bài luyện nghe còn khoá `vi`**, 0 bài sai trình độ | ✅ |

Vị trí đáp án đúng sau khi `build_sql.py` đảo: **109 / 90 / 99 / 90** cho bốn vị trí — rải đều, không phải cứ chọn A.

**Không đổi schema, không đổi code frontend.** Chỉ `update` cột `data` bằng hợp nhất JSONB. **108/108 test vẫn qua.**

⚠️ **Một cái bẫy khi chạy SQL:** máy chạy script không ra được internet tới Supabase, nên phải đẩy SQL qua công cụ quản trị theo từng lô. Lô đầu đọc lệch một dòng và **bỏ sót đúng id 686** — chỉ phát hiện được vì có đếm `select count(*)` sau mỗi lô và con số không khớp kỳ vọng. **Luôn đếm lại sau mỗi lô**, đừng tin là đã dán đủ.

---

## 15. Giai đoạn 4 (tuần 13–19) — nhật ký thực hiện

### ✅ Tuần 13 — tạo bảng + RLS · hoàn thành 2026-08-04 · **đã chạy trên Supabase**

**Không đụng gì tới frontend.** Ba bảng tạo ra nằm chờ tới tuần 14–15 khi có Auth. App hiện tại chạy y như cũ.

| Bảng | Cột | Khớp với |
|---|---|---|
| `profiles` | id, display_name, daily_goal, streak_current, streak_best, last_active_date, created_at | (mới, dùng từ tuần 18) |
| `study_log` | id, user_id + **content_id, mode, score, seconds, created_at** | đúng 5 trường của `ep:log` |
| `vocab` | id, user_id + **word, ipa, pos, meaning_vi, example, source_content_id, box, due_date, created_at** | đúng 9 trường của `ep:vocab` |

Đã đối chiếu cột trên DB với đúng đoạn code đang ghi localStorage (`logStudy()` và `saveWord()` trong `app.js`): **khớp tuyệt đối**, ngoài `id`/`user_id` do DB tự sinh. Tuần 16 sẽ chỉ là insert thẳng, không cần hàm chuyển đổi — đúng như mục 5 đã tính từ tuần 4.

**⚠️ Bẫy ở mục 7 — đã xử lý, và nó có thật.** Trước tuần 13, bảng `content` chỉ có đúng một policy `to anon`. Đã thêm `"Authenticated read access"`. Kiểm chứng bằng cách đóng vai từng role ngay trên DB:

| Vai | `content` | `study_log` / `vocab` / `profiles` | bảng backup 27/7 |
|---|---|---|---|
| `anon` (khách chưa đăng nhập) | ✅ 782 dòng | 0 dòng | 0 dòng |
| `authenticated` (đã đăng nhập) | ✅ **782 dòng** | 0 dòng | 0 dòng |

Ô in đậm là thứ đáng chú ý: **nếu quên policy đó, ô này là 0** — người đăng nhập sẽ thấy màn hình trống và app **không báo lỗi gì**, vì RLS trả về "không có dòng nào" chứ không phải "bị từ chối". Đây đúng là loại lỗi tốn cả buổi để tìm.

Hai ô `0 dòng` ở giữa là RLS chạy đúng: bảng đang rỗng nên chưa chứng minh được người A không đọc được dữ liệu người B — **việc đó phải thử lại ở tuần 15 khi đã có hai tài khoản thật**.

**Bốn thứ sửa khác so với bản phác thảo ở mục 7:**

1. **`unique (user_id, lower(word))` không đặt được trong `create table`** — Postgres không cho biểu thức trong ràng buộc UNIQUE. Đã tách thành unique index riêng `uq_vocab_user_word_lower`. Phải là `lower()` vì frontend so khớp từ không phân biệt hoa/thường (tuần 5).
2. **Viết `(select auth.uid())` thay vì `auth.uid()`** trong policy. Bọc trong subquery thì Postgres tính một lần cho cả câu lệnh thay vì tính lại trên **từng dòng** — khác biệt thấy rõ khi sổ từ có vài trăm dòng.
3. **Thêm index cho hai khoá ngoại trỏ về `content`.** Không phải chuyện lý thuyết: đối chiếu `content_backup_20260727` với `content` cho thấy **178 id từng tồn tại nay đã bị xoá**. Mỗi lần xoá một bài, cascade phải quét toàn bộ `study_log` và `vocab` nếu không có index.
4. **Bật RLS cho `content_backup_20260727`** (không tạo policy nào). Bảng này trước đó đang mở cho `anon` đọc qua API công khai. Nó chỉ là bản chụp nội dung, không có dữ liệu cá nhân, nhưng không có lý do gì để nó nằm trong API. Vẫn xem bình thường trong SQL Editor.

Ngoài ra ghim `search_path` cho hàm `get_random_content` — cảnh báo có sẵn từ trước, không phải do tuần 13 gây ra. Sau tất cả, `get_advisors` chỉ còn các mục mức INFO không cần xử lý.

**⚠️ Việc phải nhớ cho tuần 16 — landmine mới phát hiện.** `study_log.content_id` có khoá ngoại tới `content(id)`. Người dùng đã học từ tháng 7, mà **178 bài đã bị xoá khỏi `content`** — nếu `ep:log` của họ có id thuộc nhóm đó thì lệnh insert sẽ **hỏng cả lô** vì vi phạm khoá ngoại, đúng vào tuần nguy hiểm nhất của lộ trình. Cách xử lý ở tuần 16: **lọc bỏ những bản ghi trỏ tới bài không còn tồn tại trước khi insert**, và insert theo từng dòng hoặc dùng `on conflict do nothing` chứ không đẩy nguyên mảng trong một lệnh.

**`supabase_schema.sql` đã cập nhật** để repo khớp với DB thật — dựng lại từ đầu bằng file đó sẽ ra đúng trạng thái hiện tại. 4 migration đã lưu vết trên Supabase, hoàn tác được.

### Việc kế tiếp — tuần 14–15 (4h): Supabase Auth

Đăng nhập Google hoặc magic link. **Bắt buộc giữ chế độ khách** — chỉ mời đăng nhập sau khi người dùng đã học 2–3 bài.

### ✅ Tuần 14–15 — Đăng nhập Google · code xong 2026-08-04 · ⏳ **chưa deploy, chưa cấu hình dashboard**

**Chọn Google thay vì magic link.** Magic link bật một nút là chạy, nhưng email mặc định của Supabase chỉ cho ~2 email/giờ và chỉ dành để test — muốn dùng thật vẫn phải cắm SMTP ngoài. Google tốn công cấu hình một lần rồi thôi, và không có chuyện email vào spam.

**Giao diện mới:**

- Nút **tài khoản ở góc trên phải header** — luôn hiện. Chưa đăng nhập thì ghi "Đăng nhập"; đăng nhập rồi thì hiện tên + ảnh đại diện Google
- Bấm vào mở khung **Tài khoản** trong popup dùng chung (khung thứ tư, cạnh Học gần đây / Sổ từ / Hướng dẫn)
- **Dải mời đăng nhập** hiện **một lần sau bài thứ 3**, đóng bằng ✕ là không mời lại. Không phải hộp thoại phủ màn hình, không chặn thao tác nào

**Bốn quyết định đáng ghi lại:**

**1. Đếm bài KHÁC NHAU, không đếm dòng nhật ký.** App tự mở một bài ngẫu nhiên ngay khi vào trang, và người dùng hay bấm "Đổi chủ đề" vài lần. Đếm theo số dòng nhật ký thì dải mời bật lên gần như ngay lập tức và mất sạch ý nghĩa "đã dùng thử rồi mới mời". Test J3 canh đúng chuyện này.

**2. `redirectTo: window.location.origin`, không viết cứng tên miền.** Nhờ vậy chạy đúng ở cả `localhost`, bản preview của Vercel lẫn tên miền thật, không phải sửa code mỗi lần đổi. Đổi lại: **phải khai báo cả ba trong Supabase → URL Configuration**, thiếu là bị chặn.

**3. `khoiTaoAuth()` chạy sau `loadNewItem()` và KHÔNG `await`.** Mạng chậm hay Supabase lỗi thì app vẫn dùng được bình thường ở chế độ khách, chỉ là nút vẫn ghi "Đăng nhập". Không được để việc khôi phục phiên chặn màn hình đầu tiên.

**4. `taoHoSoNeuChua()` dùng upsert + `ignoreDuplicates`.** Chạy lại mỗi lần đăng nhập vẫn an toàn và **không ghi đè** `daily_goal` / streak người dùng đã có. Tạo hồ sơ hỏng thì chỉ ghi cảnh báo, app vẫn chạy.

**⚠️ Chế độ khách — đã kiểm bằng máy, không tin trí nhớ.** Toàn bộ code chỉ đọc trạng thái đăng nhập ở **đúng 2 chỗ**, cả hai đều chỉ để đổi nhãn nút và quyết định hiện dải mời. Không tính năng nào bị khoá.

**⚠️ Và tuyệt đối không xoá localStorage.** Có test đọc thẳng mã nguồn của cả `supabase.js` lẫn `app.js` để chắc không có `localStorage.clear()` và không có `removeItem` nào chạm vào `ep:log` / `ep:vocab` / `ep:titles` / `ep:fav` — đây là rủi ro "Cao" số 1 ở mục 9, và tuần này chưa làm việc gộp dữ liệu nên không có lý do gì để xoá.

**Đã kiểm thử 77/77 qua** (67 test cũ + 10 test mới nhóm J): chưa đăng nhập vẫn lưu được từ, ghi được nhật ký, chấm được quiz, ôn được từ; 2 bài chưa mời, đủ 3 bài mới mời; mở lại cùng một bài 5 lần vẫn tính là 1 bài; bấm ✕ rồi thì học thêm 20 bài cũng không mời lại; đã đăng nhập thì không mời; tên hiển thị lấy đúng thứ tự ưu tiên và không bao giờ để trống; nút tài khoản không bị ẩn ở đâu; **không chỗ nào xoá localStorage**; Supabase hỏng thì vẫn vào được chế độ khách.

**🐞 Test bắt được một lỗi thật ngay khi viết:** `soBaiDaHoc()` gọi `getSeenIds().length`, nhưng `getSeenIds()` trả về một `Set` — `.length` là `undefined`, nên `undefined >= 3` luôn sai và **dải mời sẽ không bao giờ hiện**. Lỗi im lặng hoàn toàn, không có test thì chỉ phát hiện được khi thắc mắc "sao mãi không thấy lời mời".

### Việc của bạn — theo đúng thứ tự này

1. **Cấu hình dashboard trước, deploy sau.** Làm theo `HUONG_DAN_DANG_NHAP_GOOGLE.md`: tạo OAuth client bên Google Cloud, bật provider và khai báo Redirect URLs bên Supabase. Khoảng 20–30 phút.
2. Đẩy lên GitHub: `index.html`, `styles.css`, `supabase.js`, `app.js`, `tests/run.js`, `README.md` và file hướng dẫn mới.
3. Thử: bấm nút góc trên phải → chọn tài khoản Google → quay về, nút phải đổi thành tên bạn. Rồi mở Table Editor xem bảng `profiles` có đúng một dòng.

Deploy trước khi cấu hình xong cũng không sao — nút vẫn hiện, bấm vào chỉ báo lỗi provider chưa bật, phần còn lại của app không ảnh hưởng gì.

### ✅ Cấu hình dashboard cho đăng nhập Google — xong 2026-08-04

Làm trực tiếp trên trình duyệt. Giá trị thật, ghi lại để khỏi phải mò lại:

| Nơi | Giá trị |
|---|---|
| Domain Production | `https://english-practice-nd.vercel.app` |
| Google Cloud project | `english-practice-app` (id `acquired-goods-504508-r6`) |
| OAuth client | `web` — Web application |
| Callback URL (dán vào Google) | `https://jlczlapfhqvfiktcpdwf.supabase.co/auth/v1/callback` |

**Supabase:**

- Site URL: `http://localhost:3000` (mặc định, sai) → `https://english-practice-nd.vercel.app`
- Redirect URLs: trống → 1 URL
- Provider Google: **Enabled**

**Google Cloud:**

- Audience: **External** · App name `Luyen Nghe & Doc Tieng Anh` (đây là tên người dùng thấy trên màn hình đăng nhập)
- Scopes: đúng 3 mục `openid` / `userinfo.email` / `userinfo.profile` — **0 scope nhạy cảm, 0 scope restricted**
- Authorized JavaScript origins: domain production
- Authorized redirect URIs: callback URL của Supabase
- Publishing status: **In production** (đã Publish, không phải chờ Google duyệt vì không xin scope nhạy cảm)

**Ba điểm đáng ghi lại:**

**1. Hai URL rất dễ nhầm cho nhau.** Callback URL trỏ về **Supabase** (dán vào Google), Site URL trỏ về **app** (khai ở Supabase). Nhầm là dính `redirect_uri_mismatch` hoặc bị đá về trang chủ, mà thông báo lỗi không nói rõ nhầm chỗ nào.

**2. Chưa thêm `localhost`.** Vì hiện deploy thẳng qua GitHub, không chạy máy cục bộ. Khi nào cần thì phải thêm vào **cả hai** danh sách — Google origins và Supabase Redirect URLs — thiếu một bên là hỏng.

**3. Client Secret chỉ hiện đúng một lần.** Google không cho xem lại sau khi đóng hộp thoại; mất thì phải xoá client và tạo lại. Đã tải file JSON để giữ.

**Chưa kiểm chứng được:** luồng đăng nhập thật. Kiểm tra site production cho thấy bản đang chạy **vẫn là bản trước tuần 14–15** — có nút `❓ Hướng dẫn` nhưng chưa có nút tài khoản ở góc trên phải. Phải deploy code mới rồi mới thử được.

### ✅ Tuần 16 — Gộp localStorage lên tài khoản · code xong 2026-08-17 · ⏳ **chưa deploy**

**Mục đích, nói một câu:** để dữ liệu người dùng **không mất khi đổi máy**. Sổ từ và lịch sử đang buộc vào đúng một trình duyệt trên đúng một máy; đăng nhập xong mà sổ từ trống trơn thì người dùng tưởng mất dữ liệu và bỏ app — rủi ro "Cao" số 1 ở mục 9. Đây cũng là **cây cầu một chiều** để tuần 17 có cái mà đồng bộ hai chiều.

**Phần chuyển đổi dữ liệu đúng bằng không** — công đã trả từ tuần 4 và tuần 5 khi đặt `ep:log` trùng 5 cột `study_log` và `ep:vocab` trùng 9 cột `vocab`. Chỉ thêm `user_id`. Toàn bộ công sức tuần này nằm ở bốn cái bẫy dưới.

**Đổi database — một câu SQL, đã chạy:**

```sql
create unique index if not exists uq_log_user_content_time
  on study_log (user_id, content_id, created_at);
```

⚠️ **Kế hoạch cũ ghi sai ở mục 15 (tuần 13): "dùng `on conflict do nothing`" là KHÔNG chạy được.** `study_log` không có ràng buộc unique nào nên `ON CONFLICT` không có đích để bám — gọi hàm gộp lần hai là **nhân đôi toàn bộ lịch sử**, làm sai luôn trang thống kê ở tuần 20. Bộ ba `(user_id, content_id, created_at)` là khoá tự nhiên thật: cùng người, cùng bài, cùng mốc thời gian ISO thì đúng là một lần học. Tuần 17 dùng lại chính khoá này. Migration `tuan16_unique_study_log_for_merge`, `supabase_schema.sql` đã cập nhật.

**Bốn cái bẫy — hai cái không có trong kế hoạch:**

**1. `study_log.content_id` là khoá ngoại, 178 id đã bị xoá.** Đã ghi ở tuần 13. Xử lý: gom mọi id, hỏi Supabase id nào còn sống (chia lô 300), rồi lọc. Một dòng chết là **hỏng cả lệnh insert**.

**2. ⚠️ `vocab.source_content_id` CŨNG là khoá ngoại — kế hoạch bỏ sót.** Schema ghi `on delete set null`, rất dễ đọc nhầm thành "tự động an toàn". Nhưng `on delete` chỉ chạy khi **xoá**, còn **insert vẫn bị chặn như thường**. Từ nào lưu từ một bài sau đó bị xoá thì hỏng cả lô sổ từ. Xử lý: gán `null` chứ không bỏ cả từ — mất ngữ cảnh còn hơn mất từ.

**3. ⚠️ Không dùng được upsert cho `vocab`.** Ràng buộc unique của bảng là index **biểu thức** `(user_id, lower(word))`, PostgREST không nhận tên cột dạng đó. Xử lý: đọc trước danh sách từ tài khoản đang có rồi lọc ở client. Tiện thể giải luôn bài toán xung đột: từ đã có trên server thì **giữ nguyên bản server**, không đè. Người dùng có thể đã ôn từ đó lên hộp 4 ở máy khác — đẩy bản `box: 1` của máy này đè lên là xoá sạch tiến độ ôn tập của họ.

**4. `created_at` hỏng thì loại hẳn bản ghi.** Nó là một phần của khoá chống trùng. Bản ghi không có mốc thời gian đọc được thì vừa vô dụng cho lịch sử lẫn thống kê, vừa phá khoá đó — nên loại chứ không bịa ngày.

**Chạy lại được an toàn** là yêu cầu bắt buộc, vì mạng có thể đứt giữa chừng: nhật ký dựa vào unique index mới + `ignoreDuplicates`, sổ từ dựa vào việc đọc trước danh sách đã có. **Cờ `ep:merged:<user_id>` chỉ được đặt khi cả hai bảng chèn xong.** Hỏng thì không đặt, lần đăng nhập sau tự thử lại.

**Cờ đặt theo từng tài khoản** (`ep:merged:` + `user.id`), vì một máy có thể có hai người dùng — người thứ hai vẫn phải được gộp.

**Chỗ móc:** `khoiTaoAuth` bắn callback **mỗi lần mở trang** với phiên khôi phục sẵn, không riêng lúc bấm đăng nhập. Nên có thêm cờ `dangGopDuLieu` chống chạy chồng.

**Phân chia file:** `supabase.js` giữ `gopDuLieuLenTaiKhoan(user, nhatKy, soTu)` — nhận mảng qua tham số, **không đọc và không xoá localStorage**; `app.js` lo đọc localStorage, nhớ cờ, vẽ trạng thái. Test K11 đọc thẳng mã nguồn để canh điều đó.

**Giao diện:** thêm một dòng trong khung **Tài khoản** — *"⏳ Đang đưa dữ liệu…"* → *"✅ Đã đưa 143 lượt học và 27 từ lên tài khoản."* hoặc *"⚠️ Chưa đưa được… lần đăng nhập sau sẽ tự thử lại."* Không phải hộp thoại chặn màn hình. Mở lại khung ở những lần vào trang sau vẫn thấy kết quả cũ, không để khoảng trống khó hiểu. Hai ghi chú *"chưa đồng bộ dữ liệu"* ở khung Tài khoản đã sửa lại cho đúng.

**⚠️ Không xoá localStorage.** Tới hết tuần 17 nó vẫn là **nguồn đọc duy nhất** của toàn bộ giao diện — xoá đi là đúng thứ việc gộp này sinh ra để tránh.

**Đã kiểm thử 88/88 qua** (77 test cũ + 11 test mới nhóm K). Nhóm K dùng một Supabase giả **áp đúng ràng buộc thật của DB**: khoá ngoại tới `content(id)`, unique `lower(word)`, check `mode`, check `box`. Giả kiểu nuốt-mọi-thứ-rồi-trả-ok thì test vẫn xanh trong khi bản thật hỏng ngay lệnh insert đầu tiên.

**Đã kiểm chứng test không rỗng — phá code rồi xem có đỏ không:**

| Cố tình phá | Test bắt được |
|---|---|
| Bỏ lọc bài đã xoá | ✅ K1 |
| Giữ nguyên `source_content_id` chết | ✅ K2 |
| Bỏ `ignoreDuplicates` | ✅ K3 |
| Hỏng vẫn đặt cờ | ✅ K4 |
| Xoá `ep:vocab` sau khi gộp | ✅ K7 + K11 |

**🐞 Hai lỗi trong chính bộ test, bắt được lúc viết** — đáng ghi vì cả hai đều là *test sai chứ không phải code sai*, loại tốn thời gian nhất để lần ra:

1. **Ghi `localStorage` sau khi dựng sandbox là đua với phần khởi động của app.** `loadNewItem()` chạy bất đồng bộ rồi `writeLog()` ghi đè bằng mảng nó đọc được từ trước — xoá mất dữ liệu test vừa đặt vào. Đã thêm `opts.storage` để nạp **trước** khi chạy mã app.
2. **`khoiTaoAuth()` gán `phienDangNhap = null` sau `await getSession()`.** Test đặt phiên trước thời điểm đó thì bị ghi đè, và mọi khẳng định về khung Tài khoản sai một cách khó hiểu. Đã thêm `sandboxGop()` chờ phần khởi động lắng xuống.

Nhóm K cũng là nhóm test **bất đồng bộ đầu tiên**, nên phần in kết quả đã chuyển thành `nhomK().then(inKetQua)`.

**Kiểm tra máy móc khác:** `node --check` hai file JS ✅ · không trùng tên khai báo giữa `supabase.js` và `app.js` (lỗi trang trắng `Identifier has already been declared`) ✅ · 65/65 id `getElementById` trong `app.js` đều có thật trong `index.html` ✅.

### 🐞 Đăng nhập rồi vẫn thấy dải mời đăng nhập (2026-08-17)

Bạn báo: đã đăng nhập, nút góc trên phải hiện đúng "Nhung Do", nhưng dải *"Đã học 39 bài rồi 👏 Đăng nhập để…"* vẫn nằm đó.

**Code JS hoàn toàn đúng.** `kiemTraDaiMoi()` chạy chuẩn, `signinBar.hidden = true` được đặt, và test J5 vẫn xanh. Lỗi nằm ở CSS:

```css
.signin-bar { display: flex; ... }   /* đè lên luật ẩn của trình duyệt */
```

Trình duyệt ẩn phần tử có thuộc tính `hidden` bằng `display: none` trong **bảng kiểu mặc định của chính nó** — mà bảng đó thuộc nhóm **yếu nhất**: bất kỳ `display` nào ta tự viết cũng thắng, kể cả selector chỉ có một class. Nên `hidden = true` **không có tác dụng gì về mặt hình ảnh**, và console không báo một dòng nào.

**Rà lại thì có 2 chỗ dính, không phải 1:** `signinBar` và `resumeLine` (ô "↩️ Học tiếp"). Nghĩa là ô "Học tiếp" cũng không ẩn đi được khi không có bài dở.

**Đã sửa bằng một dòng ở đầu `styles.css`** thay vì vá từng class:

```css
[hidden] { display: none !important; }
```

Viết `.signin-bar[hidden]` cho từng chỗ thì lần sau thêm class mới lại quên tiếp — trong file đã có sẵn `.tc-btn[hidden]` và `.tc-panel[hidden]`, tức là lỗi này **đã gặp và đã vá lẻ hai lần trước đây** mà không ai rút ra luật chung.

**Vì sao 88 test cũ không bắt được:** DOM giả trong `tests/minidom.js` chỉ có *thuộc tính*, không có tầng CSS — `el.hidden = true` thì `el.hidden === true`, hết. Không có cách nào biết trình duyệt thật sẽ vẽ ra sao.

**Thêm nhóm L (2 test) đọc thẳng file CSS** — cách duy nhất bắt được loại lỗi này mà không cần trình duyệt thật:

| Test | Canh điều gì |
|---|---|
| L1 | `styles.css` phải có luật `[hidden]` toàn cục |
| L2 | Rà **mọi** phần tử được bật/tắt bằng `.hidden` trong `app.js`: không cái nào có class đặt `display` mà không được luật `[hidden]` phủ |

L2 là cái đáng giá: thêm tính năng mới có class đặt `display` là nó tự canh, không cần nhớ.

**Tổng 90/90 qua.** Đã thử xoá luật toàn cục để chắc test đỏ thật.

**Bài học, lần thứ ba cho cùng một chủ đề:** hai lần trước là *nút bị ẩn khi không nên ẩn* (nút "Sổ từ", nút "🎯 Ôn tập" ở Giai đoạn 1). Lần này ngược lại — *không ẩn được thứ đáng lẽ phải ẩn*. Điểm chung: **trạng thái ẩn/hiện của giao diện chưa bao giờ được kiểm tự động ở tầng CSS**, chỉ ở tầng thuộc tính. Nhóm L lấp đúng khoảng trống đó.

### 🐞 "Đã học 39 bài" là sai — mở bài không phải là học (2026-08-17)

Truy lại chuỗi tính lúc bạn hỏi: `soBaiDaHoc()` → `getSeenIds().size` → số `content_id` khác nhau trong `ep:log`. Mà `ep:log` được ghi ngay khi **bài tải xong**, ở cả hai đường lấy bài.

**Hệ quả:** app tự mở một bài ngẫu nhiên ngay lúc vào trang, và `pickUnseenOption()` lại cố tình ưu tiên bài **chưa mở** — nên **mỗi lần mở trang là +1 "bài đã học"**, chưa nghe câu nào, chưa ở lại giây nào. Con số 39 phần lớn là số lần mở trang.

Kéo theo hai thứ nữa: kho bài bị "tiêu" dần cho tới khi app báo *"đã học hết N chủ đề"* trong khi người dùng chưa học thật; và trang thống kê tuần 20 sẽ đọc đúng nguồn dữ liệu sai này.

**Đã tách hai khái niệm ra hai kho:**

| Kho | Nghĩa | Ghi khi nào | Dùng cho |
|---|---|---|---|
| `ep:seen` **(mới)** | đã **MỞ** | bài tải xong, không điều kiện | loại trừ bài trùng lúc random · khung "Học gần đây" · ô "Học tiếp" |
| `ep:log` | đã **HỌC** | bấm phát, **hoặc** ở lại đủ 60 giây, **hoặc** làm quiz | dải mời đăng nhập · thống kê tuần 20 · đẩy lên `study_log` |

`ep:seen` cố ý dùng **đúng hình dạng** `{ content_id, created_at }` của `ep:log`, nên `getHistory()` dùng chung được cho cả hai, không phải viết hàm thứ hai.

**Bốn chi tiết đáng ghi lại:**

**1. Chốt mốc "đã học" ở `speakFrom()`.** Đây là **cửa duy nhất** của mọi thao tác phát — nút ▶ chung, nút ▶ từng câu, ⏮ ⏭, 🔁 đều đi qua đó. Gắn vào từng nút thì chắc chắn sẽ sót một cái.

**2. Đồng hồ dừng khi tab bị ẩn.** Mở tab rồi đi ăn trưa không phải là học. `document.hidden` không có trong DOM giả nên phải dò kiểu chứ không đọc thẳng.

**3. Mỗi lần mở bài chỉ ghi ĐÚNG MỘT dòng** (`daGhi`). Không thì một bài nghe 5 lần thành 5 dòng, phá luôn thống kê.

**4. `seconds` cuối cùng cũng có giá trị** — trước nay luôn `null`. Ghi là số giây **tính tới lúc đủ điều kiện**, không phải tổng thời gian ở trong bài (bấm Nghe ở giây thứ 5 thì ghi 5). Muốn tổng chính xác thì phải cập nhật lại bản ghi lúc rời bài, mà việc đó sẽ vướng phần đồng bộ hai chiều ở tuần 17 — để sau.

**Nhật ký cũ: bạn chọn "đếm lại từ 0".** `chuyenNhatKyCu()` chạy đúng một lần (cờ `ep:migr:seen`): chuyển toàn bộ id sang `ep:seen` — nên **"Học gần đây" và việc loại trừ random không mất gì** — rồi làm rỗng `ep:log`.

⚠️ **Không dùng `removeItem`, không vứt dữ liệu đi.** Bản gốc được cất nguyên vào `ep:log_truoc_2026-08-17`, lấy lại được bất cứ lúc nào. Nguyên tắc "không xoá dữ liệu người dùng" (mục 9) vẫn giữ — đây là *chuyển chỗ*, không phải xoá.

⚠️ **Thứ tự chạy có ý nghĩa:** `chuyenNhatKyCu()` nằm trước `khoiTaoAuth()` trong phần init, nên lần đăng nhập đầu tiên sẽ gộp **nhật ký mới** lên Supabase chứ không phải 39 dòng cũ. Đúng ý "đếm lại từ 0".

**Đã kiểm thử 100/100 qua** (90 cũ + 10 test mới nhóm M), và phá code 6 kiểu để chắc test không rỗng:

| Cố tình phá | Test bắt được |
|---|---|
| Quay lại luật cũ "mở là tính" | ✅ M1, M3, M4 + 4 test khác |
| Bấm Nghe không tính | ✅ M2 |
| Đếm cả khi tab ẩn | ✅ M4 |
| Bỏ chống ghi hai lần | ✅ M5 |
| Chuyển đổi mà không cất bản gốc | ✅ M8 |
| Chuyển đổi chạy lại nhiều lần | ✅ M9 |

**🐞 Một lỗi trong khung test, phát hiện nhân tiện:** phiên học tạo một `setInterval` 1 giây cho mỗi bài mở, và timer thật của Node **giữ vòng lặp sự kiện sống** — `node tests/run.js` chạy xong vẫn treo, không bao giờ thoát (phải Ctrl+C). Đã `unref()` timer trong sandbox: chạy bình thường nhưng không níu tiến trình. Giờ thoát sau ~1,7 giây với mã 0.

### 🐞 Đổi cách đếm xong nhưng không có chỗ nào nhìn thấy (2026-08-17)

Bạn báo *"chưa thấy count thêm ở chỗ nào"* và tưởng luật đếm mới chưa chạy. Kiểm tra ra: **luật chạy đúng, nhưng con số không hiện ở đâu cả.**

`soBaiDaHoc()` chỉ được vẽ ra đúng một chỗ — biến `signinCount` trong **dải mời đăng nhập**. Mà dải đó chỉ hiện khi `!nguoiDungHienTai()`. Bạn đang đăng nhập, nên dải ẩn, nên con số biến mất hoàn toàn khỏi giao diện.

**Đây là thiếu sót của tôi:** đổi cách tính một con số thì phải kèm chỗ để nhìn thấy con số đó, nếu không thay đổi là vô hình và người dùng **không có cách nào kiểm chứng**.

**Đã thêm bộ đếm vào khung Tài khoản** (bạn chọn chỗ này, không chiếm diện tích màn hình chính):

```
📚 Đã học 4 bài · 📒 12 từ trong sổ · 🎯 2 từ cần ôn
Một bài được tính khi bạn bấm ▶ Nghe, ở lại một phút, hoặc làm câu hỏi hiểu bài.
```

Ba quyết định nhỏ:

1. **Đặt NGOÀI `accGuest`/`accUser`** để hiện cho cả khách lẫn người đã đăng nhập. Nhét vào một trong hai là tái lập đúng lỗi vừa sửa, chỉ đổi phía.
2. **Vẽ lại mỗi lần mở popup**, không phải chỉ lúc khởi động — vừa học xong mở ra phải thấy số mới.
3. **Nói rõ điều kiện được tính** ngay dưới con số. Người dùng mở một bài rồi thấy số không nhúc nhích sẽ tưởng app hỏng chứ không đoán ra là cố ý.

**Thêm nhóm N (8 test), tổng 108/108 qua.** Đáng chú ý là **N8**: DOM giả trong `tests/minidom.js` đăng ký phần tử theo id một cách **phẳng, không có quan hệ cha–con**, nên `accUser.hidden = true` không kéo theo phần tử con — đặt nhầm chỗ mà N1/N2 vẫn xanh. Phát hiện được đúng lúc thử phá code. N8 đọc thẳng `index.html` để kiểm vị trí lồng nhau, là cách duy nhất bắt được.

**Ghi lại giới hạn của bộ test để lần sau không mất công tìm:** `minidom.js` không mô phỏng cây DOM lẫn tầng CSS. Mọi lỗi kiểu *"phần tử này có bị cha nó ẩn không"* và *"class có đè lên `hidden` không"* đều phải kiểm bằng cách **đọc file nguồn** (nhóm L và N8), không kiểm được qua sandbox.

Đây là lần thứ tư cùng một chủ đề: ẩn nhầm nút "Sổ từ", ẩn nhầm nút "🎯 Ôn tập", không ẩn được dải mời, và nay không hiện được con số. Bốn lần đều là **trạng thái ẩn/hiện của giao diện**, không lần nào là lỗi logic.

### Việc của bạn — tuần 16

1. Đẩy lên GitHub: `index.html`, `styles.css`, `supabase.js`, `app.js`, `tests/run.js`, `supabase_schema.sql`. **Thiếu một file JS là trang trắng.**
2. Đăng nhập Google trên site thật, mở khung **Tài khoản** xem dòng trạng thái.
3. Mở Supabase → Table Editor → `study_log` và `vocab`: số dòng phải khớp con số app báo.
4. **Thử lại lần hai:** tải lại trang, xem `study_log` **không tăng thêm dòng nào**.
5. Việc còn nợ từ tuần 13: đăng nhập bằng **tài khoản thứ hai** rồi kiểm RLS thật — người A không đọc được dữ liệu người B. Giờ mới làm được vì bảng đã có dữ liệu.

Xong bước này là sang **tuần 17 — 2.3 đồng bộ hai chiều** (3h).

---

## Tuần 17 — Server làm nguồn thật + dọn màn hình chính (2026-08-19)

### 🐞 Một tài khoản, hai thiết bị, hai con số

Bạn đăng nhập cùng một email trên máy tính và iPhone rồi chụp lại hai màn hình:

| | Máy tính | iPhone | Dưới DB |
|---|---|---|---|
| Đã học | **5 bài** | **1 bài** | **38 bài** |
| Từ trong sổ | 2 | 0 | 2 |
| Dòng đồng bộ | "Đã đưa 45 lượt học và 2 từ" | "Đã đưa 0 lượt học và 0 từ" | 45 dòng |

Ba con số, không cái nào bằng cái nào.

**Nguyên nhân gốc: giao diện đọc 100% từ localStorage, chưa bao giờ đọc từ server.**

```js
function veThongKe() {
  const soBai = soBaiDaHoc();       // new Set(readLog())  -> localStorage
  const soTu  = readVocab().length; //                     -> localStorage
  const canOn = dueWords().length;  //                     -> localStorage
```

Trong cả project chỉ có 3 chỗ đụng `study_log`/`vocab`, **đều là ghi lên**. Không có một câu `select` nào đọc về. localStorage là dữ liệu của **MÁY**; câu hỏi *"tôi đã học bao nhiêu bài"* là câu hỏi về **TÀI KHOẢN** — chỉ server trả lời được.

### Lỗi nặng nhất không phải chuyện hiển thị

`gopNeuCanThiet()` return sớm nếu có cờ `ep:merged:<uid>`. Cờ đó nằm trong localStorage nên **nó là của máy, không phải của tài khoản**. iPhone đăng nhập lúc sổ còn trống → gộp 0 dòng → **đặt cờ vĩnh viễn** → mọi bài học sau đó trên iPhone không bao giờ lên tới server. Đây là **mất dữ liệu**, không phải lệch hiển thị.

Đã bỏ hẳn cờ, thay bằng mốc `ep:pushed:<uid>` (chỉ để khỏi quét lại phần cũ — mất mốc thì cùng lắm là chậm chứ không sai). Hàm đẩy vốn đã chạy lại được an toàn nhờ `uq_log_user_content_time`, nên chỉ cần **bỏ cái chặn**. Thêm `dayNgam()` hoãn 3 giây: học xong / lưu từ là đẩy luôn, không đợi lần đăng nhập sau.

⚠️ **Test K6 bị đảo ngược.** Bản tuần 16 khẳng định *"gộp xong đặt cờ, lần sau bỏ qua hẳn"* — và chính điều nó bảo vệ là lỗi. Bài học: một test xanh chỉ chứng minh code làm đúng thứ **người viết test nghĩ là đúng**.

### `study_log.counted` — nếu thiếu thì số nhảy ngược lên 38

Server giữ 45 dòng đẩy lên hồi tuần 16, tức là danh sách bài **đã MỞ** theo luật cũ. Chuyển sang đọc server mà không xử lý thì con số nhảy từ 5 lên 38 — **đúng con số sai mà bản 17/8 vừa dẹp**.

Thêm cột `counted`, đánh dấu `false` cho các dòng trước `2026-08-17`. **Không xoá dòng nào** (mục 9): 44 dòng vẫn nằm đó, muốn tính lại chỉ cần một câu `update`.

### RPC `thong_ke_tai_khoan` — một nguồn, một công thức

PostgREST không làm được `count(distinct ...)`. Để client tự lọc thì phải kéo toàn bộ `content_id` về máy, và lặp lại đúng kiểu *"mỗi nơi tự đếm một kiểu"* đã gây ra lỗi này ngay từ đầu.

`p_today` do client truyền vào theo **ngày địa phương** (`homNay()`), không dùng `current_date`: server chạy UTC nên người học ở VN mở app lúc 7 giờ sáng sẽ bị tính là hôm qua và số "cần ôn" lệch một ngày. `security invoker` + RLS sẵn có → hàm chỉ thấy dữ liệu của chính người gọi; `anon` không gọi được.

### Hai chỗ hàm gộp không với tới

Hàm gộp chỉ biết **chèn** từ mới, cố ý không ghi đè bản trên server (để khỏi xoá tiến độ ôn ở máy khác). Hệ quả: xoá một từ ở máy này thì server vẫn giữ, ôn lên hộp 3 thì server vẫn để hộp 1 — và hai con số kia **lại lệch y như cũ**. Thêm `xoaTuTrenTaiKhoan()` và `capNhatOnTuTrenTaiKhoan()` gọi thẳng từ `removeWord()`/`gradeWord()`.

### Bỏ dòng "✅ Đã đưa 45 lượt học và 2 từ"

Con số đó đọc ra từ localStorage — nó là **kết quả của lần đẩy trước**, không phải tình trạng hiện tại. Nó đứng ngay dưới "Đã học 5 bài" và mâu thuẫn với chính dòng đó. Ba con số khác đơn vị (lượt / bài / bản ghi) cạnh nhau thì không ai hiểu được. Giờ chỉ còn *"Dữ liệu trên máy này đã được đưa lên tài khoản."*

### Dọn màn hình chính: gỡ "Học tiếp" và "Học gần đây"

Cả hai đều trả lời *"vừa nãy tôi xem bài gì"* — mà app random chủ đề mỗi ngày, nên **"bài vừa mở" gần như luôn là bài hệ thống tự chọn**, danh sách tự lấp đầy bằng nhiễu. Chúng chiếm ba dòng ngay dưới nút Nghe, đẩy nội dung chính xuống dưới màn hình đầu tiên trên điện thoại.

Việc *"muốn quay lại bài này"* đã có ☆ làm rồi, và ☆ là người dùng **chủ động** chọn nên đúng ý hơn hẳn. Nút `🕘 Học gần đây` đổi thành `⭐ Đã đánh dấu`, bỏ luôn nút lọc `favFilterBtn` (một khung một việc thì không cần chỗ chuyển chế độ).

⚠️ **`ep:seen` vẫn được ghi.** Gỡ giao diện không có nghĩa là gỡ dữ liệu — hàm random dựa vào nó để khỏi trả lại bài vừa mở. Bỏ theo thì "Đổi chủ đề" lặp bài ngay lần bấm thứ hai. Test **P7** canh đúng chỗ này. Gỡ kèm: `getHistory()`, `timeAgo()`, `.resume-line`, `.hist-meta`, `#favFilterBtn`.

Nút `⭐ Đã đánh dấu` **ẩn khi chưa đánh dấu gì** — khác nút Sổ từ (luôn hiện kể cả khi trống). Ẩn được vì lối vào của tính năng là nút ☆ cạnh tên chủ đề, luôn nhìn thấy, nên không có chuyện giấu mất tính năng. Test **P4** canh việc chỉ mở bài thì nút không được hiện lên.

### Chấm đỏ "N cần ôn" về khung Tài khoản

Đây là con số duy nhất trong ba con số tiến độ từng đứng ngoài khung Tài khoản — mà lại đứng dưới dạng **chấm đỏ báo động thường trực** cạnh nút Sổ từ. Ba con số về tiến độ thì để chung một nơi. Test **P6** canh cả hai đầu: mất khỏi nút Sổ từ **và** có mặt ở khung Tài khoản.

### Kiểm thử: 122/122 qua

| Nhóm | Canh điều gì |
|---|---|
| K6 (viết lại) | bài học mới lên được ở lần đẩy sau, không bị cờ chặn vĩnh viễn |
| K6b, K6c | mốc bỏ qua phần đã đẩy; `locTuMoc` giữ cả bản ghi hỏng ngày |
| **K12** | localStorage 1 bài / tài khoản 3 bài → **phải hiện 3** |
| K13 | dòng `counted = false` không bị đếm |
| K14 | RPC hỏng thì **giữ số cũ**, không nháy về 0 |
| K15 | xoá từ / chấm ôn đi tới được tài khoản |
| P1–P8 | gỡ sạch HTML, CSS, Hướng dẫn; `ep:seen` còn sống |

Supabase giả trong test **áp đúng ràng buộc thật** (khoá ngoại, unique `lower(word)`, check `mode`/`box`) và `rpc` đếm đúng công thức của hàm SQL — nếu chỉ nuốt mọi thứ rồi trả `ok` thì test xanh trong khi bản thật hỏng ngay lệnh insert đầu tiên.

### Dồn hết vào popup Tài khoản (cùng ngày, theo yêu cầu của bạn)

Bạn chốt: hai nút **⭐ Đã đánh dấu** và **📒 Sổ từ** chuyển hẳn vào popup Tài khoản, không còn ở màn hình chính. Màn hình chính nay chỉ còn đúng việc học: chọn bài → nghe → đọc.

Ba điểm kèm theo, **bạn chọn chứ tôi không tự quyết**:

1. **Hai nút mở khung riêng** (không phải danh sách hiện thẳng, không phải mục gấp mở) — đặt ngay dưới bộ đếm, vì cùng một chủ đề: ba con số tiến độ, rồi tới chỗ xem chi tiết của hai con số trong đó.
2. **Nút 🎯 Ôn tập xuống thân khung Sổ từ**, ngay trên danh sách từ. Hàng tiêu đề popup giờ chỉ còn ba thứ luôn cùng vai trò: quay lại, tên khung, đóng. Đây cũng là cách sửa chắc hơn: trước đây nút nằm ở hàng tiêu đề **dùng chung**, quên ẩn ở một nhánh là nó rò sang khung Hướng dẫn — nay không thể rò được nữa.
3. **Nút ← quay về khung Tài khoản.** Hai khung con nay chỉ vào được từ khung Tài khoản, không có đường về thì người dùng buộc phải đóng popup rồi mở lại từ đầu.

⚠️ **Một bẫy suýt bỏ sót:** hai nút nằm trong chính khung Tài khoản, nên **không còn ai vẽ lại nhãn của chúng hộ nữa**. Thiếu `renderFav()`/`renderVocab()` trong nhánh `pane === 'account'` là người dùng đánh dấu xong, mở khung Tài khoản vẫn thấy số cũ. Test **P10** canh đúng chỗ này.

Bỏ luôn đoạn *"Đăng nhập lần đầu, sổ từ và tiến độ đang có trên máy này sẽ được đưa lên tài khoản. Không có gì bị xoá hay ghi đè."* cho gọn.

**Thêm 6 test (P9–P14), tổng 128/128 qua.** Đáng chú ý là P9 và I2 (viết lại) đều phải **đọc thẳng `index.html`** thay vì kiểm qua sandbox — `minidom.js` đăng ký phần tử phẳng, không có quan hệ cha–con, nên mọi câu hỏi *"phần tử này nằm trong khung nào"* đều không kiểm được qua DOM giả. Đúng giới hạn đã ghi lại ở nhóm N8.

### Rút gọn khung Tài khoản còn đúng một hàng (cùng ngày, lần 3)

Bạn bỏ tiếp ba dòng chữ và dồn cả ba con số lên **nhãn của hàng nút**:

```
📚 Đã học (5)    ⭐ Đã đánh dấu (1)    📒 Sổ từ (12 · 3 cần ôn)
```

Ba dòng bị gỡ:

| Gỡ | Vì sao |
|---|---|
| `accStats` — đoạn văn bộ đếm | thứ người dùng muốn biết chỉ là ba con số; đọc một hàng nhanh hơn đọc hai câu |
| `accSync` — dòng trạng thái đồng bộ | báo thành công là nhiễu, hiện suốt ngày mà chẳng để làm gì |
| *"Bản trên máy này vẫn được giữ nguyên…"* | nói một chuyện người dùng không hỏi |

**"📚 Đã học (5)" cố ý KHÔNG phải nút** — không có khung nào để mở ra. Dùng `.acc-chip`, nền xám nhạt, không viền đậm như nút thật, để không ai bấm hụt.

⚠️ **Hai đánh đổi phải ghi lại, vì chúng không hiện ra ngay:**

**1. Đẩy dữ liệu hỏng thì giao diện im lặng.** Bạn chọn bỏ cả cảnh báo `⚠️ Chưa đưa được dữ liệu lên tài khoản`. Thứ duy nhất còn bảo vệ người dùng là mốc `ep:pushed:<uid>` **không được dời khi hỏng** — nên lần đẩy sau (mỗi lần học xong, mỗi lần mở trang) tự thử lại từ đúng chỗ cũ, và localStorage vẫn nguyên. Mất là mất phần *thông báo*, không mất dữ liệu. Test **P16** canh cấu trúc (`ghiNhoDaDay` phải nằm trong nhánh `kq.ok`), **K4** canh hành vi.

**2. Mất câu "Số này tính trên tài khoản / trên máy này".** Đây là câu duy nhất cho phép bạn tự đối chiếu hai thiết bị — chính là công cụ đã dùng để phát hiện lỗi 5 bài / 1 bài / 38 bài sáng nay. Nếu hai máy lại lệch, giờ không có gì chỉ ra điều đó. Đã báo lại, chờ bạn quyết.

Câu giải thích *"một bài được tính khi bấm ▶ Nghe…"* thì giữ, chuyển vào `title` của chip.

**Một chỗ suýt tái lập lỗi cũ:** nhãn nút Sổ từ ban đầu tôi định đếm thẳng từ `readVocab().length`. Làm vậy là khi đã đăng nhập, chip "Đã học" lấy số từ **tài khoản** còn nút Sổ từ lấy số từ **máy này** — hai con số cạnh nhau, hai nguồn khác nhau, đúng loại lỗi vừa mất cả buổi sáng để sửa. Nay cả hai đều đi qua `soLieuTienDo()`, hàm DUY NHẤT trả lời câu hỏi "ba con số là bao nhiêu".

**Thêm 5 test, viết lại nhóm N — tổng 132/132 qua.** Nhóm N vẫn canh đúng câu hỏi cũ (*"người dùng có nhìn thấy con số không"*), chỉ đổi chỗ đọc kết quả từ `accStats.innerHTML` sang nhãn chip và nhãn nút. N9 canh việc **không hiện "0 cần ôn"** — báo một việc không cần làm cũng là nhiễu.

### Ôn tập lên hàng nút, và bỏ tự mở bài (cùng ngày, lần 4)

**1. Nút 🎯 Ôn tập chuyển hẳn lên hàng nút khung Tài khoản**, đứng sau nút Sổ từ. Khung Sổ từ không còn nút nào trên danh sách.

Một chỗ phải sửa kèm mà không hiện ra ngay: nút vẽ trong `renderVocab()`, mà hàm đó vốn `return` sớm khi `modalPane !== 'vocab'`. Nút nay nằm NGOÀI khung Sổ từ nên phải vẽ **trước** dòng return đó — nếu không, nhãn "🎯 Ôn tập (3)" chỉ đúng khi người dùng đang đứng trong khung Sổ từ, tức là đúng lúc họ không nhìn thấy nó. Test **P13** canh chỗ này.

Bấm nút từ khung Tài khoản thì `batDauOnTap()` tự chuyển sang khung Sổ từ — phần ôn vẽ ở đó, không chuyển khung là bấm xong tưởng như không có gì xảy ra (test **P17**).

Nhãn giữ nguyên dạng `🎯 Ôn tập (0)` khi chưa tới hạn: nút mờ nhưng vẫn nói rõ hôm nay có 0 từ. Đây là hành vi test G3 cố ý canh từ trước, không đổi.

**2. App KHÔNG còn tự mở bài ngẫu nhiên lúc vào trang.**

Trước đây `loadNewItem()` chạy ngay trong phần init. Việc đó vừa chọn hộ người dùng thứ họ chưa yêu cầu, vừa chính là gốc của lỗi *"đã học 39 bài"* hồi 17/8 — mỗi lần mở trang là một bài mới được ghi. Nay chỉ nạp danh sách chủ đề cho ô tìm kiếm; người dùng tự chọn hoặc bấm 🔀 Đổi chủ đề.

Khung nội dung và khung câu hỏi **ẩn hẳn** khi chưa có bài, dòng trạng thái cũng ẩn (`setStatus('')` nay ẩn luôn phần tử thay vì để một dòng trống).

⚠️ **`hidden` đặt sẵn trong `index.html`, không đợi JS.** Để JS ẩn thì khung rỗng loé lên một nhịp trước khi script chạy. Nhưng vẫn gọi `capNhatKhungNoiDung()` trong init — `minidom.js` không đọc thuộc tính từ HTML nên sandbox và trình duyệt phải khớp nhau, và trạng thái ban đầu chỉ nên do MỘT chỗ quyết định. Test **P21** canh thuộc tính trong HTML, **P18** canh hành vi lúc chạy.

**Thêm 6 test, tổng 137/137 qua.**

**3. Đổi tab và đổi trình độ cũng để trống** (bạn chốt ngay sau đó). Nay app không chọn bài hộ người dùng ở **bất kỳ đâu** — chỉ còn nút 🔀 Đổi chủ đề là gọi `loadNewItem()`, và đó là lúc người dùng chủ động xin một bài ngẫu nhiên. Test **P25** đếm số lần `loadNewItem` xuất hiện trong nguồn (đúng 2: khai báo hàm + gắn vào `randomBtn`), nên thêm chỗ tự gọi ở đâu là test đỏ ngay.

`xoaBaiDangMo()` **phải dừng cả phiên học đang đếm giờ** — không dừng thì đồng hồ của bài cũ chạy tiếp và tới giây thứ 60 ghi "đã học" cho một bài không còn trên màn hình. Đúng loại lỗi M6 canh, chỉ khác đường vào. Test **P24**.

Tách `doiTab()` / `doiTrinhDo()` thành hàm có tên thay vì viết thẳng trong `addEventListener`: `minidom.js` chỉ đăng ký phần tử theo id, không có nút `.tab-btn`/`.level-btn` để mà bấm, nên viết inline là không test được đường này.

**Tổng 141/141 qua.**

### 🐞 Dời một nút sang khung khác, quên soát điều kiện ẩn/hiện (cùng ngày)

Bạn báo: **Tài khoản → 🎯 Ôn tập → ← → nút Ôn tập biến mất.**

Nguyên nhân nằm đúng một dòng:

```js
reviewBtn.hidden = reviewQueue.length > 0 || list.length === 0;
```

Luật *"đang ôn dở thì ẩn nút"* **đúng** hồi nút còn nằm TRONG khung Sổ từ — bảng ôn thế chỗ nút, để cả hai cùng lúc là thừa. Nhưng sáng nay nút chuyển ra khung Tài khoản, mà điều kiện thì giữ nguyên. Bấm ← không dừng phiên ôn, nên `reviewQueue` vẫn còn và nút bị ẩn ở cả khung Tài khoản. Phiên ôn treo lơ lửng: **bảng thì khuất, hàng đợi thì vẫn sống, không có đường nào vào lại.**

**Bài học:** dời một phần tử sang khung khác thì phải soát lại MỌI điều kiện ẩn/hiện của nó. Điều kiện được viết cho ngữ cảnh cũ, nó không tự đúng ở chỗ mới. Đây là lần thứ năm cùng chủ đề *trạng thái ẩn/hiện của giao diện* — và lần này bộ test 141 bài vẫn xanh, vì không bài nào đi qua đúng đường Tài khoản → ôn → quay lại.

**Bạn chọn giữ phiên** (không dừng như khi bấm ✕):

| Chỗ đứng | Nhãn nút |
|---|---|
| Khung Tài khoản, chưa ôn | `🎯 Ôn tập (3)` |
| Trong khung Sổ từ, đang ôn | *ẩn* — bảng ôn thế chỗ |
| Khung Tài khoản, đang ôn dở | `🎯 Ôn tiếp (2)` |
| Ôn xong hết | `🎯 Ôn tập (0)`, mờ đi nhưng **không ẩn** |

Sửa kèm `batDauOnTap()`: đang có phiên dở thì **giữ nguyên hàng đợi**. Dựng lại từ `dueWords()` là quay về từ đầu, xoá sạch tiến độ vừa làm — trong khi nút đang ghi "Ôn tiếp", tức hứa ngược lại. Và `reviewBtn.disabled` nay theo hàng đợi chứ không theo `due`: chấm xong vài từ thì `due` về 0 nhưng phiên vẫn còn từ để ôn.

Bấm ✕ đóng popup vẫn dừng hẳn phiên như cũ (test **P29** giữ hành vi đó).

**Thêm 4 test (P26–P29), tổng 145/145 qua.** Đã kiểm ngược: khôi phục dòng lỗi cũ thì **P26 đỏ** — test không rỗng.

### Bạn báo "bấm trình độ vẫn tự chọn chủ đề" — mã nguồn thì đã đúng

Rà lại `app.js`: `doiTrinhDo()` chỉ gọi `xoaBaiDangMo()` + `loadTopicOptions()`, không có `loadNewItem()` nào. Cả file chỉ còn **hai** chỗ nhắc `loadNewItem`: dòng khai báo hàm và dòng gắn vào nút 🔀 Đổi chủ đề.

**Nhưng chỗ này tôi có lỗi thật: bộ test không hề đi qua đường bấm nút.**

DOM giả trong `tests/minidom.js` chỉ đăng ký phần tử **theo id**. Nút chọn tab và trình độ không có id — app tìm chúng bằng `querySelectorAll('.tab-btn' / '.level-btn')`, mà trong sandbox hai câu đó trả về **mảng rỗng**. Nghĩa là phần gắn sự kiện chưa bao giờ chạy trong test; P22–P24 gọi thẳng `doiTrinhDo()` nên xanh mà không chứng minh được nút thật có nối đúng vào hàm đó hay không.

Đã dựng các nút đó trong DOM giả (`dungNutChon()`), đọc `data-tab` / `data-level` **thẳng từ index.html** chứ không viết cứng — đổi tên một mức trong HTML mà quên sửa app thì test phải đỏ, không xanh giả. Thêm **P30–P32** bấm thật vào nút.

Kiểm ngược bằng cách khôi phục hành vi cũ (`doiTrinhDo` gọi `loadNewItem()`): **4 bài đỏ**, trong đó P30 báo đúng câu bạn mô tả. Trước khi có `dungNutChon()` thì cùng phép thử đó chỉ đỏ 3 bài, và không bài nào đi qua nút thật.

**Tổng 148/148 qua.**

⚠️ **Nếu trên site thật vẫn còn hiện tượng đó**, nó không nằm ở mã nguồn hiện tại — nhiều khả năng là `app.js` cũ còn trong cache trình duyệt hoặc Vercel chưa deploy bản mới. Thử tải lại bằng Ctrl+Shift+R, hoặc mở DevTools → Network xem `app.js` trả về 200 hay 304 (from cache).

### Gỡ tính năng "📒 Sổ từ" (cùng ngày, lần 5)

Bạn bỏ hẳn khung **📒 Sổ từ**. Từ vẫn được lưu và vẫn chạy hộp Leitner y như cũ — chỉ khác: **không còn nơi nào liệt kê cả sổ**, người dùng gặp lại từ của mình trong lúc ôn.

**Rà trước khi sửa, khung đó đang gánh 3 việc:**

| Việc | Sau khi gỡ |
|---|---|
| Liệt kê toàn bộ từ đã lưu (hộp Leitner, ngày ôn) | bỏ |
| **Nút 🗑 xoá từ** — chỉ có ở đây | **chuyển vào màn ôn**, bạn chọn |
| Chứa bảng ôn tập (`#reviewPanel`) | chuyển sang khung riêng `#paneReview` |

Nếu không rà bước này mà gỡ thẳng, người dùng lưu nhầm một từ sẽ phải **ôn nó mãi mãi** — không còn đường nào bỏ đi. Test **P40** đọc thân `renderReview()` để chắc nút 🗑 còn đó.

**Phạm vi ôn giữ nguyên: chỉ từ đến hạn.** Hộp Leitner không đổi.

Hàng nút khung Tài khoản còn: `📚 Đã học (9)` · `⭐ Đã đánh dấu (1)` · `🎯 Ôn tập (1)`.

**Khung Ôn tập phải tự nói vì sao trống.** Trước đây mở khung Sổ từ lúc nào cũng có nội dung (cả danh sách). Nay mở khung Ôn tập mà chưa tới hạn thì trắng trơn — nên thêm `#reviewEmpty`: chưa lưu từ nào thì chỉ cách lưu, đã lưu mà chưa tới hạn thì nói ngày ôn kế tiếp (P34, P35).

**Giữ tên hàm `renderVocab()`** dù không còn danh sách nào để vẽ — nó được gọi từ hơn mười chỗ (lưu từ, xoá từ, chấm từ, mở khung Tài khoản, đăng nhập…). Nay nó chỉ còn một việc: vẽ nhãn nút 🎯 Ôn tập.

⚠️ **Số từ của TÀI KHOẢN nay không hiện ở đâu nữa.** Trước đây nó nằm trên nhãn `📒 Sổ từ (12 · 3 cần ôn)`. Nút Ôn tập cố ý đếm theo **máy** (`dueWords()`), không theo tài khoản: phiên ôn chạy trên sổ trong localStorage, mời ôn 1 từ mà bấm vào hàng đợi rỗng thì tệ hơn là nút mờ. Công thức server (`soLieuTienDo`) vẫn còn và vẫn đúng, chỉ là không ai vẽ ra. Đã báo lại, chờ bạn quyết.

**🐞 Một chỗ đúng vì tình cờ, không vì logic.** `xoaTuDangOn()` gỡ từ khỏi hàng đợi bằng `filter`. Viết `shift()` cũng cho kết quả y hệt — vì nút 🗑 hôm nay luôn xoá từ đang đứng đầu hàng. Nhưng `shift()` xoá *"từ đầu hàng"* trong khi việc cần làm là xoá *"từ có tên này"*; thêm một đường gọi khác là nó lặng lẽ xoá nhầm. Bản test đầu tiên của tôi **không bắt được** khác biệt đó (tiền đề sai: tôi tưởng hàng đợi có thể chứa từ trùng, thực ra không). Đã viết lại **P38** gọi với một từ ở giữa hàng — thay `filter` bằng `shift` là đỏ ngay.

**Tổng 157/157 qua.** Kiểm ngược 3 kiểu phá code: bỏ nút 🗑 (P40 đỏ), đổi `filter` thành `shift` (P38 đỏ), và giữ nguyên bản sửa (xanh).

### Việc của bạn — tuần 17

1. Migration `study_log_counted_and_stats_rpc` **đã chạy** trên Supabase, không phải làm gì thêm.
2. Đẩy lên GitHub: `index.html`, `styles.css`, `app.js`, `supabase.js`, `tests/run.js`, `supabase_schema.sql`.
3. Mở lại trên **cả hai máy**. Máy tính sẽ đẩy nốt 5 bài còn thiếu (server hiện mới có 1 dòng được tính), rồi hai máy phải hiện **cùng một con số**.
4. Học một bài trên iPhone → chờ vài giây → mở máy tính, số phải tăng. Đây là thứ trước đây **không bao giờ xảy ra**.
5. Vẫn nợ từ tuần 13: đăng nhập tài khoản thứ hai, kiểm RLS thật.
