"use client";

import { useEffect, useRef, useState } from "react";
import { ScheduleNode } from "@/components/wedding/shared/schedule-node";
import { RainbowText } from "@/components/wedding/shared/rainbow-text";
import { GoldCoastOfferCard } from "@/components/wedding/shared/gold-coast-offer-card";
import { GoldCoastTripHeader } from "@/components/wedding/shared/gold-coast-trip-header";
import { attractionToScheduleProps, goldCoastAttractions } from "@/lib/gold-coast-attractions";
import { LAKESIDE_MEET_GREET } from "@/lib/on-site-access";
import { saveOfflineBundle } from "@/lib/offline-cache";
import { theme } from "@/lib/theme";
import { getBucksPartyStripeUrl } from "@/lib/bucks-party-stripe";
import type { BucksPartyConfigData } from "@/lib/bucks-party-config";
import {
  GLOW_UP_PARTY_DATE_LABEL,
  GLOW_UP_PARTY_PLACE_LABEL,
  GLOW_UP_PARTY_PUBLIC_PATH,
  GLOW_UP_PARTY_RSVP_DEADLINE_LABEL,
  GLOW_UP_PARTY_TIME_LABEL,
  glowUpInterestLabel,
  isGlowUpInterestChoice,
} from "@/lib/glow-up-party";
import type { AppTab } from "@/types/wedding";
import { useVenueMapAccess } from "@/components/wedding/hooks/use-venue-map-access";
import { useWeddingPhase } from "@/components/wedding/hooks/use-wedding-phase";

