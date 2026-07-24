# Tổng quan dự án & hướng dẫn phát triển tiếp — Luyện Nghe & Đọc Tiếng Anh

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
| `supabase_schema.sql` | Định nghĩa bảng `content`, RLS, hàm `get_random_content` | Muốn đổi cấu trúc dữ liệu (thêm cột, đổi loại nội dung...) |
| `update_db_2026-07-14.sql` | Migration 1 lần: xóa bản ghi trùng, thêm unique index chặn trùng, thêm vài chủ đề | Chạy 1 lần trong Supabase SQL Editor, sau đó chỉ để tham khảo |
| `seed_100_topics.sql` | Nạp 100 chủ đề (6 nhóm), có `on conflict do nothing` | Chạy 1 lần trong Supabase; tham khảo mẫu khi muốn thêm chủ đề mới |
| `HUONG_DAN_SETUP.md` | Hướng dẫn dựng lại từ đầu (đã hoàn tất, để tham khảo) | Không cần sửa trừ khi dựng lại project mới |
| `HUONG_DAN_PHAT_TRIEN_TIEP.md` | File này | Cập nhật khi kiến trúc thay đổi |

> Các file `generate-content.mjs`, `package.json`, `.github/workflows/generate-content.yml` đã bị **xóa** (2026-07-24) vì thuộc job sinh nội dung tự động không còn dùng.

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

## 6. Lưu ý khi sửa

- Không đưa `service_role`/secret key vào `index.html` hoặc bất kỳ file frontend nào — frontend chỉ dùng anon/publishable key (chỉ đọc).
- `index.html` KHÔNG còn dữ liệu fix cứng (FALLBACK_DIALOGUES/FALLBACK_LISTENING đã xóa) — toàn bộ nội dung lấy từ Supabase. Nếu mất mạng/DB pause, app hiển thị thông báo lỗi thay vì nội dung mẫu.
- DB có unique index `uq_content_type_level_topic` trên (type, level, lower(trim(topic))) — insert chủ đề trùng tên sẽ bị từ chối. Nên luôn thêm `on conflict do nothing` vào cuối lệnh insert để chủ đề trùng tự bỏ qua thay vì làm fail cả lô.
