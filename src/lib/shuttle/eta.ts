type LatLng = { latitude: number; longitude: number };

type EtaResult = {
  durationSeconds: number;
  durationText: string;
  arrivalIso: string;
};

export async function getDrivingEta(
  origin: LatLng,
  destination: LatLng,
): Promise<EtaResult | null> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;

  const params = new URLSearchParams({
    origin: `${origin.latitude},${origin.longitude}`,
    destination: `${destination.latitude},${destination.longitude}`,
    mode: "driving",
    key: apiKey,
  });

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`,
    { next: { revalidate: 0 } },
  );

  if (!res.ok) return null;

  const data = (await res.json()) as {
    status: string;
    routes?: { legs?: { duration?: { value: number; text: string } }[] }[];
  };

  if (data.status !== "OK" || !data.routes?.[0]?.legs?.[0]?.duration) {
    return null;
  }

  const duration = data.routes[0].legs[0].duration;
  const arrival = new Date(Date.now() + duration.value * 1000);

  return {
    durationSeconds: duration.value,
    durationText: duration.text,
    arrivalIso: arrival.toISOString(),
  };
}

export function formatEtaTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-AU", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Australia/Brisbane",
  });
}
