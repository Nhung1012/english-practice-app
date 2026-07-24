-- ============================================================
-- SEED 100 CHỦ ĐỀ cho app "Luyện Nghe & Đọc Tiếng Anh"
-- Ngày tạo: 2026-07-24
--
-- Thay cho job GitHub Actions sinh nội dung tự động (đã gỡ),
-- file này chèn sẵn 100 chủ đề, chia đều 6 nhóm:
--   dialogue  | beginner     : 17
--   dialogue  | intermediate : 17
--   dialogue  | advanced     : 16
--   listening | beginner     : 17
--   listening | intermediate : 17
--   listening | advanced     : 16
--   ------------------------------------ Tổng: 100
--
-- Cách chạy: mở Supabase Dashboard > SQL Editor > dán TOÀN BỘ file > Run.
-- Mỗi INSERT có "on conflict do nothing" nên nếu chủ đề nào trùng dữ liệu
-- đã có, bản ghi đó tự bỏ qua, phần còn lại vẫn được lưu.
-- (Cần đã tạo unique index uq_content_type_level_topic — xem update_db_2026-07-14.sql)
-- ============================================================

-- ============================================================
-- NHÓM 1/6 — DIALOGUE | BEGINNER (A1-A2) — 17 chủ đề
-- ============================================================
insert into content (type, level, topic, data) values

('dialogue', 'beginner', 'Đặt món ăn ở nhà hàng', '{
  "lines": [
    {"s":"A","t":"Good evening. Do you have a table for two?"},
    {"s":"B","t":"Yes, we do. Please follow me."},
    {"s":"A","t":"Thank you. Can I see the menu?"},
    {"s":"B","t":"Here you are. Our soup is very good today."},
    {"s":"A","t":"I would like the chicken soup, please."},
    {"s":"B","t":"Sure. And what about the main dish?"},
    {"s":"A","t":"I will have the beef with rice."},
    {"s":"B","t":"Would you like something to drink?"},
    {"s":"A","t":"A glass of orange juice, please."},
    {"s":"B","t":"Great. Your food will be ready soon."},
    {"s":"A","t":"Thank you very much."},
    {"s":"B","t":"You are welcome. Enjoy your meal!"}
  ]
}'::jsonb),

('dialogue', 'beginner', 'Mua vé xem phim', '{
  "lines": [
    {"s":"A","t":"Hello. Two tickets for the new cartoon, please."},
    {"s":"B","t":"Sure. Which time do you want?"},
    {"s":"A","t":"The seven o''clock show, please."},
    {"s":"B","t":"Where would you like to sit?"},
    {"s":"A","t":"In the middle, please."},
    {"s":"B","t":"Okay. That is twelve dollars."},
    {"s":"A","t":"Here is the money."},
    {"s":"B","t":"Thank you. Here are your tickets."},
    {"s":"A","t":"Where is the room?"},
    {"s":"B","t":"Room three, on the left."},
    {"s":"A","t":"Thank you very much."},
    {"s":"B","t":"Enjoy the movie!"}
  ]
}'::jsonb),

('dialogue', 'beginner', 'Hỏi giờ mở cửa siêu thị', '{
  "lines": [
    {"s":"A","t":"Excuse me, what time does the supermarket open?"},
    {"s":"B","t":"It opens at eight in the morning."},
    {"s":"A","t":"And what time does it close?"},
    {"s":"B","t":"It closes at ten at night."},
    {"s":"A","t":"Is it open on Sunday?"},
    {"s":"B","t":"Yes, it is open every day."},
    {"s":"A","t":"Great. Where is it?"},
    {"s":"B","t":"It is on Green Street, near the bank."},
    {"s":"A","t":"Is it far from here?"},
    {"s":"B","t":"No, only five minutes on foot."},
    {"s":"A","t":"Thank you for your help."},
    {"s":"B","t":"You are welcome."}
  ]
}'::jsonb),

('dialogue', 'beginner', 'Gọi điện đặt lịch khám răng', '{
  "lines": [
    {"s":"A","t":"Hello, is this the dental clinic?"},
    {"s":"B","t":"Yes, it is. How can I help you?"},
    {"s":"A","t":"I want to make an appointment."},
    {"s":"B","t":"Sure. What is the problem?"},
    {"s":"A","t":"I have a toothache."},
    {"s":"B","t":"I am sorry to hear that. Can you come tomorrow?"},
    {"s":"A","t":"Yes. What time is good?"},
    {"s":"B","t":"We have a free time at ten in the morning."},
    {"s":"A","t":"Ten is perfect for me."},
    {"s":"B","t":"Can I have your name, please?"},
    {"s":"A","t":"My name is Nam."},
    {"s":"B","t":"Thank you, Nam. See you tomorrow."}
  ]
}'::jsonb),

('dialogue', 'beginner', 'Mua rau ở chợ', '{
  "lines": [
    {"s":"A","t":"Good morning. How much are the tomatoes?"},
    {"s":"B","t":"They are two dollars a kilo."},
    {"s":"A","t":"I will take one kilo, please."},
    {"s":"B","t":"Do you need anything else?"},
    {"s":"A","t":"Yes, I need some carrots."},
    {"s":"B","t":"How many do you want?"},
    {"s":"A","t":"Half a kilo, please."},
    {"s":"B","t":"Here you are. Anything else?"},
    {"s":"A","t":"No, thank you. How much is it?"},
    {"s":"B","t":"That is three dollars in total."},
    {"s":"A","t":"Here is the money. Thank you."},
    {"s":"B","t":"Thank you. Have a nice day!"}
  ]
}'::jsonb),

('dialogue', 'beginner', 'Hỏi thăm bạn bị ốm', '{
  "lines": [
    {"s":"A","t":"Hi Mai. How are you today?"},
    {"s":"B","t":"Not very good. I feel sick."},
    {"s":"A","t":"Oh no. What is wrong?"},
    {"s":"B","t":"I have a headache and a cough."},
    {"s":"A","t":"Did you see a doctor?"},
    {"s":"B","t":"Yes, I did. I have a cold."},
    {"s":"A","t":"You should rest and drink warm water."},
    {"s":"B","t":"Thank you. I will stay home today."},
    {"s":"A","t":"Do you need any help?"},
    {"s":"B","t":"No, thank you. I just need to sleep."},
    {"s":"A","t":"Okay. Get well soon!"},
    {"s":"B","t":"Thank you, my friend."}
  ]
}'::jsonb),

('dialogue', 'beginner', 'Thuê xe đạp đi dạo', '{
  "lines": [
    {"s":"A","t":"Hello. I want to rent a bike."},
    {"s":"B","t":"Sure. For how long?"},
    {"s":"A","t":"For two hours, please."},
    {"s":"B","t":"That is four dollars."},
    {"s":"A","t":"Okay. Here is the money."},
    {"s":"B","t":"Please choose a bike over there."},
    {"s":"A","t":"Can I have a blue one?"},
    {"s":"B","t":"Of course. Here is the key."},
    {"s":"A","t":"Where can I ride?"},
    {"s":"B","t":"You can ride around the lake. It is very nice."},
    {"s":"A","t":"Great. Thank you very much."},
    {"s":"B","t":"Have fun and be safe!"}
  ]
}'::jsonb),

('dialogue', 'beginner', 'Đăng ký thẻ thư viện', '{
  "lines": [
    {"s":"A","t":"Hello. I want to make a library card."},
    {"s":"B","t":"Sure. Do you live in this city?"},
    {"s":"A","t":"Yes, I do."},
    {"s":"B","t":"Please fill in this form."},
    {"s":"A","t":"Okay. Do I need a photo?"},
    {"s":"B","t":"Yes, one small photo, please."},
    {"s":"A","t":"Here is my photo and my form."},
    {"s":"B","t":"Thank you. Your card is ready."},
    {"s":"A","t":"How many books can I borrow?"},
    {"s":"B","t":"You can borrow five books for two weeks."},
    {"s":"A","t":"That is great. Thank you."},
    {"s":"B","t":"You are welcome. Enjoy reading!"}
  ]
}'::jsonb),

('dialogue', 'beginner', 'Hỏi đường ra bến xe buýt', '{
  "lines": [
    {"s":"A","t":"Excuse me, where is the bus stop?"},
    {"s":"B","t":"It is near the park."},
    {"s":"A","t":"How do I get there?"},
    {"s":"B","t":"Go straight and turn right."},
    {"s":"A","t":"Is it far?"},
    {"s":"B","t":"No, about three minutes on foot."},
    {"s":"A","t":"Which bus goes to the city center?"},
    {"s":"B","t":"Bus number ten goes there."},
    {"s":"A","t":"How much is the ticket?"},
    {"s":"B","t":"It is one dollar."},
    {"s":"A","t":"Thank you so much."},
    {"s":"B","t":"No problem. Have a good trip!"}
  ]
}'::jsonb),

('dialogue', 'beginner', 'Mua áo mới ở cửa hàng', '{
  "lines": [
    {"s":"A","t":"Hello. Can I help you?"},
    {"s":"B","t":"Yes. I am looking for a shirt."},
    {"s":"A","t":"What color do you like?"},
    {"s":"B","t":"I like blue."},
    {"s":"A","t":"What size are you?"},
    {"s":"B","t":"I am medium."},
    {"s":"A","t":"Here is a blue shirt in medium."},
    {"s":"B","t":"Can I try it on?"},
    {"s":"A","t":"Of course. The room is over there."},
    {"s":"B","t":"It fits well. How much is it?"},
    {"s":"A","t":"It is fifteen dollars."},
    {"s":"B","t":"Great. I will take it."}
  ]
}'::jsonb),

('dialogue', 'beginner', 'Gọi taxi ra sân bay', '{
  "lines": [
    {"s":"A","t":"Hello. I need a taxi, please."},
    {"s":"B","t":"Sure. Where do you want to go?"},
    {"s":"A","t":"I want to go to the airport."},
    {"s":"B","t":"What is your address?"},
    {"s":"A","t":"I am at the Sun Hotel."},
    {"s":"B","t":"A taxi will come in five minutes."},
    {"s":"A","t":"Thank you. How long is the trip?"},
    {"s":"B","t":"About thirty minutes."},
    {"s":"A","t":"How much is it?"},
    {"s":"B","t":"It is about twenty dollars."},
    {"s":"A","t":"Okay. Thank you very much."},
    {"s":"B","t":"You are welcome. Have a safe trip!"}
  ]
}'::jsonb),

('dialogue', 'beginner', 'Đổi trả hàng bị lỗi', '{
  "lines": [
    {"s":"A","t":"Hello. I want to return this cup."},
    {"s":"B","t":"What is the problem?"},
    {"s":"A","t":"It is broken."},
    {"s":"B","t":"I am sorry. Do you have the receipt?"},
    {"s":"A","t":"Yes, here it is."},
    {"s":"B","t":"Thank you. Do you want a new cup?"},
    {"s":"A","t":"Yes, please."},
    {"s":"B","t":"Here is a new one. Please check it."},
    {"s":"A","t":"It looks good. Thank you."},
    {"s":"B","t":"I am sorry for the problem."},
    {"s":"A","t":"It is okay. Thank you for your help."},
    {"s":"B","t":"You are welcome. Have a nice day!"}
  ]
}'::jsonb),

('dialogue', 'beginner', 'Hỏi mật khẩu wifi ở quán cà phê', '{
  "lines": [
    {"s":"A","t":"Excuse me, do you have wifi here?"},
    {"s":"B","t":"Yes, we do."},
    {"s":"A","t":"What is the password?"},
    {"s":"B","t":"It is on the wall behind you."},
    {"s":"A","t":"Oh, I see it now. Thank you."},
    {"s":"B","t":"Would you like to order something?"},
    {"s":"A","t":"Yes, a hot coffee, please."},
    {"s":"B","t":"With sugar or milk?"},
    {"s":"A","t":"Just a little sugar, please."},
    {"s":"B","t":"Okay. Please wait a moment."},
    {"s":"A","t":"Thank you very much."},
    {"s":"B","t":"You are welcome."}
  ]
}'::jsonb),

