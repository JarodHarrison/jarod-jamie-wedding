"use client";

import { useGuestProfile } from "@/components/wedding/hooks/use-guest-profile";
import { WhereImStayingCard } from "@/components/wedding/shared/where-im-staying-card";
import type { AppTab } from "@/types/wedding";

type HomeWhereImStayingProps = {
  setActiveTab: (tab: AppTab) => void;
};

export function HomeWhereImStaying({ setActiveTab }: HomeWhereImStayingProps) {
  const { profile, loading } = useGuestProfile();

  if (loading || !profile?.assignedRoomName) return null;

  return (
    <WhereImStayingCard
      profile={profile}
      onOpenTravel={() => setActiveTab("travel")}
    />
  );
}
