# プロジェクト概要
インボイス制度に対応した請求書画像をAI（Gemini API）で解析し、データの抽出・バリデーション・保存・管理を行うWebアプリケーションです。
単なるOCR（文字認識）に留まらず、AIの抽出結果を人間が確認・修正し、論理的な整合性をチェックする「実務で使える仕組み」を重視して設計しました。

# 主な機能
・AI請求書解析: Gemini 1.5 Flash（またはPro）を使用し、画像から登録番号、日付、税率別金額、合計金額を自動抽出。
・論理バリデーション: 10%・8%の対象額と消費税額の計算整合性を自動チェック。
・インタラクション・ダッシュボード:
    ・一覧画面でのサマリー表示。
    ・アコーディオン形式による詳細な内訳の段階的開示（UXへの配慮）。
・実務向けエクスポート: Excelでの文字化けを防止するBOM付きCSVダウンロード機能。
・セキュリティ: Basic認証による限定公開と、環境変数によるAPIキーの厳重管理。

# 技術スタック
| カテゴリ | 使用技術 | 採用理由 |
| Frontend/Backend | Next.js 15+ (App Router) | 高速な開発サイクルと、Server/Client Componentsの使い分けによる最適化のため。 |
| AI SDK | Google Generative AI SDK | 画像認識能力と抽出精度の高さを評価。 |
| Database | Supabase (PostgreSQL) | スピーディなDB構築と、将来的な認証機能拡張の容易さ。 |
| Styling | Tailwind CSS | 迅速なUI構築と、レスポンシブ対応の効率化。 |
| Infrastructure | Vercel | GitHub連携によるCI/CD環境の構築。 |

# 設計におけるこだわり（エンジニアとしての視点）
1.「AIの不確実性」への対策: AIは完璧ではないという前提に立ち、必ず人間が内容を確認・修正できるUIフローを構築しました。
2.実務の現場を想定したUX:
    ・一覧表の登録番号をクリックすることで詳細を展開するアコーディオンを採用し、情報のノイズを削減。
    ・CSV出力時にはExcelでの利用を想定し、BOMを付与するなどの「利用シーン」に即した実装を行っています。
3.セキュリティの徹底: ポートフォリオをPublic公開しつつ、.env管理とBasic認証を組み合わせることで、秘匿情報の漏洩を防ぎつつ、特定の人間にのみデモを公開できる状態にしました。

# セットアップBash# 依存関係のインストール
npm install

# 環境変数の設定 (.env.local)
NEXT_PUBLIC_GEMINI_API_KEY=your_key
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
BASIC_AUTH_USER=admin
BASIC_AUTH_PASSWORD=password

#イメージ
