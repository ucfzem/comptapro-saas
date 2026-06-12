export type AccountingSuggestion = {
  accountCode: string;
  accountLabel: string;
  confidence: 'high' | 'medium' | 'low';
};

type SupplierRule = {
  keywords: string[];
  accountCode: string;
  accountLabel: string;
  confidence: 'high';
};

const SUPPLIER_RULES: SupplierRule[] = [
  {
    keywords: ['urssaf'],
    accountCode: '442000',
    accountLabel: 'Organismes sociaux',
    confidence: 'high',
  },
  {
    keywords: ['edf', 'enedis'],
    accountCode: '606100',
    accountLabel: 'Énergie',
    confidence: 'high',
  },
  {
    keywords: ['orange', 'sfr', 'free'],
    accountCode: '606400',
    accountLabel: 'Fournitures administratives',
    confidence: 'high',
  },
  {
    keywords: ['bp', 'total', 'shell'],
    accountCode: '606300',
    accountLabel: 'Carburant',
    confidence: 'high',
  },
];

const DEFAULT_SUGGESTION: AccountingSuggestion = {
  accountCode: '606400',
  accountLabel: 'Fournitures administratives',
  confidence: 'low',
};

export function suggestAccountingEntry(
  data: { supplierName?: string; description?: string }
): AccountingSuggestion {
  const textToMatch = [
    data.supplierName ?? '',
    data.description ?? '',
  ]
    .join(' ')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  for (const rule of SUPPLIER_RULES) {
    if (rule.keywords.some((kw) => textToMatch.includes(kw))) {
      return {
        accountCode: rule.accountCode,
        accountLabel: rule.accountLabel,
        confidence: rule.confidence,
      };
    }
  }

  return DEFAULT_SUGGESTION;
}

export function parseFrenchNumber(input: string): number {
  if (!input) return 0;

  let cleaned = input.trim();

  cleaned = cleaned.replace(/\s/g, '');

  cleaned = cleaned.replace(',', '.');

  const match = cleaned.match(/-?\d+(\.\d+)?/);
  if (!match) return 0;

  return parseFloat(match[0]);
}
