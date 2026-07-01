import type { GuestGeoContext } from "@/lib/guest-geo";
import type { ScoredAttraction } from "@/lib/attraction-store";
import { formatPlaceChatLinks } from "@/lib/hinterland-places";

export function formatCachedAttractionForChat(
  place: ScoredAttraction,
  geo: GuestGeoContext,
): string {
  const distanceLabel =
    place.driveMinutes === 0
      ? "on-site"
      : `~${place.driveMinutes} minutes from ${geo.originLabel}`;

  const ratingHint =
    typeof place.rating === "number" ? ` · ★ ${place.rating.toFixed(1)}` : "";

  return `• **${place.name}** (${place.category}${ratingHint}, ${distanceLabel}) — ${place.description}${formatPlaceChatLinks({
    name: place.name,
    websiteUrl: place.websiteUrl,
    latitude: place.latitude,
    longitude: place.longitude,
  })}`;
}
