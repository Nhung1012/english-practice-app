// generate-content.mjs
// Sinh nội dung mới (hội thoại + script luyện nghe) bằng Google Gemini API
// (free tier, không cần thẻ tín dụng) và lưu vào Supabase. Chạy 1 lần/ngày
// qua GitHub Actions (xem .github/workflows/generate-content.yml).
//
// Biến môi trường bắt buộc:
//   GEMINI_API_KEY             - key lấy free tại https://aistudio.google.com/apikey
//   SUPABASE_URL               - vd: https://xxxx.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY  - service_role/secret key (CHỈ dùng ở server/CI,
//                                 tuyệt đối không đưa vào frontend)
//
// Chạy thử cục bộ:
//   GEMINI_API_KEY=xxx SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx node generate-content.mjs

import { createClient } from "@supabase/supabase-js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Dùng alias "latest" thay vì ghim cứng phiên bản (vd "gemini-2.5-flash") vì
// Google liên tục deprecate model cũ — alias này tự trỏ sang bản mới nhất,
// tránh phải sửa code mỗi khi model bị khai tử. Free tier: đủ dùng cho
// 6 request/ngày của app này.
const GEMINI_MODEL = "gemini-flash-latest";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Số chủ đề mới sinh MỖI LẦN chạy, cho mỗi tổ hợp (type, level).
// Giữ nhỏ (1-2) để không chạm rate limit — chạy cron hàng ngày sẽ tự tích luỹ dần.
const TOPICS_PER_RUN = 1;

const LEVELS = ["beginner", "intermediate", "advanced"];
const TYPES = ["dialogue", "listening"];

const LEVEL_DESC = {
  beginner: "A1-A2 (từ vựng đơn giản, câu ngắn, chủ đề đời sống hàng ngày)",
  intermediate: "B1-B2 (câu phức hơn, chủ đề công việc/xã hội thông dụng)",
  advanced: "C1-C2 (từ vựng học thuật/trừu tượng, lập luận, tranh luận)",
};

// Lấy danh sách chủ đề ĐÃ CÓ trong Supabase cho đúng type/level, để đưa vào
// prompt làm danh sách "cần tránh" ĐỘNG — không còn liệt kê cứng vài chủ đề
// mẫu trong prompt như trước, mà luôn phản ánh đúng dữ liệu thật hiện có.
async function fetchExistingTopics(supabase, type, level) {
  const { data, error } = await supabase
    .from("content")
    .select("topic")
    .eq("type", type)
    .eq("level", level);

  if (error) {
    console.warn(`  -> Không lấy được danh sách chủ đề đã có cho ${type}/${level}: ${error.message}`);
    return [];
  }

  return (data || []).map((row) => row.topic);
}

function buildPrompt(type, level, existingTopics) {
  const levelDesc = LEVEL_DESC[level];

  // Danh sách chủ đề cần tránh trùng, lấy động từ Supabase (không hardcode).
  const avoidBlock = existingTopics.length
    ? `\n\nDANH SÁCH CHỦ ĐỀ ĐÃ CÓ trong hệ thống cho đúng loại bài + trình độ này (lấy trực tiếp từ dữ liệu hiện tại — TUYỆT ĐỐI KHÔNG được sinh chủ đề trùng hoặc quá giống bất kỳ mục nào dưới đây):\n${existingTopics
        .map((t) => `- ${t}`)
        .join("\n")}`
    : "";

  if (type === "dialogue") {
    return `Bạn là người soạn giáo trình tiếng Anh. Hãy sinh ra ĐÚNG ${TOPICS_PER_RUN} đoạn hội thoại tiếng Anh giữa 2 người (A và B) để người Việt luyện nghe/đọc.

Yêu cầu:
- Trình độ: ${levelDesc}
- Chủ đề: tự chọn, đời sống thực tế, hoàn toàn mới, chưa từng xuất hiện trong hệ thống.
- Mỗi hội thoại có 10-15 lượt thoại (lines), xen kẽ A/B tự nhiên.
- Câu văn tự nhiên, đúng ngữ pháp, độ dài phù hợp trình độ.${avoidBlock}

Chỉ trả về JSON hợp lệ theo đúng schema sau, KHÔNG thêm text giải thích nào khác, KHÔNG bọc trong markdown code block:
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
- Chủ đề: tự chọn, hoàn toàn mới, chưa từng xuất hiện trong hệ thống.
- Đoạn văn dài khoảng 180-260 từ, chia thành nhiều câu ngắn/vừa để dễ highlight từng câu khi đọc.
- Văn phong tự nhiên, mạch lạc, đúng ngữ pháp.${avoidBlock}

Chỉ trả về JSON hợp lệ theo đúng schema sau, KHÔNG thêm text giải thích nào khác, KHÔNG bọc trong markdown code block:
{
  "items": [
    { "topic": "Tên chủ đề bằng tiếng Việt", "text": "đoạn văn tiếng Anh..." }
  ]
}`;
}

function extractJson(rawText) {
  // Gemini đôi khi bọc JSON trong ```json ... ``` dù đã yêu cầu không làm vậy.
  const match = rawText.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Không tìm thấy JSON trong phản hồi: " + rawText);
  return JSON.parse(match[0]);
}

async function callGeminiOnce(apiKey, prompt) {
  const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 1,
        maxOutputTokens: 3000,
        // Tắt "extended thinking" — model 2.5/3.x flash mặc định dành một phần
        // token cho suy luận nội bộ trước khi trả lời, dễ làm JSON bị cắt cụt
        // giữa chừng do hết token. Tác vụ này chỉ cần sinh văn bản đơn giản,
        // không cần suy luận sâu, nên tắt đi để dồn hết token cho phần trả lời.
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  });

  const json = await res.json();

  if (!res.ok) {
    const message = json?.error?.message || `HTTP ${res.status}`;
    throw new Error(message);
  }

  const rawText = json?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("\n");
  if (!rawText) {
    throw new Error("Phản hồi Gemini không có nội dung text: " + JSON.stringify(json));
  }
  return rawText;
}

