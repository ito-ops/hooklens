# 競合分析: Social Insight (sns.userlocal.jp) と Tsukami の戦略

調査日: 2026年5月

---

## エグゼクティブサマリー

**Social Insight** は株式会社ユーザーローカルが提供する、日本最大規模（4,300万アカウント対応）のエンタープライズ向け SNS 統合分析プラットフォーム。料金は非公開で「ビジネス版」「エンタープライズ版」の2階層、想定では月額 5万〜30万円超の価格帯。

**Tsukami の競争優位性として狙えるポイント:**
1. **エントリー価格を1/10〜1/30** にして、個人クリエイター〜中小企業へ降ろす
2. 競合の **分析・モニタリング機能** は Apify で90%実現可能
3. 競合の **投稿管理・キャンペーン機能** は Apify 単独では不可（公式API必須）→ 段階的に統合
4. 競合にない **Tsukami のフック評価AI** は差別化の核

---

## 1. Social Insight の機能カタログ

### 4つの製品ピラー

#### A. アカウント分析（Fan Analytics）
- フォロワー推移・属性分析
- 競合アカウントモニタリング
- 投稿効果測定（最適投稿時間）
- インフルエンサー調査
- 反応分析・エンゲージメント率
- 業界ランキング
- **対応**: IG / X / FB / YT / TikTok / LINE / Pinterest / note / Threads / mixi / LinkedIn / Bluesky

#### B. クチコミ分析（Listening）
- キーワード/URL/ハッシュタグ監視
- 感情分析（ポジ・ネガ）
- トピック抽出（AI搭載）
- 競合との並列比較
- 炎上検知・風評対策
- ユーザーペルソナ分析（性年代地域）
- 数百億件のクチコミ蓄積データ
- CSVエクスポート

#### C. 投稿管理（Social CRM）
- 複数アカウント予約投稿
- 投稿承認ワークフロー
- コメント一元管理（ステータス分類: 要返信/要相談）
- 自動リプライ
- 複数担当者対応
- コメント一括ダウンロード

#### D. キャンペーン
- フォロー&リポストキャンペーン
- ハッシュタグキャンペーン
- インスタントウィン（即時抽選）
- 応募者管理＆CSV出力
- 当選者への自動DM送信
- 効果測定レポート

---

## 2. Apify による実装可能性マッピング

### ✅ 100% 実装可能（Apify で完結）

| Social Insight 機能 | Apify Actor | 単価 (約) |
|---|---|---|
| IG フォロワー数推移 | `apify/instagram-followers-count` | $1.30/1k |
| IG 投稿分析 | `apify/instagram-scraper` | $1.50/1k 投稿 |
| IG プロフィール詳細 | `apify/instagram-profile-scraper` | $1.60/1k |
| IG ハッシュタグ追跡 | `apify/instagram-hashtag-scraper` | $1.90/1k |
| TikTok 動画分析 | `clockworks/tiktok-scraper` | $0.30/1k 投稿 |
| TikTok プロフィール | `clockworks/tiktok-profile-scraper` | 従量 |
| TikTok ハッシュタグ | `clockworks/tiktok-hashtag-scraper` | $5/1k |
| X (Twitter) ツイート検索 | `kaitoeasyapi/tweet-scraper` | $0.25/1k ツイート |
| X プロフィール | `apidojo/twitter-scraper-lite` | 従量（イベント単位） |
| YouTube チャンネル分析 | `apidojo/youtube-channel-scraper` | 従量 |
| YouTube 動画/コメント | `starvibe/youtube-scraper` | 従量 |
| Threads | Apifyに専用Actor | 従量 |
| LinkedIn | Apify Store に複数 | 高め |
| Pinterest | Apify Store に複数 | 中程度 |

**コスト試算（小規模ユーザー想定）:**
- 1ユーザーあたり 月 100投稿分析 + 競合5アカウント追跡（週次）= 約 $0.30〜$1
- Apify 月額 $29 (Starter) で 50ユーザー程度をカバー可能

### ⚠️ 半分実装可能（追加開発が必要）

