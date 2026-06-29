const AIRPORT_LABELS: Record<string, string> = {
  BNE: "Brisbane (BNE)",
  MCY: "Sunshine Coast (MCY)",
};

export function airportLabel(code: string | null | undefined): string {
  if (!code) return "the airport";
  return AIRPORT_LABELS[code] ?? code;
}

export function formatTravelWhen(date: string | null, time: string | null): string {
  if (!date) return "a similar time";
  const formattedDate = new Date(`${date}T12:00:00`).toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  if (!time) return formattedDate;
  return `${formattedDate} around ${time.slice(0, 5)}`;
}