function WeddingSchedule({
  isOnSite,
  bucksPartyAttending,
  showGlowUp,
  glowUpRegistered,
  glowUpInterest,
  onOpenVenueMap,
  showVenueMapLink,
  onOpenSeating,
  showSeatingLink,
  stripeUrl,
}: {
  isOnSite: boolean;
  bucksPartyAttending?: boolean;
  showGlowUp?: boolean;
  glowUpRegistered?: boolean;
  glowUpInterest?: string | null;
  onOpenVenueMap?: () => void;
  showVenueMapLink?: boolean;
  onOpenSeating?: () => void;
  showSeatingLink?: boolean;
  stripeUrl?: string | null;
}) {
  const [bucksEvent, setBucksEvent] = useState<BucksPartyConfigData | null>(null);

  useEffect(() => {
    if (!bucksPartyAttending) return;
    void (async () => {
      try {
        const res = await fetch("/api/bucks-party/config", { cache: "no-store" });
        const data = await res.json();
        if (res.ok && data.event) setBucksEvent(data.event as BucksPartyConfigData);
      } catch {
        setBucksEvent(null);
      }
    })();
  }, [bucksPartyAttending]);

  const glowUpChoice = isGlowUpInterestChoice(glowUpInterest)
    ? glowUpInterestLabel(glowUpInterest)
    : null;

  return (
    <div className="relative space-y-6 before:absolute before:inset-0 before:ml-6 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-[#e2d5c4]/0 before:via-[#e2d5c4] before:to-[#e2d5c4]/0">
      {bucksPartyAttending && (
        <div className="relative">
          <div className="mb-2 ml-12 h-1 w-[calc(100%-3rem)] rounded-full bg-gradient-to-r from-red-500 via-yellow-400 via-green-500 to-purple-600" />
          <ScheduleNode
            date={bucksEvent?.dateShort ?? "29.08"}
            title="Bucks Party"
            time={bucksEvent?.timeLabel ?? "TBC"}
            attire="Your sluttiest outfit (optional but encouraged)"
            loc={bucksEvent?.placeLabel ?? "Details coming soon"}
            desc={
              bucksEvent?.detailsNote?.trim() ||
              "Jarod & Jamie's ultimate joint bucks. We'll SMS & email the plan."
            }
            tip={
              stripeUrl
                ? "Prepay open: use the button below or the public Bucks page."
                : "Prepay opens closer to the date."
            }
          />
          {stripeUrl ? (
            <>
              <a
                href={stripeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-12 mt-2 inline-flex min-h-11 w-[calc(100%-3rem)] items-center justify-center rounded-xl bg-[#1a0f24] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-pink-200"
              >
                Prepay with Stripe
              </a>
              <p className="ml-12 mt-1 w-[calc(100%-3rem)] text-center text-[10px] text-gray-500">
                Price shown includes the processing fee.
              </p>
            </>
          ) : null}
        </div>
      )}
      {showGlowUp ? (
        <div className="relative">
          <ScheduleNode
            date="05.09"
            title="Pre-Wedding Glow-Up"
            time={GLOW_UP_PARTY_TIME_LABEL}
            attire="Come ready to glow"
            loc={GLOW_UP_PARTY_PLACE_LABEL}
            desc={
              glowUpRegistered && glowUpChoice
                ? `You're down for ${glowUpChoice}. Open the Glow-Up page anytime for details or to update your RSVP.`
                : `Teeth whitening & Botox Pump Party on ${GLOW_UP_PARTY_DATE_LABEL}. RSVP by ${GLOW_UP_PARTY_RSVP_DEADLINE_LABEL}.`
            }
            tip={
              glowUpRegistered
                ? "You're on the list. We'll email & SMS closer to the day."
                : "Register on the Glow-Up page to lock in your spot."
            }
          />
          <a
            href={GLOW_UP_PARTY_PUBLIC_PATH}
            className="ml-12 mt-2 inline-flex min-h-11 w-[calc(100%-3rem)] items-center justify-center rounded-xl bg-[#2a2723] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#e0c9a0]"
          >
            {glowUpRegistered ? "Open Glow-Up page" : "RSVP on Glow-Up page"}
          </a>
        </div>
      ) : null}
      {showVenueMapLink && onOpenVenueMap && (
        <button
          type="button"
          onClick={onOpenVenueMap}
          className="ml-12 flex w-[calc(100%-3rem)] items-center justify-between gap-3 rounded-2xl border bg-white/80 px-4 py-3 text-left shadow-sm active:scale-[0.99]"
          style={{ borderColor: theme.border }}
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#c3a379]">Venue map</p>
            <p className="text-sm text-[#2a2723]">Find homesteads, lawns & Lake View Deck</p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Open</span>
        </button>
      )}
      {isOnSite && (
        <ScheduleNode
          date={LAKESIDE_MEET_GREET.date}
          title={LAKESIDE_MEET_GREET.title}
          time={LAKESIDE_MEET_GREET.time}
          attire={LAKESIDE_MEET_GREET.attire}
          loc={LAKESIDE_MEET_GREET.loc}
          desc={LAKESIDE_MEET_GREET.desc}
          details={[...LAKESIDE_MEET_GREET.details]}
          tip={LAKESIDE_MEET_GREET.tip}
          calendarEventId="lakeside-meet-greet"
        />
      )}
      <ScheduleNode
        date="26.09"
        title="The Ceremony"
        time="3:00pm"
        attire="Colourful cocktail"
        loc="Spicers Clovelly Estate"
        desc="Honey, get ready to sashay! Strictly adults-only."
        calendarEventId="ceremony"
      />
      <ScheduleNode
        date="26.09"
        title="Garden Party"
        time="4:30pm"
        loc="Upper Lawn"
        desc="Decadent canapés, divine drinks, face painter, and a glitter bar! ✨"
      />
      <ScheduleNode
        date="26.09"
        title="Reception"
        time="6:00pm"
        loc="The Pavilion"
        desc="Celebrate with amazing food, drinks, and dance."
      />
      {showSeatingLink && onOpenSeating && (
        <button
          type="button"
          onClick={onOpenSeating}
          className="ml-12 flex w-[calc(100%-3rem)] items-center justify-between gap-3 rounded-2xl border bg-white/80 px-4 py-3 text-left shadow-sm active:scale-[0.99]"
          style={{ borderColor: theme.border }}
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#c3a379]">Seating chart</p>
            <p className="text-sm text-[#2a2723]">Find your table in The Pavilion</p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Open</span>
        </button>
      )}
      <ScheduleNode
        date="27.09"
        title="Family Breakfast"
        time="9:00am"
        attire="Sunglasses probably required"
        loc="Spicers Clovelly Estate"
      />
    </div>
  );
}

function GoldCoastSchedule({ isPenthouseGuest }: { isPenthouseGuest: boolean }) {
  return (
    <div className="animate-fade-in space-y-8 pb-6">
      <GoldCoastTripHeader isPenthouseGuest={isPenthouseGuest} />

      <div className="space-y-4">
        <GoldCoastOfferCard productId="gcue" badge="Add-on · we'll book everything" />
        {isPenthouseGuest && (
          <GoldCoastOfferCard productId="penthouse" badge="À la carte · stay only" />
        )}
      </div>

      <div className="relative space-y-6 before:absolute before:inset-0 before:ml-6 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-[#e2d5c4]/0 before:via-[#e2d5c4] before:to-[#e2d5c4]/0">
        <h3 className="pl-10 font-serif text-xl text-[#c3a379]">Tue 22.09 · Byron Bay & Skydeck</h3>
        {isPenthouseGuest && (
          <ScheduleNode
            time="09:00 AM"
            title="Depart Brisbane"
            desc="Minivan pick-up from Pullman Brisbane Airport. Have luggage ready for the drive south."
            loc="Pullman Brisbane Airport (BNE)"
            details={[
              "We meet at the Pullman Brisbane Airport hotel before heading down the coast.",
              "The minivan covers Brisbane → Byron Bay → Gold Coast penthouse check-in.",
            ]}
          />
        )}
        <ScheduleNode {...attractionToScheduleProps(goldCoastAttractions["byron-lunch"])} />
        {isPenthouseGuest && (
          <>
            <ScheduleNode time="01:00 PM" title="Depart Byron Bay" desc="Hop back in the minivan and head north to the Gold Coast." />
            <ScheduleNode
              time="02:15 PM"
              title="Penthouse Check-in"
              desc="Arrive on the Gold Coast and settle into our three-storey Surfers Paradise penthouse."
              loc="Surfers Paradise"
              details={[
                "Three nights: Tue 22, Wed 23 & Thu 24 Sep.",
                "Ocean views, room to spread out, and the perfect base for theme park days and nights out.",
              ]}
            />
          </>
        )}
        <ScheduleNode {...attractionToScheduleProps(goldCoastAttractions.skydeck)} />

        <h3 className="pt-4 pl-10 font-serif text-xl text-[#c3a379]">Wed 23.09 · Movie World & Fine Dining</h3>
        {isPenthouseGuest && (
          <ScheduleNode time="09:15 AM" title="Depart the Hotel" desc="Minivan pick-up from the penthouse." loc="Surfers Paradise" />
        )}
        <ScheduleNode {...attractionToScheduleProps(goldCoastAttractions["movie-world"])} />
        {isPenthouseGuest && (
          <>
            <ScheduleNode time="05:00 PM" title="Depart Movie World" desc="Leave the park at closing time." />
            <ScheduleNode
              time="05:45 PM"
              title="Hotel Refresh"
              desc="Freshen up at the penthouse before a beautifully indulgent evening at Little Truffle."
              loc="Surfers Paradise"
            />
          </>
        )}
        <ScheduleNode {...attractionToScheduleProps(goldCoastAttractions["little-truffle"])} />

        <h3 className="pt-4 pl-10 font-serif text-xl text-[#c3a379]">Thu 24.09 · Dreamworld & Dracula&apos;s</h3>
        {isPenthouseGuest && (
          <ScheduleNode time="09:15 AM" title="Depart the Hotel" desc="Minivan pick-up from the penthouse." loc="Surfers Paradise" />
        )}
        <ScheduleNode {...attractionToScheduleProps(goldCoastAttractions.dreamworld)} />
        {isPenthouseGuest && (
          <>
            <ScheduleNode time="05:00 PM" title="Depart Dreamworld" desc="Leave the park right at closing time." />
            <ScheduleNode
              time="05:45 PM"
              title="Hotel Refresh"
              desc="Freshen up at the hotel before the evening's entertainment."
              loc="Surfers Paradise"
            />
          </>
        )}
        <ScheduleNode
          time="06:15 PM"
          title="Uber to Dracula's"
          desc="Catch an Uber to Dracula's Cabaret. Arrive 15 minutes before doors open for priority entry and the ghost train."
          loc="Broadbeach"
          details={[
            "Decadent dining, dazzling performances, and deliciously dark glamour.",
            "A-Reserve VIP gets you closer to the action for the three-course dinner show.",
          ]}
        />
        <ScheduleNode {...attractionToScheduleProps(goldCoastAttractions.draculas)} />

        <h3 className="pt-4 pl-10 font-serif text-xl text-[#c3a379]">Fri 25.09 · Australia Zoo & The Hinterland</h3>
        {isPenthouseGuest && (
          <ScheduleNode
            time="07:30 AM"
            title="Depart the Gold Coast"
            desc="Check out of the penthouse and head north towards the Sunshine Coast and Australia Zoo."
            loc="Surfers Paradise"
            details={[
              "Allow about two hours to Beerwah with a coffee stop. Traffic can vary.",
              "After the zoo we continue up into the hinterland to Spicers Clovelly Estate.",
            ]}
          />
        )}
        <ScheduleNode {...attractionToScheduleProps(goldCoastAttractions["australia-zoo"])} />
        {isPenthouseGuest && (
          <>
            <ScheduleNode time="02:30 PM" title="Depart Australia Zoo" desc="Wrap up with the animals and head up into the mountains." />
            <ScheduleNode
              time="03:00 PM"
              title="Arrive at Spicers Clovelly Estate"
              desc="Time to unpack and relax before the wedding weekend kicks into gear!"
              loc="Montville, QLD"
            />
          </>
        )}
      </div>
    </div>
  );
}

export function ItineraryScreen({
  canAccessGoldCoast,
  isPenthouseGuest,
  isOnSite,
  bucksPartyAttending = false,
  showGlowUp = false,
  glowUpRegistered = false,
  glowUpInterest = null,
  setActiveTab,
}: {
  canAccessGoldCoast: boolean;
  isPenthouseGuest: boolean;
  isOnSite: boolean;
  bucksPartyAttending?: boolean;
  showGlowUp?: boolean;
  glowUpRegistered?: boolean;
  glowUpInterest?: string | null;
  setActiveTab?: (tab: AppTab) => void;
}) {
  const { canViewVenueMap: showVenueMap } = useVenueMapAccess();
  const { isFeatureVisible } = useWeddingPhase();
  const showSeating = isFeatureVisible("seating-chart");
  const [view, setView] = useState<"wedding" | "goldcoast">("wedding");
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canAccessGoldCoast && view === "goldcoast") {
      setView("wedding");
    }
  }, [canAccessGoldCoast, view]);

  useEffect(() => {
    const main = topRef.current?.closest("main");
    main?.scrollTo({ top: 0, left: 0 });
  }, [view]);

  useEffect(() => {
    saveOfflineBundle({
      itineraryHtml:
        "Fri Meet & Greet 6pm (on-site). Sat Ceremony 3pm, Garden Party 4:30pm, Reception 6pm at Spicers Clovelly. Sun Breakfast 9am.",
      faqSnippets: [
        "Ceremony 3:00pm: colourful cocktail attire, adults-only",
        "Reception 6:00pm: The Pavilion",
        "Courtesy shuttle for Montville-area guests",
        "Hashtag #J-rodandJamo",
      ],
    });
  }, []);

  const switchView = (next: "wedding" | "goldcoast") => {
    setView(next);
  };

  return (
    <div ref={topRef} className="animate-fade-in pb-10">
      <div className="wedding-screen-top sticky top-0 z-20 bg-[var(--wedding-bg)]/90 px-8 pb-6 text-center backdrop-blur-md">
        <RainbowText
          as="h2"
          className="mb-2 font-serif text-sm uppercase tracking-[0.15em] text-gray-500"
        >
          The Details
        </RainbowText>
        <RainbowText as="h1" className="font-serif text-3xl text-[var(--wedding-text-dark)]">
          Schedule & Events
        </RainbowText>
        {canAccessGoldCoast ? (
          <div className="mt-6 flex rounded-full bg-[#e2d5c4]/30 p-1 shadow-inner">
            <button
              type="button"
              onClick={() => switchView("wedding")}
              className={`flex-1 rounded-full py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all ${view === "wedding" ? "bg-white text-[#2a2723] shadow-md" : "text-gray-500"}`}
            >
              Wedding Wknd
            </button>
            <button
              type="button"
              onClick={() => switchView("goldcoast")}
              className={`flex-1 rounded-full py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all ${view === "goldcoast" ? "bg-white text-[#2a2723] shadow-md" : "text-gray-500"}`}
            >
              Gold Coast Trip
            </button>
          </div>
        ) : null}
      </div>
      <div className="mt-4 px-6">
        {view === "goldcoast" && canAccessGoldCoast ? (
          <GoldCoastSchedule isPenthouseGuest={isPenthouseGuest} />
        ) : (
          <WeddingSchedule
            isOnSite={isOnSite}
            bucksPartyAttending={bucksPartyAttending}
            showGlowUp={showGlowUp}
            glowUpRegistered={glowUpRegistered}
            glowUpInterest={glowUpInterest}
            stripeUrl={getBucksPartyStripeUrl()}
            showVenueMapLink={showVenueMap}
            onOpenVenueMap={setActiveTab ? () => setActiveTab("venue-map") : undefined}
            showSeatingLink={showSeating}
            onOpenSeating={setActiveTab ? () => setActiveTab("seating") : undefined}
          />
        )}
      </div>
    </div>
  );
}
