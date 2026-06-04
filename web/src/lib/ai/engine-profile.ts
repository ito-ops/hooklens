import type { Platform } from "@/types/domain";

/**
 * 入力内容（プラットフォーム / 業界 / ターゲット / タスク）に合わせて
 * 裏側の生成AIを最適化するための「エンジンプロファイル」。
 *
 * - systemInstruction: ペルソナ + プラットフォーム指針 + 業界別の勘所
 * - temperature: タスクで切替（分析=低い=一貫性 / 生成=高い=多様性）
 * - model: 既定は環境変数のモデル。業界の難度に応じて昇格も可能（拡張ポイント）。
 */

export type EngineTask = "analyze" | "generate";

interface IndustryProfile {
  /** 想定オーディエンスと文脈 */
  audience: string;
  /** このジャンルで刺さるフックの型・語彙 */
  hookPlaybook: string;
  /** トーン・コンプラ上の注意 */
  cautions?: string;
}

const PLATFORM_GUIDE: Record<Platform, string> = {
  instagram:
    "Instagram Reels。保存・シェアされる「役立つ/共感」系が強い。1行目で結論or意外性、ビジュアル前提で語りすぎない。",
  shorts:
    "YouTube Shorts。検索流入も意識。最初の2秒で『何の動画か』を明示しつつ続きを匂わせる。やや説明的でも可。",
  tiktok:
    "TikTok。スワイプ前提でテンポ最優先。口語・トレンド語・ツッコミ余地のある言い切りが伸びやすい。",
};

/**
 * 業界別プロファイル。未定義の業界は DEFAULT_PROFILE を使う。
 * ワーホリ/留学/語学など海外系は特に手厚く定義。
 */
const INDUSTRY_PROFILES: Record<string, IndustryProfile> = {
  "working-holiday": {
    audience: "18〜30歳。海外で働きながら暮らすことに憧れ＆不安を持つ層。費用・ビザ・英語力・帰国後のキャリアが主な関心。",
    hookPlaybook:
      "リアルな費用/貯金額の数字、『行く前に知りたかった』失敗談、ビザや締切の期限性、現地の年収/時給ギャップ、英語ゼロでも行けた等の常識破壊が刺さる。",
    cautions: "ビザ・就労条件は国により異なるため断定しすぎない。誇大な収入保証は避ける。",
  },
  "study-abroad": {
    audience: "高校〜20代と保護者。語学/学位/キャリアのための留学を検討。費用対効果と失敗回避への関心が強い。",
    hookPlaybook:
      "総費用や奨学金の具体額、『留学しても英語が伸びない人の共通点』など逆説、国・都市の比較、エージェント不要で安くする方法などの有益情報が強い。",
    cautions: "学校/ビザ情報は変わりやすいので断定回避。効果には個人差がある旨を含意。",
  },
  language: {
    audience: "英語/語学を独学またはスクールで学ぶ社会人・学生。挫折経験者が多い。",
    hookPlaybook:
      "『〇ヶ月でTOEIC+200』等の数字、ネイティブの本音、よくある間違い指摘、最短勉強法、教材不要などの逆説が刺さる。",
    cautions: "学習効果の保証は避け、再現性は個人差ありとする。",
  },
  travel: {
    audience: "旅行好き・これから計画する層。コスパ・穴場・失敗回避に関心。",
    hookPlaybook:
      "総額/節約額の数字、『知らないと損する』系、絶景の意外性、現地でやってはいけない事などのギャップが強い。",
  },
  beauty: {
    audience: "美容感度の高い10〜40代。即効性とビフォーアフターに反応。",
    hookPlaybook: "ビフォーアフター、『プロしか知らない』権威性、年齢/悩み明示のターゲティング、即効性の数字が刺さる。",
    cautions: "医療・効果効能の断定表現（治る等）は避ける。",
  },
  fitness: {
    audience: "ダイエット/筋トレに取り組む層。時短・即効・挫折回避に反応。",
    hookPlaybook: "期間×成果の数字、『〇〇な人がやりがちな間違い』、ながら/短時間訴求、意外な原因の指摘が強い。",
    cautions: "過度な減量保証や医療的断定は避ける。",
  },
  finance: {
    audience: "投資/節約/お金の不安を持つ社会人。損失回避と再現性を重視。",
    hookPlaybook: "金額の具体数字、『知らないと損』、新NISA等の制度フック、失敗談、期限性が刺さる。",
    cautions: "投資助言・利益保証は避け、一般情報として中立に。元本保証等の断定NG。",
  },
  health: {
    audience: "健康/不調改善に関心のある層。",
    hookPlaybook: "症状の心当たり提示、意外な原因、簡単セルフチェック、専門家見解の権威性が刺さる。",
    cautions: "診断・治療効果の断定は避け、受診を妨げない表現に。",
  },
  saas: {
    audience: "業務効率化を探す担当者・経営者。ROIと工数削減に反応。",
    hookPlaybook: "削減できる時間/コストの数字、『まだ手作業？』の課題提起、導入前後比較、具体ユースケースが強い。",
  },
  marketing: {
    audience: "集客/運用に悩むマーケ担当・個人事業主。",
    hookPlaybook: "成果の数字、『9割が間違えている』逆説、手順の型化、最新アルゴリズム話題が刺さる。",
  },
  "side-business": {
    audience: "副業・起業に関心のある会社員。再現性と初期費用への不安。",
    hookPlaybook: "月収/初期費用の数字、未経験/スキマ時間訴求、失敗談、『会社にバレずに』等の状況設定が強い。",
    cautions: "収入保証・誇大な再現性訴求は避ける。",
  },
  education: {
    audience: "受験生・保護者・学習者。成績と効率に関心。",
    hookPlaybook: "偏差値/点数の数字、『落ちる人の共通点』、最短勉強法、意外な常識否定が刺さる。",
  },
  "self-improvement": {
    audience: "習慣化・生産性・マインドを高めたい層。",
    hookPlaybook: "before/after、『成功者の共通点』、1つの習慣訴求、逆説的アドバイスが強い。",
  },
  food: {
    audience: "料理/グルメ好き。時短・簡単・意外性に反応。",
    hookPlaybook: "材料数/時間の数字、『プロの裏技』、意外な組み合わせ、失敗しないコツが刺さる。",
  },
};

