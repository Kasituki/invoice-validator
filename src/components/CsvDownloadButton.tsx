"use client";

import { DbInvoice } from "@/types/invoice";

export default function CsvDownloadButton({ data }: { data: DbInvoice[] }) {
    const handleDownload = () => {
      if (!data || data.length === 0) return;
  
      const headers = ["登録番号", "請求日", "10%対象額", "10%消費税", "8%対象額", "8%消費税", "合計金額", "登録日時"];
      
      const csvRows = data.map(inv => [
        inv.registration_number,
        inv.invoice_date,
        inv.subtotal_10,
        inv.tax_10,
        inv.subtotal_8,
        inv.tax_8,
        inv.total_amount,
        new Date(inv.created_at).toLocaleString('ja-JP')
      ].join(","));

    const csvContent = [headers.join(","), ...csvRows].join("\n");

    // 3. BOM（Excelの文字化け対策）を付与してBlobを作成
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvContent], { type: "text/csv;charset=utf-8;" });
    
    // 4. ダウンロードリンクを生成してクリック
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `invoices_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleDownload}
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-bold flex items-center gap-2"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      CSVダウンロード
    </button>
  );
}