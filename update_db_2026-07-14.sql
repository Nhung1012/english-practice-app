-- ============================================================
-- Cập nhật DB ngày 2026-07-14:
--   1) Xóa các bản ghi trùng lặp hiện có
--   2) Chặn trùng lặp trong tương lai (unique index)
--   3) Thêm 5 chủ đề mới (3 hội thoại + 2 luyện nghe)
-- Chạy TOÀN BỘ file này trong Supabase Dashboard > SQL Editor
-- ============================================================

-- ---------- 1) XÓA BẢN GHI TRÙNG ----------
-- Đã rà soát dữ liệu thực tế (19 bản ghi), các id sau là bản trùng/na ná
-- một chủ đề đã có trước đó (giữ bản có id nhỏ nhất):
--   id 8, 14: "Lần đầu đi hiến máu nhân đạo"      (trùng id 2)
--   id 9    : "Giảm thiểu rác thải nhựa tại VP"    (trùng id 3)
--   id 16   : "Du lịch chữa lành ... bản địa"      (trùng id 4)
--   id 11   : "Một buổi tối làm bánh tại nhà"      (trùng id 5)
delete from content where id in (8, 9, 11, 14, 16);

-- Quét thêm 1 lượt: xóa mọi bản ghi trùng CHÍNH XÁC tên chủ đề
-- (cùng type + level, không phân biệt hoa/thường), giữ bản id nhỏ nhất.
delete from content c
using content c2
where c.type = c2.type
  and c.level = c2.level
  and lower(trim(c.topic)) = lower(trim(c2.topic))
  and c.id > c2.id;

-- ---------- 2) CHẶN TRÙNG TỪ NAY VỀ SAU ----------
-- Unique index theo (type, level, tên chủ đề đã chuẩn hóa): nếu script sinh
-- nội dung lỡ insert chủ đề trùng tên, DB sẽ từ chối thay vì lưu bản sao.
create unique index if not exists uq_content_type_level_topic
  on content (type, level, lower(trim(topic)));

-- ---------- 3) THÊM 5 CHỦ ĐỀ MỚI ----------
insert into content (type, level, topic, data) values

-- 3.1 Hội thoại | Cơ bản (A1-A2)
('dialogue', 'beginner', 'Hỏi đường đến bưu điện', '{
  "lines": [
    {"s":"A","t":"Excuse me, can you help me?"},
    {"s":"B","t":"Of course. What do you need?"},
    {"s":"A","t":"I am looking for the post office."},
    {"s":"B","t":"The post office is not far from here."},
    {"s":"A","t":"How do I get there?"},
    {"s":"B","t":"Go straight on this street for two blocks."},
    {"s":"A","t":"Go straight for two blocks. Then what?"},
    {"s":"B","t":"Then turn left at the bank. The post office is next to it."},
    {"s":"A","t":"Is it a big building?"},
    {"s":"B","t":"Yes, it is a big yellow building. You cannot miss it."},
    {"s":"A","t":"Thank you so much for your help!"},
    {"s":"B","t":"You are welcome. Have a nice day!"}
  ]
}'::jsonb),

-- 3.2 Hội thoại | Trung cấp (B1-B2)
('dialogue', 'intermediate', 'Lên kế hoạch cho chuyến team building của công ty', '{
  "lines": [
    {"s":"A","t":"Hi Linh, have you started planning the company team building trip yet?"},
    {"s":"B","t":"I''ve just begun. I''m thinking about a two-day trip to the beach next month."},
    {"s":"A","t":"That sounds great. How many people are we expecting?"},
    {"s":"B","t":"Around forty, including a few family members of the staff."},
    {"s":"A","t":"We should book the hotel early then. Prices go up quickly in the summer."},
    {"s":"B","t":"Good point. I''ll ask for quotes from three hotels and compare them."},
    {"s":"A","t":"What about activities? Last year some people said the games were a bit boring."},
    {"s":"B","t":"I was thinking of a cooking competition on the beach and a short hiking trip."},
    {"s":"A","t":"I like that. We could also add a quiet option for people who just want to relax."},
    {"s":"B","t":"Definitely. Not everyone enjoys group games, so free time is important too."},
    {"s":"A","t":"Should we set a budget per person before we go any further?"},
    {"s":"B","t":"Yes, I''ll propose a budget to the director this week and let you know."},
    {"s":"A","t":"Perfect. Send me the plan when it''s ready and I''ll help you check the details."},
    {"s":"B","t":"Will do. Thanks for your support!"}
  ]
}'::jsonb),

