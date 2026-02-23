import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "ファイルがありません" }, { status: 400 });
  }

  // 1. 画像をBase64に変換
  const buffer = Buffer.from(await file.arrayBuffer());
  const imagePart = {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType: file.type,
    },
  };

  // 2. Gemini 2.5 Flash で解析 (2026年最新モデル)
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const prompt = `この請求書画像を解析し、JSON形式のみで出力してください。
    項目: 
    - registration_number (T+13桁)
    - date
    - items (各行の配列: { description, tax_rate, amount })
    - summary (subtotal_10, tax_10, subtotal_8, tax_8)
    - total_amount
    数値はすべてカンマなしの数値型にすること。`;

  const result = await model.generateContent([prompt, imagePart]);
  const responseText = result.response.text();
  const data = JSON.parse(responseText.replace(/```json|```/g, ""));

  // 文字列かもしれない値を安全に数値化するヘルパー関数
    const sanitizeNumber = (val: any) => {
        if (typeof val === 'string') {
        // カンマを空文字に置換してから数値化
        return Number(val.replace(/,/g, ''));
        }
        return Number(val) || 0;
    };

  // データをクレンジング（無害化）して上書きする
  const cleanData = {
    ...data,
    total_amount: sanitizeNumber(data.total_amount),
    summary: {
      subtotal_10: sanitizeNumber(data.summary?.subtotal_10),
      tax_10: sanitizeNumber(data.summary?.tax_10),
      subtotal_8: sanitizeNumber(data.summary?.subtotal_8),
      tax_8: sanitizeNumber(data.summary?.tax_8),
    },
    items: data.items?.map((item: any) => ({
      ...item,
      tax_rate: sanitizeNumber(item.tax_rate),
      amount: sanitizeNumber(item.amount)
    })) || []
  };
// 3. 論理バリデーション（クレンジング後のデータを使う）
const validation = {
    tax10: Math.floor(cleanData.summary.subtotal_10 * 0.1) === cleanData.summary.tax_10,
    tax8: Math.floor(cleanData.summary.subtotal_8 * 0.08) === cleanData.summary.tax_8,
    total: (cleanData.summary.subtotal_10 + cleanData.summary.tax_10 + 
            cleanData.summary.subtotal_8 + cleanData.summary.tax_8) === cleanData.total_amount
  };

  // 呼び出し元には cleanData を data という名前で返してあげる（画面側の変更を最小限にするテクニックだ）
  return NextResponse.json({ data: cleanData, validation });
}