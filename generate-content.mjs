// generate-content.mjs
// Sinh nội dung mới (hội thoại + script luyện nghe) bằng Claude API
// và lưu vào Supabase. Chạy 1 lần/ngày qua GitHub Actions (xem
// .github/workflows/generate-content.yml).
//
// Biến môi trường bắt buộc:
//   ANTHROPIC_API_KEY          - key gọi Claude API
//   SUPABASE_URL               - vd: https://xxxx.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY  - service_role key (CHỈ dùng ở server/CI,
//                                 tuyệt đối không đưa vào frontend)
//
// Chạy thử cục bộ:
//   ANTHROPIC_API_KEY=xxx SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx node generate-content.mjs

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Số chủ đề mới sinh MỖI LẦN chạy, cho mỗi tổ hợp (type, level).
// Giữ nhỏ (1-2) để tiết kiệm token — chạy cron hàng ngày sẽ tự tích luỹ dần.
const TOPICS_PER_RUN = 1;

const LEVELS = ["beginner", "intermediate", "advanced"];
const TYPES = ["dialogue", "listening"];

const LEVEL_DESC = {
  beginner: "A1-A2 (từ vựng đơn giản, câu ngắn, chủ đề đời sống hàng ngày)",
  intermediate: "B1-B2 (câu phức hơn, chủ đề công việc/xã hội thông dụng)",
  advanced: "C1-C2 (từ vựng học thuật/trừu tượng, lập luận, tranh luận)",
};

function buildPrompt(type, level) {
  const levelDesc = LEVEL_DESC[level];

  if (type === "dialogue") {
    return `Bạn là người soạn giáo trình tiếng Anh. Hãy sinh ra ĐÚNG ${TOPICS_PER_RUN} đoạn hội thoại tiếng Anh giữa 2 người (A và B) để người Việt luyện nghe/đọc.

Yêu cầu:
- Trình độ: ${levelDesc}
- Chủ đề: tự chọn, đời sống thực tế, KHÔNG trùng các chủ đề phổ biến đã quá quen thuộc (đặt bàn nhà hàng, mua sắm quần áo, hỏi đường, phỏng vấn xin việc, đặt phòng khách sạn) vì đã có sẵn trong hệ thống.
- Mỗi hội thoại có 10-15 lượt thoại (lines), xen kẽ A/B tự nhiên.
- Câu văn tự nhiên, đúng ngữ pháp, độ dài phù hợp trình độ.

Chỉ trả về JSON hợp lệ theo đúng schema sau, KHÔNG thêm text giải thích nào khác:
{
  "items": [
    {
      "topic": "Tên chủ đề bằng tiếng Việt",
      "lines": [ {"s": "A", "t": "câu tiếng Anh"}, {"s": "B", "t": "câu tiếng Anh"} ]
    }
  ]
}`;
  }

  // listening
  return `Bạn là người soạn giáo trình tiếng Anh. Hãy sinh ra ĐÚNG ${TOPICS_PER_RUN} đoạn văn tiếng Anh (dạng bài luyện nghe/đọc, không phải hội thoại) để người Việt luyện nghe.

Yêu cầu:
- Trình độ: ${levelDesc}
- Chủ đề: tự chọn, KHÔNG trùng các chủ đề đã quá quen thuộc (một ngày của tôi, thời tiết, du lịch, thói quen buổi sáng, kinh tế toàn cầu, công nghệ và xã hội).
- Đoạn văn dài khoảng 180-260 từ, chia thành nhiều câu ngắn/vừa để dễ highlight từng câu khi đọc.
- Văn phong tự nhiên, mạch lạc, đúng ngữ pháp.

Chỉ trả về JSON hợp lệ theo đúng schema sau, KHÔNG thêm text giải thích nào khác:
{
  "items": [
    { "topic": "Tên chủ đề bằng tiếng Việt", "text": "đoạn văn tiếng Anh..." }
  ]
}`;
}

function extractJson(rawText) {
  // Claude đôi khi bọc JSON trong ```json ... ``` dù đã yêu cầu không làm vậy.
  const match = rawText.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Không tìm thấy JSON trong phản hồi: " + rawText);
  return JSON.parse(match[0]);
}

async function generateForCombo(anthropic, type, level) {
  const prompt = buildPrompt(type, level);

  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const rawText = msg.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  const parsed = extractJson(rawText);

  if (!Array.isArray(parsed.items)) {
    throw new Error(`Phản hồi không có mảng "items" hợp lệ cho ${type}/${level}`);
  }

  return parsed.items.map((item) => {
    if (type === "dialogue") {
      return {
        type,
        level,
        topic: item.topic,
        data: { lines: item.lines },
      };
    }
    return {
      type,
      level,
      topic: item.topic,
      data: { text: item.text },
    };
  });
}

async function main() {
  if (!ANTHROPIC_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error(
      "Thiếu biến môi trường bắt buộc: ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY"
    );
    process.exit(1);
  }

  const trimmedKey = ANTHROPIC_API_KEY.trim();
  console.log(
    `ANTHROPIC_API_KEY: độ dài ${trimmedKey.length} ký tự, bắt đầu bằng "${trimmedKey.slice(0, 8)}...", kết thúc bằng "...${trimmedKey.slice(-4)}"`
  );
  const anthropic = new Anthropic({ apiKey: trimmedKey });
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const rowsToInsert = [];

  for (const type of TYPES) {
    for (const level of LEVELS) {
      console.log(`Đang sinh nội dung: type=${type} level=${level} ...`);
      try {
        const rows = await generateForCombo(anthropic, type, level);
        rowsToInsert.push(...rows);
        console.log(`  -> sinh được ${rows.length} bản ghi`);
      } catch (err) {
        // Không để 1 combo lỗi làm hỏng toàn bộ job — log lại và tiếp tục.
        console.error(`  -> LỖI ở type=${type} level=${level}:`, err.message);
        if (err.cause) console.error("     cause:", err.cause);
      }
    }
  }

  if (rowsToInsert.length === 0) {
    console.error("Không sinh được bản ghi nào, dừng job (không insert gì).");
    process.exit(1);
  }

  const { error } = await supabase.from("content").insert(rowsToInsert);
  if (error) {
    console.error("Lỗi khi insert vào Supabase:", error.message);
    process.exit(1);
  }

  console.log(`Đã insert thành công ${rowsToInsert.length} bản ghi vào bảng "content".`);
}

main().catch((err) => {
  console.error("Job thất bại:", err);
  process.exit(1);
});
