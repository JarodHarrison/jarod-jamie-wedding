"use client";

import { useState } from "react";
import { ScheduleNode } from "@/components/wedding/shared/schedule-node";
import { theme } from "@/lib/theme";

function WeddingSchedule() {
  return (
    <div className="relative space-y-6 before:absolute before:inset-0 before:ml-6 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-[#e2d5c4]/0 before:via-[#e2d5c4] before:to-[#e2d5c4]/0">
      <ScheduleNode date="25.09" title="Meet & Greet (On-site guests)" time="6:00pm" attire="Smart casual" loc="Spicers Clovelly Estate" />
      <ScheduleNode date="26.09" title="The Ceremony" time="3:00pm" attire="Colourful cocktail" loc="Spicers Clovelly Estate" desc="Honey, get ready to sashay! Strictly adults-only." />
      <ScheduleNode date="26.09" title="Garden Party" time="4:30pm" loc="Upper Lawn" desc="Decadent canapés, divine drinks, face painter, and a glitter bar! ✨" />
      <ScheduleNode date="26.09" title="Reception" time="6:00pm" loc="The Pavilion" desc="Celebrate with amazing food, drinks, and dance." />
      <ScheduleNode date="27.09" title="Family Breakfast" time="9:00am" attire="Sunglasses probably required" loc="Spicers Clovelly Estate" />
    </div>
  );
}

function GoldCoastSchedule({ isPenthouse }: { isPenthouse: boolean }) {
  return (
    <div className="animate-fade-in space-y-8 pb-6">
      {isPenthouse && (
        <div
          className="rounded-3xl border bg-white/80 p-6 text-center shadow-sm"
          style={{ borderColor: theme.border }}
        >
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
            Accommodation + Minivan
          </p>
          <h2 className="font-serif text-4xl text-[#2a2723]">$550.00</h2>
          <p className="mt-1 text-xs text-[#c3a379]">($1100 per couple)</p>
          <button
            type="button"
            className="mt-4 w-full rounded-full py-3 text-[10px] font-bold uppercase tracking-widest shadow-md transition-transform active:scale-95"
            style={{ backgroundColor: theme.gold, color: theme.btnDark }}
          >
            Pay Securely via Stripe
          </button>
        </div>
      )}

      <div className="relative space-y-6 before:absolute before:inset-0 before:ml-6 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-[#e2d5c4]/0 before:via-[#e2d5c4] before:to-[#e2d5c4]/0">
        <h3 className="pl-10 font-serif text-xl text-[#c3a379]">Tue 22.09</h3>
        {isPenthouse && (
          <ScheduleNode time="08:00 AM" title="Depart Brisbane" desc="Minivan pick-up from the hotel. Grab a coffee, we're hitting the M1 south to the Gold Coast!" loc="Pullman Brisbane Airport" />
        )}
        <ScheduleNode time="09:15 AM" title="Warner Bros. Movie World" desc="Grab your Fast Track passes to skip the holiday lines." loc="Movie World" booking={{ sub: "Adult Entry | Optional Fast Track", price: "$109 - $208", btn: "Book Yourself", ext: true, url: "https://movieworld.com.au/" }} />
        {isPenthouse && (
          <>
            <ScheduleNode time="05:00 PM" title="Depart Movie World" desc="Leave the park at closing time and head to Surfers Paradise." />
            <ScheduleNode time="05:40 PM" title="Hotel Check-in" desc="Drop your bags and freshen up for the evening." loc="Novotel Surfers Paradise" />
          </>
        )}
        <ScheduleNode time="06:30 PM" title="SkyPoint Observation Deck" desc="Perfect window for the twilight climb as the sun goes down, followed by a well-earned drink at the top." loc="SkyPoint, Surfers Paradise" booking={{ sub: "Deck Entry | Optional Twilight Climb", price: "$36 - $92", btn: "Book Yourself", ext: true, url: "https://skypoint.com.au/" }} />
        <ScheduleNode time="08:00 PM" title="Little Truffle" desc="Group dinner in nearby Mermaid Beach to celebrate the start of the trip." loc="Mermaid Beach" booking={{ sub: "4-Course Dinner", price: "$89.00", btn: "Pay Group Booking", ext: false }} />

        <h3 className="pt-4 pl-10 font-serif text-xl text-[#c3a379]">Wed 23.09</h3>
        {isPenthouse && (
          <>
            <ScheduleNode time="07:30 AM" title="Depart for Byron Bay" desc="Head south early from the Novotel to cross the border into New South Wales." loc="Novotel Surfers Paradise" />
            <ScheduleNode time="08:45 AM" title="Byron Bay Breakfast" desc="45-minute stop for coffee and views before heading back north." loc="Byron Bay" />
            <ScheduleNode time="09:30 AM" title="Depart Byron Bay" desc="Hop back in the minivan and hit the road north towards the theme parks." />
          </>
        )}
        <ScheduleNode time="10:45 AM" title="Dreamworld" desc="Arrive with your unlimited Ride Express passes to jump straight to the front of the queue." loc="Dreamworld" booking={{ sub: "Adult Entry | Optional Ride Express", price: "$139 - $269", btn: "Book Yourself", ext: true, url: "https://dreamworld.com.au/" }} />
        {isPenthouse && (
          <>
            <ScheduleNode time="05:00 PM" title="Depart Dreamworld" desc="Leave the park right at closing time." />
            <ScheduleNode time="05:40 PM" title="Hotel Refresh" desc="Quick turnaround at the hotel before the evening's entertainment." loc="Novotel Surfers Paradise" />
          </>
        )}
        <ScheduleNode time="06:45 PM" title="Dracula's Cabaret" desc="Arrive 15 minutes before doors open for priority entry, the ghost train ride, and a 3-course dinner." loc="Broadbeach" booking={{ sub: "A-Reserve VIP", price: "$149 - $155", btn: "Pay Group Booking", ext: false }} />

        <h3 className="pt-4 pl-10 font-serif text-xl text-[#c3a379]">Thu 24.09</h3>
        {isPenthouse && (
          <ScheduleNode time="08:00 AM" title="Depart Gold Coast" desc="Say goodbye to the coast and head up the M1 towards the Sunshine Coast." loc="Novotel Surfers Paradise" />
        )}
        <ScheduleNode time="10:00 AM" title="Australia Zoo" desc="A morning of wildlife action at the Home of the Crocodile Hunter." loc="Beerwah" booking={{ sub: "Adult Entry", price: "$75 - $77", btn: "Book Yourself", ext: true, url: "https://australiazoo.com.au/" }} />
        {isPenthouse && (
          <>
            <ScheduleNode time="02:00 PM" title="Depart Zoo" desc="Wrap up with the animals and head up into the mountains." />
            <ScheduleNode time="02:40 PM" title="Arrive at Spicers Clovelly Estate" desc="Time to unpack and relax before the wedding weekend kicks into gear!" loc="Montville, QLD" />
          </>
        )}
      </div>
    </div>
  );
}

