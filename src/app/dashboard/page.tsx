import { supabase } from "@/lib/supabase";
import Link from "next/link";
import CsvDownloadButton from "@/components/CsvDownloadButton";
import DashboardTable from "@/components/DashboardTable";
import { DbInvoice } from "@/types/invoice";

// キャッシュを無効化し、常に最新のDBデータを取得する設定
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  // Supabaseから請求書データを取得（作成日時の降順）
  const { data: invoices, error } = await supabase
    .from('inv_invoices')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return <div className="p-8 text-red-500">データの取得に失敗しました: {error.message}</div>;
  }

  // 統計用の簡単な計算（合計金額の総計）
  const totalSum = invoices?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0;

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">請求書ダッシュボード</h1>
        <div className="flex gap-4"> {/* コンテナを追加 */}
          <CsvDownloadButton data={invoices as unknown as DbInvoice[] || []} /> {/* CSVボタンを追加 */}
          <Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            ＋ 新規アップロード
          </Link>
        </div>
      </div>

      {/* 簡易分析パネル */}
      <div className="bg-white p-6 rounded-lg shadow border mb-8">
        <h2 className="text-gray-500 text-sm font-bold mb-1">累計請求金額</h2>
        <p className="text-4xl font-black text-gray-800">¥{totalSum.toLocaleString()}</p>
      </div>

      {/* 一覧テーブル */}
      <div className="bg-white rounded-lg shadow overflow-hidden border">
        <table className="w-full text-left border-collapse">
            <DashboardTable invoices={(invoices as unknown as DbInvoice[]) || []} />
        </table>
      </div>
    </main>
  );
}