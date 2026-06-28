export type PartyRosterMember = {
  name: string;
  role: string;
  /** Guest profile names that should also map to this person */
  matchNames?: string[];
};

export const partyGrooms: PartyRosterMember[] = [
  { name: "Jarod Harrison", role: "Groom", matchNames: ["J-rod H", "J-rod"] },
  { name: "Jamie Stocks", role: "Groom", matchNames: ["Jamo"] },
];

export const partyWeddingParty: PartyRosterMember[] = [
  { name: "Kirra ten-Hove Smith", role: "J-rod's Best Bitch", matchNames: ["Kirra"] },
  { name: "Samantha Cooper", role: "Jamo's Best Bitch", matchNames: ["Sam Cooper"] },
];

export const partyJrodFamily: PartyRosterMember[] = [
  { name: "Bernadette Harrison", role: "Mother" },
  { name: "John Harrison", role: "Father" },
  { name: "Grace Dillon", role: "Sister" },
  { name: "Max Dillon", role: "Brother-in-law" },
  { name: "Rosie Dillon", role: "Niece (Flower girl)" },
  { name: "Damien Pobar", role: "Uncle" },
  { name: "Monica Cleary", role: "Aunty" },
  { name: "Martin Pobar", role: "Guncle" },
  { name: "Darren Rees", role: "Guncle" },
  { name: "Sam Pobar", role: "Cousin", matchNames: ["Samuel Pobar"] },
];

export const partyJamoFamily: PartyRosterMember[] = [
  { name: "Tracey Gooden", role: "Mother Figure" },
  { name: "Akara Gooden", role: "Sister" },
  { name: "Kai", role: "Nephew (Ring bearer)" },
  { name: "Jo Bloodworth", role: "Father figure" },
  { name: "AJ Heta", role: "Jo's husband" },
];

export const partyFamilyGroups = [
  { id: "jrod", title: "J-rod's Family", members: partyJrodFamily },
  { id: "jamo", title: "Jamo's Family", members: partyJamoFamily },
] as const;