('dialogue', 'beginner', 'Nhờ đồng nghiệp giúp một việc nhỏ', '{
  "lines": [
    {"s":"A","t":"Hi Lan, can you help me?"},
    {"s":"B","t":"Sure. What do you need?"},
    {"s":"A","t":"Can you print this file for me?"},
    {"s":"B","t":"Of course. How many copies?"},
    {"s":"A","t":"Two copies, please."},
    {"s":"B","t":"Okay. Do you need color?"},
    {"s":"A","t":"No, black and white is fine."},
    {"s":"B","t":"Here are your copies."},
    {"s":"A","t":"Thank you so much."},
    {"s":"B","t":"No problem. Anything else?"},
    {"s":"A","t":"No, that is all. Thank you."},
    {"s":"B","t":"You are welcome."}
  ]
}'::jsonb),

('dialogue', 'beginner', 'Đặt bàn ăn tối cho hai người', '{
  "lines": [
    {"s":"A","t":"Hello. I want to book a table."},
    {"s":"B","t":"Sure. For how many people?"},
    {"s":"A","t":"For two people, please."},
    {"s":"B","t":"What time do you want?"},
    {"s":"A","t":"At seven this evening."},
    {"s":"B","t":"Okay. What is your name?"},
    {"s":"A","t":"My name is Hoa."},
    {"s":"B","t":"Do you want a table near the window?"},
    {"s":"A","t":"Yes, that would be nice."},
    {"s":"B","t":"Your table is ready at seven."},
    {"s":"A","t":"Thank you very much."},
    {"s":"B","t":"See you this evening!"}
  ]
}'::jsonb),

('dialogue', 'beginner', 'Hỏi giá phòng khách sạn', '{
  "lines": [
    {"s":"A","t":"Hello. Do you have a room for tonight?"},
    {"s":"B","t":"Yes, we do. For how many people?"},
    {"s":"A","t":"For one person."},
    {"s":"B","t":"We have a single room."},
    {"s":"A","t":"How much is it for one night?"},
    {"s":"B","t":"It is thirty dollars."},
    {"s":"A","t":"Does it have breakfast?"},
    {"s":"B","t":"Yes, breakfast is included."},
    {"s":"A","t":"Great. I will take the room."},
    {"s":"B","t":"Can I see your passport, please?"},
    {"s":"A","t":"Sure. Here you are."},
    {"s":"B","t":"Thank you. Here is your key."}
  ]
}'::jsonb),

('dialogue', 'beginner', 'Mua thuốc cảm ở hiệu thuốc', '{
  "lines": [
    {"s":"A","t":"Hello. I do not feel well."},
    {"s":"B","t":"What is the matter?"},
    {"s":"A","t":"I have a cold and a sore throat."},
    {"s":"B","t":"Do you have a fever?"},
    {"s":"A","t":"A little. I feel tired too."},
    {"s":"B","t":"You can take this cold medicine."},
    {"s":"A","t":"How many times a day?"},
    {"s":"B","t":"Two times a day, after meals."},
    {"s":"A","t":"Okay. How much is it?"},
    {"s":"B","t":"It is five dollars."},
    {"s":"A","t":"Here you are. Thank you."},
    {"s":"B","t":"Get well soon!"}
  ]
}'::jsonb)

on conflict do nothing;

-- ============================================================
-- NHÓM 2/6 — DIALOGUE | INTERMEDIATE (B1-B2) — 17 chủ đề
-- ============================================================
insert into content (type, level, topic, data) values

('dialogue', 'intermediate', 'Thảo luận chuyển sang làm việc từ xa', '{
  "lines": [
    {"s":"A","t":"Have you thought about asking to work from home two days a week?"},
    {"s":"B","t":"I have, but I''m not sure how the manager will react."},
    {"s":"A","t":"A lot of teams are doing it now, so it''s worth a try."},
    {"s":"B","t":"True. I think I''m actually more focused at home."},
    {"s":"A","t":"Same here. There are fewer interruptions in the morning."},
    {"s":"B","t":"My only worry is staying connected with the team."},
    {"s":"A","t":"We could set a short video call every morning."},
    {"s":"B","t":"That''s a good idea. It keeps everyone updated."},
    {"s":"A","t":"You should prepare some numbers to show it works."},
    {"s":"B","t":"Right. I''ll track my tasks for two weeks first."},
    {"s":"A","t":"Then present it politely and let the results speak."},
    {"s":"B","t":"Thanks. I feel more confident about asking now."}
  ]
}'::jsonb),

('dialogue', 'intermediate', 'Phỏng vấn xin việc vị trí marketing', '{
  "lines": [
    {"s":"A","t":"Thanks for coming in. Can you tell me about your background?"},
    {"s":"B","t":"Of course. I''ve worked in digital marketing for three years."},
    {"s":"A","t":"What kind of campaigns have you managed?"},
    {"s":"B","t":"Mostly social media and email campaigns for small brands."},
    {"s":"A","t":"How do you measure whether a campaign is successful?"},
    {"s":"B","t":"I look at reach, engagement, and of course the sales it brings."},
    {"s":"A","t":"Can you give me an example of a project you''re proud of?"},
    {"s":"B","t":"I grew one client''s online sales by forty percent in six months."},
    {"s":"A","t":"Impressive. How do you handle a campaign that isn''t working?"},
    {"s":"B","t":"I check the data, test new ideas, and adjust quickly."},
    {"s":"A","t":"Great. Do you have any questions for me?"},
    {"s":"B","t":"Yes. What would success look like in the first three months?"}
  ]
}'::jsonb),

('dialogue', 'intermediate', 'Thương lượng giá thuê căn hộ', '{
  "lines": [
    {"s":"A","t":"The apartment is lovely, but the rent is a bit high for me."},
    {"s":"B","t":"I understand. What price did you have in mind?"},
    {"s":"A","t":"Could you lower it by fifty dollars a month?"},
    {"s":"B","t":"That''s quite a lot. The location is very convenient."},
    {"s":"A","t":"It is, but I''m ready to sign a one-year contract."},
    {"s":"B","t":"A longer contract does help. Let me think."},
    {"s":"A","t":"I would also pay three months in advance."},
    {"s":"B","t":"In that case, I could reduce it by thirty dollars."},
    {"s":"A","t":"Could we meet in the middle at forty?"},
    {"s":"B","t":"All right, forty dollars off with the advance payment."},
    {"s":"A","t":"Perfect. Thank you for being flexible."},
    {"s":"B","t":"No problem. I''ll prepare the contract today."}
  ]
}'::jsonb),

('dialogue', 'intermediate', 'Lên kế hoạch tiết kiệm mua nhà', '{
  "lines": [
    {"s":"A","t":"We really should start saving for a house."},
    {"s":"B","t":"I agree, but where do we even begin?"},
    {"s":"A","t":"First, let''s see how much we spend each month."},
    {"s":"B","t":"I think we waste a lot on eating out."},
    {"s":"A","t":"Right. If we cook more, we could save a few hundred."},
    {"s":"B","t":"We could also open a separate savings account."},
    {"s":"A","t":"Good idea. We won''t touch that money."},
    {"s":"B","t":"How much do we need for a deposit?"},
    {"s":"A","t":"Probably about twenty percent of the price."},
    {"s":"B","t":"That will take a few years, but it''s possible."},
    {"s":"A","t":"Let''s set a monthly goal and check it together."},
    {"s":"B","t":"Agreed. Having a clear plan makes it feel real."}
  ]
}'::jsonb),

('dialogue', 'intermediate', 'Giải quyết mâu thuẫn với hàng xóm ồn ào', '{
  "lines": [
    {"s":"A","t":"Hi, I''m your neighbor from the flat below. Do you have a minute?"},
    {"s":"B","t":"Sure. Is everything okay?"},
    {"s":"A","t":"I wanted to talk about the noise late at night."},
    {"s":"B","t":"Oh, I''m sorry. I didn''t realize it was a problem."},
    {"s":"A","t":"It''s mostly the music after eleven. It''s hard to sleep."},
    {"s":"B","t":"I understand. I''ll use headphones from now on."},
    {"s":"A","t":"That would help a lot. Thank you."},
    {"s":"B","t":"Please tell me if it happens again."},
    {"s":"A","t":"I will. I didn''t want to cause any trouble."},
    {"s":"B","t":"Not at all. I''m glad you spoke to me directly."},
    {"s":"A","t":"Me too. It''s better than getting angry."},
    {"s":"B","t":"Agreed. Let''s keep things friendly."}
  ]
}'::jsonb),

('dialogue', 'intermediate', 'Chọn khóa học tiếng Anh buổi tối', '{
  "lines": [
    {"s":"A","t":"I want to improve my English, but I don''t know which class to take."},
    {"s":"B","t":"What is your main goal, speaking or exams?"},
    {"s":"A","t":"Mostly speaking. I get nervous in meetings."},
    {"s":"B","t":"Then look for a class with small groups and lots of practice."},
    {"s":"A","t":"There''s an evening course near my office."},
    {"s":"B","t":"How many students are in each class?"},
    {"s":"A","t":"About eight, and it meets twice a week."},
    {"s":"B","t":"That sounds ideal for speaking practice."},
    {"s":"A","t":"The only problem is finishing work on time."},
    {"s":"B","t":"Could you take an online option on busy days?"},
    {"s":"A","t":"Maybe. I''ll ask if they allow that."},
    {"s":"B","t":"Good. Being consistent matters more than anything."}
  ]
}'::jsonb),

('dialogue', 'intermediate', 'Bàn về việc nuôi thú cưng trong chung cư', '{
  "lines": [
    {"s":"A","t":"I''m thinking of getting a small dog for the apartment."},
    {"s":"B","t":"That''s exciting, but is it allowed in your building?"},
    {"s":"A","t":"Pets are allowed, but there are some rules."},
    {"s":"B","t":"Do you have enough space and time for a dog?"},
    {"s":"A","t":"That''s my worry. I work long hours."},
    {"s":"B","t":"A dog needs walks and company every day."},
    {"s":"A","t":"Maybe a cat would be easier to care for."},
    {"s":"B","t":"Cats are more independent, that''s true."},
    {"s":"A","t":"But I really love the idea of walking a dog."},
    {"s":"B","t":"Then think about a dog walker or a neighbor''s help."},
    {"s":"A","t":"Good point. I shouldn''t decide too quickly."},
    {"s":"B","t":"Exactly. A pet is a long commitment."}
  ]
}'::jsonb),

('dialogue', 'intermediate', 'Đổi lịch họp với khách hàng', '{
  "lines": [
    {"s":"A","t":"Hello, I''m calling about our meeting on Thursday."},
    {"s":"B","t":"Yes, is everything all right?"},
    {"s":"A","t":"Something urgent came up, and I need to reschedule."},
    {"s":"B","t":"I see. When would suit you instead?"},
    {"s":"A","t":"Would Friday afternoon work for you?"},
    {"s":"B","t":"Friday morning is better, if that''s possible."},
    {"s":"A","t":"Morning is fine. Shall we say ten o''clock?"},
    {"s":"B","t":"Ten works well. Same meeting room?"},
    {"s":"A","t":"Yes, the same room. I''ll send a new invite."},
    {"s":"B","t":"Thank you for letting me know early."},
    {"s":"A","t":"Of course. I''m sorry for the change."},
    {"s":"B","t":"No problem at all. See you Friday."}
  ]
}'::jsonb),

('dialogue', 'intermediate', 'Góp ý cải thiện dịch vụ nhà hàng', '{
  "lines": [
    {"s":"A","t":"Excuse me, could I share some feedback about my meal?"},
    {"s":"B","t":"Of course. We always welcome feedback."},
    {"s":"A","t":"The food was delicious, but the service was quite slow."},
    {"s":"B","t":"I''m sorry about that. We''re short of staff tonight."},
    {"s":"A","t":"I understand. Maybe you could tell customers about the wait."},
    {"s":"B","t":"That''s a fair point. We should manage expectations."},
    {"s":"A","t":"A small note on the menu would help."},
    {"s":"B","t":"Thank you. I''ll pass this to the manager."},
    {"s":"A","t":"I really do like this place, so I wanted to help."},
    {"s":"B","t":"We appreciate honest customers like you."},
    {"s":"A","t":"Thanks for listening so kindly."},
    {"s":"B","t":"Please come again. Next time will be better."}
  ]
}'::jsonb),