async function callGemini(apiKey, prompt, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await callGeminiOnce(apiKey, prompt);
    } catch (err) {
      const isLastAttempt = attempt === retries;
      // Free tier Gemini đôi khi quá tải tạm thời ("high demand") — lỗi này
      // đáng để thử lại; các lỗi khác thì thử lại cũng vô ích nhưng không hại gì.
      if (isLastAttempt) throw err;
      console.log(`     (thử lại lần ${attempt + 1}/${retries} sau lỗi: ${err.message})`);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}

async function generateForCombo(apiKey, type, level, existingTopics) {
  const prompt = buildPrompt(type, level, existingTopics);
  const rawText = await callGemini(apiKey, prompt);
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

function normalizeTopic(topic) {
  return (topic || "").trim().toLowerCase();
}

async function main() {
  if (!GEMINI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error(
      "Thiếu biến môi trường bắt buộc: GEMINI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY"
    );
    process.exit(1);
  }

  const trimmedKey = GEMINI_API_KEY.trim();
  console.log(
    `GEMINI_API_KEY: độ dài ${trimmedKey.length} ký tự, bắt đầu bằng "${trimmedKey.slice(0, 6)}...", kết thúc bằng "...${trimmedKey.slice(-4)}"`
  );

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const rowsToInsert = [];

  for (const type of TYPES) {
    for (const level of LEVELS) {
      console.log(`Đang sinh nội dung: type=${type} level=${level} ...`);
      try {
        // Lấy chủ đề đã có (dữ liệu động từ Supabase) để nhắc Gemini tránh trùng.
        const existingTopics = await fetchExistingTopics(supabase, type, level);
        const rows = await generateForCombo(trimmedKey, type, level, existingTopics);

        // Lớp chặn an toàn phía client: nếu Gemini vẫn lỡ sinh trùng dù đã
        // được nhắc tránh, bỏ chủ đề đó thay vì insert thêm dữ liệu trùng lặp.
        const existingNormalized = new Set(existingTopics.map(normalizeTopic));
        const newRows = rows.filter((row) => {
          const key = normalizeTopic(row.topic);
          const isDuplicate =
            existingNormalized.has(key) ||
            rowsToInsert.some(
              (r) => r.type === row.type && r.level === row.level && normalizeTopic(r.topic) === key
            );
          if (isDuplicate) {
            console.warn(`  -> Bỏ qua chủ đề bị trùng: "${row.topic}"`);
          }
          return !isDuplicate;
        });

        rowsToInsert.push(...newRows);
        console.log(`  -> sinh được ${rows.length} bản ghi, giữ lại ${newRows.length} bản ghi mới (không trùng)`);
      } catch (err) {
        // Không để 1 combo lỗi làm hỏng toàn bộ job — log lại và tiếp tục.
        console.error(`  -> LỖI ở type=${type} level=${level}:`, err.message);
      }
      // Free tier Gemini giới hạn 10 request/phút — chờ 1 chút giữa các lần gọi
      // cho an toàn (6 request/lần chạy, không cần chờ lâu).
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  if (rowsToInsert.length === 0) {
    console.error("Không sinh được bản ghi nào (hoặc tất cả đều bị trùng), dừng job (không insert gì).");
    process.exit(1);
  }

  // Insert TỪNG bản ghi thay vì cả lô: nếu 1 chủ đề vẫn lỡ trùng (vi phạm
  // unique index uq_content_type_level_topic trong DB), chỉ bản ghi đó bị bỏ
  // qua — các bản ghi còn lại vẫn được lưu, job không fail toàn bộ như trước.
  let inserted = 0;
  let skipped = 0;
  for (const row of rowsToInsert) {
    const { error } = await supabase.from("content").insert(row);
    if (!error) {
      inserted++;
      continue;
    }
    // Mã 23505 = unique_violation (Postgres) — bản ghi trùng, bỏ qua an toàn.
    if (error.code === "23505" || /duplicate key/i.test(error.message)) {
      skipped++;
      console.warn(`  -> Bỏ qua bản ghi trùng trong DB: ${row.type}/${row.level} "${row.topic}"`);
    } else {
      console.error(`  -> Lỗi insert ${row.type}/${row.level} "${row.topic}":`, error.message);
    }
  }

  console.log(`Kết quả: insert thành công ${inserted}/${rowsToInsert.length} bản ghi (bỏ qua ${skipped} bản trùng).`);

  if (inserted === 0) {
    console.error("Không insert được bản ghi nào, đánh dấu job thất bại.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Job thất bại:", err);
  process.exit(1);
});