export function ItineraryScreen({ isPenthouse }: { isPenthouse: boolean }) {
  const [view, setView] = useState<"wedding" | "goldcoast">("wedding");

  return (
    <div className="animate-fade-in pb-10">
      <div className="wedding-screen-top sticky top-0 z-20 bg-[#f7f4ee]/90 px-8 pb-6 text-center backdrop-blur-md">
        <h2 className="mb-2 font-serif text-sm uppercase tracking-[0.15em] text-gray-500">The Details</h2>
        <h1 className="font-serif text-3xl text-[#2a2723]">Schedule & Events</h1>
        <div className="mt-6 flex rounded-full bg-[#e2d5c4]/30 p-1 shadow-inner">
          <button
            type="button"
            onClick={() => setView("wedding")}
            className={`flex-1 rounded-full py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all ${view === "wedding" ? "bg-white text-[#2a2723] shadow-md" : "text-gray-500"}`}
          >
            Wedding Wknd
          </button>
          <button
            type="button"
            onClick={() => setView("goldcoast")}
            className={`flex-1 rounded-full py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all ${view === "goldcoast" ? "bg-white text-[#2a2723] shadow-md" : "text-gray-500"}`}
          >
            Gold Coast Trip
          </button>
        </div>
      </div>
      <div className="mt-4 px-6">
        {view === "wedding" ? <WeddingSchedule /> : <GoldCoastSchedule isPenthouse={isPenthouse} />}
      </div>
    </div>
  );
}
