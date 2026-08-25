/**
 * 课堂语音（TTS）：基于浏览器 Web Speech API，中文语音。
 * 零依赖、无需 API key；无语音支持时静默降级。
 */

let cachedVoice: SpeechSynthesisVoice | null = null;
let voiceReady = false;

function pickVoice(): SpeechSynthesisVoice | null {
  if (!("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find(
      (v) => v.lang.startsWith("zh") && /huihui|yaoyao|xiaoxiao|xiaoyi|xiaofeng|yunjian/i.test(v.name),
    ) ??
    voices.find((v) => v.lang.startsWith("zh")) ??
    null
  );
}

function ensureVoice(): SpeechSynthesisVoice | null {
  if (!voiceReady) {
    cachedVoice = pickVoice();
    // getVoices 首次可能为空，监听 voiceschanged 再取一次
    window.speechSynthesis?.addEventListener?.("voiceschanged", () => {
      cachedVoice = pickVoice();
    });
    voiceReady = true;
  }
  return cachedVoice;
}

/** 朗读一段中文文本（会打断上一段） */
export function speak(text: string, opts?: { rate?: number; pitch?: number }): void {
  if (!("speechSynthesis" in window)) return;
  if (!text?.trim()) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  const voice = ensureVoice();
  if (voice) utter.voice = voice;
  utter.lang = "zh-CN";
  utter.rate = opts?.rate ?? 1.05;
  utter.pitch = opts?.pitch ?? 1.1;
  window.speechSynthesis.speak(utter);
}

/** 停止朗读 */
export function stopSpeaking(): void {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}