('dialogue', 'intermediate', 'Chuẩn bị cho buổi thuyết trình quan trọng', '{
  "lines": [
    {"s":"A","t":"My big presentation is tomorrow and I''m nervous."},
    {"s":"B","t":"You''ll be fine. Have you practiced out loud?"},
    {"s":"A","t":"A few times, but I keep forgetting the middle part."},
    {"s":"B","t":"Try using just a few key words on each slide."},
    {"s":"A","t":"That might stop me from reading everything."},
    {"s":"B","t":"Exactly. Speak to the audience, not the screen."},
    {"s":"A","t":"What if someone asks a hard question?"},
    {"s":"B","t":"It''s okay to pause and think before you answer."},
    {"s":"A","t":"That''s reassuring. I always feel I must reply instantly."},
    {"s":"B","t":"Take your time. It shows confidence, not weakness."},
    {"s":"A","t":"Thanks. I''ll do one more practice tonight."},
    {"s":"B","t":"Good luck. You know your topic well."}
  ]
}'::jsonb),

('dialogue', 'intermediate', 'So sánh mua xe cũ và xe mới', '{
  "lines": [
    {"s":"A","t":"I can''t decide between a new car and a used one."},
    {"s":"B","t":"What matters most to you, price or peace of mind?"},
    {"s":"A","t":"Price, honestly. A new car is expensive."},
    {"s":"B","t":"A used car saves money, but it may need repairs."},
    {"s":"A","t":"That''s true. Repairs can add up quickly."},
    {"s":"B","t":"A new car has a warranty, so you feel safer."},
    {"s":"A","t":"But it loses value fast in the first year."},
    {"s":"B","t":"Right. A two or three year old car is a good middle choice."},
    {"s":"A","t":"I hadn''t thought about that option."},
    {"s":"B","t":"Get a mechanic to check it before you buy."},
    {"s":"A","t":"Good advice. That could save me trouble later."},
    {"s":"B","t":"Take your time. It''s a big decision."}
  ]
}'::jsonb),

('dialogue', 'intermediate', 'Bàn kế hoạch nghỉ phép dài ngày', '{
  "lines": [
    {"s":"A","t":"I''m planning to take two weeks off next month."},
    {"s":"B","t":"Nice! Do you have a destination in mind?"},
    {"s":"A","t":"I''d love to travel around the north by train."},
    {"s":"B","t":"That sounds relaxing. Have you told your manager?"},
    {"s":"A","t":"Not yet. I want to finish my projects first."},
    {"s":"B","t":"Good idea. It makes the request easier to approve."},
    {"s":"A","t":"I''ll also prepare notes so my work is covered."},
    {"s":"B","t":"That''s very professional. Who will handle emails?"},
    {"s":"A","t":"I''ll ask a colleague and set an away message."},
    {"s":"B","t":"Perfect. Then you can truly switch off."},
    {"s":"A","t":"That''s the goal. I really need a proper break."},
    {"s":"B","t":"You deserve it. Enjoy the trip!"}
  ]
}'::jsonb),

('dialogue', 'intermediate', 'Xử lý đơn hàng giao trễ với khách', '{
  "lines": [
    {"s":"A","t":"Hello, I''m calling about my order. It''s three days late."},
    {"s":"B","t":"I''m very sorry. Let me check your order number."},
    {"s":"A","t":"It''s 4-5-2-1."},
    {"s":"B","t":"Thank you. I can see there was a delay at the warehouse."},
    {"s":"A","t":"I needed it for a gift this weekend."},
    {"s":"B","t":"I understand. I''ll upgrade you to express delivery for free."},
    {"s":"A","t":"When will it arrive then?"},
    {"s":"B","t":"It should reach you by tomorrow evening."},
    {"s":"A","t":"All right. That would still work."},
    {"s":"B","t":"Again, I apologize for the inconvenience."},
    {"s":"A","t":"Thank you for solving it quickly."},
    {"s":"B","t":"You''re welcome. I''ll email you the tracking link."}
  ]
}'::jsonb),

('dialogue', 'intermediate', 'Thảo luận chế độ ăn uống lành mạnh', '{
  "lines": [
    {"s":"A","t":"I want to eat healthier, but I don''t know where to start."},
    {"s":"B","t":"Small changes work best. What''s your biggest weakness?"},
    {"s":"A","t":"Definitely sugary drinks. I have two a day."},
    {"s":"B","t":"Try replacing one with water or tea first."},
    {"s":"A","t":"That sounds doable. What about snacks?"},
    {"s":"B","t":"Keep fruit and nuts nearby instead of chips."},
    {"s":"A","t":"I also skip breakfast a lot."},
    {"s":"B","t":"That''s not ideal. Even a banana is better than nothing."},
    {"s":"A","t":"Should I cut out rice completely?"},
    {"s":"B","t":"No, balance matters more than cutting things out."},
    {"s":"A","t":"That''s a relief. I love rice too much."},
    {"s":"B","t":"Just watch your portions and you''ll be fine."}
  ]
}'::jsonb),

('dialogue', 'intermediate', 'Lên kế hoạch tổ chức sinh nhật bất ngờ', '{
  "lines": [
    {"s":"A","t":"Let''s throw a surprise party for Hoa next Saturday."},
    {"s":"B","t":"Great idea! Where should we have it?"},
    {"s":"A","t":"Maybe at my place. It''s big enough for ten people."},
    {"s":"B","t":"Perfect. How do we keep it a secret?"},
    {"s":"A","t":"I''ll tell her we''re just having a quiet dinner."},
    {"s":"B","t":"Clever. I''ll take care of the cake and drinks."},
    {"s":"A","t":"I''ll message the others so everyone arrives early."},
    {"s":"B","t":"What time should we tell them to come?"},
    {"s":"A","t":"By six, and she''ll arrive at half past."},
    {"s":"B","t":"Should we collect money for a group gift?"},
    {"s":"A","t":"Yes, I''ll start a small fund tonight."},
    {"s":"B","t":"This is going to be so much fun!"}
  ]
}'::jsonb),

('dialogue', 'intermediate', 'Tư vấn chọn điện thoại phù hợp', '{
  "lines": [
    {"s":"A","t":"I need a new phone, but there are too many choices."},
    {"s":"B","t":"What do you use your phone for the most?"},
    {"s":"A","t":"Mainly photos, messaging, and a bit of gaming."},
    {"s":"B","t":"Then a good camera and battery should be your priority."},
    {"s":"A","t":"My budget is around four hundred dollars."},
    {"s":"B","t":"That''s enough for a solid mid-range model."},
    {"s":"A","t":"Do I really need the latest one?"},
    {"s":"B","t":"Not at all. Last year''s model is often much cheaper."},
    {"s":"A","t":"That makes sense. What about storage?"},
    {"s":"B","t":"Get at least 128 gigabytes if you take many photos."},
    {"s":"A","t":"Thanks. That narrows it down a lot."},
    {"s":"B","t":"Read a few reviews before you decide."}
  ]
}'::jsonb),

('dialogue', 'intermediate', 'Bàn về việc học thêm kỹ năng mới sau giờ làm', '{
  "lines": [
    {"s":"A","t":"I feel like I should learn a new skill after work."},
    {"s":"B","t":"That''s a great mindset. What are you interested in?"},
    {"s":"A","t":"Maybe coding or graphic design."},
    {"s":"B","t":"Both are useful. Which one excites you more?"},
    {"s":"A","t":"Design, I think. I enjoy visual things."},
    {"s":"B","t":"Then start with a short online course."},
    {"s":"A","t":"My worry is finding the time and energy."},
    {"s":"B","t":"Even thirty minutes a day adds up over months."},
    {"s":"A","t":"That''s true. I waste that much on my phone anyway."},
    {"s":"B","t":"Exactly. Set a fixed time and treat it seriously."},
    {"s":"A","t":"I''ll try three evenings a week to start."},
    {"s":"B","t":"Perfect. Small steps lead to real progress."}
  ]
}'::jsonb)

on conflict do nothing;

-- ============================================================
-- NHÓM 3/6 — DIALOGUE | ADVANCED (C1-C2) — 16 chủ đề
-- ============================================================
insert into content (type, level, topic, data) values

('dialogue', 'advanced', 'Tranh luận về trí tuệ nhân tạo thay thế việc làm', '{
  "lines": [
    {"s":"A","t":"I''m convinced automation will displace far more jobs than it creates this time."},
    {"s":"B","t":"That fear resurfaces with every technological wave, yet employment keeps recovering."},
    {"s":"A","t":"Previous waves automated muscle; this one automates judgment, which is a different order of threat."},
    {"s":"B","t":"Judgment in narrow domains, perhaps, but broad reasoning remains stubbornly human."},
    {"s":"A","t":"For now. The pace of improvement is compressing the timeline dramatically."},
    {"s":"B","t":"Speed alone doesn''t guarantee competence. Deployment lags far behind the demos."},
    {"s":"A","t":"Even partial deployment can hollow out entire tiers of white-collar work."},
    {"s":"B","t":"Or it can free those workers for tasks machines still handle poorly."},
    {"s":"A","t":"That optimism assumes retraining happens fast enough, which history rarely supports."},
    {"s":"B","t":"Then the real debate isn''t about technology, but about our willingness to invest in people."},
    {"s":"A","t":"On that, I''ll concede, the policy response matters more than the algorithms themselves."},
    {"s":"B","t":"Precisely. The tool is neutral; the disruption is a political choice."}
  ]
}'::jsonb),

('dialogue', 'advanced', 'Bàn về đánh thuế người giàu cao hơn', '{
  "lines": [
    {"s":"A","t":"Raising taxes on the very wealthy seems the obvious way to fund public services."},
    {"s":"B","t":"Obvious, yet the revenue often falls short of the projections politicians promise."},
    {"s":"A","t":"That''s because loopholes are left intact, not because the principle is flawed."},
    {"s":"B","t":"Close the loopholes and capital simply relocates to friendlier jurisdictions."},
    {"s":"A","t":"Mobility is exaggerated. Most fortunes are tied to assets that can''t just fly away."},
    {"s":"B","t":"Some can''t, but the marginal investor and entrepreneur are precisely the mobile ones."},
    {"s":"A","t":"So we abandon fairness out of fear that a few might leave?"},
    {"s":"B","t":"Not fairness, efficiency. A tax that raises little while chilling investment helps no one."},
    {"s":"A","t":"Then design it around wealth that''s genuinely immobile, like land and property."},
    {"s":"B","t":"Now that''s a proposal I can engage with seriously."},
    {"s":"A","t":"Good. The disagreement was never about the goal, only the instrument."},
    {"s":"B","t":"Agreed. Broad slogans obscure what careful design could actually achieve."}
  ]
}'::jsonb),

('dialogue', 'advanced', 'Tranh luận mạng xã hội và sức khỏe tinh thần', '{
  "lines": [
    {"s":"A","t":"The evidence linking heavy social media use to anxiety is becoming hard to ignore."},
    {"s":"B","t":"Correlation, though. Anxious people may simply gravitate toward these platforms."},
    {"s":"A","t":"Several longitudinal studies now suggest the causal arrow points both ways."},
    {"s":"B","t":"Both ways weakens the case for blaming the platforms alone."},
    {"s":"A","t":"It doesn''t absolve them; the design deliberately exploits our need for validation."},
    {"s":"B","t":"Every medium competes for attention. Newspapers sensationalized long before apps did."},
    {"s":"A","t":"Newspapers didn''t follow you into bed at two in the morning."},
    {"s":"B","t":"Fair, the intimacy and constancy are genuinely new and worth scrutiny."},
    {"s":"A","t":"So we agree some regulation of addictive features is justified?"},
    {"s":"B","t":"Regulation of the mechanics, yes, but not censorship of the content."},
    {"s":"A","t":"That''s a distinction I can wholeheartedly support."},
    {"s":"B","t":"Then we''ve found more common ground than the headlines would suggest."}
  ]
}'::jsonb),

