import { NextResponse } from "next/server";
import { getMontvilleWeddingWeather } from "@/lib/weather/montville-wedding-weather";

export const revalidate = 3600;

export async function GET() {
  try {
    const weather = await getMontvilleWeddingWeather();
    return NextResponse.json(weather);
  } catch {
    return NextResponse.json({ error: "Unable to load weather right now." }, { status: 503 });
  }
}
