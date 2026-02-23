// types/invoice.ts
export interface InvoiceItem {
    description: string;
    tax_rate: number;
    amount: number;
  }
  
  export interface InvoiceData {
    registration_number: string;
    date: string;
    items: InvoiceItem[];
    summary: {
      subtotal_10: number;
      tax_10: number;
      subtotal_8: number;
      tax_8: number;
    };
    total_amount: number;
  }