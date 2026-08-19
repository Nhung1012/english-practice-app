-- ============================================================
-- Schema cho app "Luyện Nghe & Đọc Tiếng Anh"
-- Chạy file này trong Supabase Dashboard > SQL Editor
-- ============================================================

-- Bảng duy nhất, lưu nội dung dạng JSONB để map thẳng vào cấu trúc
-- DIALOGUES / LISTENING đang dùng trong file HTML gốc.
create table if not exists content (
  id bigint generated always as identity primary key,
  type text not null check (type in ('dialogue', 'listening')),
  level text not null check (level in ('beginner', 'intermediate', 'advanced')),
  topic text not null,
  -- Với type='dialogue': data = { "lines": [ {"s":"A","t":"..."}, ... ] }
  -- Với type='listening': data = { "text": "..." }
  data jsonb not null,
  created_at timestamptz not null default now()
);

-- Index để query nhanh theo type + level (dùng để lấy random 1 bản ghi)
create index if not exists idx_content_type_level on content (type, level);

-- Chặn trùng chủ đề: unique theo (type, level, tên chủ đề đã chuẩn hoá).
-- Nhờ index này, insert chủ đề trùng tên sẽ bị DB từ chối — nên các file
-- seed luôn kết thúc bằng `on conflict do nothing`.
-- (Trước đây nằm ở update_db_2026-07-14.sql, đã gộp vào đây 2026-07-29.)
create unique index if not exists uq_content_type_level_topic
  on content (type, level, lower(trim(topic)));

-- Bật Row Level Security
alter table content enable row level security;

-- Cho phép AI đọc công khai (ai cũng SELECT được, không ai INSERT/UPDATE/DELETE qua client)
create policy "Public read access"
  on content
  for select
  to anon
  using (true);

-- ⚠️ BẮT BUỘC có policy thứ hai cho role `authenticated` (thêm 2026-08-04,
-- tuần 13). Sau khi bật Auth, người ĐÃ đăng nhập gửi request với role
-- `authenticated`, không khớp policy `to anon` ở trên → RLS trả về 0 dòng và
-- app hiện màn hình trống mà KHÔNG báo lỗi gì. Đây là bẫy đã ghi ở mục 7 của
-- KE_HOACH_PHAT_TRIEN.md; xoá policy này đi là hỏng app cho người đăng nhập.
create policy "Authenticated read access"
  on content
  for select
  to authenticated
  using (true);

-- Không tạo policy insert/update/delete cho role "anon" hay "authenticated"
-- => chỉ script sinh nội dung (dùng service_role key, bypass RLS) mới ghi được.
-- Tuyệt đối KHÔNG để lộ service_role key ở phía frontend.

-- ============================================================
-- (Tuỳ chọn) Hàm lấy ngẫu nhiên 1 bản ghi theo type + level,
-- nhanh hơn là SELECT * rồi random ở client khi bảng lớn dần.
-- ============================================================
-- `set search_path` để hàm không bị trỏ sang schema khác (linter Supabase
-- cảnh báo `function_search_path_mutable`; ghim lại 2026-08-04).
-- Từ mục 1.6, việc random chủ yếu làm ở client; hàm này còn là đường dự phòng.
create or replace function get_random_content(p_type text, p_level text)
returns setof content
language sql
stable
set search_path = public, pg_temp
as $$
  select *
  from content
  where type = p_type and level = p_level
  order by random()
  limit 1;
$$;

-- ============================================================
-- TUẦN 13 (Giai đoạn 4) — 3 bảng cho tài khoản người học.
-- Đã chạy trên Supabase ngày 2026-08-04.
--
-- Cột được đặt KHỚP ĐÚNG dữ liệu localStorage app đang ghi từ tuần 1:
--   ep:log   -> study_log (content_id, mode, score, seconds, created_at)
--   ep:vocab -> vocab (word, ipa, pos, meaning_vi, example,
--                      source_content_id, box, due_date, created_at)
-- Nhờ vậy tuần 16 chỉ là insert thẳng, không cần hàm chuyển đổi.
-- ============================================================

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
-- Index cho khoá ngoại: mỗi lần xoá một bài khỏi `content`, cascade phải tìm
-- các dòng tham chiếu. Không có index thì phải quét cả bảng.
create index if not exists idx_study_log_content on study_log (content_id);

-- ⚠️ Khoá chống trùng cho việc GỘP dữ liệu localStorage lên tài khoản (tuần 16).
-- Không có ràng buộc unique thì `on conflict do nothing` không có đích để bám:
-- việc gộp hỏng giữa chừng (mất mạng khi đang chèn lô thứ 2) rồi chạy lại sẽ
-- nhân đôi phần đã chèn, làm sai luôn trang thống kê ở tuần 20.
-- Bộ ba này là khoá tự nhiên thật: cùng người, cùng bài, cùng mốc thời gian ISO
-- thì đúng là một lần học. Tuần 17 đồng bộ hai chiều dùng lại chính khoá này.
create unique index if not exists uq_log_user_content_time
  on study_log (user_id, content_id, created_at);

