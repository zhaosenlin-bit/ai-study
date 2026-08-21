/**
 * 情绪观察：调用 MiniMax 大模型分析学生文本情绪。
 *
 * - 浏览器直连 api.minimax.chat（官方支持 CORS + Bearer 鉴权，已验证）。
 * - Key 从 .env.local 读取（VITE_MINIMAX_API_KEY / VITE_MINIMAX_API_KEY_BACKUP），
 *   主 key 额度用尽（status 2056）或鉴权失败时自动切换备用 key 重试一次。
 * - 解析失败 / 网络异常时抛出，由调用方降级为默认表情，绝不影响对话主流程。
 */
import type { MoodResult, MoodTag } from "@/config/emotionMap";

const MINIMAX_ENDPOINT = "https://api.minimax.chat/v1/text/chatcompletion_v2";
const MINIMAX_MODEL = "MiniMax-Text-01";

/** 合法的情绪标签集合（防止模型输出未知标签时直接丢给映射表） */
const VALID_TAGS = new Set<MoodTag>([
  "happy", "excited", "sad", "angry", "tired", "confused",
  "frustrated", "curious", "focused", "anxious", "neutral",
]);

const SYSTEM_PROMPT = `你是小学 AI 学习伙伴的"情绪观察员"。根据学生最新一句话，判断其当下的情绪状态。
只输出 JSON，不要输出任何其他内容，格式严格为：{"emotion":"<标签>","intensity":<0到1的小数>}
情绪标签只能是以下之一：happy 开心 / excited 兴奋 / sad 失落难过 / angry 生气 / tired 疲惫 /
confused 困惑 / frustrated 受挫 / curious 好奇 / focused 专注 / anxious 紧张 / neutral 平静。
intensity 表示情绪强度，如"好难过啊"为 0.9，"还行"为 0.4。`;

interface MiniMaxMessage {
  role: "system" | "user";
  content: string;
}

async function callMiniMax(apiKey: string, userText: string): Promise<MoodResult> {
  const res = await fetch(MINIMAX_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MINIMAX_MODEL,
      temperature: 0.1,
      max_tokens: 30,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userText },
      ] satisfies MiniMaxMessage[],
    }),
  });

  if (!res.ok) {
    throw new Error(`MiniMax HTTP ${res.status}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
    base_resp?: { status_code?: number; status_msg?: string };
  };

  // Token 额度用尽等业务错误码
  const code = data.base_resp?.status_code ?? 0;
  if (code !== 0) {
    throw new Error(`MiniMax ${code}: ${data.base_resp?.status_msg ?? "unknown"}`);
  }

  const content = data.choices?.[0]?.message?.content ?? "";
  return parseMood(content);
}

/** 解析模型输出 JSON，容错：剥离 markdown 代码块、提取首个 {...} */
function parseMood(content: string): MoodResult {
  const cleaned = content
    .replace(/```json|```/g, "")
    .trim()
    .match(/\{[\s\S]*\}/);
  if (!cleaned) throw new Error("MiniMax 返回非 JSON");

  const obj = JSON.parse(cleaned[0]) as Partial<MoodResult>;
  const emotion = (obj.emotion ?? "neutral").toLowerCase() as MoodTag;
  const intensity = typeof obj.intensity === "number"
    ? Math.min(Math.max(obj.intensity, 0), 1)
    : 0.5;

  return {
    emotion: VALID_TAGS.has(emotion) ? emotion : "neutral",
    intensity,
  };
}

/**
 * 分析一段文本的情绪。主 key 失败自动切备用 key 重试一次。
 * 两个 key 都不可用时抛出异常，调用方负责降级。
 */
export async function detectMood(userText: string): Promise<MoodResult> {
  const text = userText.trim();
  if (!text) return { emotion: "neutral", intensity: 0.5 };

  const keys = [
    import.meta.env.VITE_MINIMAX_API_KEY,
    import.meta.env.VITE_MINIMAX_API_KEY_BACKUP,
  ].filter((k): k is string => Boolean(k));

  let lastError: unknown;
  for (const key of keys) {
    try {
      return await callMiniMax(key, text);
    } catch (e) {
      lastError = e;
      // 只有主 key 失败才继续尝试备用 key
    }
  }
  throw lastError ?? new Error("未配置 MiniMax API Key");
}
