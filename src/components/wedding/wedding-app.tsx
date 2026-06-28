"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Calendar, Heart, Home, MapPin, UserCircle, Users, Shield, Store } from "lucide-react";
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
import { PhotoboothBingoScreen } from "@/components/wedding/screens/photobooth-bingo-screen";
import { McBingoVerifyScreen } from "@/components/wedding/screens/mc-bingo-verify-screen";
import { VenueMapScreen } from "@/components/wedding/screens/venue-map-screen";
import { ProfileScreen } from "@/components/wedding/screens/profile-screen";
import { PartyScreen } from "@/components/wedding/screens/party-screen";
import { RSVPScreen } from "@/components/wedding/screens/rsvp-screen";
import { JarodJamieScreen } from "@/components/wedding/screens/jarod-jamie-screen";
import { VendorsScreen } from "@/components/wedding/screens/vendors-screen";
import { TravelScreen } from "@/components/wedding/screens/travel-screen";
import { WeddingChatbot } from "@/components/wedding/chat/wedding-chatbot";
import { SparkleOverlay } from "@/components/wedding/shared/sparkle-overlay";
import { InstallAppPopup } from "@/components/wedding/shared/install-app-popup";
import { OfflineBanner } from "@/components/wedding/shared/offline-banner";
import { requestInstallGuide } from "@/lib/pwa/install-guide";
import { ensureNotificationServiceWorker } from "@/lib/os-notifications";
import { resetAnnitaFabHiddenForNewSession } from "@/lib/annita-fab-prefs";
import { theme } from "@/lib/theme";
import type { AdminUser, AppTab, GuestTier, MainTab, WeddingUser } from "@/types/wedding";
import { hasOnSiteAppAccess } from "@/lib/on-site-access";
import { useWeddingPhase } from "@/components/wedding/hooks/use-wedding-phase";
import type { WeddingFeature } from "@/lib/wedding-event";

const guestNav: { id: MainTab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "jarodjamie", label: "Stories", icon: Heart },
  { id: "itinerary", label: "Itinerary", icon: Calendar },
  { id: "guide", label: "Guide", icon: MapPin },
  { id: "party", label: "Party", icon: Users },
  { id: "profile", label: "Profile", icon: UserCircle },
];

const adminNavItem = { id: "admin" as const, label: "Admin", icon: Shield };
const vendorsNavItem = { id: "vendors" as const, label: "Vendors", icon: Store };

const SESSION_REFRESH_MS = 30_000;

const PHASE_GATED_TABS: Partial<Record<AppTab, WeddingFeature>> = {
  bingo: "photobooth-bingo",
  shuttle: "live-shuttle",
};

const PLANNING_TABS: AppTab[] = ["attractions", "fashion", "glowup", "onsite"];

