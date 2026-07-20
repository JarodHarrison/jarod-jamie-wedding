export const BUCKS_PARTY_DATE_LABEL = "29 August 2026";
export const BUCKS_PARTY_DATE_SHORT = "29.08";
export const BUCKS_PARTY_PUBLIC_PATH = "/Bucksparty";

export const BUCKS_ATTENDING_POLL = {
  question: "Am I attending J-rod & Jamo's ultimate bucks do",
  yes: "Yes I'll wear my sluttiest outfit",
  no: "No, I have to hang my head in shame and miss all the shenanigans.",
} as const;

export type BucksBudgetChoice = 100 | 130 | 150;

export const BUCKS_BUDGET_OPTIONS: {
  value: BucksBudgetChoice;
  label: string;
}[] = [
  {
    value: 150,
    label: "$150 gets a big party with entertainment, travel and more. Plus drinks of course!!",
  },
  {
    value: 130,
    label: "$130 gets us some exciting entertainment and travel and some drinks.",
  },
  {
    value: 100,
    label:
      "$100 gets a meagre party with some lights and fog machine and an eski full of drinks.",
  },
];

export const BUCKS_PARTY_ORGANISER_EMAILS = [
  "aaron.apse@hotmail.com",
  "jnneil91@gmail.com",
  "jamie_stocks27@hotmail.com",
  "jamie_chef35@gmail.com",
  "jarod.harrison87@gmail.com",
  "jarod.harrison@outlook.com",
] as const;

export function isBucksBudgetChoice(value: unknown): value is BucksBudgetChoice {
  return value === 100 || value === 130 || value === 150;
}

export function bucksPartyShareUrl(origin?: string): string {
  const base =
    origin?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://jarodandjamiewedding.com";
  return `${base}${BUCKS_PARTY_PUBLIC_PATH}`;
}
