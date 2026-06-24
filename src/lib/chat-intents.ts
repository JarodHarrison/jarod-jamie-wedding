type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const FORM_INTENT_PATTERNS = [
  /\b(rsvp|attending|declin(e|ing)|dietary|plus[- ]?one|song request)\b/i,
  /\b(accommodation|staying at|where (i'm|we're) staying|check[- ]?in|check[- ]?out|shuttle)\b/i,
  /\b(flight|airport|transfer|arrival|departure|passenger|mcy|bne)\b/i,
  /\b(glow[- ]?up|botox|teeth|whiten|hair|make[- ]?up|barber|pre-wedding service)\b/i,
  /\b(save|submit|update|fill in|complete).*(form|rsvp|accommodation|profile|details)\b/i,
  /\bhelp me (with )?(my )?(rsvp|accommodation|flight|transfer|forms?)\b/i,
  /\bmy (phone|dietary|plus[- ]?one|accommodation|flight)\b/i,
];

const INSTALL_GUIDE_PATTERNS = [
  /\b(install|add to home|home screen|download the app|pwa)\b/i,
  /\b(app on my phone|get the app|save (the )?app|icon on (my )?phone)\b/i,
  /\bhow (do|can) i (install|add|get).*(app|phone|home screen)\b/i,
];

const PENTHOUSE_PATTERNS = [
  /\b(penthouse|gold coast|byron bay|movie world|dreamworld|dracula|australia zoo|skydeck|skypoint)\b/i,
  /\bpre-wedding trip|minivan\b/i,
];

const FORM_FOLLOWUP_PATTERNS = [
  /\b(rsvp|accommodation|flight|transfer|phone number|dietary|plus[- ]?one|save|submit)\b/i,
];

const TRAVEL_KNOWLEDGE_PATTERNS = [
  /\b(airport|flight|bne|mcy|brisbane airport|sunshine coast airport)\b/i,
  /\b(uber|taxi|shuttle|transport|driving|parking|expedia|accommodation|staying)\b/i,
  /\b(get(ting)? (to|from)|how do i get|travel|airtrain)\b/i,
];

export function recentUserText(messages: ChatMessage[]): string {
  return messages
    .filter((m) => m.role === "user")
    .slice(-3)
    .map((m) => m.content)
    .join(" ");
}

export function wantsInstallGuideHelp(messages: ChatMessage[]): boolean {
  return INSTALL_GUIDE_PATTERNS.some((pattern) => pattern.test(recentUserText(messages)));
}

export function wantsPenthouseKnowledge(guestTier?: string, messages?: ChatMessage[]): boolean {
  if (guestTier === "PENTHOUSE") return true;
  if (!messages?.length) return false;
  return PENTHOUSE_PATTERNS.some((pattern) => pattern.test(recentUserText(messages)));
}

export function wantsFormTools(messages: ChatMessage[]): boolean {
  const userText = recentUserText(messages);
  if (FORM_INTENT_PATTERNS.some((pattern) => pattern.test(userText))) return true;

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  if (!lastUser || !lastAssistant) return false;

  const assistantIndex = messages.lastIndexOf(lastAssistant);
  const userIndex = messages.lastIndexOf(lastUser);
  if (userIndex <= assistantIndex) return false;

  return FORM_FOLLOWUP_PATTERNS.some((pattern) => pattern.test(lastAssistant.content));
}

export function wantsTravelKnowledge(messages: ChatMessage[]): boolean {
  const text = recentUserText(messages);
  return TRAVEL_KNOWLEDGE_PATTERNS.some((pattern) => pattern.test(text));
}
