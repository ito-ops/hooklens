import { GoogleGenerativeAI } from "@google/generative-ai";
import { geminiEnv } from "@/lib/env";

let _client: GoogleGenerativeAI | null = null;

export function getGemini() {
  if (!_client) {
    _client = new GoogleGenerativeAI(geminiEnv().GEMINI_API_KEY);
  }
  return _client;
}

export function getGeminiModel() {
  return getGemini().getGenerativeModel({
    model: geminiEnv().GEMINI_MODEL,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.4,
    },
  });
}
