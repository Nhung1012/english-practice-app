# Tổng quan dự án & hướng dẫn phát triển tiếp — Luyện Nghe & Đọc Tiếng Anh

> **Cập nhật 2026-07-29:** Thay `<select>` chủ đề bằng **combobox tìm kiếm** — gộp ô tìm và danh sách vào **một ô duy nhất**: bấm vào ô là danh sách xổ ra, gõ tới đâu lọc tới đó, đoạn khớp được bôi vàng, chủ đề đang mở có dấu ✓. Tìm kiếm **không phân biệt dấu tiếng Việt và hoa/thường** (gõ `ve may bay` vẫn ra "Hỏi cách đổi vé máy bay") và khớp **nhiều từ khoá rời** không cần đúng thứ tự. Điều hướng bằng ↑ ↓ / PageUp / PageDown / Home / End, Enter để chọn, Esc để xoá từ khoá rồi đóng. Chỉ sửa `index.html`, không đổi DB. Chi tiết ở mục 5b.

> **Cập nhật 2026-07-27 (dọn dữ liệu ngắn):** Đã **xóa 178 bài "ngắn"** ở Trung cấp & Nâng cao (hội thoại < 12 câu: 123 bài; luyện nghe < 200 từ: 55 bài). Cơ bản giữ nguyên. Toàn bộ 178 bài đã được sao lưu sang bảng `content_backup_20260727` trong Supabase; muốn khôi phục chạy file `restore_deleted_2026-07-27.sql`. Sau khi dọn, số lượng còn lại: HT Trung cấp 37, HT Nâng cao 160, Nghe Trung cấp 114, Nghe Nâng cao 151 (tất cả đều ≥ ngưỡng). Lưu ý: **hội thoại Trung cấp giờ chỉ còn 37 bài** — nên cân nhắc soạn thêm.

> **Cập nhật 2026-07-27 (nội dung):** Bổ sung **40 chủ đề mới** cho Trung cấp & Nâng cao (mỗi nhóm +10: hội thoại + luyện nghe), nạp trực tiếp vào Supabase. Sau đợt này mỗi nhóm intermediate/advanced có 160 chủ đề. Nội dung mới được soạn dài hơn mức trung bình cũ (hội thoại Trung cấp 16 câu, Nâng cao 18 câu; luyện nghe Trung cấp ~265 từ, Nâng cao ~300 từ). File SQL lưu tại `seed_more_2026-07-27.sql` (chạy được nhiều lần nhờ `on conflict do nothing`). Lưu ý: DB thực tế đã có 150 chủ đề/nhóm từ trước (nhiều hơn file `seed_100_topics.sql`), nên khi thống kê hãy tin số liệu truy vấn trực tiếp trong Supabase.

> **Cập nhật 2026-07-27:** Thêm tính năng **bấm vào từ để tra phiên âm + nghĩa**. Khi người dùng bấm bất kỳ từ tiếng Anh nào trong script (hội thoại hoặc luyện nghe), một popup nhỏ hiện ngay tại từ đó gồm: phiên âm IPA, từ loại (n/v/adj…), nghĩa tiếng Việt, một câu ví dụ tiếng Anh, và nút 🔊 để đọc riêng từ đó. Toàn bộ nằm trong `index.html`, không đổi DB. Chi tiết ở mục 5a bên dưới.

> **Cập nhật 2026-07-24:** Đã gỡ bỏ cơ chế sinh nội dung tự động bằng AI (job GitHub Actions chạy hằng ngày). Lý do: job hay bị lỗi/fail. Thay vào đó, nội dung được nạp sẵn bằng file SQL tĩnh (`seed_100_topics.sql` — 100 chủ đề). Muốn thêm chủ đề mới thì viết thêm câu lệnh `insert` và chạy trong Supabase SQL Editor.

## 1. Kiến trúc hiện tại

Dự án gồm 2 phần tách rời, không có server riêng, tất cả đều free:

- **Frontend**: 1 file `index.html` tĩnh, host trên Vercel. Chứa toàn bộ giao diện + logic TTS (Web Speech API của trình duyệt) + code fetch dữ liệu từ Supabase.
- **Database**: Supabase (Postgres), bảng `content` (cột `type`, `level`, `topic`, `data` dạng JSONB). Frontend chỉ có quyền đọc (SELECT) qua key công khai `anon`/`publishable`; không thể ghi từ frontend. Nội dung được nạp thủ công bằng các file SQL (chạy trong SQL Editor).

Luồng dữ liệu: người dùng mở web → web gọi Supabase (RPC `get_random_content`) → hiển thị + đọc bằng TTS. Việc thêm nội dung nằm ngoài luồng runtime (chạy SQL 1 lần khi cần).

