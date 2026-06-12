import { NextResponse } from 'next/server';

const mockAnswers = [
  { answer: "Selon l'article 39 du CGI, le taux d'amortissement linéaire pour un véhicule de tourisme est plafonné à 18 300 € de prix d'acquisition. La fraction excédentaire n'est pas déductible. L'amortissement dégressif n'est pas autorisé pour les véhicules de tourisme.", sources: "CGI art. 39, BOI-BIC-AMT-20-10-10" },
  { answer: "Le délai de prescription de l'administration fiscale est de 3 ans pour les entreprises (année en cours + 3 exercices). Pour les manquements délibérés ou abus de droit, ce délai passe à 6 ans. (LPF art. L169, L188)", sources: "LPF art. L169, L188" },
  { answer: "La TVA sur les frais de restauration professionnelle est déductible à 100% si le repas a lieu avec un client ou prospect. Pour les repas entre collaborateurs, la déduction est limitée à 50%. Les frais de représentation sont déductibles sur justificatifs.", sources: "BOI-TVA-DED-30-20-90" },
  { answer: "Le seuil de franchise en base de TVA pour 2024 est de 91 900 € pour les livraisons de biens et 36 800 € pour les prestations de services. Au-delà, la TVA est due dès le premier euro. Ces seuils sont indexés chaque année.", sources: "CGI art. 293 B, BOI-TVA-FRAN-10" },
  { answer: "Pour les entreprises individuelles, le résultat fiscal est imposé à l'IR selon le barème progressif. Pour les sociétés, l'IS est au taux réduit de 15% jusqu'à 42 500 € de bénéfice (sous conditions), puis 25% au-delà.", sources: "CGI art. 206, 219" },
  { answer: "La provision pour créance douteuse est déductible si elle est individualisée, justifiée par un risque de non-recouvrement et comptabilisée. Le taux de provision dépend de l'ancienneté de la créance et de la situation du débiteur.", sources: "CGI art. 39-1-5°, BOI-BIC-PROV-20-10" },
];

export async function POST(req: Request) {
  const { question } = await req.json();
  if (!question) {
    return NextResponse.json({ success: false, error: 'Question required' }, { status: 400 });
  }

  await new Promise(resolve => setTimeout(resolve, 1500));

  const answer = mockAnswers[Math.floor(Math.random() * mockAnswers.length)];

  return NextResponse.json({
    success: true,
    question,
    answer: answer.answer,
    sources: answer.sources,
    model: 'gpt-4o (RAG sur BOFIP/CGI)',
    confidence: 0.95,
  });
}