('dialogue', 'advanced', 'Bàn về du lịch vũ trụ thương mại', '{
  "lines": [
    {"s":"A","t":"Commercial space tourism strikes me as an obscene use of resources."},
    {"s":"B","t":"Every frontier technology begins as a plaything for the rich before it democratizes."},
    {"s":"A","t":"Aviation at least promised mass transport. Who does a suborbital joyride serve?"},
    {"s":"B","t":"The revenue funds the very research that could lower costs for everyone."},
    {"s":"A","t":"A convenient justification for what is essentially luxury spectacle."},
    {"s":"B","t":"Spectacle has always financed exploration. Patrons funded voyages for prestige too."},
    {"s":"A","t":"And often at tremendous human and environmental cost."},
    {"s":"B","t":"Which is why oversight matters, not prohibition of the enterprise itself."},
    {"s":"A","t":"I''d accept it more readily if the emissions were honestly accounted for."},
    {"s":"B","t":"On transparency, we agree entirely. Hidden costs corrupt any cost-benefit claim."},
    {"s":"A","t":"So let the market proceed, but under a clear environmental ledger."},
    {"s":"B","t":"Yes. Ambition and accountability needn''t be mutually exclusive."}
  ]
}'::jsonb),

('dialogue', 'advanced', 'Tranh luận nên tiến tới xã hội không tiền mặt', '{
  "lines": [
    {"s":"A","t":"A fully cashless society would cut crime and make transactions effortless."},
    {"s":"B","t":"It would also hand unprecedented surveillance power to banks and governments."},
    {"s":"A","t":"Most people already pay digitally; the privacy is largely gone anyway."},
    {"s":"B","t":"Largely isn''t entirely. Cash remains the last untraceable option for ordinary people."},
    {"s":"A","t":"Untraceable also means convenient for tax evasion and exploitation."},
    {"s":"B","t":"True, yet the elderly and the poor rely disproportionately on physical money."},
    {"s":"A","t":"A transition period with support could address that inclusion gap."},
    {"s":"B","t":"Support programs are promised often and delivered rarely."},
    {"s":"A","t":"So your objection is really about trust in institutions, not cash itself."},
    {"s":"B","t":"Partly, yes. Remove the fallback and you remove the citizen''s leverage."},
    {"s":"A","t":"Then perhaps the answer is reducing cash, not abolishing it."},
    {"s":"B","t":"A pragmatic middle path. Optionality itself has real democratic value."}
  ]
}'::jsonb),

('dialogue', 'advanced', 'Bàn về đạo đức trong chỉnh sửa gen người', '{
  "lines": [
    {"s":"A","t":"Editing genes to eliminate hereditary disease seems an unambiguous good."},
    {"s":"B","t":"Eliminating disease, perhaps. But the same tools invite enhancement."},
    {"s":"A","t":"We can draw a line between therapy and enhancement."},
    {"s":"B","t":"Can we? The boundary blurs the moment you define what counts as normal."},
    {"s":"A","t":"Medicine already makes such judgments every day without collapsing into eugenics."},
    {"s":"B","t":"Heritable edits are different; the consequences propagate to people who never consented."},
    {"s":"A","t":"So does every environmental and social choice we impose on future generations."},
    {"s":"B","t":"None so precise or irreversible at the level of the genome."},
    {"s":"A","t":"Which argues for caution and oversight, not an outright ban."},
    {"s":"B","t":"I could accept strict, transparent trials for severe conditions only."},
    {"s":"A","t":"Then we agree the technology demands humility, not prohibition."},
    {"s":"B","t":"Humility, and a very slow hand. The temptation to overreach is enormous."}
  ]
}'::jsonb),

('dialogue', 'advanced', 'Tranh luận giáo dục đại học miễn phí', '{
  "lines": [
    {"s":"A","t":"Free university education should be treated as a basic public right."},
    {"s":"B","t":"A noble aim, but someone still pays; the cost merely shifts to taxpayers."},
    {"s":"A","t":"Society already funds schools and roads. Higher education is no different."},
    {"s":"B","t":"Roads benefit everyone. A degree benefits the graduate most directly."},
    {"s":"A","t":"Educated citizens raise productivity and civic participation for all."},
    {"s":"B","t":"Then subsidize fields with clear public returns, not every degree indiscriminately."},
    {"s":"A","t":"Ranking degrees by value invites bureaucrats to pick winners badly."},
    {"s":"B","t":"And unlimited free tuition invites universities to inflate costs endlessly."},
    {"s":"A","t":"Cost control and access aren''t mutually exclusive goals."},
    {"s":"B","t":"Agreed, if we pair free access with genuine accountability for institutions."},
    {"s":"A","t":"So the fight is about design and discipline, not the principle."},
    {"s":"B","t":"Exactly. I oppose waste, not opportunity."}
  ]
}'::jsonb),

('dialogue', 'advanced', 'Bàn về năng lượng hạt nhân và biến đổi khí hậu', '{
  "lines": [
    {"s":"A","t":"If we''re serious about climate, nuclear power has to be part of the mix."},
    {"s":"B","t":"The waste problem alone should give us pause before expanding it."},
    {"s":"A","t":"Modern reactors produce far less waste, and it''s containable for centuries."},
    {"s":"B","t":"Containable in theory. In practice, no country has a permanent repository running smoothly."},
    {"s":"A","t":"Meanwhile fossil fuels release their waste directly into the atmosphere we breathe."},
    {"s":"B","t":"A fair comparison, though renewables avoid both problems entirely."},
    {"s":"A","t":"Renewables are intermittent; nuclear provides the steady baseload they lack."},
    {"s":"B","t":"Storage technology is closing that gap faster than new reactors can be built."},
    {"s":"A","t":"Faster, yet not fast enough to retire coal on the timeline we need."},
    {"s":"B","t":"So you''d treat nuclear as a bridge rather than a destination."},
    {"s":"A","t":"Precisely. A transitional tool while storage matures."},
    {"s":"B","t":"Framed that way, I find the argument far more persuasive."}
  ]
}'::jsonb),

('dialogue', 'advanced', 'Tranh luận quyền riêng tư và giám sát an ninh', '{
  "lines": [
    {"s":"A","t":"Expanded surveillance is a reasonable price for preventing serious attacks."},
    {"s":"B","t":"That bargain always sounds reasonable until the powers are quietly misused."},
    {"s":"A","t":"Oversight and warrants exist precisely to prevent that misuse."},
    {"s":"B","t":"Oversight bodies are frequently understaffed and outpaced by the agencies they watch."},
    {"s":"A","t":"So we strengthen oversight rather than blind ourselves to real threats."},
    {"s":"B","t":"Even perfect oversight can''t undo the chilling effect of being constantly watched."},
    {"s":"A","t":"Most people never feel watched in their daily lives."},
    {"s":"B","t":"The marginalized and the dissenting feel it acutely, and they matter too."},
    {"s":"A","t":"Targeted surveillance of genuine suspects addresses that concern."},
    {"s":"B","t":"If it stays targeted. The historical drift is always toward mass collection."},
    {"s":"A","t":"Then hard legal limits, not vague guidelines, are the real safeguard."},
    {"s":"B","t":"On enforceable limits, we finally agree. Trust must be structural, not assumed."}
  ]
}'::jsonb),

('dialogue', 'advanced', 'Bàn về thu nhập cơ bản phổ quát', '{
  "lines": [
    {"s":"A","t":"A universal basic income could provide a floor of dignity in an uncertain economy."},
    {"s":"B","t":"A generous idea, but paying everyone regardless of need seems deeply inefficient."},
    {"s":"A","t":"Universality removes the stigma and the costly bureaucracy of means testing."},
    {"s":"B","t":"It also sends money to people who plainly don''t require it."},
    {"s":"A","t":"You can claw that back through progressive taxation afterward."},
    {"s":"B","t":"Then you''ve reinvented targeted welfare with extra steps."},
    {"s":"A","t":"Not quite. The guarantee itself changes people''s willingness to take risks and retrain."},
    {"s":"B","t":"Pilot studies show modest effects on work, which cuts both ways."},
    {"s":"A","t":"Modest is not the collapse in labor that critics predicted."},
    {"s":"B","t":"True, the doomsday scenario hasn''t materialized in the trials."},
    {"s":"A","t":"So the honest debate is about cost and scale, not human laziness."},
    {"s":"B","t":"Agreed. The moral panic obscures what is really a fiscal question."}
  ]
}'::jsonb),

('dialogue', 'advanced', 'Bàn về bảo tồn ngôn ngữ thiểu số', '{
  "lines": [
    {"s":"A","t":"When a minority language dies, we lose an entire way of seeing the world."},
    {"s":"B","t":"A romantic notion, but speakers often abandon these languages by choice for opportunity."},
    {"s":"A","t":"Choice made under economic pressure isn''t entirely free."},
    {"s":"B","t":"Still, pouring resources into languages with few speakers has real trade-offs."},
    {"s":"A","t":"Documentation is cheap compared to the irreversible loss of losing them."},
    {"s":"B","t":"Documentation, yes. Enforced daily use is another matter entirely."},
    {"s":"A","t":"No one proposes enforcement, only genuine options in schools and media."},
    {"s":"B","t":"Options I can support, provided they don''t crowd out shared national languages."},
    {"s":"A","t":"Bilingualism enriches rather than competes, as the research consistently shows."},
    {"s":"B","t":"Fair. The cognitive benefits are hard to dispute."},
    {"s":"A","t":"So we agree preservation and opportunity can coexist."},
    {"s":"B","t":"We do, as long as the community itself leads the effort."}
  ]
}'::jsonb),

('dialogue', 'advanced', 'Tranh luận cấm quảng cáo đồ ăn nhanh', '{
  "lines": [
    {"s":"A","t":"Banning fast-food advertising to children is a justified public health measure."},
    {"s":"B","t":"It''s also a slippery step toward policing every persuasive message."},
    {"s":"A","t":"We already restrict tobacco and alcohol ads without society collapsing."},
    {"s":"B","t":"Those cause direct harm. A burger in moderation does not."},
    {"s":"A","t":"The issue is the relentless volume aimed at people too young to resist it."},
    {"s":"B","t":"Then teach media literacy rather than removing the speech entirely."},
    {"s":"A","t":"Literacy helps, but it can''t match billion-dollar marketing budgets."},
    {"s":"B","t":"So the real grievance is asymmetry of resources, not advertising as such."},
    {"s":"A","t":"Precisely, and regulation is how democracies correct such asymmetries."},
    {"s":"B","t":"I could accept limits during children''s programming specifically."},
    {"s":"A","t":"That narrower measure is exactly what I''m advocating."},
    {"s":"B","t":"Then we''re closer than our opening positions suggested."}
  ]
}'::jsonb),

('dialogue', 'advanced', 'Bàn về đô thị hóa và mất đất nông nghiệp', '{
  "lines": [
    {"s":"A","t":"Unchecked urban sprawl is quietly consuming our best farmland."},
    {"s":"B","t":"Cities have to grow somewhere as populations rise."},
    {"s":"A","t":"They can grow upward instead of outward across fertile plains."},
    {"s":"B","t":"Dense vertical growth is expensive and politically unpopular."},
    {"s":"A","t":"Cheaper than importing all our food once the soil is paved over."},
    {"s":"B","t":"Modern agriculture is productive enough to absorb some loss of land."},
    {"s":"A","t":"Until climate shocks make that thin margin dangerous."},
    {"s":"B","t":"A fair point. Resilience argues for protecting productive acreage."},
    {"s":"A","t":"So we agree zoning should treat prime farmland as strategic infrastructure."},
    {"s":"B","t":"Strategic, yes, but not frozen against all development forever."},
    {"s":"A","t":"Balanced protection, then, guided by soil quality rather than convenience."},
    {"s":"B","t":"That framing I can endorse without hesitation."}
  ]
}'::jsonb),

