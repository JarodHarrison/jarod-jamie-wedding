type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const FORM_INTENT_PATTERNS = [
  /\b(rsvp|attending|declin(e|ing)|dietary|plus[- ]?one|song request)\b/i,
  /\b(accommodation|staying at|where (i'm|we're) staying|check[- ]?in|check[- ]?out)\b/i,
  /\b(glow[- ]?up|botox|teeth|whiten|hair|make[- ]?up|barber|pre-wedding service)\b/i,
  /\b(save|submit|update|fill in|complete).*(form|rsvp|accommodation|profile|details|flight|transfer)\b/i,
  /\bhelp me (with )?(my )?(rsvp|accommodation|flight|transfer|forms?)\b/i,
  /\bmy (phone|dietary|plus[- ]?one|accommodation|flight|transfer|arrival|departure)\b/i,
  /\b(register|add).*(flight|transfer|shuttle|interest)\b/i,
  /\bneed to add my (accommodation|flight|rsvp)\b/i,
];

const WELCOME_OR_BROADCAST_PATTERNS = [
  /\bask me about the schedule\b/i,
  /\byour sassy wedding concierge\b/i,
  /\bstill need:\b/i,
  /\bwant me to help you fill those in\b/i,
];

const FORM_COLLECTION_ASSISTANT_PATTERNS = [
  /\b(what'?s|send|need|share|tell me) your\b/i,
  /\b(attending|declining|plus[- ]?one|dietary|phone|accommodation|flight)\b[^.]{0,40}\?/i,
  /\bi('ll| will) (save|update|submit)\b/i,
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
  if (guestTier !== "PENTHOUSE") return false;
  if (!messages?.length) return false;
  const text = recentUserText(messages);
  if (PENTHOUSE_PATTERNS.some((pattern) => pattern.test(text))) return true;
  if (
    guestTier === "PENTHOUSE" &&
    /\b(itinerary|schedule|gold coast|trip|minivan|pre-wedding)\b/i.test(text)
  ) {
    return true;
  }
  return false;
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

  if (WELCOME_OR_BROADCAST_PATTERNS.some((pattern) => pattern.test(lastAssistant.content))) {
    return false;
  }

  return (
    FORM_COLLECTION_ASSISTANT_PATTERNS.some((pattern) => pattern.test(lastAssistant.content)) &&
    FORM_FOLLOWUP_PATTERNS.some((pattern) => pattern.test(lastAssistant.content))
  );
}

export function userExplicitlyWantsFormHelp(messages: ChatMessage[]): boolean {
  const userText = recentUserText(messages);
  return /\b(help|complete|fill|save|submit|update|add my)\b/i.test(userText) &&
    wantsFormTools(messages);
}

export function wantsTravelKnowledge(messages: ChatMessage[]): boolean {
  const text = recentUserText(messages);
  return TRAVEL_KNOWLEDGE_PATTERNS.some((pattern) => pattern.test(text));
}
