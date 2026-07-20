import { JAROD_GUEST_EMAIL } from "@/lib/auth/account-roles";

export type PartyRosterMember = {
  name: string;
  role: string;
  /** Guest profile names that should also map to this person */
  matchNames?: string[];
  /** Guest login emails that should map to this person */
  matchEmails?: string[];
};

export const partyGrooms: PartyRosterMember[] = [
  {
    name: "Jarod Harrison",
    role: "Groom",
    matchNames: ["J-rod H", "J-rod"],
    matchEmails: [JAROD_GUEST_EMAIL],
  },
  { name: "Jamie Stocks", role: "Groom", matchNames: ["Jamo"] },
];

export const partyWeddingParty: PartyRosterMember[] = [
  { name: "Kirra ten-Hove Smith", role: "J-rod's Best Bitch", matchNames: ["Kirra"] },
  { name: "Samantha Cooper", role: "Jamo's Best Bitch", matchNames: ["Sam Cooper"] },
];

export const partyJrodFamily: PartyRosterMember[] = [
  { name: "Bernadette Harrison", role: "Mother" },
  { name: "John Harrison", role: "Father" },
  { name: "Grace Dillion", role: "Sister" },
  { name: "Max Dillion", role: "Brother-in-law" },
  { name: "Rosie Dillion", role: "Niece (Flower girl)" },
  { name: "Damien Pobar", role: "Uncle" },
  { name: "Monica Cleary", role: "Aunty" },
  { name: "Martin Pobar", role: "Guncle" },
  { name: "Darren Rees", role: "Guncle" },
  { name: "Sam Pobar", role: "Cousin", matchNames: ["Samuel Pobar"] },
  { name: "Lauren Roberts", role: "Cousin", matchEmails: ["laurenr@iinet.net.au"] },
];

export const partyJamoFamily: PartyRosterMember[] = [
  { name: "Tracey Gooden", role: "Mother Figure" },
  { name: "Akara Gooden", role: "Sister", matchNames: ["Akara Chan"] },
  {
    name: "Malakai Gooden",
    role: "Nephew (Ring bearer)",
    matchNames: ["Kai", "Malakai", "Malakai Gooderson"],
  },
  {
    name: "Jo Bloodworth",
    role: "Father figure",
    matchNames: ["Johanna Bloodworth", "Joanna Bloodworth", "Jo"],
    matchEmails: ["johanna-bloodworth@guests.jarodandjamiewedding.com"],
  },
  { name: "AJ Heta", role: "Jo's husband", matchEmails: ["ajheta@yahoo.com"] },
];

export const partyCelebrantAndMcs: PartyRosterMember[] = [
  {
    name: "Liz Anya",
    role: "Celebrant & MC",
    matchEmails: ["celebrant_flair@outlook.com"],
  },
  {
    name: "Andrew Gillard",
    role: "MC",
    matchNames: ["Andy Gillard", "Andrew Jillard"],
    matchEmails: ["andrewjillard67@gmail.com"],
  },
];

export const partyFamilyGroups = [
  { id: "jrod", title: "J-rod's Family", members: partyJrodFamily },
  { id: "jamo", title: "Jamo's Family", members: partyJamoFamily },
] as const;
