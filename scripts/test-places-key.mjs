import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env") });

const key =
  process.env.GOOGLE_MAPS_API_KEY?.trim() ||
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();

if (!key) {
  console.log("NO_MAPS_KEY");
  process.exit(1);
}

console.log("key_prefix:", key.slice(0, 10) + "...");

const params = new URLSearchParams({
  key,
  location: "-26.691,152.892",
  radius: "5000",
  type: "restaurant",
});

const res = await fetch(
  `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params}`,
);
const data = await res.json();
console.log("places_status:", data.status);
console.log("places_error:", data.error_message ?? "(none)");
console.log("places_results:", data.results?.length ?? 0);

const geoParams = new URLSearchParams({ key, address: "Montville QLD" });
const geoRes = await fetch(
  `https://maps.googleapis.com/maps/api/geocode/json?${geoParams}`,
);
const geo = await geoRes.json();
console.log("geocode_status:", geo.status);
console.log("geocode_error:", geo.error_message ?? "(none)");
