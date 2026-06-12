import { NextResponse } from 'next/server';

const mockEntries = [
  { id: '1', date: '2024-05-01', label: 'Facture Fournisseur A', account: '401000', debit: 0, credit: 1200.00, matchRef: null, client: 'Tech SARL' },
  { id: '2', date: '2024-05-01', label: 'TVA Facture A', account: '445660', debit: 240.00, credit: 0, matchRef: 'FAC-123', client: 'Tech SARL' },
  { id: '3', date: '2024-05-05', label: 'Règlement Banque X', account: '512000', debit: 1440.00, credit: 0, matchRef: null, client: 'Banque X' },
  { id: '4', date: '2024-05-10', label: 'Facture EDF', account: '606100', debit: 0, credit: 890.50, matchRef: null, client: 'EDF' },
  { id: '5', date: '2024-05-10', label: 'TVA EDF', account: '445660', debit: 178.10, credit: 0, matchRef: null, client: 'EDF' },
  { id: '6', date: '2024-05-12', label: 'Paiement EDF', account: '512000', debit: 1068.60, credit: 0, matchRef: null, client: 'EDF' },
  { id: '7', date: '2024-06-01', label: 'Loyer local', account: '613000', debit: 0, credit: 2500.00, matchRef: 'LOY-2024-06', client: 'Bailleur SARL' },
  { id: '8', date: '2024-06-15', label: 'Salaire comptable', account: '641000', debit: 0, credit: 3200.00, matchRef: null, client: 'Intern' },
  { id: '9', date: '2024-06-20', label: 'Fournitures bureau', account: '606400', debit: 0, credit: 156.80, matchRef: null, client: 'Bureau Plus' },
  { id: '10', date: '2024-07-01', label: 'Honoraires expert-comptable', account: '622000', debit: 0, credit: 800.00, matchRef: null, client: 'Cabinet Conseil' },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const unmatched = searchParams.get('unmatched') === 'true';
  const limit = parseInt(searchParams.get('limit') || '50');
  const search = searchParams.get('search')?.toLowerCase() || '';

  let filtered = mockEntries;
  if (unmatched) filtered = filtered.filter(e => !e.matchRef);
  if (search) filtered = filtered.filter(e =>
    e.label.toLowerCase().includes(search) ||
    e.account.includes(search) ||
    (e.client || '').toLowerCase().includes(search)
  );

  return NextResponse.json({
    entries: filtered.slice(0, limit),
    total: filtered.length,
    unmatchedCount: mockEntries.filter(e => !e.matchRef).length,
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const ref = `FAC-${Date.now()}`;
  const amountHT = parseFloat(body.amountHT) || 0;
  const tvaAmount = parseFloat(body.tvaAmount) || 0;
  const totalTTC = amountHT + tvaAmount;

  const newEntries = [
    { id: Date.now().toString(), date: body.date || new Date().toISOString().slice(0,10), label: body.label || 'Saisie OCR', account: body.accountCode || '606400', debit: amountHT, credit: 0, matchRef: ref, client: body.supplier || '' },
  ];
  if (tvaAmount > 0) {
    newEntries.push({ id: (Date.now()+1).toString(), date: body.date, label: `TVA ${body.label || 'OCR'}`, account: '445660', debit: tvaAmount, credit: 0, matchRef: ref, client: body.supplier || '' });
  }
  newEntries.push({ id: (Date.now()+2).toString(), date: body.date, label: `Total TTC ${body.label || 'OCR'}`, account: '401000', debit: 0, credit: totalTTC, matchRef: ref, client: body.supplier || '' });

  mockEntries.push(...newEntries as any);

  return NextResponse.json({ success: true, entries: newEntries, matchReference: ref });
}