| 機能 | Apify でできる部分 | 追加で必要なもの |
|---|---|---|
| 感情分析（ポジネガ） | データ取得は Apify | **Gemini で文章分類**（既にTsukamiで実装中） |
| トピック抽出 | データ取得は Apify | Gemini でクラスタリング＆要約 |
| 炎上検知 | キーワードモニタリング | Gemini で異常検知ロジック + 通知（メール/Slack） |
| 競合比較レポート | 各社のデータ取得 | データ集計＆ダッシュボード（Tsukamiが既に持つ） |
| ペルソナ分析 | フォロワーリスト取得 | Apify は性年代を返さないため、AI推定 or 別データソース必要 |

### ❌ Apify では不可（公式 API 必須）

| 機能 | 必須API | 取得の難易度 |
|---|---|---|
| 予約投稿（IG/FB） | **Instagram Graph API** | Meta Business 認証 |
| 予約投稿（X） | **X API v2** | $200/月〜 |
| 予約投稿（TikTok） | **TikTok Business API** | 法人申請必要 |
| コメント自動取得＆返信 | 各PFの公式API | 同上 |
| キャンペーン抽選（投稿側）| 同上 | 同上 |
| インスタントウィン（DM送信） | Instagram/X 公式API（DM権限） | 高難易度 |

**結論**: アカウント分析・クチコミ分析は Apify で実現可能。投稿管理・キャンペーン管理は公式API依存。

---

## 3. Tsukami の差別化戦略

### 競合が持っていない / 弱い領域 = Tsukami の強み

1. **フック評価AI** (Tsukami の核)
   - 11観点で冒頭3秒を多角採点
   - Gemini ベースで改善案を自動生成
   - 業界別の文脈反映
   - → 競合は「分析後の振り返り」、Tsukami は「投稿前の予測＆改善」

2. **個人/中小企業フォーカス**
   - 競合はエンタープライズ（5万円〜）
   - Tsukami は個人 Free / Pro ¥2,980 / Team ¥14,800
   - 価格帯を **10〜30倍下げる**

3. **動画特化**
   - 競合は静的SNSも含む汎用
   - Tsukami は IG Reels / Shorts / TikTok の「ショート動画」特化

4. **データ収集パイプライン**
   - ユーザーが投稿URLを貼るだけで自動取り込み＆スコア化
   - 競合はダッシュボード前提、設定が重い

### 競合に合わせて実装すべき機能（優先度順）

| 優先度 | 機能 | 実装難易度 | Apify 必要 |
|---|---|---|---|
| 🔥 P0 | アカウント分析（自分のIG/TikTok/YT）| 中 | あり |
| 🔥 P0 | 競合アカウント追跡（最大5〜10アカウント）| 中 | あり |
| 🔥 P0 | フォロワー推移グラフ | 低 | あり |
| 🔥 P0 | 業界ベンチマーク | 中 | あり |
| 🟠 P1 | ハッシュタグトレンド分析 | 中 | あり |
| 🟠 P1 | クチコミ／メンション監視 | 中 | あり |
| 🟠 P1 | 感情分析（Gemini） | 低 | Apify + Gemini |
| 🟠 P1 | 炎上アラート | 中 | Apify + Gemini |
| 🟡 P2 | インフルエンサー検索 | 高 | あり |
| 🟡 P2 | キャンペーン応募者管理 | 高 | X/IG 公式API |
| 🔴 P3 | 予約投稿 | 非常に高 | 公式API |

---

## 4. 価格戦略の提案

### 競合の想定価格 vs Tsukami

| プラン | Social Insight (推定) | Tsukami（提案） | 倍率 |
|---|---|---|---|
| 個人 | なし | **Free / ¥0** | — |
| エントリー | なし | **Pro ¥2,980/月** | — |
| SMB | ビジネス版 ¥50,000〜? | **Team ¥14,800/月** | 約 1/3 |
| 中規模法人 | エンタープライズ ¥150,000〜? | **Business ¥39,800/月**（新設提案） | 約 1/4 |
| 大規模法人 | エンタープライズ ¥300,000〜? | **Enterprise 要問合せ** | — |

### 各プランの内容案

#### Free（個人クリエイター）
- フック分析 1日5回
- 改善案 3パターン
- 自分のアカウント 1個追跡（週次更新）

#### Pro ¥2,980/月（副業/専業クリエイター）
- フック分析 無制限
- 改善案 5パターン
- 自分のアカウント 3個追跡（日次）
- IG実績レポート 月20件
- 競合アカウント追跡 5個

