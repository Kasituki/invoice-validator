"use client";
import { useState, useEffect } from "react";
import { InvoiceData } from "@/types/invoice";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function InvoiceApp() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [editableData, setEditableData] = useState<InvoiceData | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/analyze", { method: "POST", body: formData });
    const json = await res.json();
    setResult(json);
    setLoading(false);
    setEditableData(json.data)
  };

  // 入力値が変更された時の処理（イミュータブルに更新）
  const handleInputChange = (path: string, value: any) => {
    if (!editableData) return;

    const newData = { ...editableData };
    // パスを分解してネストした値を更新（例: "summary.tax_10"）
    const keys = path.split('.');
    let current: any = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;

    setEditableData(newData);
  };

  // Supabaseへの保存処理（後で実装）
  const handleSave = async () => {
    if (!editableData) return;

    try {
      setLoading(true);

      // 1. 親テーブル (inv_invoices) に保存
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('inv_invoices')
        .insert({
          registration_number: editableData.registration_number,
          invoice_date: editableData.date, // ★DBの型に合わせて日付形式のバリデーションが必要な場合もある
          subtotal_10: editableData.summary.subtotal_10,
          tax_10: editableData.summary.tax_10,
          subtotal_8: editableData.summary.subtotal_8,
          tax_8: editableData.summary.tax_8,
          total_amount: editableData.total_amount
        })
        .select() // 挿入したデータを返し、IDを取得する
        .single();

      if (invoiceError) throw invoiceError;

      // 2. 子テーブル (inv_invoice_items) に保存するデータを作成
      const itemsToInsert = editableData.items.map(item => ({
        invoice_id: invoiceData.id, // ★親のIDを紐付ける
        description: item.description,
        tax_rate: item.tax_rate,
        amount: item.amount
      }));

      // 3. 子テーブルへ一括保存 (Bulk Insert)
      const { error: itemsError } = await supabase
        .from('inv_invoice_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      alert("データベースへの保存が完了しました！");
      console.log("Saved successfully:", invoiceData.id);

    } catch (error) {
      console.error("保存エラー:", error);
      alert("保存に失敗しました。コンソールを確認してください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">AI Invoice Validator</h1>
        <Link href="/dashboard" className="text-blue-600 hover:underline font-bold">
          一覧画面を見る →
        </Link>
      </div>
      <div className="border-2 border-dashed border-gray-300 p-12 text-center rounded-lg">
        <input type="file" onChange={handleUpload} className="hidden" id="fileInput" />
        <label htmlFor="fileInput" className="cursor-pointer bg-blue-600 text-white px-6 py-3 rounded-md">
          {loading ? "解析中..." : "請求書をアップロード"}
        </label>
      </div>

      {result && (
        <div className="mt-8 grid grid-cols-2 gap-8">
          <div className="mt-8 bg-white border p-6 rounded shadow col-span-2">
            <h2 className="font-bold mb-4 text-xl">請求明細リスト</h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-2">内容</th>
                  <th className="p-2">税率(%)</th>
                  <th className="p-2 text-right">金額(円)</th>
                </tr>
              </thead>
              <tbody>
              {editableData?.items.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <input 
                      value={item.description}
                      onChange={(e) => handleInputChange(`items.${idx}.description`, e.target.value)}
                      className="border rounded px-2 w-full"
                    />
                  </td>
                  <td className="p-2">
                    <input 
                      value={item.tax_rate}
                      onChange={(e) => handleInputChange(`items.${idx}.tax_rate`, parseInt(e.target.value))}
                      className="border rounded px-2 w-full"
                    />
                  </td>
                    <td className="p-2 text-right">
                      <input 
                        value={item.amount}
                        onChange={(e) => handleInputChange(`items.${idx}.amount`, parseInt(e.target.value))}
                        className="border rounded px-2 w-full"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 bg-white border p-6 rounded shadow col-span-2">
            <h2 className="font-bold mb-4 text-xl">請求合計金額</h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-2">内容</th>
                  <th className="p-2">小計(円)</th>
                  <th className="p-2">消費税(円)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2">10%消費税</td>
                  <td>
                    <input 
                      value={editableData?.summary.subtotal_10}
                      onChange={(e) => handleInputChange(`summary.subtotal_10`, parseInt(e.target.value))}
                      className="border rounded px-2 w-full"
                    />
                  </td>
                  <td className="p-2">
                    <input 
                      value={editableData?.summary.tax_10}
                      onChange={(e) => handleInputChange(`summary.tax_10`, parseInt(e.target.value))}
                      className="border rounded px-2 w-full"
                    />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">8%消費税</td>
                  <td>
                    <input 
                      value={editableData?.summary.subtotal_8}
                      onChange={(e) => handleInputChange(`summary.subtotal_8`, parseInt(e.target.value))}
                      className="border rounded px-2 w-full"
                    />
                  </td>
                  <td className="p-2 text-right">
                    <input 
                      value={editableData?.summary.tax_8}
                      onChange={(e) => handleInputChange(`summary.tax_8`, parseInt(e.target.value))}
                      className="border rounded px-2 w-full"
                    />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-2"></td>
                  <td className="p-2 font-bold ">合計金額</td>
                  <td className="p-2 text-right">
                    <input 
                      value={editableData?.total_amount}
                      onChange={(e) => handleInputChange(`total_amount`, parseInt(e.target.value))}
                      className="border rounded px-2 w-full"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-gray-100 p-4 rounded shadow">
            <h2 className="font-bold mb-4">解析結果 (JSON)</h2>
            <pre className="text-sm">{JSON.stringify(result.data, null, 2)}</pre>
          </div>
          
          <div className="bg-white border p-4 rounded shadow">
            <h2 className="font-bold mb-4">論理バリデーション</h2>
            <ul className="space-y-2">
              <StatusItem label="10%消費税計算" status={result.validation.tax10} />
              <StatusItem label="8%消費税計算" status={result.validation.tax8} />
              <StatusItem label="合計金額整合性" status={result.validation.total} />
            </ul>
          </div>

          <div className="fixed bottom-8 right-8 z-50">
            <button 
              onClick={handleSave}
              className="bg-green-600 text-white px-8 py-4 rounded-full font-bold shadow-2xl hover:bg-green-700 hover:scale-105 transition-transform"
            >
              データを確定して保存
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function StatusItem({ label, status }: { label: string, status: boolean }) {
  return (
    <li className="flex justify-between p-2 border-b">
      <span>{label}</span>
      <span className={status ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
        {status ? "✅ OK" : "❌ NG"}
      </span>
    </li>
  );
}