('dialogue', 'advanced', 'Tranh luận nghệ thuật do AI tạo ra', '{
  "lines": [
    {"s":"A","t":"I struggle to call something art when a machine generated it from a prompt."},
    {"s":"B","t":"Yet the prompt, the curation, and the intent are all human contributions."},
    {"s":"A","t":"Thin contributions compared to years of learning a craft."},
    {"s":"B","t":"Photography faced the same accusation and is now unquestioned as art."},
    {"s":"A","t":"A camera still records reality; these models remix the labor of countless artists."},
    {"s":"B","t":"So your objection is really about consent and attribution, not creativity."},
    {"s":"A","t":"Both, honestly. The aesthetic and the ethical concerns are entangled."},
    {"s":"B","t":"Then let''s separate them. Fair compensation is a solvable policy problem."},
    {"s":"A","t":"And the aesthetic question?"},
    {"s":"B","t":"That the public will settle over time, as it always has with new media."},
    {"s":"A","t":"Perhaps. I''d feel better if the training were transparent and consensual."},
    {"s":"B","t":"On that, we stand firmly on the same side."}
  ]
}'::jsonb),

('dialogue', 'advanced', 'Bàn về trách nhiệm môi trường của doanh nghiệp', '{
  "lines": [
    {"s":"A","t":"Corporations should be legally bound to their environmental promises, not just their marketing."},
    {"s":"B","t":"Legally binding vague pledges would drown firms in litigation."},
    {"s":"A","t":"Then require specific, measurable targets that courts can actually assess."},
    {"s":"B","t":"Specific targets can become straitjackets when technology and markets shift."},
    {"s":"A","t":"Flexibility too often becomes an excuse for indefinite delay."},
    {"s":"B","t":"And rigid mandates can push production to countries with weaker rules."},
    {"s":"A","t":"Which is why standards should travel with trade agreements."},
    {"s":"B","t":"An elegant idea, though enforcement across borders is notoriously weak."},
    {"s":"A","t":"Weak, but improving. Disclosure requirements are already reshaping behavior."},
    {"s":"B","t":"Transparency I''ll grant you. Sunlight does change how firms act."},
    {"s":"A","t":"So mandatory disclosure is our shared minimum."},
    {"s":"B","t":"Agreed. Start there, and let accountability build from evidence."}
  ]
}'::jsonb),

('dialogue', 'advanced', 'Tranh luận toàn cầu hóa và văn hóa địa phương', '{
  "lines": [
    {"s":"A","t":"Globalization is steadily flattening the world''s distinct local cultures."},
    {"s":"B","t":"Or it''s exposing them to wider audiences that keep them alive."},
    {"s":"A","t":"Exposure often means commodification, reducing traditions to souvenirs."},
    {"s":"B","t":"Yet the same flows let a small cuisine or craft find global admirers."},
    {"s":"A","t":"Admirers who reshape it to suit their own tastes."},
    {"s":"B","t":"Cultures have always borrowed and adapted; purity is a myth."},
    {"s":"A","t":"There''s a difference between organic exchange and market homogenization."},
    {"s":"B","t":"Agreed, though drawing that line precisely is genuinely difficult."},
    {"s":"A","t":"Which is why local communities should control how their heritage is shared."},
    {"s":"B","t":"Community agency, yes. That reframes globalization as negotiation, not invasion."},
    {"s":"A","t":"Exactly my point. The problem is power, not contact itself."},
    {"s":"B","t":"Then we largely agree once the slogans are set aside."}
  ]
}'::jsonb)

on conflict do nothing;

-- ============================================================
-- NHÓM 4/6 — LISTENING | BEGINNER (A1-A2) — 17 chủ đề
-- ============================================================
insert into content (type, level, topic, data) values

('listening', 'beginner', 'Một ngày ở trường của em', '{
  "text": "My name is Linh. I am a student. Every morning I get up at six. I brush my teeth and eat breakfast with my family. Then I go to school by bike. My school is not far from my house. Classes start at seven. My favorite subject is English. I like to read and speak English with my friends. At ten we have a short break. I eat a snack and play in the yard. Lunch is at twelve. The food at school is simple but good. In the afternoon we have math and art. I love drawing pictures of animals. School finishes at four. After that I go home and do my homework. In the evening I help my mother cook dinner. I go to bed at nine. I am happy at school because I learn new things every day."
}'::jsonb),

('listening', 'beginner', 'Con mèo cưng của gia đình', '{
  "text": "We have a cat at home. Her name is Mimi. She is small and white with black feet. Mimi is two years old. She is very cute and friendly. Every morning she sits by the window. She likes to watch the birds outside. Mimi loves to eat fish and drink milk. She sleeps a lot during the day. Her favorite place is a soft box in the living room. In the evening she plays with a ball. Sometimes she runs after her own tail. That is very funny. My little sister loves Mimi very much. She gives the cat food every day. Mimi is quiet and clean. She never makes trouble. When I am sad, Mimi sits next to me. She makes me feel happy. I love our cat. She is a real member of our family."
}'::jsonb),

('listening', 'beginner', 'Chuyến đi thăm ông bà ở quê', '{
  "text": "Last weekend my family went to the countryside. We visited my grandparents. They live in a small village near a river. We took a bus for two hours. The village is quiet and green. My grandparents have a big garden. They grow vegetables and fruit. My grandmother made a special lunch for us. We ate rice, fish, and fresh vegetables. It was delicious. After lunch, my grandfather showed me his chickens. I gave them some rice. They were very hungry. In the afternoon, we walked along the river. The water was clean and cool. My little brother and I played with a kite. The sky was blue and the wind was strong. In the evening, we sat together and talked. My grandparents told us old stories. I love visiting them. The countryside is peaceful and beautiful."
}'::jsonb),

('listening', 'beginner', 'Bữa sáng yêu thích của tôi', '{
  "text": "Breakfast is my favorite meal of the day. I always eat breakfast at home. My favorite breakfast is bread with eggs. I also drink a glass of warm milk. Sometimes I eat noodles with my family. On Sunday, my mother makes pancakes. They are sweet and soft. I put a little honey on them. I love them very much. Breakfast gives me energy for the day. When I eat well, I feel happy and strong. My father drinks coffee every morning. My little sister likes fruit and yogurt. We eat together at the table. We talk about our plans for the day. Breakfast is a good time for our family. I never skip breakfast because I get hungry at school. A good breakfast helps me study well. I think breakfast is important for everyone."
}'::jsonb),

('listening', 'beginner', 'Đi chợ cùng mẹ', '{
  "text": "On Saturday morning, I go to the market with my mother. The market is near our house. It is big and busy. There are many people and many colors. We buy fresh food for the week. First, we buy vegetables. My mother chooses green ones. Then we buy fruit. I love oranges and bananas. Next, we go to the fish shop. The fish are very fresh. My mother talks to the seller and asks the price. Sometimes she asks for a lower price. At the market, I help my mother carry the bags. The bags are heavy, but I am strong. We also buy some flowers for the table. They are red and yellow. After shopping, we go home. My mother cooks a nice lunch. I like going to the market. It is fun to see so many things."
}'::jsonb),

('listening', 'beginner', 'Người bạn thân của em', '{
  "text": "My best friend is Nam. We are in the same class. Nam is tall and thin. He has short black hair and a big smile. We have been friends for three years. We like the same things. We both love football. After school, we play football in the park. Nam is very kind. When I have a problem, he helps me. Last week, I was sick. Nam brought my homework to my house. He is a good student too. He is good at math. Sometimes he helps me with hard questions. On weekends, we ride our bikes together. We also play video games at his house. Nam makes me laugh a lot. He tells funny jokes. I am lucky to have a friend like him. A good friend is very important. I hope we will be friends forever."
}'::jsonb),

('listening', 'beginner', 'Kỳ nghỉ hè ở biển', '{
  "text": "Last summer, my family went to the beach. We stayed there for three days. The beach was beautiful. The sand was white and the sea was blue. Every morning, I swam in the sea. The water was warm and clean. My father and I built a sandcastle. It was big and tall. My mother sat under an umbrella and read a book. In the afternoon, we ate fresh seafood. It was very tasty. We also drank cold coconut water. In the evening, we walked along the beach. The sky was pink and orange. It was so pretty. On the last day, we collected some shells. I keep them in my room now. I had a wonderful time at the beach. I want to go there again next summer. The beach is my favorite place."
}'::jsonb),

('listening', 'beginner', 'Lần đầu học nấu ăn', '{
  "text": "Last Sunday, I learned to cook for the first time. My mother taught me. We made fried rice together. First, we washed our hands. Then my mother showed me the vegetables. I cut the carrots into small pieces. I was a little scared of the knife, so I was careful. Next, we cooked the rice. My mother heated the pan. I added the eggs and the vegetables. The kitchen smelled very good. I mixed everything with a big spoon. It was not easy, but it was fun. After twenty minutes, the fried rice was ready. My father and my sister tried it. They said it was delicious. I was very proud of myself. Now I want to cook more dishes. Cooking is fun and useful. Next time, I will make soup. I love helping my mother in the kitchen."
}'::jsonb),

('listening', 'beginner', 'Buổi sáng trong khu vườn nhỏ', '{
  "text": "My family has a small garden behind our house. I love it very much. Every morning, I go into the garden. The air is fresh and cool. There are many green plants. We grow tomatoes, herbs, and flowers. I water the plants with a small can. The flowers are red, yellow, and purple. Many bees and butterflies come to visit. I like to watch them. My grandmother works in the garden too. She teaches me the names of the plants. Sometimes we find small insects on the leaves. Birds sing in the morning. It is a happy sound. When the tomatoes are red, we pick them. They taste sweet and fresh. The garden is a quiet and peaceful place. I feel calm when I am there. I hope our garden grows bigger every year."
}'::jsonb),

('listening', 'beginner', 'Chuyến đi sở thú', '{
  "text": "Yesterday, my class went to the zoo. We were very excited. We went by bus with our teacher. The zoo was big and full of animals. First, we saw the monkeys. They were funny and jumped from tree to tree. Then we saw the elephants. They were very big and gray. One elephant ate a lot of grass. Next, we visited the lions. They slept under a tree. We were a little scared but also happy. My favorite animals were the penguins. They walked in a funny way. We watched them swim in the cold water. At lunch, we sat on the grass and ate our sandwiches. In the afternoon, we saw colorful birds and tall giraffes. The giraffes had very long necks. It was a wonderful day. I learned many things about animals. I want to go to the zoo again."
}'::jsonb),

('listening', 'beginner', 'Ngày mưa ở nhà', '{
  "text": "It was raining all day yesterday. I could not go outside to play. So I stayed at home with my family. In the morning, I read a book about animals. It was very interesting. Then I helped my mother clean the house. We listened to music while we worked. At noon, we made hot soup for lunch. It was warm and tasty. The rain was loud on the roof. I liked the sound. In the afternoon, my sister and I played board games. I won two games. We laughed a lot. My father made hot tea for everyone. We sat by the window and watched the rain. The street was wet and shiny. In the evening, the rain stopped. A rainbow appeared in the sky. It was beautiful. Even a rainy day can be fun at home with family."
}'::jsonb),

('listening', 'beginner', 'Đi xe buýt đến trung tâm thành phố', '{
  "text": "On Sunday, I went to the city center by bus. I went with my older brother. We waited at the bus stop near our house. The bus came at nine o''clock. It was not crowded, so we found seats. The trip took about thirty minutes. I looked out of the window. I saw many shops, parks, and tall buildings. In the city center, there were a lot of people. We visited a big bookshop first. I bought a comic book. Then we walked around the square. There was a beautiful old church. We took some photos. At noon, we ate noodles at a small restaurant. The food was cheap and good. In the afternoon, we took the bus home. I was tired but happy. I like going to the city with my brother. We always have a nice time together."
}'::jsonb),

('listening', 'beginner', 'Trồng cây trong lớp học', '{
  "text": "Last month, our teacher gave each student a small plant. My plant was a young green bean. We put our plants near the window. The window gets a lot of sun. Every day, I water my plant a little. I also talk to it and say good morning. At first, the plant was very small. After one week, it grew two new leaves. I was so happy. My friends'' plants grew too. We measured them every Friday. My plant grew five centimeters. The teacher taught us about roots, leaves, and sunlight. Plants need water, light, and air to grow. Taking care of a plant is a big responsibility. It teaches us to be patient and kind. Now my plant is tall and strong. I want to plant more trees at home. Green plants make the world more beautiful and clean."
}'::jsonb),

