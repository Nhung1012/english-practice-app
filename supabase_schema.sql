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

-- Bật Row Level Security
alter table content enable row level security;

-- Cho phép AI đọc công khai (ai cũng SELECT được, không ai INSERT/UPDATE/DELETE qua client)
create policy "Public read access"
  on content
  for select
  to anon
  using (true);

-- Không tạo policy insert/update/delete cho role "anon" hay "authenticated"
-- => chỉ script sinh nội dung (dùng service_role key, bypass RLS) mới ghi được.
-- Tuyệt đối KHÔNG để lộ service_role key ở phía frontend.

-- ============================================================
-- (Tuỳ chọn) Hàm lấy ngẫu nhiên 1 bản ghi theo type + level,
-- nhanh hơn là SELECT * rồi random ở client khi bảng lớn dần.
-- ============================================================
create or replace function get_random_content(p_type text, p_level text)
returns setof content
language sql
stable
as $$
  select *
  from content
  where type = p_type and level = p_level
  order by random()
  limit 1;
$$;
