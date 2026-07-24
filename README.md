# english-practice-app

Web luyện nghe & đọc tiếng Anh: chọn trình độ (beginner / intermediate / advanced) và loại bài (hội thoại / luyện nghe), đọc nội dung và nghe bằng giọng đọc của trình duyệt (TTS).

## Kiến trúc

- **Frontend**: một file `index.html` tĩnh, host trên Vercel. Bao gồm giao diện, TTS (Web Speech API) và code đọc dữ liệu từ Supabase.
- **Database**: Supabase (Postgres), bảng `content` (`type`, `level`, `topic`, `data` JSONB). Frontend chỉ đọc (SELECT) qua anon/publishable key.
- **Nội dung**: nạp sẵn bằng các file SQL chạy trong Supabase SQL Editor (không sinh tự động).

## Các file

| File | Vai trò |
|---|---|
| `index.html` | Toàn bộ frontend + TTS + fetch Supabase |
| `supabase_schema.sql` | Tạo bảng `content`, RLS, hàm `get_random_content` |
| `update_db_2026-07-14.sql` | Migration: unique index chống trùng + vài chủ đề |
| `seed_100_topics.sql` | Nạp 100 chủ đề (6 nhóm), có `on conflict do nothing` |
| `HUONG_DAN_SETUP.md` | Hướng dẫn dựng lại từ đầu |
| `HUONG_DAN_PHAT_TRIEN_TIEP.md` | Tổng quan & hướng dẫn phát triển tiếp |

## Chạy nhanh

1. Tạo project Supabase, chạy `supabase_schema.sql` trong SQL Editor.
2. Chạy `update_db_2026-07-14.sql` rồi `seed_100_topics.sql` để nạp nội dung.
3. Điền Project URL + anon key vào `index.html`.
4. Deploy `index.html` lên Vercel.

Chi tiết xem `HUONG_DAN_SETUP.md`.

> Ghi chú: bản đầu dùng AI sinh nội dung tự động qua GitHub Actions; cơ chế đó đã được gỡ (2026-07-24), nội dung nay nạp thủ công bằng file SQL.
