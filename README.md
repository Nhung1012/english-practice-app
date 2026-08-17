# english-practice-app

Web luyện nghe & đọc tiếng Anh: chọn trình độ (beginner / intermediate / advanced) và loại bài (hội thoại / luyện nghe), đọc nội dung và nghe bằng giọng đọc của trình duyệt (TTS).

## Kiến trúc

- **Frontend**: 4 file tĩnh (`index.html` + `styles.css` + `supabase.js` + `app.js`), host trên Vercel. **Không có bước build** — các file JS là script cổ điển, nạp theo thứ tự khai báo trong `index.html`.
- **Database**: Supabase (Postgres), bảng `content` (`type`, `level`, `topic`, `data` JSONB). Frontend chỉ đọc (SELECT) qua anon/publishable key.
- **Nội dung**: nạp sẵn bằng các file SQL chạy trong Supabase SQL Editor (không sinh tự động).

## Các file

| File | Vai trò |
|---|---|
| `index.html` | Chỉ còn HTML: khung trang, các nút, popup. Không còn CSS/JS viết thẳng bên trong |
| `styles.css` | Toàn bộ giao diện |
| `supabase.js` | Cấu hình kết nối, **mọi** hàm đọc dữ liệu, và lớp đăng nhập. Nạp trước `app.js` |
| `app.js` | Giao diện & logic: TTS, tra từ, sổ từ, lịch sử, dịch câu, quiz. Nạp cuối `<body>`, **không dùng `defer`** |
| `supabase_schema.sql` | Tạo bảng `content`, RLS, unique index, hàm `get_random_content` |
| `KE_HOACH_PHAT_TRIEN.md` | **File chính** — kế hoạch, lộ trình, nhật ký, và cách vận hành xưởng nội dung (mục 15) |
| `gd2_batches/` | Xưởng soạn bản dịch + quiz (nguồn) và script sinh SQL — hướng dẫn ở mục 15 của file trên |
| `gd2_translations.sql`, `gd2_quiz.sql` | Sản phẩm của `gd2_batches/build_sql.py`, dán vào Supabase SQL Editor |
| `tests/` | Bộ kiểm thử tự động — `node tests/run.js` |
| `HUONG_DAN_SETUP.md` | Hướng dẫn dựng lại toàn bộ từ đầu (Supabase + Vercel) |
| `HUONG_DAN_DANG_NHAP_GOOGLE.md` | Các bước bấm dashboard để bật đăng nhập Google |
| `luu tru/` | Các file SQL đã chạy xong, giữ làm bản sao dự phòng nội dung |

## Làm việc hằng ngày

```bash
node tests/run.js                    # chạy bộ kiểm thử trước khi deploy
python3 gd2_batches/build_sql.py     # sinh lại 2 file SQL sau khi soạn thêm nội dung
```

Sửa code → chạy test → đẩy lên GitHub → Vercel tự deploy.
Nhớ đẩy **cả 4 file** frontend nếu có sửa nhiều file cùng lúc — thiếu một file là trang trắng.

## Dựng lại từ đầu

Xem `HUONG_DAN_SETUP.md`, phần nạp nội dung xem thêm `luu tru/README.md`.

> Ghi chú: bản đầu dùng AI sinh nội dung tự động qua GitHub Actions; cơ chế đó đã được gỡ (2026-07-24), nội dung nay nạp thủ công bằng file SQL.
