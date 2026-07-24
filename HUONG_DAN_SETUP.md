# Hướng dẫn setup — Luyện Nghe & Đọc Tiếng Anh

> File này mô tả các bước setup ban đầu — **đã hoàn tất và đang chạy thật**. Giữ lại để tham khảo nếu cần dựng lại từ đầu (project mới, tài khoản khác...). Nếu chỉ muốn cập nhật tính năng, xem file `HUONG_DAN_PHAT_TRIEN_TIEP.md`.
>
> **Cập nhật 2026-07-24:** Đã gỡ bỏ job GitHub Actions sinh nội dung tự động hằng ngày (`generate-content.mjs`, `package.json`, `.github/workflows/generate-content.yml`). Nội dung giờ được nạp sẵn một lần bằng file SQL (`seed_100_topics.sql`) thay vì sinh tự động bằng AI. Muốn thêm chủ đề mới thì thêm câu lệnh `insert` và chạy trong Supabase (xem `HUONG_DAN_PHAT_TRIEN_TIEP.md`).

## 1. Tạo project Supabase

1. Vào https://supabase.com → đăng ký/đăng nhập → **New project** (chọn gói Free).
2. Đợi vài phút để project khởi tạo xong.
3. Vào **SQL Editor** → dán toàn bộ nội dung file `supabase_schema.sql` → **Run**.
4. Vào **Project Settings > API**, lấy 2 giá trị:
   - **Project URL** (dạng `https://xxxx.supabase.co`)
   - **anon public key** (hoặc "Publishable key" `sb_publishable_...` với hệ thống key mới)
   - (service_role/secret key giờ **không còn cần** cho việc chạy hằng ngày, vì đã bỏ job tự động. Chỉ cần nếu sau này bạn muốn ghi dữ liệu bằng script server-side.)

## 2. Cập nhật file `index.html`

Mở file `index.html`, tìm 2 dòng:

```js
const SUPABASE_URL = "https://YOUR-PROJECT-REF.supabase.co";
const SUPABASE_ANON_KEY = "YOUR-ANON-PUBLIC-KEY";
```

Thay bằng Project URL và anon/publishable key ở bước 1. Đây là 2 giá trị công khai, an toàn khi để trong frontend vì bảng `content` chỉ cho phép đọc (SELECT), không cho ghi.

## 3. Nạp nội dung vào database

Vào **Supabase > SQL Editor**, chạy lần lượt (dán toàn bộ file → Run):

1. `update_db_2026-07-14.sql` — tạo unique index chống trùng `uq_content_type_level_topic` và thêm vài chủ đề mẫu. **Chạy file này trước.**
2. `seed_100_topics.sql` — nạp 100 chủ đề, chia đều 6 nhóm (dialogue/listening × beginner/intermediate/advanced). Mỗi lệnh insert có `on conflict do nothing` nên chủ đề nào trùng sẽ tự bỏ qua, chạy lại nhiều lần cũng an toàn.

Kiểm tra: vào **Table Editor > bảng `content`** để thấy dữ liệu, hoặc chạy trong SQL Editor:

```sql
select type, level, count(*) as so_bai
from content group by type, level order by type, level;
```

## 4. Tạo repo GitHub và đẩy code lên

1. Tạo repo mới trên GitHub (public hoặc private đều được).
2. Đẩy các file sau lên repo:
   - `index.html`
   - `supabase_schema.sql`
   - `update_db_2026-07-14.sql`
   - `seed_100_topics.sql`
   - các file hướng dẫn `.md`

> Không còn cần đẩy `generate-content.mjs`, `package.json` hay thư mục `.github/workflows/` — job tự động đã bị gỡ.

## 5. Deploy frontend lên Vercel (miễn phí)

1. Vào https://vercel.com → đăng nhập bằng GitHub → **Add New Project** → chọn repo vừa tạo.
2. Vì đây là site tĩnh (chỉ có `index.html`), không cần cấu hình build command — Vercel tự nhận diện (Framework preset: "Other").
3. Bấm **Deploy**. Sau vài giây sẽ có link dạng `https://ten-project.vercel.app`.
4. Mỗi khi bạn push code mới lên GitHub, Vercel tự động deploy lại.
5. Muốn đổi tên miền `.vercel.app` cho ngắn/đẹp hơn: vào project → **Settings > Domains** → **Edit** domain hiện tại → nhập tên mới → Save (chọn "Redirect old domain to new" để link cũ không bị hỏng).

## 6. Kiểm tra

- Mở link Vercel, đổi trình độ / chủ đề, kiểm tra nội dung hiển thị được lấy từ Supabase. Nếu báo lỗi tải dữ liệu, kiểm tra lại Supabase URL/key ở bước 2, và chắc chắn đã nạp dữ liệu ở bước 3.
- Bấm "Nghe" để test TTS trình duyệt.
