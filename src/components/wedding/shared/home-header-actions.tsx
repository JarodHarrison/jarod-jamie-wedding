"use client";

import { NotificationBell } from "@/components/wedding/shared/notification-bell";
import { ThemeEmojiToggle } from "@/components/wedding/shared/theme-emoji-toggle";

type HomeHeaderActionsProps = {
  className?: string;
};

export function HomeHeaderActions({ className }: HomeHeaderActionsProps) {
  return (
    <div className={`flex items-center gap-0.5 ${className ?? ""}`}>
      <NotificationBell />
      <ThemeEmojiToggle />
    </div>
  );
}
