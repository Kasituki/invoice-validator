"use client";

import { useState } from "react";
import { DbInvoice } from "@/types/invoice";

export default function DashboardTable({ invoices }: { invoices: DbInvoice[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleRow = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden border">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b text-sm">
            <th className="p-4">登録番号</th>
            <th className="p-4">請求日</th>
            <th className="p-4 text-right">合計金額</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <React.Fragment key={inv.id}>
              {/* メイン行 */}
              <tr 
                className={`border-b hover:bg-gray-50 cursor-pointer transition-colors ${expandedId === inv.id ? 'bg-blue-50' : ''}`}
                onClick={() => toggleRow(inv.id)}
              >
                <td className="p-4 font-mono text-sm text-blue-600 font-bold underline">
                  {inv.registration_number}
                </td>
                <td className="p-4 text-sm">{inv.invoice_date}</td>
                <td className="p-4 text-right font-bold text-sm">
                  ¥{inv.total_amount.toLocaleString()}
                </td>
              </tr>

              {/* アコーディオン詳細行 */}
              {expandedId === inv.id && (
                <tr className="bg-gray-50 border-b">
                  <td colSpan={4} className="p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm border-l-4 border-blue-400 pl-4 py-2">
                      <div>
                        <p className="text-gray-500 text-xs">10%対象額 / 消費税</p>
                        <p className="font-medium">
                          ¥{inv.subtotal_10.toLocaleString()} / ¥{inv.tax_10.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">8%対象額 / 消費税</p>
                        <p className="font-medium">
                          ¥{inv.subtotal_8.toLocaleString()} / ¥{inv.tax_8.toLocaleString()}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-500 text-xs text-right">登録日時: {new Date(inv.created_at).toLocaleString('ja-JP')}</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import React from "react"; // React.Fragmentを使うために必要