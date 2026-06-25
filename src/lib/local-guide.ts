import {
  buildHinterlandPlacesKnowledge,
  LOCAL_DISCOVERY_AREA,
} from "@/lib/hinterland-places";

export { LOCAL_DISCOVERY_AREA };

export function buildLocalGuideKnowledge(): string {
  return buildHinterlandPlacesKnowledge();
}
