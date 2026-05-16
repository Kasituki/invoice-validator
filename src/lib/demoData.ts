import { InvoiceData } from "@/types/invoice";

export const DEMO_INVOICE: InvoiceData = {
  registration_number: "T1234567890123",
  date: "2026-01-15",
  items: [
    { description: "システム開発費（1月分）", tax_rate: 10, amount: 100000 },
    { description: "保守運用費", tax_rate: 10, amount: 50000 },
    { description: "事務用品", tax_rate: 8, amount: 5000 },
    { description: "消耗品費", tax_rate: 8, amount: 2000 },
  ],
  summary: {
    subtotal_10: 150000,
    tax_10: 15000,
    subtotal_8: 7000,
    tax_8: 560,
  },
  total_amount: 172560,
};

export const DEMO_VALIDATION = {
  tax10: true,
  tax8: true,
  total: true,
};
