import { AppShell } from "@/components/AppNav";
import { NewReportForm } from "./NewReportForm";

export default function NewReportPage() {
  return (
    <AppShell active="reports" title="新規レポート" subtitle="Instagram投稿URLからレポートを生成します。">
      <div className="grid grid-cols-12 gap-5">
        <section className="surface-card col-span-12 p-7 lg:col-span-8">
          <NewReportForm />
        </section>

        <section className="surface-card col-span-12 p-6 lg:col-span-4">
          <h3 className="mb-3 text-sm font-bold text-[var(--color-ink)]">レポートでわかること</h3>
          <ul className="space-y-3 text-xs leading-relaxed text-[var(--color-ink-soft)]">
            <li className="flex gap-2">
              <span>📊</span>
              <span>各投稿のフックスコアと実績の相関</span>
            </li>
            <li className="flex gap-2">
              <span>💡</span>
              <span>伸びた投稿に共通するパターン抽出</span>
            </li>
            <li className="flex gap-2">
              <span>⚠️</span>
              <span>伸びなかった投稿の共通する弱点</span>
            </li>
            <li className="flex gap-2">
              <span>✨</span>
              <span>次にやるべきフック提案（あなたのアカウント文脈に最適化）</span>
            </li>
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