-- Sổ từ vựng + trạng thái SRS (hộp Leitner)
create table if not exists vocab (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  word text not null,
  ipa text, pos text, meaning_vi text, example text,
  source_content_id bigint references content(id) on delete set null,
  box int not null default 1 check (box between 1 and 5),
  due_date date not null default current_date,
  created_at timestamptz not null default now()
);
create index if not exists idx_vocab_due on vocab (user_id, due_date);
create index if not exists idx_vocab_source_content on vocab (source_content_id);

-- Postgres không cho biểu thức trong UNIQUE của CREATE TABLE, nên ràng buộc
-- "mỗi người mỗi từ một lần" phải là unique index riêng. Dùng lower() vì
-- frontend so khớp từ không phân biệt hoa/thường (mục 10, tuần 5).
create unique index if not exists uq_vocab_user_word_lower on vocab (user_id, lower(word));

-- RLS: mỗi người chỉ thấy dữ liệu của chính mình.
-- Viết `(select auth.uid())` chứ không phải `auth.uid()`: bọc trong subquery
-- thì Postgres tính một lần cho cả câu lệnh thay vì tính lại trên từng dòng.
alter table profiles  enable row level security;
alter table study_log enable row level security;
alter table vocab     enable row level security;

create policy "own profile" on profiles for all to authenticated
  using (id = (select auth.uid()))      with check (id = (select auth.uid()));
create policy "own log" on study_log for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own vocab" on vocab for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Bảng sao lưu ngày 27/7: bật RLS và KHÔNG tạo policy nào = không đọc được
-- qua API công khai, vẫn xem bình thường trong SQL Editor.
alter table if exists content_backup_20260727 enable row level security;

-- ============================================================
-- TUẦN 17 — SERVER LÀM NGUỒN THẬT CHO BỘ ĐẾM TIẾN ĐỘ
-- Đã chạy trên Supabase ngày 2026-08-19 (migration study_log_counted_and_stats_rpc).
--
-- Lỗi được sửa: khung Tài khoản đọc 100% từ localStorage, nên cùng một tài
-- khoản đăng nhập ở hai máy cho hai con số khác nhau (5 bài trên máy tính,
-- 1 bài trên iPhone, 38 bài dưới DB). localStorage là dữ liệu của MÁY, không
-- phải của TÀI KHOẢN — không thể dùng nó để trả lời câu hỏi "tôi đã học bao
-- nhiêu bài".
-- ============================================================

-- study_log.counted — phân biệt dòng "đã HỌC" với dòng "đã MỞ" của luật cũ.
--
-- Trước 2026-08-17 app tính "mở bài = đã học", nên nhật ký đẩy lên hồi tuần 16
-- thực chất là danh sách bài ĐÃ MỞ. Bản 17/8 đã sửa luật ở client và cho đếm
-- lại từ 0 (chuyenNhatKyCu()). Nếu server đếm cả các dòng cũ đó thì người dùng
-- vừa thấy 5 bài sẽ nhảy ngược lên 38 — đúng con số sai mà bản 17/8 sinh ra để
-- dẹp. KHÔNG xoá dòng nào (nguyên tắc mục 9): chỉ đánh dấu không tính, muốn
-- tính lại chỉ cần update cột này.
alter table study_log
  add column if not exists counted boolean not null default true;

update study_log
   set counted = false
 where created_at < timestamptz '2026-08-17 00:00:00+00'
   and counted;

create index if not exists idx_study_log_user_counted
  on study_log (user_id, content_id) where counted;

-- RPC thong_ke_tai_khoan — một lần gọi lấy đủ ba con số của khung Tài khoản.
--
-- Vì sao là RPC chứ không phải ba câu select: PostgREST không làm được
-- count(distinct ...), nếu để client tự lọc thì phải kéo toàn bộ content_id về
-- máy — vừa tốn, vừa lặp lại đúng kiểu "mỗi nơi tự đếm một kiểu" đã gây ra lỗi
-- này ngay từ đầu. Một nguồn, một công thức.
--
-- p_today do client truyền vào theo NGÀY ĐỊA PHƯƠNG của máy (hàm homNay()),
-- không dùng current_date của server: server chạy UTC nên người học ở VN mở app
-- lúc 7 giờ sáng sẽ bị tính là hôm qua, số "cần ôn" lệch một ngày.
--
-- security invoker (mặc định) + RLS "own log"/"own vocab" đã bật => hàm chỉ
-- nhìn thấy dữ liệu của chính người gọi. KHÔNG đặt security definer ở đây.
create or replace function thong_ke_tai_khoan(p_today date default null)
returns json
language sql
stable
as $$
  select json_build_object(
    'so_bai',  (select count(distinct content_id) from study_log
                 where user_id = (select auth.uid()) and counted),
    'so_tu',   (select count(*) from vocab
                 where user_id = (select auth.uid())),
    'can_on',  (select count(*) from vocab
                 where user_id = (select auth.uid())
                   and due_date <= coalesce(p_today, current_date))
  );
$$;

revoke all on function thong_ke_tai_khoan(date) from public, anon;
grant execute on function thong_ke_tai_khoan(date) to authenticated;
