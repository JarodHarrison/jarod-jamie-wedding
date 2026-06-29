function escapeVcardValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/\n/g, "\\n");
}

function splitName(fullName: string): { family: string; given: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return { family: parts[0] ?? "", given: "" };
  return { family: parts.at(-1) ?? "", given: parts.slice(0, -1).join(" ") };
}

export function buildVcard(contact: {
  name: string;
  email: string;
  phone?: string | null;
}): string {
  const { family, given } = splitName(contact.name);
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${escapeVcardValue(contact.name)}`,
    `N:${escapeVcardValue(family)};${escapeVcardValue(given)};;;`,
    `EMAIL;TYPE=INTERNET:${escapeVcardValue(contact.email)}`,
  ];

  if (contact.phone?.trim()) {
    lines.push(`TEL;TYPE=CELL:${escapeVcardValue(contact.phone.trim())}`);
  }

  lines.push("END:VCARD");
  return lines.join("\r\n");
}

export function vcardFilename(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug || "contact"}.vcf`;
}
