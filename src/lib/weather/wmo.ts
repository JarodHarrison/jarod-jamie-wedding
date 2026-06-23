export function describeWeatherCode(code: number): { label: string; emoji: string } {
  if (code === 0) return { label: "Clear skies", emoji: "☀️" };
  if (code === 1) return { label: "Mostly clear", emoji: "🌤️" };
  if (code === 2) return { label: "Partly cloudy", emoji: "⛅" };
  if (code === 3) return { label: "Overcast", emoji: "☁️" };
  if (code === 45 || code === 48) return { label: "Foggy", emoji: "🌫️" };
  if (code >= 51 && code <= 57) return { label: "Drizzle", emoji: "🌦️" };
  if (code >= 61 && code <= 67) return { label: "Rain", emoji: "🌧️" };
  if (code >= 71 && code <= 77) return { label: "Cool & crisp", emoji: "❄️" };
  if (code >= 80 && code <= 82) return { label: "Showers", emoji: "🌦️" };
  if (code >= 95) return { label: "Storms possible", emoji: "⛈️" };
  return { label: "Mixed conditions", emoji: "🌤️" };
}

export function roundTemp(celsius: number): number {
  return Math.round(celsius);
}