('listening', 'beginner', 'Sinh nhật lần thứ mười của em', '{
  "text": "Yesterday was my tenth birthday. I was very happy. In the morning, my parents said happy birthday to me. My mother made a big chocolate cake. It had ten candles on top. In the afternoon, my friends came to my house. We played games in the garden. We laughed and ran a lot. Then we ate the cake together. It was sweet and delicious. I made a wish and blew out the candles. My friends gave me nice presents. I got a new book, a toy car, and a football. My favorite gift was the football. My father promised to play with me. In the evening, my family had a special dinner. We ate my favorite food. Everyone sang a happy song for me. It was the best birthday. I will remember this day for a long time."
}'::jsonb),

('listening', 'beginner', 'Giúp mẹ dọn nhà cuối tuần', '{
  "text": "Every Saturday, my family cleans the house together. We all help. It is our family rule. In the morning, my mother makes a list of jobs. My job is to clean my room. I put my books on the shelf. I make my bed and pick up my toys. My brother cleans the windows. He likes to see them shine. My father washes the floor in the kitchen. My mother does the laundry. We play music while we work. It makes cleaning more fun. After two hours, the house is clean and tidy. It smells fresh and nice. Then we sit down and rest. My mother gives us cold juice. I feel happy when the house is clean. Working together is faster and easier. I learn to be tidy and helpful. A clean home makes everyone comfortable and glad."
}'::jsonb),

('listening', 'beginner', 'Chú chó hàng xóm thân thiện', '{
  "text": "My neighbor has a dog. His name is Lucky. Lucky is brown and white. He is big but very friendly. Every morning, I see Lucky in the garden. He wags his tail when he sees me. I say hello and give him a small treat. Lucky loves to run and play. In the afternoon, my neighbor takes him for a walk. Sometimes I walk with them. Lucky likes the park. He runs after the ball and brings it back. He is a smart dog. He can sit and shake hands. Children in our street love Lucky. He never bites and is always gentle. When I am sad, Lucky comes to me. He puts his head on my knee. It makes me smile. I do not have a dog, but Lucky feels like my friend. I am happy to have such a nice neighbor and dog."
}'::jsonb),

('listening', 'beginner', 'Buổi tối xem phim cùng gia đình', '{
  "text": "On Friday evening, my family watches a movie together. It is our favorite time of the week. After dinner, we clean the table. Then we sit on the sofa in the living room. My father chooses a movie for us. We often watch cartoons or funny films. My mother makes popcorn. It is warm and salty. My little sister brings her favorite blanket. We turn off the lights and start the movie. Sometimes we laugh very loudly. Sometimes the movie is a little scary. We hold hands and feel brave together. My father tells us about the story. During the break, we drink juice. After the movie, we talk about our favorite parts. Then we go to bed. I love our movie nights. It is not about the film. It is about being together as a family. I look forward to it every week."
}'::jsonb)

on conflict do nothing;

-- ============================================================
-- NHÓM 5/6 — LISTENING | INTERMEDIATE (B1-B2) — 17 chủ đề
-- ============================================================
insert into content (type, level, topic, data) values

('listening', 'intermediate', 'Lợi ích của việc đọc sách mỗi ngày', '{
  "text": "Reading every day is one of the simplest habits with the greatest rewards. Many people believe they have no time to read, yet even twenty minutes a day can make a real difference. Reading regularly builds vocabulary and improves the way we express ourselves. When we meet new words in context, we remember them far better than from a list. Books also expand our knowledge of the world. A single novel can take us into another culture, another century, or another person''s mind. This helps us understand people who are different from us and makes us more open-minded. Reading is good for the brain too. Studies suggest that people who read often keep their minds sharp as they grow older. It can also reduce stress. After a long day, losing yourself in a good story is a calm and healthy way to relax. To build the habit, keep a book by your bed and read a few pages before sleeping. Over a year, those small pages add up to many complete books."
}'::jsonb),

('listening', 'intermediate', 'Tầm quan trọng của giấc ngủ', '{
  "text": "Sleep is often the first thing we sacrifice when we are busy, but it may be the most important part of a healthy life. While we sleep, our body repairs itself and our brain organizes the information from the day. This is why students who sleep well usually remember their lessons better than those who study all night. Most adults need between seven and nine hours of sleep, yet many get far less. A lack of sleep affects more than just our energy. It weakens the immune system, so we catch colds more easily. It also affects our mood, making us irritable and less patient with others. Over many years, poor sleep is linked to serious health problems such as heart disease. The good news is that better sleep is possible with small changes. Going to bed at the same time every night helps the body find a rhythm. Avoiding screens and coffee in the evening also makes a big difference. Treating sleep as a priority, not a luxury, is one of the best gifts we can give ourselves."
}'::jsonb),

('listening', 'intermediate', 'Cách quản lý thời gian hiệu quả', '{
  "text": "Managing time well is a skill that anyone can learn, and it can change both your work and your peace of mind. The first step is to know where your time actually goes. For a few days, write down how you spend each hour. Many people are surprised to see how much time disappears into their phones. Once you understand your habits, you can plan more carefully. A useful method is to decide on your three most important tasks each morning. If you finish only these, the day is still a success. It also helps to do difficult tasks early, when your energy is high. Another common mistake is trying to do many things at once. Research shows that switching between tasks makes us slower and more likely to make mistakes. It is better to focus on one thing at a time. Finally, remember to include breaks. Short rests actually improve concentration. Good time management is not about being busy every minute. It is about spending your hours on what truly matters to you."
}'::jsonb),

('listening', 'intermediate', 'Xu hướng mua sắm trực tuyến', '{
  "text": "Online shopping has changed the way we buy almost everything, from clothes to groceries. Only a few decades ago, people had to visit physical stores for every purchase. Today, a few taps on a phone can bring products to our door within days or even hours. The main reason for this growth is convenience. Customers can shop at any time, compare prices easily, and read reviews from other buyers before deciding. For people in remote areas, online shopping opens access to goods they could never find nearby. However, this trend also brings challenges. Small local shops struggle to compete with large websites that offer lower prices. The huge number of deliveries also creates more packaging waste and traffic. Some customers miss the experience of seeing and touching a product before buying it. There are also concerns about privacy, because companies collect a lot of data about our habits. Online shopping is clearly here to stay, but wise shoppers still think carefully. They support local businesses when they can and avoid buying things they do not really need."
}'::jsonb),

('listening', 'intermediate', 'Lợi ích của việc học một ngôn ngữ mới', '{
  "text": "Learning a new language is one of the most rewarding challenges a person can take on. The most obvious benefit is communication. Speaking another language allows you to talk with millions of new people and to travel with far more confidence. But the advantages go much deeper than travel. Learning a language trains the brain in a powerful way. It improves memory and helps you focus, because you must constantly switch between rules and words. Some studies even suggest that bilingual people keep their minds sharper as they age. A new language also opens a door to another culture. When you understand the language, you can enjoy films, music, and books in their original form, without translation. This gives you a richer view of how other people think and live. Of course, learning a language takes patience. Progress can feel slow, and making mistakes is part of the process. The key is to practice a little every day and not to fear errors. Every conversation, even a short one, brings you closer to your goal."
}'::jsonb),

('listening', 'intermediate', 'Ảnh hưởng của cà phê đến cơ thể', '{
  "text": "Coffee is one of the most popular drinks in the world, and millions of people cannot imagine starting their day without it. The main reason is caffeine, a natural substance that makes us feel more awake and alert. When we drink coffee, caffeine blocks the signals in the brain that make us feel tired. This is why a morning cup can help us concentrate at work or school. In moderate amounts, coffee may even have some health benefits. Research suggests it can improve mood and physical performance. However, coffee also has a downside if we drink too much. Too much caffeine can cause a fast heartbeat, anxiety, and trouble sleeping. Drinking coffee late in the day is a common reason for poor sleep. The effect of caffeine is different for each person. Some people can drink several cups and feel fine, while others feel nervous after just one. The best advice is to know your own body. For most adults, a few cups a day are safe, but it is wise to avoid coffee in the evening."
}'::jsonb),

('listening', 'intermediate', 'Vì sao nên trồng nhiều cây xanh trong thành phố', '{
  "text": "As cities grow larger, planting trees and creating green spaces has become more important than ever. Trees do far more than make a street look pretty. They clean the air by absorbing harmful gases and releasing oxygen. In busy cities full of traffic, this natural filter is extremely valuable for our health. Trees also help control temperature. On a hot day, a street lined with trees can be several degrees cooler than one made only of concrete. This shade reduces the need for air conditioning and saves energy. Green spaces are good for the mind as well as the body. Parks give people a place to walk, exercise, and relax away from noise. Studies show that spending time near trees lowers stress and improves mood. Trees also support wildlife, giving birds and insects a home in the middle of the city. Of course, planting trees requires planning and care. Cities must choose the right species and protect them as they grow. But the long-term benefits, for both people and the environment, are well worth the effort."
}'::jsonb),

('listening', 'intermediate', 'Làm việc nhóm và kỹ năng giao tiếp', '{
  "text": "In almost every job today, the ability to work well in a team is highly valued. Very few tasks are completed by one person alone. Whether in an office, a hospital, or a construction site, people must cooperate to reach a common goal. The heart of good teamwork is communication. Team members need to share information clearly and listen carefully to one another. Misunderstandings often happen not because people disagree, but because they fail to explain their ideas well. Good communication also means giving and receiving feedback in a respectful way. Another important part of teamwork is trust. When people trust their colleagues, they are willing to share ideas and admit mistakes. This creates a safer environment where everyone can learn and improve. Of course, working with others is not always easy. People have different opinions, styles, and personalities. Conflicts can appear, but they can be solved through honest and calm discussion. Learning to work in a team is a skill that improves with practice. Those who master it are usually more successful and happier in their careers."
}'::jsonb),

('listening', 'intermediate', 'Thói quen ăn sáng lành mạnh', '{
  "text": "People often call breakfast the most important meal of the day, and there is good reason for this. After a night of sleep, the body has gone many hours without food. A healthy breakfast provides the energy we need to start the day with a clear mind. Studies show that people who eat a balanced breakfast tend to concentrate better and feel less tired in the morning. However, not every breakfast is a good one. Meals that are full of sugar, such as sweet cakes or sugary drinks, give a quick burst of energy that soon disappears. Soon after, we feel hungry and tired again. A better choice includes foods that release energy slowly, such as whole grains, eggs, fruit, and nuts. These keep us full for longer and help us avoid unhealthy snacks before lunch. Skipping breakfast is a common habit for busy people, but it often leads to overeating later in the day. Even a small, simple meal is better than nothing. Building a healthy breakfast habit takes only a little planning, and the benefits last all day."
}'::jsonb),

('listening', 'intermediate', 'Du lịch bụi và những bài học', '{
  "text": "Backpacking, or traveling on a low budget with a simple bag, has become popular among young people around the world. Unlike a luxury holiday, backpacking is about experience rather than comfort. Travelers often stay in cheap hostels, use public transport, and eat local street food. This style of travel teaches many valuable lessons that no classroom can offer. First, it builds independence. When you are alone in a foreign country, you must solve problems by yourself, from reading a map to finding a place to sleep. Second, backpacking teaches flexibility. Plans change, buses are late, and the weather can surprise you. Travelers learn to stay calm and adapt. Perhaps the greatest lesson is an appreciation of different cultures. Meeting local people and other travelers opens the mind and breaks down prejudice. Of course, backpacking has its difficulties. It can be tiring, and safety is always a concern. Careful planning and respect for local customs are essential. For many people, though, the challenges are part of the reward. They return home with confidence, wonderful memories, and a wider view of the world."
}'::jsonb),

