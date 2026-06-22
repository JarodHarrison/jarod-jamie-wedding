"use client";

import { useEffect, useState } from "react";
import { BookOpen, Calendar, Home, MapPin, Shield, Users } from "lucide-react";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { LoginScreen } from "@/components/wedding/login-screen";
import { PhoneFrame } from "@/components/wedding/phone-frame";
import { NavItem } from "@/components/wedding/shared/nav-item";
import { AttractionsScreen } from "@/components/wedding/screens/attractions-screen";
import { FAQScreen, WishingWellScreen } from "@/components/wedding/screens/faq-screen";
import { GuestShuttleScreen } from "@/components/wedding/screens/guest-shuttle-screen";
import { GlowUpScreen, FashionInspirationScreen, OnSiteScreen } from "@/components/wedding/screens/guide-sub-screens";
import { GuideScreen } from "@/components/wedding/screens/guide-screen";
import { HomeScreen } from "@/components/wedding/screens/home-screen";
import { ItineraryScreen } from "@/components/wedding/screens/itinerary-screen";
import { PhotosScreen } from "@/components/wedding/screens/photos-screen";
import { PartyScreen } from "@/components/wedding/screens/party-screen";
import { RSVPScreen } from "@/components/wedding/screens/rsvp-screen";
import { StoryScreen } from "@/components/wedding/screens/story-screen";
import { TravelScreen } from "@/components/wedding/screens/travel-screen";
import { WeddingChatbot } from "@/components/wedding/chat/wedding-chatbot";
import { theme } from "@/lib/theme";
import type { AdminUser, AppTab, MainTab, WeddingUser } from "@/types/wedding";

const guestNav: { id: MainTab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "itinerary", label: "Itinerary", icon: Calendar },
  { id: "rsvp", label: "RSVP", icon: BookOpen },
  { id: "guide", label: "Guide", icon: MapPin },
  { id: "party", label: "Party", icon: Users },
];

const adminNavItem = { id: "admin" as const, label: "Admin", icon: Shield };

export function WeddingApp() {
  const [activeTab, setActiveTab] = useState<AppTab>("home");
  const [chatOpen, setChatOpen] = useState(false);
  const [user, setUser] = useState<WeddingUser | null>(null);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
        if (data.admin) setAdmin(data.admin);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setAdmin(null);
    setActiveTab("home");
  };

  if (loading) {
    return (
      <PhoneFrame>
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Loading...</p>
        </div>
      </PhoneFrame>
    );
  }

  if (!user && !admin) {
    return (
      <PhoneFrame>
        <LoginScreen onGuestLogin={setUser} onAdminLogin={setAdmin} />
      </PhoneFrame>
    );
  }

  const displayName = user?.name ?? admin!.name;
  const isPenthouse = user?.tier === "PENTHOUSE" || !!admin;
  const navItems = admin ? [...guestNav, adminNavItem] : guestNav;

  const renderScreen = () => {
    switch (activeTab) {
      case "admin":
        return (
          <AdminDashboard
            adminName={admin!.name}
            onLogout={handleLogout}
            onUnauthorized={handleLogout}
          />
        );
      case "home":
        return (
          <HomeScreen
            setActiveTab={setActiveTab}
            onLogout={handleLogout}
            userName={displayName}
            onOpenChat={() => setChatOpen(true)}
          />
        );
      case "itinerary":
        return <ItineraryScreen isPenthouse={isPenthouse} />;
      case "rsvp":
        return <RSVPScreen />;
      case "guide":
        return <GuideScreen setActiveTab={setActiveTab} />;
      case "party":
        return <PartyScreen />;
      case "story":
        return <StoryScreen setActiveTab={setActiveTab} />;
      case "faq":
        return <FAQScreen setActiveTab={setActiveTab} />;
      case "wishingwell":
        return <WishingWellScreen setActiveTab={setActiveTab} />;
      case "travel":
        return <TravelScreen setActiveTab={setActiveTab} />;
      case "shuttle":
        return <GuestShuttleScreen setActiveTab={setActiveTab} />;
      case "photos":
        return <PhotosScreen setActiveTab={setActiveTab} />;
      case "attractions":
        return <AttractionsScreen setActiveTab={setActiveTab} />;
      case "fashion":
        return <FashionInspirationScreen setActiveTab={setActiveTab} />;
      case "glowup":
        return <GlowUpScreen setActiveTab={setActiveTab} />;
      case "onsite":
        return <OnSiteScreen setActiveTab={setActiveTab} />;
      default:
        return (
          <HomeScreen
            setActiveTab={setActiveTab}
            userName={displayName}
            onOpenChat={() => setChatOpen(true)}
          />
        );
    }
  };

  return (
    <PhoneFrame>
      <div className="relative flex min-h-0 flex-1 flex-col">
        <main className="min-h-0 flex-1 overflow-y-auto scroll-smooth">{renderScreen()}</main>
        <WeddingChatbot open={chatOpen} onOpenChange={setChatOpen} />
        {!chatOpen && (
          <nav
            className={`wedding-bottom-nav z-50 grid w-full shrink-0 items-end border-t bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-0.5 pt-1.5 ${navItems.length > 5 ? "grid-cols-6" : "grid-cols-5"}`}
            style={{ borderColor: theme.border }}
          >
            {navItems.map(({ id, label, icon }) => (
              <NavItem
                key={id}
                id={id}
                icon={icon}
                label={label}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                compact={!!admin}
              />
            ))}
          </nav>
        )}
      </div>
    </PhoneFrame>
  );
}
