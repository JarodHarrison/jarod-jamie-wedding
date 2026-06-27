"use client";

import { useEffect, useRef, useState } from "react";
import { ScheduleNode } from "@/components/wedding/shared/schedule-node";
import { RainbowText } from "@/components/wedding/shared/rainbow-text";
import { GoldCoastOfferCard } from "@/components/wedding/shared/gold-coast-offer-card";
import { attractionToScheduleProps, goldCoastAttractions } from "@/lib/gold-coast-attractions";
import { LAKESIDE_MEET_GREET } from "@/lib/on-site-access";
import { saveOfflineBundle } from "@/lib/offline-cache";
import { theme } from "@/lib/theme";
import type { AppTab } from "@/types/wedding";
import { useVenueMapAccess } from "@/components/wedding/hooks/use-venue-map-access";

function WeddingSchedule({
  isOnSite,
  onOpenVenueMap,
  showVenueMapLink,
}: {
  isOnSite: boolean;
  onOpenVenueMap?: () => void;
  showVenueMapLink?: boolean;
}) {
  return (
    <div className="relative space-y-6 before:absolute before:inset-0 before:ml-6 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-[#e2d5c4]/0 before:via-[#e2d5c4] before:to-[#e2d5c4]/0">
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
        calendarEventId="garden-party"
      />
      <ScheduleNode
        date="26.09"
        title="Reception"
        time="6:00pm"
        loc="The Pavilion"
        desc="Celebrate with amazing food, drinks, and dance."
        calendarEventId="reception"
      />
      <ScheduleNode
        date="27.09"
        title="Family Breakfast"
        time="9:00am"
        attire="Sunglasses probably required"
        loc="Spicers Clovelly Estate"
        calendarEventId="family-breakfast"
      />
    </div>
  );
}

function GoldCoastSchedule({ isPenthouse }: { isPenthouse: boolean }) {
  return (
    <div className="animate-fade-in space-y-8 pb-6">
      {isPenthouse && (
        <div className="space-y-4">
          <GoldCoastOfferCard productId="gcue" badge="Recommended · all in" />
          <GoldCoastOfferCard productId="penthouse" badge="À la carte · stay only" />
        </div>
      )}

      <div className="relative space-y-6 before:absolute before:inset-0 before:ml-6 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-[#e2d5c4]/0 before:via-[#e2d5c4] before:to-[#e2d5c4]/0">
        <h3 className="pl-10 font-serif text-xl text-[#c3a379]">Tue 22.09 · Byron Bay & Skydeck</h3>
        {isPenthouse && (
          <ScheduleNode
            time="09:00 AM"
            title="Depart Brisbane"
            desc="Pick up at Pullman Brisbane Airport (BNE) and drive south."
            loc="Pullman Brisbane Airport"
          />
        )}
        <ScheduleNode {...attractionToScheduleProps(goldCoastAttractions["byron-lunch"])} />
        {isPenthouse && (
          <>
            <ScheduleNode time="01:00 PM" title="Depart Byron Bay" desc="Hop back in the minivan and head north to the Gold Coast." />
            <ScheduleNode
              time="02:15 PM"
              title="Penthouse Check-in"
              desc="Arrive on the Gold Coast and settle into the penthouse."
              loc="Surfers Paradise"
            />
          </>
        )}
        <ScheduleNode {...attractionToScheduleProps(goldCoastAttractions.skydeck)} />

        <h3 className="pt-4 pl-10 font-serif text-xl text-[#c3a379]">Wed 23.09 · Movie World & Fine Dining</h3>
        {isPenthouse && (
          <ScheduleNode time="09:15 AM" title="Depart the Hotel" desc="Minivan pick-up from the penthouse." loc="Surfers Paradise" />
        )}
        <ScheduleNode {...attractionToScheduleProps(goldCoastAttractions["movie-world"])} />
        {isPenthouse && (
          <>
            <ScheduleNode time="05:00 PM" title="Depart Movie World" desc="Leave the park at closing time." />
            <ScheduleNode
              time="05:45 PM"
              title="Hotel Refresh"
              desc="Freshen up at the hotel before dinner."
              loc="Surfers Paradise"
            />
          </>
        )}
        <ScheduleNode {...attractionToScheduleProps(goldCoastAttractions["little-truffle"])} />

        <h3 className="pt-4 pl-10 font-serif text-xl text-[#c3a379]">Thu 24.09 · Dreamworld & Dracula&apos;s</h3>
        {isPenthouse && (
          <ScheduleNode time="09:15 AM" title="Depart the Hotel" desc="Minivan pick-up from the penthouse." loc="Surfers Paradise" />
        )}
        <ScheduleNode {...attractionToScheduleProps(goldCoastAttractions.dreamworld)} />
        {isPenthouse && (
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
          desc="Catch an Uber to Dracula's Cabaret — arrive 15 minutes before doors open."
          loc="Broadbeach"
        />
        <ScheduleNode {...attractionToScheduleProps(goldCoastAttractions.draculas)} />

        <h3 className="pt-4 pl-10 font-serif text-xl text-[#c3a379]">Fri 25.09 · Australia Zoo & The Hinterland</h3>
        {isPenthouse && (
          <ScheduleNode
            time="07:30 AM"
            title="Depart the Gold Coast"
            desc="Check out of the penthouse and head north towards the Sunshine Coast."
            loc="Surfers Paradise"
          />
        )}
        <ScheduleNode {...attractionToScheduleProps(goldCoastAttractions["australia-zoo"])} />
        {isPenthouse && (
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
  isPenthouse,
  isOnSite,
  setActiveTab,
}: {
  isPenthouse: boolean;
  isOnSite: boolean;
  setActiveTab?: (tab: AppTab) => void;
}) {
  const { canViewVenueMap: showVenueMap } = useVenueMapAccess();
  const [view, setView] = useState<"wedding" | "goldcoast">("wedding");
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const main = topRef.current?.closest("main");
    main?.scrollTo({ top: 0, left: 0 });
  }, [view]);

  useEffect(() => {
    saveOfflineBundle({
      itineraryHtml:
        "Fri Meet & Greet 6pm (on-site). Sat Ceremony 3pm, Garden Party 4:30pm, Reception 6pm at Spicers Clovelly. Sun Breakfast 9am.",
      faqSnippets: [
        "Ceremony 3:00pm — colourful cocktail attire, adults-only",
        "Reception 6:00pm — The Pavilion",
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
      <div className="wedding-screen-top sticky top-0 z-20 bg-[#f7f4ee]/90 px-8 pb-6 text-center backdrop-blur-md">
        <RainbowText
          as="h2"
          className="mb-2 font-serif text-sm uppercase tracking-[0.15em] text-gray-500"
        >
          The Details
        </RainbowText>
        <RainbowText as="h1" className="font-serif text-3xl text-[var(--wedding-text-dark)]">
          Schedule & Events
        </RainbowText>
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
      </div>
      <div className="mt-4 px-6">
        {view === "wedding" ? (
          <WeddingSchedule
            isOnSite={isOnSite}
            showVenueMapLink={showVenueMap}
            onOpenVenueMap={setActiveTab ? () => setActiveTab("venue-map") : undefined}
          />
        ) : (
          <GoldCoastSchedule isPenthouse={isPenthouse} />
        )}
      </div>
    </div>
  );
}