#### Team ¥14,800/月（中小企業マーケチーム）
- Pro 機能すべて
- 複数メンバー（10人）
- 競合 20個追跡
- ハッシュタグ追跡 10個
- クチコミ/メンション監視（メール通知）
- 業界ベンチマーク（25業界）
- CSV エクスポート

#### Business ¥39,800/月（中規模法人）※新設提案
- Team 機能すべて
- 感情分析・炎上アラート
- インフルエンサー検索
- API アクセス
- 専属サポート

#### Enterprise（要問合せ）
- 投稿管理・予約投稿（公式API統合）
- キャンペーン管理
- 専用ダッシュボード
- SLA 保証

---

## 5. コスト試算（Tsukami 側）

### 月次の Apify コスト（例: Pro 100名 + Team 20名 + Business 5名）

| プラン | 人数 | 月次データ取得 | 単価 | 月額コスト |
|---|---|---|---|---|
| Pro | 100 | 各 100投稿 + 5競合 = 600件/人 | $1.50/1k | $9 |
| Team | 20 | 各 1,000投稿 + 20競合 = 5,000件/人 | $1.50/1k | $150 |
| Business | 5 | 各 5,000投稿 + 監視 = 20,000件/人 | $1.50/1k | $150 |
| **合計** | 125 | 約 22万件/月 | | **約 $310/月（≈ ¥46,000）** |

**売上想定（同条件）:**
- Pro: 100 × ¥2,980 = ¥298,000
- Team: 20 × ¥14,800 = ¥296,000
- Business: 5 × ¥39,800 = ¥199,000
- **合計売上: 約 ¥793,000/月**

**粗利:** ¥793,000 − ¥46,000（Apify）− 数万円（Gemini）− 1万円程度（Supabase/Vercel）= **約 ¥730,000/月（粗利率 92%）**

---

## 6. 実装ロードマップ提案

### Phase 1: 既存機能の磨き込み（W1〜2 ← 現在）
- ✅ フック分析（完了）
- ✅ Stripe / Supabase / Gemini（完了）
- ⏳ IG レポート機能（Apify 連携、APIキー待ち）

### Phase 2: 競合機能の段階実装（W3〜6）
- アカウント追跡（自分 + 競合）の定期実行 cron
- フォロワー推移グラフ（Recharts）
- ハッシュタグトレンド
- TikTok / YouTube 連携追加（Apify Actor 切り替えるだけ）

### Phase 3: AI付加機能（W7〜10）
- Gemini で感情分析（ポジネガ判定）
- トピック自動クラスタリング
- 炎上アラート（しきい値検知 + メール）

### Phase 4: Business プラン機能（W11〜）
- インフルエンサー検索（フォロワー数フィルタ）
- 業界ランキング自動更新
- API キー発行

### Phase 5: Enterprise プラン機能（後期）
- IG/X 公式 API 統合（要 Meta/X 法人申請）
- 予約投稿
- キャンペーン管理

---

## 7. 即やるべき次のアクション

1. **Apify API token 取得**（無料枠 $5/月クレジットで PoC 開始）
2. 既存の `/api/reports/ingest` で IG 投稿取り込みを動作確認
3. 「競合アカウント追跡」機能を MVP 実装（最初は手動トリガー、後で cron）
4. プラン構成に **Business ¥39,800/月** を追加するか決定
5. ランディングページで競合比較表を打ち出す（「Social Insight より1/10の価格で同等機能」）

---

## Sources

- [Social Insight TOP](https://sns.userlocal.jp/)
- [Social Insight 料金](https://sns.userlocal.jp/document/price/)
- [Social Insight アカウント分析](https://sns.userlocal.jp/functions/fan_analytics/)
- [Social Insight クチコミ分析](https://sns.userlocal.jp/functions/listening/)
- [Social Insight 投稿管理](https://sns.userlocal.jp/functions/social_crm/)
- [Social Insight キャンペーン](https://sns.userlocal.jp/functions/campaign/)
- [Apify Instagram Scraper](https://apify.com/apify/instagram-scraper)
- [Apify TikTok Scraper](https://apify.com/clockworks/tiktok-scraper)
- [Apify Twitter/X Scrapers](https://apify.com/scrapers/twitter)
- [Apify YouTube Scrapers](https://apify.com/starvibe/youtube-scraper)
- [Apify Pricing](https://apify.com/pricing)
- [Best Social Media Scrapers on Apify (2026)](https://use-apify.com/docs/best-apify-actors/best-social-media-scrapers)
