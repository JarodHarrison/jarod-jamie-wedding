import type { GuestPhotoStatus } from "@prisma/client";

export type VisionLikelihood =
  | "UNKNOWN"
  | "VERY_UNLIKELY"
  | "UNLIKELY"
  | "POSSIBLE"
  | "LIKELY"
  | "VERY_LIKELY";

export type VisionSafeSearchResult = {
  adult: VisionLikelihood;
  violence: VisionLikelihood;
  racy: VisionLikelihood;
  medical: VisionLikelihood;
  spoof: VisionLikelihood;
};

export type VisionModerationOutcome = {
  enabled: boolean;
  scanned: boolean;
  safeSearch: VisionSafeSearchResult | null;
  flaggedCategories: string[];
  decision: "block" | "review" | "allow";
  status: GuestPhotoStatus;
};

const BLOCK_LEVELS = new Set<VisionLikelihood>(["LIKELY", "VERY_LIKELY"]);
const REVIEW_LEVELS = new Set<VisionLikelihood>(["POSSIBLE"]);

const MODERATED_CATEGORIES = ["adult", "violence", "racy"] as const;

export function isVisionModerationEnabled() {
  if (process.env.GUEST_PHOTO_VISION_MODERATION === "false") return false;
  return Boolean(process.env.GOOGLE_API_KEY?.trim());
}

function parseLikelihood(value: unknown): VisionLikelihood {
  if (typeof value !== "string") return "UNKNOWN";
  if (
    value === "VERY_UNLIKELY" ||
    value === "UNLIKELY" ||
    value === "POSSIBLE" ||
    value === "LIKELY" ||
    value === "VERY_LIKELY"
  ) {
    return value;
  }
  return "UNKNOWN";
}

export async function scanImageSafeSearch(buffer: Buffer): Promise<VisionSafeSearchResult | null> {
  const apiKey = process.env.GOOGLE_API_KEY?.trim();
  if (!apiKey) return null;

  const res = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requests: [
        {
          image: { content: buffer.toString("base64") },
          features: [{ type: "SAFE_SEARCH_DETECTION", maxResults: 1 }],
        },
      ],
    }),
  });

  const data = (await res.json()) as {
    responses?: Array<{
      safeSearchAnnotation?: Record<string, unknown>;
      error?: { message?: string };
    }>;
    error?: { message?: string };
  };

  if (!res.ok) {
    console.error("[google-vision] request failed:", data.error?.message ?? res.status);
    return null;
  }

  const annotation = data.responses?.[0]?.safeSearchAnnotation;
  if (!annotation) {
    console.error("[google-vision] missing annotation:", data.responses?.[0]?.error?.message);
    return null;
  }

  return {
    adult: parseLikelihood(annotation.adult),
    violence: parseLikelihood(annotation.violence),
    racy: parseLikelihood(annotation.racy),
    medical: parseLikelihood(annotation.medical),
    spoof: parseLikelihood(annotation.spoof),
  };
}

function flaggedCategories(safeSearch: VisionSafeSearchResult) {
  return MODERATED_CATEGORIES.filter((category) => {
    const level = safeSearch[category];
    return BLOCK_LEVELS.has(level) || REVIEW_LEVELS.has(level);
  });
}

function worstDecision(safeSearch: VisionSafeSearchResult): "block" | "review" | "allow" {
  let worst: "block" | "review" | "allow" = "allow";

  for (const category of MODERATED_CATEGORIES) {
    const level = safeSearch[category];
    if (BLOCK_LEVELS.has(level)) return "block";
    if (REVIEW_LEVELS.has(level)) worst = "review";
  }

  return worst;
}

export function resolvePhotoStatusFromVision(
  safeSearch: VisionSafeSearchResult | null,
): Pick<VisionModerationOutcome, "flaggedCategories" | "decision" | "status"> {
  if (!safeSearch) {
    return {
      flaggedCategories: [],
      decision: "allow",
      status: "APPROVED",
    };
  }

  const categories = flaggedCategories(safeSearch);
  const decision = worstDecision(safeSearch);

  if (decision === "block") {
    return { flaggedCategories: categories, decision, status: "HIDDEN" };
  }

  return {
    flaggedCategories: decision === "review" ? categories : [],
    decision,
    status: "APPROVED",
  };
}

export async function moderateGuestPhoto(buffer: Buffer): Promise<VisionModerationOutcome> {
  if (!isVisionModerationEnabled()) {
    return {
      enabled: false,
      scanned: false,
      safeSearch: null,
      flaggedCategories: [],
      decision: "allow",
      status: "APPROVED",
    };
  }

  const safeSearch = await scanImageSafeSearch(buffer);
  const resolved = resolvePhotoStatusFromVision(safeSearch);

  return {
    enabled: true,
    scanned: Boolean(safeSearch),
    safeSearch,
    ...resolved,
  };
}

export function formatVisionFlags(safeSearch: VisionSafeSearchResult) {
  return {
    ...safeSearch,
    reviewedAt: new Date().toISOString(),
  };
}

export function visionSummary(safeSearch: VisionSafeSearchResult | null) {
  if (!safeSearch) return null;

  return MODERATED_CATEGORIES.map((category) => `${category}: ${safeSearch[category]}`).join(" · ");
}

// Minimal 1×1 JPEG for a cheap Vision API health check.
const VISION_HEALTH_CHECK_JPEG = Buffer.from(
  "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDAREAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAr/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAgP/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA//2Q==",
  "base64",
);

export async function verifyVisionApiAccess(): Promise<{ ok: boolean; error?: string }> {
  if (!process.env.GOOGLE_API_KEY?.trim()) {
    return { ok: false, error: "GOOGLE_API_KEY is not set." };
  }

  if (process.env.GUEST_PHOTO_VISION_MODERATION === "false") {
    return { ok: false, error: "Vision moderation is disabled via GUEST_PHOTO_VISION_MODERATION." };
  }

  const result = await scanImageSafeSearch(VISION_HEALTH_CHECK_JPEG);
  if (!result) {
    return {
      ok: false,
      error: "Vision API did not respond. Confirm Cloud Vision API is enabled on this Google Cloud project.",
    };
  }

  return { ok: true };
}
