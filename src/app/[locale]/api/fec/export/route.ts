import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get('year') || '2024');

  const mockEntries = [
    { date: '2024-01-15', label: 'Facture client A', account: '411000', debit: 5000.00, credit: 0 },
    { date: '2024-01-15', label: 'Vente prestation', account: '706000', debit: 0, credit: 5000.00 },
    { date: '2024-02-01', label: 'Achat fournitures', account: '606400', debit: 1250.00, credit: 0 },
    { date: '2024-02-01', label: 'Fournisseur B', account: '401000', debit: 0, credit: 1250.00 },
  ];

  const headerFec = `FEC|123456789|${year}0101`;
  const headers = 'JournalCode;JournalLib;EcritureNum;EcritureDate;CompteNum;CompteLib;PieceRef;Debit;Credit;Libelle';
  const lines = mockEntries.map(e =>
    `AC;ACHATS;${e.date.replace(/-/g,'')};${e.date};${e.account};Compte ${e.account};REF-001;${e.debit.toFixed(2)};${e.credit.toFixed(2)};${e.label}`
  );

  const fecContent = [headerFec, headers, ...lines].join('\n');

  return new NextResponse(fecContent, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="FEC${year}.txt"`,
    },
  });
}