('listening', 'intermediate', 'Vai trò của hoạt động tình nguyện trong cộng đồng', '{
  "text": "Volunteering means giving your time and effort to help others without expecting money in return. In every community, volunteers play a quiet but vital role. They help in many ways, from teaching children and caring for the elderly to cleaning parks and supporting people after natural disasters. The benefits of volunteering reach far beyond the people who receive help. Volunteers themselves often gain a great deal. They learn new skills, meet different people, and gain useful work experience. Many say that helping others gives their life a sense of meaning and purpose. Volunteering also makes communities stronger. When people work together for a common cause, they build trust and friendship. Problems that seem too big for one person become manageable when many hands share the work. Young people, in particular, can learn important values through volunteering, such as responsibility and kindness. Getting involved does not require much. Even a few hours a month can make a difference. The most important thing is a willingness to help. A community where people care for one another is a happier and safer place for everyone."
}'::jsonb),

('listening', 'intermediate', 'Cách tiết kiệm tiền cho người trẻ', '{
  "text": "Learning to save money is a skill that becomes valuable early in life, especially for young people who are just starting to earn. Many believe that saving is only possible for those with high salaries, but this is not true. Saving is more about habit than about income. The first step is to understand where your money goes. By writing down every expense for a month, most people discover small daily costs that add up quickly, such as coffee or snacks. A popular rule is to save a fixed part of your income as soon as you receive it, before spending on anything else. Even ten percent makes a difference over time. It also helps to separate needs from wants. A need is something necessary, like food or rent, while a want is something extra that we can live without. This does not mean never enjoying life, but making thoughtful choices. Setting a clear goal, such as a trip or an emergency fund, gives saving a purpose and keeps you motivated. The earlier you start, the more your money can grow, thanks to interest over the years."
}'::jsonb),

('listening', 'intermediate', 'Lợi ích của thể thao đối với học sinh', '{
  "text": "Playing sports is about much more than winning games or building strong muscles. For students, regular physical activity brings benefits that reach into the classroom and beyond. The most obvious benefit is health. Sport keeps the heart strong, controls weight, and gives students more energy for their daily activities. But the advantages are not only physical. Exercise is also very good for the mind. After playing sport, students often feel happier and less stressed, because the body releases chemicals that improve mood. This can help them concentrate better on their studies. Sports also teach important life skills. In a team, students learn to cooperate, to follow rules, and to respect their opponents. They discover how to win with grace and how to accept defeat without giving up. These lessons build character and confidence. Of course, balance is important. Students should not spend so much time on sport that they neglect their studies. When managed well, however, sport and study support each other. A healthy body helps create a healthy, focused mind, ready to learn."
}'::jsonb),

('listening', 'intermediate', 'Sự phát triển của xe điện', '{
  "text": "Electric vehicles, once a rare sight on the roads, are quickly becoming part of everyday life. Unlike traditional cars that burn petrol or diesel, electric cars run on batteries and produce no exhaust smoke. This is one of the main reasons for their growing popularity. As cities struggle with air pollution, electric vehicles offer a cleaner way to travel. They are also quieter, which helps reduce noise in busy urban areas. For drivers, electric cars can be cheaper to run, since electricity often costs less than fuel, and the motors need less maintenance. However, the change is not without challenges. Electric cars are still more expensive to buy than many petrol cars, although prices are falling. Drivers also worry about the distance a car can travel before the battery runs out. To solve this, governments and companies are building more charging stations. Another concern is where the electricity comes from, because it is only truly clean if it is made from renewable sources. Despite these problems, the trend is clear. As technology improves and prices drop, electric vehicles are likely to become the normal choice for future drivers."
}'::jsonb),

('listening', 'intermediate', 'Tại sao nên hạn chế đồ nhựa dùng một lần', '{
  "text": "Single-use plastic items, such as bags, straws, and bottles, are everywhere in modern life because they are cheap and convenient. However, this convenience comes at a heavy price for the environment. The main problem is that plastic does not break down easily. A single plastic bottle can take hundreds of years to disappear. In the meantime, huge amounts of plastic waste end up in rivers and oceans. There, it harms sea animals, which sometimes mistake it for food. Tiny pieces of plastic have even been found in the fish that people eat. Reducing single-use plastic is a challenge, but small changes can have a big effect. Carrying a reusable bag and a refillable water bottle are simple habits that cut down on waste. Choosing products with less packaging also helps. Many countries have started to ban certain plastic items or charge a fee for plastic bags, and these measures have already reduced waste. Businesses are looking for greener materials too. The problem of plastic pollution is serious, but it is not hopeless. If each of us makes an effort, together we can protect our planet."
}'::jsonb),

('listening', 'intermediate', 'Học trực tuyến và lớp học truyền thống', '{
  "text": "In recent years, online learning has grown rapidly and now sits alongside traditional classroom education. Both have their own strengths and weaknesses, and understanding them helps students choose what suits them best. Online learning offers great flexibility. Students can study at home, at their own pace, and often at times that fit their schedule. This is especially helpful for people who work or live far from a school. Online courses can also be cheaper and give access to teachers and materials from around the world. However, online learning requires strong self-discipline. Without a teacher watching, it is easy to lose focus or fall behind. Some students also feel lonely without classmates around them. Traditional classrooms, on the other hand, offer face-to-face contact. Students can ask questions immediately and learn from discussions with others. The social side of school helps young people build friendships and communication skills. The best approach may be a mix of both. Many schools now combine online lessons with classroom time. This blended method takes the convenience of technology and the human connection of the classroom, giving students the benefits of each."
}'::jsonb),

('listening', 'intermediate', 'Ảnh hưởng của âm nhạc đến tâm trạng', '{
  "text": "Music is a part of human life in every culture around the world, and it has a powerful effect on how we feel. Almost everyone has experienced how a favorite song can lift their mood or bring back a strong memory. Scientists have studied this connection and found that music truly affects the brain. Fast, upbeat music can give us energy and make us feel happy, which is why many people listen to it while exercising. Slow, gentle music can calm the mind and reduce stress, helping us relax after a difficult day. Because of these effects, music is now used to help people in many ways. In hospitals, soft music can ease patients'' anxiety before an operation. Some people use music to focus while they work or study, though very loud or complex songs can also be a distraction. Music can even bring people together. Singing or playing in a group creates a strong sense of belonging. Whether we listen alone or with others, music has the rare power to change our emotions in a moment. It is a simple and free way to care for our mental well-being."
}'::jsonb)

on conflict do nothing;

-- ============================================================
-- NHÓM 6/6 — LISTENING | ADVANCED (C1-C2) — 16 chủ đề
-- ============================================================
insert into content (type, level, topic, data) values

('listening', 'advanced', 'Tác động của trí tuệ nhân tạo đến thị trường lao động', '{
  "text": "The rise of artificial intelligence has provoked one of the most consequential economic debates of our era: what will happen to human work? Unlike earlier waves of automation, which primarily replaced physical labour, modern systems increasingly perform cognitive tasks once thought to be uniquely human, such as writing, analysis, and even certain forms of decision-making. Optimists argue that this transformation will follow a familiar historical pattern. New technologies destroy some jobs but create others, often ones we cannot yet imagine, while raising overall productivity and prosperity. Pessimists counter that the speed and breadth of this change are unprecedented, potentially displacing workers faster than economies can retrain them. The truth likely lies between these poles. Certain routine roles will indeed shrink, yet many jobs will be reshaped rather than eliminated, with humans and machines working in partnership. What matters most is not the technology itself but how societies respond. Investment in education, flexible retraining programmes, and social support will determine whether the benefits are shared broadly or concentrated among a few. In this sense, the challenge posed by artificial intelligence is less a technical question than a profoundly political and moral one about the kind of economy we choose to build."
}'::jsonb),

('listening', 'advanced', 'Kinh tế tuần hoàn và tương lai sản xuất', '{
  "text": "For most of the industrial age, our economy has operated on a simple linear model: we extract raw materials, manufacture products, use them, and throw them away. This take-make-waste approach has generated remarkable prosperity, but at a growing environmental cost that we can no longer ignore. The circular economy offers an alternative vision. Rather than treating products as disposable, it seeks to keep materials in use for as long as possible through repair, reuse, and recycling. In this model, the waste from one process becomes the raw material for another, mimicking the cycles found in nature. The implications for manufacturing are profound. Companies must design products that last longer and can be easily disassembled and repaired. Some businesses are shifting from selling goods to offering services, leasing equipment and taking responsibility for its eventual recovery. Such changes reduce demand for scarce resources and cut the pollution created by constant production. Of course, the transition is not simple. It requires new technologies, supportive regulations, and a shift in consumer attitudes away from disposability. Yet the potential rewards, both economic and environmental, are considerable. A circular economy suggests that sustainability and prosperity need not be opposites, but can reinforce one another over the long term."
}'::jsonb),

('listening', 'advanced', 'Biến đổi khí hậu và an ninh lương thực', '{
  "text": "Climate change is often discussed in terms of rising seas and extreme weather, but one of its most serious consequences concerns something more fundamental: our ability to feed ourselves. Agriculture depends on stable and predictable conditions, and it is precisely this stability that a warming planet is undermining. Shifting rainfall patterns, prolonged droughts, and more frequent floods all threaten harvests around the world. Crops that have been cultivated in the same regions for centuries may no longer thrive there. The effects are not evenly distributed. Wealthier nations can often adapt by importing food or investing in new technologies, but poorer countries, many of which depend heavily on farming, are far more vulnerable. When harvests fail, food prices rise, and it is the poorest who suffer most. This can deepen inequality and even trigger social unrest and migration. Addressing this challenge requires action on two fronts. First, reducing greenhouse gas emissions to limit the severity of future warming. Second, helping farmers adapt through drought-resistant crops, better water management, and more resilient farming methods. Food security, once taken for granted in many parts of the world, is emerging as one of the defining challenges of the coming decades, binding together environmental, economic, and political concerns."
}'::jsonb),

('listening', 'advanced', 'Vai trò của dữ liệu lớn trong y tế', '{
  "text": "Modern healthcare is generating data on an unprecedented scale, from electronic medical records and genetic tests to information gathered by wearable devices. The analysis of these vast datasets, often called big data, promises to transform medicine in remarkable ways. By examining patterns across millions of patients, researchers can identify risk factors, predict outbreaks, and discover which treatments work best for particular groups. This shift enables a move towards more personalised medicine, where care is tailored to an individual''s unique characteristics rather than based on averages. For example, analysing a patient''s genetic profile may reveal how they are likely to respond to a specific drug, reducing dangerous side effects. Big data can also make health systems more efficient, helping hospitals predict demand and allocate resources wisely. Yet these opportunities come with serious concerns. Medical data is deeply personal, and its collection raises difficult questions about privacy and consent. If such information were misused or leaked, the consequences could be severe. There is also a risk that algorithms trained on incomplete data could reinforce existing inequalities in care. Realising the benefits of big data in medicine therefore depends not only on technical progress but on strong ethical safeguards and public trust, without which even the most powerful tools may do more harm than good."
}'::jsonb),

('listening', 'advanced', 'Đô thị thông minh và cuộc sống tương lai', '{
  "text": "As more of the world''s population moves into cities, planners are turning to technology to manage the growing pressures of urban life. The concept of the smart city describes an urban area that uses sensors, data, and connected systems to improve how it functions. In such a city, traffic lights might adjust automatically to reduce congestion, rubbish bins could signal when they need emptying, and energy grids might balance supply and demand in real time. The promised benefits are considerable: less pollution, lower energy use, shorter commutes, and more responsive public services. Yet the smart city is not without its critics. Gathering so much data about how people move and live raises significant privacy concerns. Who owns this information, and how might it be used or abused? There is also a risk that expensive technology could widen the gap between wealthy and poorer neighbourhoods, benefiting some residents while neglecting others. Furthermore, a city that depends heavily on connected systems may become vulnerable to technical failures or cyber-attacks. The most thoughtful approach recognises that technology is a tool, not a solution in itself. A truly smart city must place the needs and rights of its citizens at the centre, using innovation to serve people rather than allowing people to serve the system."
}'::jsonb),