-- 3.3 Hội thoại | Nâng cao (C1-C2)
('dialogue', 'advanced', 'Tranh luận về tuần làm việc bốn ngày', '{
  "lines": [
    {"s":"A","t":"I''ve been reading about companies adopting a four-day workweek, and the results seem surprisingly positive."},
    {"s":"B","t":"Positive in what sense? Productivity metrics, or simply employee satisfaction surveys?"},
    {"s":"A","t":"Both, actually. Several trials reported stable or even improved output alongside lower burnout rates."},
    {"s":"B","t":"I remain skeptical. Those trials often involve self-selected firms that were already well-managed."},
    {"s":"A","t":"That''s a fair methodological critique, but the sheer consistency across countries is hard to dismiss."},
    {"s":"B","t":"Consistency doesn''t imply universality. Client-facing industries can''t simply compress their availability."},
    {"s":"A","t":"They wouldn''t have to. Staggered schedules could preserve coverage while still reducing individual hours."},
    {"s":"B","t":"Then you''re redefining the policy. A staggered model is hardly the utopia the headlines promise."},
    {"s":"A","t":"Perhaps, but policy rarely arrives in its purest form. Incremental adoption is how most reforms take root."},
    {"s":"B","t":"Granted. My concern is that we''re treating a productivity experiment as a settled social entitlement."},
    {"s":"A","t":"And mine is that we cling to a five-day convention designed for factory floors, not knowledge work."},
    {"s":"B","t":"On that point, at least, we agree — the current structure deserves scrutiny, whatever the conclusion."}
  ]
}'::jsonb),

-- 3.4 Luyện nghe | Cơ bản (A1-A2)
('listening', 'beginner', 'Chuyến dã ngoại cuối tuần ở công viên', '{
  "text": "Last Sunday, my family went to the park for a picnic. We got up early in the morning. My mother made sandwiches and fresh orange juice. My father prepared a big blanket and some fruit. The weather was sunny and warm. At the park, we found a nice place under a big tree. My little brother played with a ball. My sister and I rode our bicycles around the lake. After that, we ate lunch together on the blanket. The sandwiches were delicious. In the afternoon, we fed the ducks near the water. They were very funny. Before going home, we took many photos. Everyone was tired but very happy. I love spending weekends with my family. We want to go back to the park next month."
}'::jsonb),

-- 3.5 Luyện nghe | Trung cấp (B1-B2)
('listening', 'intermediate', 'Lợi ích của việc đi xe đạp trong thành phố', '{
  "text": "Cycling in the city has become increasingly popular in recent years, and for good reason. First of all, it is one of the cheapest ways to travel. A decent bicycle costs far less than a motorbike or a car, and it needs no fuel at all. Second, cycling is excellent for your health. Riding for just thirty minutes a day strengthens your heart, improves your mood, and helps you sleep better at night. Many office workers say that cycling to work gives them more energy in the morning than a cup of coffee. There are also clear benefits for the environment. Bicycles produce no emissions, so every trip by bike means less air pollution and less noise on the streets. Of course, urban cycling has its challenges. Traffic can be dangerous, and not every city has proper bicycle lanes. Rainy weather can also make riding uncomfortable. However, many local governments are now investing in safer roads, bike-sharing programs, and parking areas for bicycles. If more people choose two wheels instead of four, our cities will become cleaner, quieter, and healthier places to live."
}'::jsonb);

-- ---------- KIỂM TRA KẾT QUẢ ----------
select type, level, count(*) as so_bai
from content
group by type, level
order by type, level;
