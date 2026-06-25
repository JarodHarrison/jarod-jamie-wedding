import type { GuestPhotoStatus } from "@prisma/client";

export function initialGuestPhotoStatus(): GuestPhotoStatus {
  return "APPROVED";
}

export function guestPhotoStatusLabel(status: GuestPhotoStatus) {
  switch (status) {
    case "PENDING":
      return "Awaiting approval";
    case "APPROVED":
      return "Live on wall";
    case "HIDDEN":
      return "Hidden";
  }
}