## 2. Danh sách file & vai trò

| File | Vai trò | Khi nào cần sửa |
|---|---|---|
| `index.html` | Toàn bộ giao diện + TTS + fetch Supabase | Muốn đổi giao diện, thêm tab/tính năng mới, đổi cách hiển thị |
| `supabase_schema.sql` | Định nghĩa bảng `content`, index (gồm unique index chặn trùng), RLS, hàm `get_random_content` | Muốn đổi cấu trúc dữ liệu (thêm cột, đổi loại nội dung...) |
| `seed_100_topics.sql` | Nạp 100 chủ đề đợt đầu, có `on conflict do nothing` | Chỉ để **sao lưu nội dung** + tham khảo mẫu khi thêm chủ đề mới |
| `seed_more_2026-07-27.sql` | 40 chủ đề bổ sung (Trung cấp + Nâng cao) | Như trên |
| `seed_more_dlg_2026-07-27.sql` | Hội thoại bổ sung đợt 27-07 | Như trên |
| `HUONG_DAN_SETUP.md` | Hướng dẫn dựng lại từ đầu (đã hoàn tất, để tham khảo) | Không cần sửa trừ khi dựng lại project mới |
| `HUONG_DAN_PHAT_TRIEN_TIEP.md` | File này | Cập nhật khi kiến trúc thay đổi |

> Các file `generate-content.mjs`, `package.json`, `.github/workflows/generate-content.yml` đã bị **xóa** (2026-07-24) vì thuộc job sinh nội dung tự động không còn dùng.

> **Dọn file SQL (2026-07-29):** hai file dưới đây **không còn cần**, có thể xoá:
> - `update_db_2026-07-14.sql` — migration đã chạy xong từ lâu. Phần duy nhất còn giá trị lâu dài (unique index `uq_content_type_level_topic`) đã được **gộp vào `supabase_schema.sql`**, nên xoá file này không mất gì.
> - `restore_deleted_2026-07-27.sql` — script khôi phục 178 bài đã dọn, chỉ chạy được khi bảng `content_backup_20260727` còn trong Supabase. Nếu đã chắc chắn không muốn khôi phục thì xoá.
>
> Ba file `seed_*.sql` **nên giữ**: chúng là bản sao lưu nội dung duy nhất nằm ngoài Supabase, đồng thời là mẫu định dạng khi soạn chủ đề mới.

## 3. Các liên kết quan trọng

- **Trang web live**: https://english-practice-nd.vercel.app
- **GitHub repo**: https://github.com/Nhung1012/english-practice-app
- **Supabase project**: "Nhung1012's Project" — https://supabase.com/dashboard/project/jlczlapfhqvfiktcpdwf
- **Vercel project**: https://vercel.com/nhung1012s-projects/english-practice-app

## 4. Secrets

Không còn secret nào bắt buộc cho việc chạy hằng ngày (đã bỏ job tự động). Các secret cũ trong GitHub → Settings → Secrets and variables → Actions (`GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`) giờ **không dùng nữa** — có thể xoá cho gọn.

## 5. Quy trình khi muốn cập nhật/thêm nội dung hoặc tính năng

Cách đơn giản nhất: **nói với tôi bạn muốn thêm/đổi gì**, tôi sẽ:

1. Sửa file tương ứng (`index.html`, hoặc viết thêm SQL insert cho chủ đề mới).
2. Đưa code lên GitHub giúp bạn (qua upload trên trình duyệt, không cần bạn cài git).
3. Nếu là thay đổi frontend (`index.html`) → Vercel tự deploy lại sau vài chục giây.
4. Nếu là thêm nội dung / đổi cấu trúc dữ liệu → tôi tạo đoạn SQL, và có thể chạy trực tiếp vào Supabase giúp bạn (nếu bạn đã kết nối Supabase với tôi), hoặc bạn tự dán vào SQL Editor và Run.

### Cách thêm chủ đề mới (không cần AI)

Mở `seed_100_topics.sql` xem mẫu, rồi thêm dòng insert theo đúng định dạng:

```sql
insert into content (type, level, topic, data) values
-- Hội thoại:
('dialogue', 'beginner', 'Tên chủ đề tiếng Việt', '{
  "lines": [
    {"s":"A","t":"Câu tiếng Anh của A."},
    {"s":"B","t":"Câu tiếng Anh của B."}
  ]
}'::jsonb),
-- Luyện nghe/đọc:
('listening', 'intermediate', 'Tên chủ đề tiếng Việt', '{
  "text": "Đoạn văn tiếng Anh..."
}'::jsonb)
on conflict do nothing;
```

