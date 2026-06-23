import { daysUntilWedding, WEDDING_DATE_ISO, WEDDING_TIMEZONE } from "@/lib/wedding-date";
import { describeWeatherCode, roundTemp } from "@/lib/weather/wmo";

const MONTVILLE_LAT = -26.696;
const MONTVILLE_LNG = 152.881;
const FORECAST_HORIZON_DAYS = 10;

export type WeddingWeatherPayload = {
  location: string;
  weddingDate: string;
  weddingDateLabel: string;
  mode: "forecast" | "typical" | "current_only";
  headline: string;
  emoji: string;
  highC: number | null;
  lowC: number | null;
  rainChancePercent: number | null;
  note: string | null;
  currentMontville?: {
    tempC: number;
    label: string;
    emoji: string;
  };
};

type DailySlice = {
  weatherCode: number;
  highC: number;
  lowC: number;
  rainChancePercent: number | null;
};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Weather request failed (${res.status})`);
  return res.json() as Promise<T>;
}

function weddingDateLabel(): string {
  return new Date(`${WEDDING_DATE_ISO}T12:00:00`).toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: WEDDING_TIMEZONE,
  });
}

async function fetchForecastDay(dateIso: string): Promise<DailySlice | null> {
  const params = new URLSearchParams({
    latitude: String(MONTVILLE_LAT),
    longitude: String(MONTVILLE_LNG),
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    timezone: WEDDING_TIMEZONE,
    start_date: dateIso,
    end_date: dateIso,
  });

  const data = await fetchJson<{
    daily?: {
      time?: string[];
      weather_code?: number[];
      temperature_2m_max?: number[];
      temperature_2m_min?: number[];
      precipitation_probability_max?: number[];
    };
  }>(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);

  const i = data.daily?.time?.indexOf(dateIso) ?? -1;
  if (i < 0) return null;

  const high = data.daily?.temperature_2m_max?.[i];
  const low = data.daily?.temperature_2m_min?.[i];
  const code = data.daily?.weather_code?.[i];
  if (high == null || low == null || code == null) return null;

  return {
    weatherCode: code,
    highC: high,
    lowC: low,
    rainChancePercent: data.daily?.precipitation_probability_max?.[i] ?? null,
  };
}

async function fetchTypicalLateSeptember(): Promise<DailySlice> {
  const years = [2020, 2021, 2022, 2023, 2024, 2025];
  const slices: (DailySlice | null)[] = await Promise.all(
    years.map(async (year) => {
      const dateIso = `${year}-09-26`;
      const params = new URLSearchParams({
        latitude: String(MONTVILLE_LAT),
        longitude: String(MONTVILLE_LNG),
        daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum",
        timezone: WEDDING_TIMEZONE,
        start_date: dateIso,
        end_date: dateIso,
      });

      try {
        const data = await fetchJson<{
          daily?: {
            weather_code?: number[];
            temperature_2m_max?: number[];
            temperature_2m_min?: number[];
            precipitation_sum?: number[];
          };
        }>(`https://archive-api.open-meteo.com/v1/archive?${params.toString()}`);

        const high = data.daily?.temperature_2m_max?.[0];
        const low = data.daily?.temperature_2m_min?.[0];
        const code = data.daily?.weather_code?.[0];
        if (high == null || low == null || code == null) return null;

        return {
          weatherCode: code,
          highC: high,
          lowC: low,
          rainChancePercent:
            (data.daily?.precipitation_sum?.[0] ?? 0) > 1 ? 55 : 25,
        };
      } catch {
        return null;
      }
    }),
  );

  const valid = slices.filter((s): s is DailySlice => s !== null);
  if (valid.length === 0) {
    return {
      weatherCode: 2,
      highC: 23,
      lowC: 14,
      rainChancePercent: 30,
    };
  }

  const avg = (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length;
  const medianCode = [...valid].map((s) => s.weatherCode).sort((a, b) => a - b)[
    Math.floor(valid.length / 2)
  ]!;

  return {
    weatherCode: medianCode,
    highC: avg(valid.map((s) => s.highC)),
    lowC: avg(valid.map((s) => s.lowC)),
    rainChancePercent: Math.round(
      avg(valid.map((s) => s.rainChancePercent ?? 30)),
    ),
  };
}

async function fetchCurrentMontville() {
  const params = new URLSearchParams({
    latitude: String(MONTVILLE_LAT),
    longitude: String(MONTVILLE_LNG),
    current: "temperature_2m,weather_code",
    timezone: WEDDING_TIMEZONE,
  });

  const data = await fetchJson<{
    current?: { temperature_2m?: number; weather_code?: number };
  }>(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);

  const temp = data.current?.temperature_2m;
  const code = data.current?.weather_code;
  if (temp == null || code == null) return undefined;

  const { label, emoji } = describeWeatherCode(code);
  return { tempC: roundTemp(temp), label, emoji };
}

function buildPayload(
  mode: WeddingWeatherPayload["mode"],
  day: DailySlice,
  note: string | null,
  currentMontville?: WeddingWeatherPayload["currentMontville"],
): WeddingWeatherPayload {
  const { label, emoji } = describeWeatherCode(day.weatherCode);
  return {
    location: "Montville, QLD",
    weddingDate: WEDDING_DATE_ISO,
    weddingDateLabel: weddingDateLabel(),
    mode,
    headline: label,
    emoji,
    highC: roundTemp(day.highC),
    lowC: roundTemp(day.lowC),
    rainChancePercent: day.rainChancePercent,
    note,
    currentMontville,
  };
}

export async function getMontvilleWeddingWeather(): Promise<WeddingWeatherPayload> {
  const daysOut = daysUntilWedding();
  const currentMontville = await fetchCurrentMontville();

  if (daysOut >= 0 && daysOut <= FORECAST_HORIZON_DAYS) {
    const forecast = await fetchForecastDay(WEDDING_DATE_ISO);
    if (forecast) {
      return buildPayload(
        "forecast",
        forecast,
        daysOut === 0 ? "It's wedding day, darling!" : "Live forecast for the big day",
        currentMontville,
      );
    }
  }

  const typical = await fetchTypicalLateSeptember();
  const daysUntilNote =
    daysOut > FORECAST_HORIZON_DAYS
      ? `Live forecast from ${FORECAST_HORIZON_DAYS} days before the wedding — showing typical late-September weather for now`
      : daysOut < 0
        ? "Hope you had the most fabulous day!"
        : null;

  return buildPayload("typical", typical, daysUntilNote, currentMontville);
}