export function WeddingApp() {
  const [activeTab, setActiveTab] = useState<AppTab>("home");
  const { isFeatureVisible } = useWeddingPhase();
  const [chatOpen, setChatOpen] = useState(false);
  const [user, setUser] = useState<WeddingUser | null>(null);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [canAccessAdmin, setCanAccessAdmin] = useState(false);
  const [canViewVendors, setCanViewVendors] = useState(false);
  const [canVerifyBingo, setCanVerifyBingo] = useState(false);
  const [hasOnSiteAccess, setHasOnSiteAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    resetAnnitaFabHiddenForNewSession();
  }, []);

  useEffect(() => {
    if (!user) return;
    void ensureNotificationServiceWorker();
  }, [user]);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, left: 0 });
  }, [activeTab]);

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) setUser(data.user);
      else setUser(null);
      if (data.admin) setAdmin(data.admin);
      else setAdmin(null);
      setCanAccessAdmin(Boolean(data.canAccessAdmin));
      setCanViewVendors(Boolean(data.canViewVendors));
      setCanVerifyBingo(Boolean(data.canVerifyBingo));
      setHasOnSiteAccess(Boolean(data.hasOnSiteAccess));
    } catch {
      setUser(null);
      setAdmin(null);
      setCanAccessAdmin(false);
      setCanViewVendors(false);
      setCanVerifyBingo(false);
      setHasOnSiteAccess(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const auth = params.get("auth");
    if (auth === "google_signin" || auth === "google_signup" || auth === "google_linked") {
      window.history.replaceState({}, "", window.location.pathname);
      if (auth === "google_linked") {
        setActiveTab("profile");
      }
      void refreshSession().finally(() => setLoading(false));
      return;
    }

    void refreshSession().finally(() => setLoading(false));
  }, [refreshSession]);

  useEffect(() => {
    if (loading) return;
    if (!user && !admin) return;

    const interval = window.setInterval(() => void refreshSession(), SESSION_REFRESH_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void refreshSession();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [loading, user, admin, refreshSession]);

  useEffect(() => {
    if (loading || (!user && !admin)) return;
    void refreshSession();
  }, [activeTab, loading, user, admin, refreshSession]);

  useEffect(() => {
    const feature = PHASE_GATED_TABS[activeTab];
    if (feature && !isFeatureVisible(feature)) {
      setActiveTab("home");
      return;
    }
    if (PLANNING_TABS.includes(activeTab) && !isFeatureVisible("pre-wedding-planning")) {
      setActiveTab("guide");
    }
  }, [activeTab, isFeatureVisible]);

  useEffect(() => {
    const onTierUpdated = (event: Event) => {
      const tier = (event as CustomEvent<GuestTier>).detail;
      setUser((current) => (current ? { ...current, tier } : current));
      setHasOnSiteAccess(hasOnSiteAppAccess(tier));
    };
    window.addEventListener("wedding:guest-tier", onTierUpdated);
    return () => window.removeEventListener("wedding:guest-tier", onTierUpdated);
  }, []);

  const applySession = (data: {
    user?: WeddingUser | null;
    admin?: AdminUser | null;
    canAccessAdmin?: boolean;
    canViewVendors?: boolean;
    canVerifyBingo?: boolean;
  }) => {
    setUser(data.user ?? null);
    setAdmin(data.admin ?? null);
    setCanAccessAdmin(Boolean(data.canAccessAdmin));
    setCanViewVendors(Boolean(data.canViewVendors));
    setCanVerifyBingo(Boolean(data.canVerifyBingo));
    setActiveTab("home");
  };

  const handleLogout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setAdmin(null);
    setCanAccessAdmin(false);
    setCanViewVendors(false);
    setCanVerifyBingo(false);
    setActiveTab("home");
  }, []);

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
        <LoginScreen
          onGuestLogin={(loggedInUser, canAccessAdmin, canVerifyBingo) => {
            applySession({ user: loggedInUser, admin: null, canAccessAdmin, canVerifyBingo });
          }}
          onAdminLogin={(loggedInAdmin, linkedUser) => {
            applySession({
              user: linkedUser ?? null,
              admin: loggedInAdmin,
              canAccessAdmin: true,
              canVerifyBingo: true,
            });
          }}
        />
      </PhoneFrame>
    );
  }

  const displayName = user?.name ?? admin!.name;
  const isPenthouse = user?.tier === "PENTHOUSE" || canAccessAdmin;
  const isOnSite = hasOnSiteAccess || canAccessAdmin;
  const showAdminNav = canAccessAdmin;
  const navItems = [
    ...guestNav,
    ...(canViewVendors && !canAccessAdmin ? [vendorsNavItem] : []),
    ...(showAdminNav ? [adminNavItem] : []),
  ];

  const renderScreen = () => {
    switch (activeTab) {
      case "admin":
        return (
          <AdminDashboard
            adminName={user?.name ?? admin?.name ?? "Admin"}
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
            onOpenInstall={requestInstallGuide}
            canVerifyBingo={canVerifyBingo}
          />
        );
      case "itinerary":
        return (
          <ItineraryScreen
            isPenthouse={isPenthouse}
            isOnSite={isOnSite}
            setActiveTab={setActiveTab}
          />
        );
      case "rsvp":
        return <RSVPScreen />;
      case "guide":
        return <GuideScreen setActiveTab={setActiveTab} />;
      case "profile":
        return (
          <ProfileScreen
            setActiveTab={setActiveTab}
            onLogout={handleLogout}
          />
        );
      case "party":
        return <PartyScreen />;
      case "vendors":
        return <VendorsScreen setActiveTab={setActiveTab} />;
      case "jarodjamie":
        return <JarodJamieScreen setActiveTab={setActiveTab} />;
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
      case "bingo":
        return <PhotoboothBingoScreen setActiveTab={setActiveTab} />;
      case "mc-verify":
        return <McBingoVerifyScreen setActiveTab={setActiveTab} />;
      case "venue-map":
        return <VenueMapScreen setActiveTab={setActiveTab} isAdmin={canAccessAdmin} />;
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
            onOpenInstall={requestInstallGuide}
            canVerifyBingo={canVerifyBingo}
          />
        );
    }
  };

  return (
    <PhoneFrame>
      <SparkleOverlay />
      <OfflineBanner />
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <main ref={mainRef} className="min-h-0 flex-1 overflow-y-auto scroll-smooth">{renderScreen()}</main>
        <WeddingChatbot open={chatOpen} onOpenChange={setChatOpen} />
        <InstallAppPopup />
        {!chatOpen && (
          <nav
            className={`wedding-bottom-nav z-50 grid w-full shrink-0 items-end border-t bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-0.5 pt-1 ${
              navItems.length > 6 ? "grid-cols-7" : navItems.length > 5 ? "grid-cols-6" : "grid-cols-5"
            }`}
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
                compact={showAdminNav}
              />
            ))}
          </nav>
        )}
      </div>
    </PhoneFrame>
  );
}
