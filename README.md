# AI Invoice Validator

## プロジェクトの背景と目的
インボイス制度の導入に伴い、経理担当者の手入力による業務負荷と、税率・登録番号の確認漏れによるヒューマンエラーが現場の課題となっています。
本システムは、LLM（Gemini API）の画像解析能力を活用して非定型フォーマットの請求書から必要データを自動抽出し、入力作業の省力化とヒューマンエラーの防止を目的としたWebアプリケーションです。

## 設計におけるこだわり（実運用を想定したアーキテクチャ）

1. **AIの誤認識を前提とした「Human-in-the-loop」設計**
単なるOCRやAIの自動処理に依存せず、「AIの抽出結果を人間が確認・修正し、論理的な整合性をチェックする」運用フローを強制するUIを構築しました。消費税額（10%・8%）の計算不一致をシステム側で検知し、不正なデータの登録を防ぎます。

2. **業務担当者のリテラシーに依存しないUXと出力**
大量のデータを処理する際の情報過多を防ぐため、一覧画面ではサマリーのみを表示し、アコーディオン形式で詳細を展開する設計としています。また、経理部門での二次利用（Excel）を想定し、CSV出力にはBOM（Byte Order Mark）を付与し、文字化けによる業務停止を防ぐ泥臭い対応を入れています。

3. **セキュアなプロトタイプ公開環境の構築**
環境変数によるAPIキーの秘匿化に加え、Next.jsのMiddlewareを活用したBasic認証を実装。特定のリソースにのみアクセスを許可するセキュアなデモ環境を構築しています。

## 技術選定の理由
| 使用技術 | 採用理由 |
| :--- | :--- |
| **Next.js (App Router)** | APIルートとフロントエンドを統合し、迅速にプロトタイプを構築するため。Server Componentsによる初期描画の高速化とセキュアなデータフェッチを実現。 |
| **Gemini 1.5 Flash (AI SDK)** | 従来のOCRでは対応が困難な「非定型フォーマット」の請求書に対し、文脈を理解してキーバリューを抽出する能力が最も費用対効果が高いと判断。 |
| **Supabase (PostgreSQL)** | RLS（Row Level Security）による将来的なアクセス制御の拡張性と、バックエンド構築のリードタイム短縮のため。 |
| **Vercel** | GitHub連携によるCI/CDパイプラインの自動化。 |

## セットアップBash# 依存関係のインストール
npm install

## 環境変数の設定 (.env.local)
* NEXT_PUBLIC_GEMINI_API_KEY=your_key
* NEXT_PUBLIC_SUPABASE_URL=your_url
* NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
* BASIC_AUTH_USER=admin
* BASIC_AUTH_PASSWORD=password

## データベース・セットアップ (Supabase)
SQL Editor で以下のクエリを実行し、テーブルを作成してください。

\`\`\`sql
create table inv_invoices (
  id uuid default gen_random_uuid() primary key,
  registration_number text,         -- インボイス登録番号
  invoice_date date,                -- 請求日
  subtotal_10 numeric,              -- 10%対象額
  tax_10 numeric,                   -- 10%消費税
  subtotal_8 numeric,               -- 8%対象額
  tax_8 numeric,                    -- 8%消費税
  total_amount numeric,             -- 合計金額
  created_at timestamp with time zone default now()
);
\`\`\`

## プロジェクト構造
\`\`\`text
src/
├── app/
│   ├── api/analyze/    # AI解析API (Gemini API)
│   ├── dashboard/      # 一覧・分析画面
│   ├── layout.tsx
│   └── page.tsx        # メイン解析画面
├── components/         # 共通コンポーネント (DashboardTable, CsvDownloadButton)
├── lib/                # 外部サービス連携 (Supabaseクライアント)
├── types/              # 型定義 (InvoiceData, DbInvoice)
└── middleware.ts       # Basic認証の定義
\`\`\`

## ライセンス
MIT License

## イメージ
* 初期画面
<img width="1429" height="949" alt="image" src="https://github.com/user-attachments/assets/b2a479ca-b3a5-4ea7-861f-3c57eb3be76d" />

* アップロード後画面
<img width="1156" height="1285" alt="image" src="https://github.com/user-attachments/assets/34bb8634-8e3f-4562-a4dd-78e02714c4be" />

* 一覧画面
<img width="1050" height="478" alt="image" src="https://github.com/user-attachments/assets/3ca9ff58-c854-469c-a5c6-abf594b5fb70" />

* 一覧画面(アコーディオン展開)
<img width="1051" height="614" alt="image" src="https://github.com/user-attachments/assets/96b86fba-6766-4543-a35d-b21ef6e0f4a1" />

