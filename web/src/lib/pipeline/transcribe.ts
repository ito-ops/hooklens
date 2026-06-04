import { z } from "zod";
import { getGeminiModel } from "@/lib/gemini/client";
import { downloadVideo } from "@/lib/apify/client";

const transcribeSchema = z.object({
  hook_text: z.string(),
  opening_transcript: z.string().default(""),
});

export interface TranscribeResult {
  hookText: string;
  transcript: string;
  /** 抽出元: video=動画文字起こし, caption=キャプション近似, none=失敗 */
  source: "video" | "caption" | "none";
}

function extractJson(raw: string): unknown {
  const trimmed = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  return JSON.parse(trimmed);
}

/** キャプションから素朴に冒頭を取り出す（フォールバック）。 */
function hookFromCaption(caption?: string | null): string {
  if (!caption) return "";
  const cleaned = caption.replace(/\s+/g, " ").trim();
  const first = cleaned.split(/[。．.!?！？\n]/)[0]?.trim() ?? "";
  return (first.length >= 6 ? first : cleaned).slice(0, 100);
}

/**
 * 動画の冒頭2〜3秒で「実際に話している／字幕で出る」フックを Gemini で文字起こしする。
 * 動画が取得できない/大きすぎる場合はキャプション冒頭にフォールバック。
 */
export async function transcribeHook(input: {
  videoUrl?: string | null;
  caption?: string | null;
}): Promise<TranscribeResult> {
  // 1) 動画があればマルチモーダルで文字起こし
  if (input.videoUrl) {
    try {
      const video = await downloadVideo(input.videoUrl);
      if (video) {
        const model = getGeminiModel({ temperature: 0.1 });
        const { response } = await model.generateContent([
          {
            text:
              "この動画の最初の2〜3秒で、演者が実際に話している言葉、または画面に大きく出ている字幕（=フック/つかみ）を、日本語でそのまま文字起こししてください。" +
              "装飾やハッシュタグは含めず、聞こえた/見えたままの一文を hook_text に入れてください。" +
              "冒頭の数秒の発話を少し長めに opening_transcript に入れてください。JSONで返答。",
          },
          { inlineData: { mimeType: video.mimeType, data: video.base64 } },
        ]);
        const parsed = transcribeSchema.parse(extractJson(response.text()));
        const hookText = parsed.hook_text.trim();
        if (hookText) {
          return { hookText, transcript: parsed.opening_transcript.trim(), source: "video" };
        }
      }
    } catch (e) {
      console.warn("[transcribe] video transcription failed, falling back to caption:", e);
    }
  }

  // 2) キャプション近似
  const fromCaption = hookFromCaption(input.caption);
  if (fromCaption) {
    return { hookText: fromCaption, transcript: "", source: "caption" };
  }

  return { hookText: "", transcript: "", source: "none" };
}
