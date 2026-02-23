import { supabase } from "@/lib/supabase";
import Link from "next/link";

// キャッシュを無効化し、常に最新のDBデータを取得する設定
export const revalidate = 0;

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
        <Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          ＋ 新規アップロード
        </Link>
      </div>

      {/* 簡易分析パネル */}
      <div className="bg-white p-6 rounded-lg shadow border mb-8">
        <h2 className="text-gray-500 text-sm font-bold mb-1">累計請求金額</h2>
        <p className="text-4xl font-black text-gray-800">¥{totalSum.toLocaleString()}</p>
      </div>

      {/* 一覧テーブル */}
      <div className="bg-white rounded-lg shadow overflow-hidden border">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-4">登録番号</th>
              <th className="p-4">請求日</th>
              <th className="p-4 text-right">合計金額</th>
              <th className="p-4">登録日時</th>
            </tr>
          </thead>
          <tbody>
            {invoices?.map((inv) => (
              <tr key={inv.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-mono text-sm">{inv.registration_number}</td>
                <td className="p-4">{inv.invoice_date}</td>
                <td className="p-4 text-right font-bold">¥{inv.total_amount.toLocaleString()}</td>
                <td className="p-4 text-sm text-gray-500">
                  {new Date(inv.created_at).toLocaleString('ja-JP')}
                </td>
              </tr>
            ))}
            {invoices?.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">データがありません</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}