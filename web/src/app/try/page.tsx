import type { Metadata } from "next";
import { TryClient } from "./TryClient";

export const metadata: Metadata = {
  title: "Tsukami — フック分析を試す",
  description: "ログイン不要。ショート動画の冒頭フックをAIが11観点でスコアリングし、改善案を提案します。",
  robots: { index: false, follow: false },
};

export default function TryPage() {
  return <TryClient />;
}
