import { NextResponse } from 'next/server';
import { suggestAccountingEntry } from '@/lib/ocr-mapping';

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
  }

  await new Promise(resolve => setTimeout(resolve, 1500));

  const simulatedExtraction = {
    date: '2024-05-23',
    supplierName: 'FOURNISSEUR TECH SARL',
    amountHT: '1250,00',
    tvaAmount: '250,00',
    amountTTC: '1500,00',
    invoiceNumber: 'FAC-2024-0042',
  };

  const suggested = suggestAccountingEntry(simulatedExtraction);

  return NextResponse.json({
    success: true,
    confidence: 98.7,
    data: {
      ...simulatedExtraction,
      suggestedAccount: suggested.accountCode,
      suggestedLabel: suggested.accountLabel,
    },
  });
}
