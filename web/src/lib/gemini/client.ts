import { GoogleGenerativeAI } from "@google/generative-ai";
import { geminiEnv } from "@/lib/env";

let _client: GoogleGenerativeAI | null = null;

export function getGemini() {
  if (!_client) {
    _client = new GoogleGenerativeAI(geminiEnv().GEMINI_API_KEY);
  }
  return _client;
}

export interface GeminiModelOptions {
  /** 上書きするモデル名（未指定なら env の GEMINI_MODEL）。 */
  model?: string;
  temperature?: number;
  /** 入力に合わせて切り替えるシステム指示。 */
  systemInstruction?: string;
  responseMimeType?: string;
}

export function getGeminiModel(opts: GeminiModelOptions = {}) {
  return getGemini().getGenerativeModel({
    model: opts.model ?? geminiEnv().GEMINI_MODEL,
    systemInstruction: opts.systemInstruction,
    generationConfig: {
      responseMimeType: opts.responseMimeType ?? "application/json",
      temperature: opts.temperature ?? 0.4,
    },
  });
}