Lưu ý: dấu nháy đơn `'` trong tiếng Anh (vd `I'm`) phải viết thành `''` (hai nháy đơn) để không lỗi SQL. `type` chỉ nhận `dialogue`/`listening`; `level` chỉ nhận `beginner`/`intermediate`/`advanced`.

Các loại yêu cầu khác:

- "Thêm giọng đọc khác/tốc độ đọc khác" → sửa `index.html` (phần TTS).
- "Thêm loại bài tập mới (vd: điền từ)" → cần sửa cả `supabase_schema.sql` (thêm giá trị `type` mới vào ràng buộc `check`), dữ liệu, và giao diện hiển thị trong `index.html`.
- "Thêm tài khoản người dùng, lưu tiến độ học" → cần thiết kế thêm bảng Supabase mới + Supabase Auth — thay đổi lớn hơn, nên trao đổi kỹ trước khi làm.

## 5a. Tính năng bấm từ → phiên âm + nghĩa (thêm 2026-07-27)

Nằm hoàn toàn trong `index.html`, không cần sửa Supabase.

**Cách hoạt động:**

- Khi render script, mỗi từ tiếng Anh được bọc trong `<span class="word">` (hàm `tokenizeWords`). Dấu câu và khoảng trắng giữ nguyên; từ có dấu `'` hoặc `-` như `I'm`, `well-done` được giữ nguyên là một từ.
- Bấm vào từ → popup `#wordPopup` hiện tại vị trí từ đó, gọi 2 API miễn phí (không cần API key) và cache kết quả trong phiên để không gọi lại từ trùng.

**Nguồn dữ liệu (gọi trực tiếp từ trình duyệt lúc chạy, cần có mạng):**

- Phiên âm IPA + từ loại + ví dụ: `https://api.dictionaryapi.dev/api/v2/entries/en/{word}` (hàm `fetchDictionary`).
- Nghĩa tiếng Việt: thử Google `translate.googleapis.com` trước, nếu lỗi thì fallback sang `api.mymemory.translated.net` (hàm `fetchTranslation`). Đây là dịch máy nên nghĩa chỉ ở mức tham khảo.
- Nút 🔊 đọc riêng từ: dùng Web Speech API sẵn có (hàm `speakWord`), không cần mạng.

**Muốn chỉnh gì thì sửa ở đâu:**

- Đổi giao diện popup → CSS `.word` / `.word-popup` và các class `.wp-*` trong `<style>`.
- Đổi/thêm nguồn dịch → hàm `fetchTranslation`.
- Bỏ ví dụ hoặc từ loại → hàm `renderPopupData`.
- Muốn thêm sổ từ vựng (lưu từ đã tra) sau này → lưu vào `localStorage` và thêm tab hiển thị; đã chừa sẵn chỗ (cache `wordCache`).

**Tối ưu tốc độ (2026-07-27):** để bấm từ phản hồi nhanh hơn, đã thêm: (1) **cache bền vững bằng localStorage** — từ đã tra 1 lần sẽ hiện tức thì ở mọi lần sau, kể cả sau khi tải lại trang (key dạng `wp:<từ>`); (2) **hiển thị dần** — phiên âm và nghĩa phần nào có trước hiện trước, không chờ cả hai; (3) **nạp trước** khi rê chuột/chạm vào từ (`prefetchWord`), nên lúc bấm thật thường đã có sẵn; (4) **huỷ request cũ + timeout 6s** (`AbortController`) để không treo khi mạng chậm. Muốn xoá cache đã lưu: trong DevTools Console chạy `Object.keys(localStorage).filter(k=>k.startsWith('wp:')).forEach(k=>localStorage.removeItem(k))`.

**Hạn chế đã biết:** API dịch miễn phí có thể giới hạn số lần gọi/ngày theo IP; nếu bị chặn, popup vẫn hiện phiên âm nhưng phần nghĩa báo "chưa dịch được". Lần bấm ĐẦU TIÊN cho mỗi từ vẫn cần mạng (sau đó đã được cache). Việc nạp trước làm tăng số lần gọi API một chút — chấp nhận được với quy mô cá nhân.

## 5b. Combobox chọn / tìm chủ đề (thêm 2026-07-29)

Nằm hoàn toàn trong `index.html`, không cần sửa Supabase. Thay cho `<select>` cũ.

**Cấu trúc DOM:** `.topic-combo#topicCombo` gồm 2 phần —
`.tc-field` (icon 🔍 + input `#topicSearch` + nút xoá `#topicSearchClear` + mũi tên `#topicCaret`) và
`.tc-panel#topicPanel` xổ xuống (dòng đếm `#topicCount` + danh sách `ul#topicListbox`).
Panel dùng `position: absolute` nên không đẩy layout khi mở.

