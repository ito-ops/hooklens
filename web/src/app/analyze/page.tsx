import { AppShell } from "@/components/AppNav";
import { AnalyzeForm } from "./AnalyzeForm";

export default function AnalyzePage() {
  return (
    <AppShell
      active="analyze"
      title="フックを分析する"
      subtitle="冒頭3秒のコピーを、AIが11観点でスコアリング＆改善提案します。"
    >
      <AnalyzeForm />
    </AppShell>
  );
}