const DEFAULT_PROFILE: IndustryProfile = {
  audience: "そのジャンルに関心のある一般のショート動画視聴者。",
  hookPlaybook: "具体的な数字、ターゲットの明示、意外性/常識破壊、続きを匂わせる好奇心ギャップが普遍的に効く。",
};

export interface EngineProfile {
  model?: string;
  temperature: number;
  systemInstruction: string;
  /** デバッグ/レポート用にどのプロファイルを使ったか */
  industryKey: string;
}

export interface EngineProfileInput {
  platform: Platform;
  industry: string;
  target?: string;
}

export function getEngineProfile(input: EngineProfileInput, task: EngineTask): EngineProfile {
  const profile = INDUSTRY_PROFILES[input.industry] ?? DEFAULT_PROFILE;
  const platformGuide = PLATFORM_GUIDE[input.platform];

  const roleLine =
    task === "analyze"
      ? "あなたはショート動画のフック（冒頭2〜3秒のつかみ）を評価する、データドリブンなマーケティング分析の専門家です。"
      : "あなたはショート動画のリール本編で、演者が最初に“口に出す一言”でスクロールを止めさせる、トップクラスの構成作家です。タイトルやサムネ文言ではなく、話し言葉のフックを書きます。損失回避・感情・自分ごと化を巧みに使います。";

  const systemInstruction = [
    roleLine,
    `【プラットフォーム特性】${platformGuide}`,
    `【想定オーディエンス】${profile.audience}`,
    `【このジャンルで効くフックの型】${profile.hookPlaybook}`,
    profile.cautions ? `【表現上の注意】${profile.cautions}` : "",
    input.target ? `【今回のターゲット】${input.target}（この層に刺さる言葉選び・粒度に最適化すること）` : "",
    task === "analyze"
      ? "評価は辛口かつ一貫性を重視し、上記の型に照らして根拠ある点数を付けること。"
      : "上記の型を活かしつつ、必ず『話し言葉の一文』として自然なフックを生成すること。タイトル/見出し調（【】や体言止めの羅列）は禁止。損失回避（放置するリスク）と感情を毎回どれかの候補で必ず使うこと。",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    // 既定は環境変数のモデル。将来、難度の高いジャンルだけ上位モデルに昇格させる拡張余地を残す。
    model: undefined,
    temperature: task === "analyze" ? 0.3 : 0.85,
    systemInstruction,
    industryKey: input.industry in INDUSTRY_PROFILES ? input.industry : "default",
  };
}
