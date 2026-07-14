# Tổng quan dự án & hướng dẫn phát triển tiếp — Luyện Nghe & Đọc Tiếng Anh

## 1. Kiến trúc hiện tại

Dự án gồm 3 phần tách rời, không có server riêng, tất cả đều free:

- **Frontend**: 1 file `index.html` tĩnh, host trên Vercel. Chứa toàn bộ giao diện + logic TTS (Web Speech API của trình duyệt) + code fetch dữ liệu từ Supabase.
- **Database**: Supabase (Postgres), bảng `content` (cột `type`, `level`, `topic`, `data` dạng JSONB). Frontend chỉ có quyền đọc (SELECT) qua key công khai `anon`/`publishable`; không thể ghi từ frontend.
- **Content generator**: script Node (`generate-content.mjs`) gọi Google Gemini API (free tier) để sinh hội thoại/bài luyện nghe mới, insert vào Supabase bằng service_role/secret key. Script này được GitHub Actions (`generate-content.yml`) tự động chạy 1 lần/ngày (cron 00:00 UTC = 07:00 sáng giờ VN), hoặc chạy tay bất cứ lúc nào qua tab Actions.

Luồng dữ liệu: GitHub Actions (cron) → Gemini API sinh nội dung → insert vào Supabase → người dùng mở web → web gọi Supabase (RPC `get_random_content`) → hiển thị + đọc bằng TTS.

## 2. Danh sách file & vai trò

| File | Vai trò | Khi nào cần sửa |
|---|---|---|
| `index.html` | Toàn bộ giao diện + TTS + fetch Supabase | Muốn đổi giao diện, thêm tab/tính năng mới, đổi cách hiển thị |
| `generate-content.mjs` | Script sinh nội dung bằng Gemini, insert Supabase | Muốn đổi prompt, đổi model, đổi số lượng/loại nội dung sinh mỗi ngày |
| `generate-content.yml` | Workflow GitHub Actions (lịch chạy, biến môi trường) | Muốn đổi giờ chạy, đổi tần suất, thêm bước xử lý |
| `package.json` | Khai báo dependency cho script generate | Khi thêm thư viện npm mới cho script |
| `supabase_schema.sql` | Định nghĩa bảng `content`, RLS, hàm `get_random_content` | Muốn đổi cấu trúc dữ liệu (thêm cột, đổi loại nội dung...) |
| `update_db_2026-07-14.sql` | Migration 1 lần: xóa bản ghi trùng, thêm unique index chặn trùng, thêm 5 chủ đề mới | Chạy 1 lần trong Supabase SQL Editor, sau đó chỉ để tham khảo |
| `HUONG_DAN_SETUP.md` | Hướng dẫn dựng lại từ đầu (đã hoàn tất, để tham khảo) | Không cần sửa trừ khi dựng lại project mới |
| `HUONG_DAN_PHAT_TRIEN_TIEP.md` | File này | Cập nhật khi kiến trúc thay đổi |

## 3. Các liên kết quan trọng

- **Trang web live**: https://english-practice-nd.vercel.app
- **GitHub repo**: https://github.com/Nhung1012/english-practice-app
- **Supabase project**: "Nhung1012's Project" — https://supabase.com/dashboard/project/jlczlapfhqvfiktcpdwf
- **Vercel project**: https://vercel.com/nhung1012s-projects/english-practice-app

## 4. Secrets đang dùng (trong GitHub → Settings → Secrets and variables → Actions)

`GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`. (`ANTHROPIC_API_KEY` còn sót lại từ lần thử đầu tiên, không dùng nữa — có thể xoá.)

## 5. Quy trình khi muốn cập nhật/thêm tính năng

Cách đơn giản nhất: **nói với tôi bạn muốn thêm/đổi gì**, tôi sẽ:

1. Sửa file tương ứng (`index.html`, `generate-content.mjs`, `generate-content.yml`, hoặc `supabase_schema.sql`).
2. Đưa code lên GitHub giúp bạn (qua upload trên trình duyệt, không cần bạn cài git).
3. Nếu là thay đổi frontend (`index.html`) → Vercel tự deploy lại sau vài chục giây, không cần làm gì thêm.
4. Nếu là thay đổi logic sinh nội dung (`generate-content.mjs`/`.yml`) → tôi sẽ chạy thử workflow qua tab Actions và kiểm tra Supabase có insert đúng không trước khi báo bạn xong.
5. Nếu là thay đổi cấu trúc dữ liệu (`supabase_schema.sql`) → cần bạn dán và chạy đoạn SQL mới trong Supabase SQL Editor (bước này cần đăng nhập tài khoản bạn, tôi không tự làm được).

Một vài ví dụ loại yêu cầu và nơi cần sửa:

- "Thêm giọng đọc khác/tốc độ đọc khác" → sửa `index.html` (phần TTS).
- "Thêm chủ đề mới mỗi ngày nhiều hơn" → sửa `TOPICS_PER_RUN` trong `generate-content.mjs`.
- "Đổi giờ sinh nội dung" → sửa `cron` trong `generate-content.yml`.
- "Thêm loại bài tập mới (vd: điền từ)" → cần sửa cả 3: schema (`supabase_schema.sql` thêm giá trị `type` mới), script sinh nội dung, và giao diện hiển thị.
- "Thêm tài khoản người dùng, lưu tiến độ học" → cần thiết kế thêm bảng Supabase mới + Supabase Auth — đây là thay đổi lớn hơn, nên trao đổi kỹ trước khi làm.

## 6. Lưu ý khi sửa

- Không đưa `SUPABASE_SERVICE_ROLE_KEY` vào `index.html` hoặc bất kỳ file frontend nào — chỉ dùng trong GitHub Secrets (server-side).
- Model Gemini dùng alias `gemini-flash-latest` (tự cập nhật bản mới nhất của Google) — không cần sửa trừ khi Google đổi cách đặt tên.
- Free tier Gemini giới hạn khoảng 10 request/phút — nếu tăng `TOPICS_PER_RUN` hoặc số lần chạy/ngày lên nhiều, có thể cần thêm delay hoặc gặp lỗi quá tải.
- (Cập nhật 2026-07-14) `index.html` KHÔNG còn dữ liệu fix cứng (FALLBACK_DIALOGUES/FALLBACK_LISTENING đã xóa) — toàn bộ nội dung lấy từ Supabase. Nếu mất mạng/DB pause, app hiển thị thông báo lỗi thay vì nội dung mẫu.
- (Cập nhật 2026-07-14) DB có unique index `uq_content_type_level_topic` trên (type, level, lower(trim(topic))) — insert chủ đề trùng tên sẽ bị DB từ chối. Lưu ý: script insert cả batch trong 1 lệnh, nếu 1 dòng trùng thì cả batch fail; script đã lọc trùng trước khi insert nên hiếm khi xảy ra.