**Cách hoạt động:**

- Bấm/focus vào ô → `openCombo()` xổ danh sách đầy đủ, tự đánh dấu và cuộn tới chủ đề đang mở (có dấu ✓, in đậm).
- Gõ → `applyTopicQuery()` chuẩn hoá từ khoá rồi `renderTopicList()` vẽ lại danh sách. Danh sách chủ đề vẫn chỉ tải 1 lần từ Supabase (`loadTopicOptions`), lọc chạy hoàn toàn ở trình duyệt nên không tốn thêm request.
- `normalizeForSearch()` bỏ dấu tiếng Việt (NFD + xoá dấu thanh), đổi `đ` → `d`, hạ chữ thường, gộp khoảng trắng. Kết quả chuẩn hoá của mỗi chủ đề được tính sẵn 1 lần, lưu ở trường `search` trong `topicOptions`.
- `matchTopic()` yêu cầu **tất cả** từ khoá xuất hiện trong tên chủ đề, không cần đúng thứ tự (vd `ve bay` khớp "Hỏi cách đổi vé máy bay").
- `highlightTopic()` bôi vàng đúng đoạn khớp. Nó so khớp trên chuỗi đã bỏ dấu nhưng cắt trên chuỗi gốc — hai chuỗi cùng độ dài vì `normalizeForSearch` chỉ đổi ký tự 1-1; nếu lệch độ dài (tên chủ đề có khoảng trắng thừa) thì tự bỏ qua phần bôi vàng, không lỗi.
- Chọn 1 dòng → `chooseComboItem()` → `closeCombo()` rồi `loadSelectedTopic()` (hàm cũ, không đổi).
- Đóng combobox luôn xoá từ khoá (`clearTopicQuery`), nên lần mở sau luôn là danh sách đầy đủ — không bị "danh sách trống mà không hiểu vì sao".

**Bàn phím & chuột:**

| Thao tác | Kết quả |
|---|---|
| ↓ / ↑ | Di chuyển trong danh sách (mở danh sách nếu đang đóng) |
| PageDown / PageUp | Nhảy 5 dòng |
| Home / End | Về đầu / cuối (khi ô tìm đang trống) |
| Enter | Mở chủ đề đang được đánh dấu |
| Esc | Lần 1 xoá từ khoá, lần 2 đóng danh sách |
| Tab | Đóng danh sách |
| Rê chuột | Dòng dưới con trỏ tự được đánh dấu |
| Bấm ra ngoài | Đóng danh sách |

Chọn dòng bằng `mousedown` (không phải `click`) để bắt được thao tác trước khi input mất focus.

**Muốn chỉnh gì thì sửa ở đâu:**

- Đổi giao diện → CSS `.topic-combo`, `.tc-field`, `.tc-panel`, `.tc-item`, `.tc-count`, `.tc-empty`.
- Đổi chiều cao danh sách → `max-height` của `.tc-list` (đang 264px ≈ 6 dòng).
- Đổi kiểu khớp (vd chỉ khớp từ đầu chủ đề) → hàm `matchTopic` / `getFilteredTopics`.
- Đổi/ẩn dòng đếm → hàm `updateTopicCount`.
- Bỏ bôi vàng → cho `highlightTopic` trả thẳng `escapeHtml(opt.topic)`.
- Muốn tìm cả trong **nội dung bài** (không chỉ tên chủ đề) → phải `select` thêm cột `data` trong `loadTopicOptions` (nặng vì tải toàn bộ nội dung), hoặc tốt hơn là làm full-text search phía Supabase (Postgres).

**Lưu ý:** tên chủ đề đang học vẫn hiển thị ở khung "Chủ đề hôm nay" phía trên (`#topicText`) — combobox chỉ là ô điều khiển để tìm/chọn, cố ý không lặp lại tên chủ đề để tránh trùng thông tin.

## 6. Lưu ý khi sửa

- Không đưa `service_role`/secret key vào `index.html` hoặc bất kỳ file frontend nào — frontend chỉ dùng anon/publishable key (chỉ đọc).
- `index.html` KHÔNG còn dữ liệu fix cứng (FALLBACK_DIALOGUES/FALLBACK_LISTENING đã xóa) — toàn bộ nội dung lấy từ Supabase. Nếu mất mạng/DB pause, app hiển thị thông báo lỗi thay vì nội dung mẫu.
- DB có unique index `uq_content_type_level_topic` trên (type, level, lower(trim(topic))) — insert chủ đề trùng tên sẽ bị từ chối. Nên luôn thêm `on conflict do nothing` vào cuối lệnh insert để chủ đề trùng tự bỏ qua thay vì làm fail cả lô.