('listening', 'advanced', 'Tâm lý học của thói quen tiêu dùng', '{
  "text": "Every day we make countless purchasing decisions, and while we like to believe these choices are rational, psychology tells a more complicated story. Much of our buying behaviour is driven by emotion, habit, and subtle influences we barely notice. Marketers understand this well and design their strategies accordingly. The placement of products in a shop, the colours used in packaging, and even the music playing in the background can all shape what we buy. One powerful factor is the idea of scarcity. When we are told that an item is limited or an offer will soon end, we feel a sense of urgency that pushes us to act. Social proof is another strong influence: seeing that others have bought or praised a product makes us more likely to want it ourselves. Our decisions are also affected by how choices are presented. A price of ninety-nine, for instance, feels notably cheaper than one hundred, even though the difference is tiny. Understanding these mechanisms is valuable not only for businesses but for consumers who wish to spend more wisely. By pausing to ask whether a purchase reflects a genuine need or a clever piece of persuasion, we can regain some control over our habits and resist the constant pressure to buy more than we truly want."
}'::jsonb),

('listening', 'advanced', 'Sự trỗi dậy của kinh tế chia sẻ', '{
  "text": "In the space of little more than a decade, the sharing economy has transformed the way many people travel, work, and consume. Built on digital platforms that connect individuals directly, it allows people to rent out spare rooms, offer rides in their cars, or lend tools and equipment they rarely use. Supporters praise this model for making better use of underused resources and for opening new sources of income to ordinary people. A homeowner can earn money from an empty room, while travellers enjoy cheaper and more personal alternatives to hotels. The sharing economy also promises environmental benefits, since sharing goods can, in theory, reduce the total amount we need to produce. However, this rapid growth has revealed significant tensions. Traditional businesses complain of unfair competition from platforms that avoid many of the regulations they must follow. Workers who provide services often lack the security and benefits of conventional employment, raising concerns about their rights. In some cities, short-term rentals have reduced the supply of long-term housing, driving up prices for residents. These challenges have prompted governments to search for new rules that can capture the benefits of sharing while limiting its harms. The sharing economy is unlikely to disappear, but how societies choose to regulate it will shape its ultimate impact."
}'::jsonb),

('listening', 'advanced', 'Bảo tồn đa dạng sinh học ở đô thị', '{
  "text": "When we think of protecting wildlife, we usually imagine distant forests or oceans rather than the streets where most of us live. Yet cities, often dismissed as concrete deserts, can play a surprisingly important role in preserving biodiversity. Parks, gardens, rivers, and even rooftops can provide homes for a remarkable variety of plants, insects, birds, and small animals. As natural habitats shrink in the countryside, these urban spaces are becoming valuable refuges. Encouraging biodiversity in cities brings benefits for people as well as for nature. Green spaces cool the air, absorb rainwater, and reduce pollution. They also improve mental health, offering residents a welcome connection to the natural world. Insects such as bees, which are vital for pollinating plants, can thrive in well-designed urban gardens. Achieving this, however, requires deliberate planning. Planting native species, reducing the use of pesticides, and creating corridors of greenery that link isolated patches all help wildlife to move and flourish. Even small actions, such as leaving part of a garden wild or installing a pond, can make a difference. The idea that cities and nature are opposites is increasingly outdated. With thoughtful design, urban areas can become not only places for humans to live but living landscapes shared with a rich diversity of other species."
}'::jsonb),

('listening', 'advanced', 'Tác động của mạng xã hội đến đời sống chính trị', '{
  "text": "Social media has profoundly reshaped the way citizens engage with politics, bringing both new opportunities and serious risks to democratic life. On the positive side, these platforms have given ordinary people a voice that was once reserved for those who controlled newspapers and television. Movements can now organise quickly, share information widely, and hold the powerful to account. Politicians can communicate directly with the public, and citizens can debate issues across great distances. Yet the same features that empower can also distort. The way these platforms are designed tends to reward content that provokes strong emotions, which often means outrage rather than reasoned argument. This can deepen divisions, pushing people into isolated groups where they encounter only opinions that confirm their own. The rapid spread of false information poses a further threat, as misleading claims can travel faster than careful corrections. Foreign interference and coordinated manipulation add another layer of concern. Addressing these problems is far from straightforward, since any attempt to control content raises difficult questions about free expression. Solutions may lie in a combination of better platform design, greater transparency, and, above all, a public that is educated to think critically about what it reads. The health of modern democracy may depend on how wisely we navigate this new and powerful arena."
}'::jsonb),

('listening', 'advanced', 'Tương lai của công việc từ xa', '{
  "text": "The sudden shift to remote work in recent years began as a response to necessity, but it has since prompted a lasting rethink of where and how work should be done. For many office employees, the daily commute has been replaced by a walk to a spare room, and the results have surprised both workers and employers. Many report higher productivity, better work-life balance, and relief from hours previously lost in traffic. Companies, meanwhile, have discovered that they can recruit talented people regardless of location and reduce the cost of large offices. Yet remote work also carries real drawbacks. The spontaneous conversations that spark new ideas are harder to replicate through a screen. New employees may struggle to learn and feel part of a team, and the line between professional and personal life can blur uncomfortably. Some workers feel isolated, missing the social connection that an office provides. As a result, many organisations are moving towards a hybrid model, combining days at home with days in a shared workplace. This approach attempts to capture the flexibility of remote work while preserving the collaboration and belonging of the office. How successfully this balance is struck will shape not only individual careers but the future of cities, transport, and the very meaning of the workplace."
}'::jsonb),

('listening', 'advanced', 'Đạo đức trong nghiên cứu trí tuệ nhân tạo', '{
  "text": "As artificial intelligence grows more capable, the ethical questions surrounding its development have moved from the pages of philosophy to the centre of public concern. Unlike earlier technologies, advanced AI systems can make decisions and predictions that directly affect people''s lives, from who receives a loan to how long a prison sentence should be. This power brings a heavy responsibility. One of the most pressing issues is fairness. Because these systems learn from historical data, they can absorb and even amplify the biases present in that data, leading to unjust outcomes for certain groups. Ensuring that AI treats people equitably requires careful design and constant testing. Another concern is transparency. Many advanced systems function as black boxes, producing answers without any clear explanation of how they reached them. When such decisions affect human lives, the inability to understand or challenge them is deeply troubling. There are also broader questions about accountability: when an automated system causes harm, who is responsible? The developer, the company, or the user? Finally, researchers must consider the long-term consequences of building ever more powerful systems whose behaviour may become difficult to predict or control. Addressing these challenges demands cooperation between engineers, ethicists, and policymakers. The goal is not to halt progress but to ensure that it serves humanity wisely and justly."
}'::jsonb),

('listening', 'advanced', 'Già hóa dân số và thách thức kinh tế', '{
  "text": "Across much of the world, populations are growing older, a demographic shift with far-reaching economic consequences. Thanks to better healthcare and lower birth rates, people are living longer while fewer children are being born. As a result, the proportion of elderly citizens is rising steadily, while the share of working-age people shrinks. This ageing of society, though a triumph of medicine and prosperity, poses serious challenges. A smaller workforce must support a larger number of retirees, placing strain on pension systems and public finances. Healthcare costs tend to rise as populations age, since older people generally require more medical care. There is also concern about slower economic growth, as a shrinking labour force may struggle to maintain productivity. Yet these challenges are not insurmountable. Encouraging older people to remain in work longer, if they are able and willing, can ease the pressure. Investment in technology and automation may help maintain output with fewer workers. Some countries look to immigration to replenish their labour force, though this brings its own political debates. Supporting families and making it easier to raise children could, over time, help balance the age structure. How societies adapt to this transformation, redesigning work, retirement, and care, will be among the defining economic questions of the twenty-first century."
}'::jsonb),

('listening', 'advanced', 'Năng lượng tái tạo và lưới điện thông minh', '{
  "text": "The transition from fossil fuels to renewable sources of energy is essential for tackling climate change, but it presents a significant technical challenge. Unlike coal or gas power stations, which can produce a steady output on demand, sources such as solar and wind are variable by nature. The sun does not always shine, and the wind does not always blow. This intermittency makes it difficult to match supply with the constant demand for electricity. The traditional power grid, designed for a small number of large and predictable power stations, is poorly suited to this new reality. The solution lies in what engineers call the smart grid. By using sensors, data, and automated controls, a smart grid can respond intelligently to changes in both supply and demand. It can draw power from many scattered sources, store surplus energy in batteries when production is high, and release it when needed. It can even encourage consumers to use electricity at times when renewable supply is abundant, for example by adjusting the price throughout the day. Combined with improvements in energy storage, such systems make a future powered largely by renewables increasingly realistic. Building this infrastructure requires substantial investment and coordination, but it is a crucial step towards a cleaner and more secure energy system."
}'::jsonb),

('listening', 'advanced', 'Vai trò của giáo dục STEM trong nền kinh tế hiện đại', '{
  "text": "In recent years, governments and educators around the world have placed growing emphasis on STEM education, the study of science, technology, engineering, and mathematics. This focus reflects a belief that these fields hold the key to future economic success. As industries become more advanced and automated, the demand for workers with technical skills continues to rise. Nations that produce skilled scientists and engineers are better placed to innovate, to compete globally, and to solve pressing problems such as disease and climate change. There is much to be said for this priority. Careers in STEM fields are often well paid and in high demand, and the discoveries they enable can improve countless lives. Yet an excessive focus on STEM alone carries risks. The arts, humanities, and social sciences teach skills that machines cannot easily replace, such as creativity, ethical judgment, and the ability to understand human behaviour. Indeed, the most valuable innovations often arise when technical knowledge is combined with imagination and a deep understanding of people''s needs. A wise education system therefore seeks balance. It nurtures the technical abilities that drive economic growth while preserving the broad, humane education that produces thoughtful citizens. Preparing young people for the future means equipping them not only to build new technologies but to use them wisely."
}'::jsonb),

('listening', 'advanced', 'Chủ nghĩa tối giản và tiêu dùng bền vững', '{
  "text": "In a world that constantly encourages us to buy more, the philosophy of minimalism offers a quiet act of resistance. At its heart, minimalism is the idea that we can live better with less, focusing on what genuinely adds value to our lives and letting go of the rest. For many people, this begins simply as a way to reduce clutter and stress. Yet minimalism increasingly connects to a larger concern: the environmental cost of endless consumption. Every product we buy requires raw materials, energy, and labour to produce, and eventually contributes to waste. By choosing to own fewer but better things, minimalists aim to reduce this burden on the planet. This approach challenges a deeply held assumption in modern economies, that growth and constant buying are always good. Critics argue that if too many people consumed less, businesses would suffer and jobs would be lost. Supporters respond that we can shift towards an economy that values quality, durability, and services rather than the sheer quantity of goods. Minimalism is not about deprivation or living without comfort. Rather, it invites us to think carefully about what we truly need and to find satisfaction in experiences and relationships rather than possessions. In doing so, it suggests a path towards both personal contentment and a more sustainable way of life."
}'::jsonb),

('listening', 'advanced', 'Sức khỏe tinh thần nơi công sở', '{
  "text": "For a long time, discussions of health in the workplace focused almost entirely on physical safety. Today, however, there is a growing recognition that mental well-being deserves equal attention. The pressures of modern work, including tight deadlines, long hours, constant connectivity, and job insecurity, can take a serious toll on employees'' mental health. Stress, anxiety, and burnout are increasingly common, and their effects reach far beyond the individual. When workers are struggling, their productivity falls, mistakes increase, and absences rise, harming both people and organisations. Forward-thinking employers are beginning to treat mental health as a genuine priority rather than a private matter to be ignored. Practical measures can make a real difference. Encouraging reasonable working hours, offering flexibility, and ensuring that workloads are manageable all help to prevent chronic stress. Creating a culture where people feel able to speak openly about their difficulties, without fear of judgment, is equally important. Access to professional support, such as counselling, can help those in need. Perhaps most crucial is the attitude of managers, who set the tone for the whole workplace. A supportive leader who listens and shows understanding can transform an employee''s experience. Ultimately, caring for mental health is not only a moral responsibility but also a wise investment, benefiting workers and organisations alike."
}'::jsonb)

on conflict do nothing;

-- ============================================================
-- KIỂM TRA KẾT QUẢ (đếm số bài theo từng nhóm)
-- ============================================================
select type, level, count(*) as so_bai
from content
group by type, level
order by type, level;

