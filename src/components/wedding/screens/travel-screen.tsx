"use client";

import { ExternalLink, Phone, Plane, Bus } from "lucide-react";
import { AccommodationForm } from "@/components/wedding/forms/accommodation-form";
import { flightTransferAccordion } from "@/components/wedding/data/flight-transfers";
import { SubHeader } from "@/components/wedding/shared/sub-header";
import { TravelAccordion } from "@/components/wedding/shared/travel-accordion";
import { theme } from "@/lib/theme";
import type { AppTab } from "@/types/wedding";

const taxiContacts = [
  {
    name: "Hinterland Transfers",
    note: "Montville-based — airport, restaurant & event transfers",
    websiteUrl: "https://www.facebook.com/profile.php?id=61558019309165",
    phones: [{ display: "0449 549 022", href: "tel:+61449549022" }],
  },
  {
    name: "MAGS Private Chauffeur",
    note: "Hinterland wedding & event transfers — pre-book essential",
    websiteUrl: "https://magnoliaco.au/",
    phones: [
      { display: "1300 626 656", href: "tel:1300626656" },
      { display: "0414 711 804", href: "tel:+61414711804" },
    ],
  },
  {
    name: "Suncoast Cabs",
    note: "Sunshine Coast taxi service — book ahead for hinterland trips",
    websiteUrl: "https://suncoastcabs.com.au/",
    phones: [{ display: "131 008", href: "tel:131008" }],
  },
  {
    name: "Queensland Chauffeurs",
    note: "Private airport & hinterland chauffeur transfers",
    websiteUrl: "https://www.queenslandchauffeurs.com.au/",
    phones: [{ display: "0410 167 100", href: "tel:+61410167100" }],
  },
] as const;

type TravelScreenProps = {
  setActiveTab: (tab: AppTab) => void;
};

export function TravelScreen({ setActiveTab }: TravelScreenProps) {
  return (
    <div className="animate-fade-in animate-slide-right pb-10">
      <SubHeader title="Travel & Stay" subtitle="Logistics" onBack={() => setActiveTab("home")} />
      <div className="mt-8 px-6">
        <TravelAccordion
          defaultOpenId="accommodation"
          items={[
            {
              id: "accommodation",
              title: "Accommodation Preferences",
              content: (
                <>
                  <p className="mb-4 text-sm font-light leading-relaxed text-gray-600">
                    Please take a moment to fill out your accommodation preferences below. Knowing
                    where everyone is staying allows us to finalise our courtesy shuttle routes and
                    designate convenient stops along the way.
                  </p>
                  <p className="mb-4 text-sm font-light leading-relaxed text-gray-600">
                    Select <span className="font-medium text-[#2a2723]">On-site at Spicers Clovelly Estate</span> if
                    you have a confirmed room — you&apos;ll unlock on-site events in the itinerary,
                    including Friday&apos;s lakeside welcome.
                  </p>
                  <AccommodationForm />
                </>
              ),
            },
            {
              id: "on-site",
              title: "Staying On-Site",
              content: (
                <>
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#c3a379]">
                    Spicers Clovelly Estate
                  </p>
                  <div className="relative mb-4 overflow-hidden rounded-2xl border bg-[#f7f4ee] p-4">
                    <div className="absolute right-3 top-3 rounded-md bg-[#2a2723] px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-[#c3a379] shadow-md">
                      Fully Booked
                    </div>
                    <p className="mb-3 border-l-2 pl-3 text-sm font-light italic leading-relaxed text-gray-600" style={{ borderColor: theme.gold }}>
                      Update: All on-site accommodation at the estate for the wedding weekend has now been filled.
                    </p>
                    <p className="mb-3 text-sm font-light leading-relaxed text-gray-600">
                      For those who have secured rooms: Spicers will email you to lock in your payment ($500 per room, per night).
                    </p>
                  </div>
                  <p className="mb-3 text-sm font-light leading-relaxed text-gray-600">
                    Friday evening welcomes on-site guests to the Lake View Deck for drinks, cheese and charcuterie, a relaxed gourmet barbecue at The Long Apron, and the firepit afterwards.
                  </p>
                  <p className="text-sm font-light leading-relaxed text-gray-600">
                    On Saturday, Friday-night guests can enjoy à la carte breakfast in the restaurant or via room service, plus a BBQ lunch before the festivities begin.
                  </p>
                </>
              ),
            },
            {
              id: "off-site",
              title: "Staying Off-Site",
              content: (
                <>
                  <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[#c3a379]">
                    Montville Area
                  </p>
                  <p className="mb-4 text-sm font-light leading-relaxed text-gray-600">
                    Special rates are available for our guests via the Expedia links below:
                  </p>
                  <div className="mb-6 space-y-3">
                    {[
                      {
                        href: "https://expedia.com/affiliates/jarod_and_jamies_wedding2n/2nights",
                        title: "Book 2 Nights",
                        sub: "Check-in 25th, Check-out 27th",
                      },
                      {
                        href: "https://expedia.com/affiliates/jarod_and_jamies_wedding2n/1night",
                        title: "Book 1 Night",
                        sub: "Night of the wedding (26th)",
                      },
                    ].map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between rounded-2xl border bg-white/80 p-4 shadow-sm transition-colors hover:bg-white"
                        style={{ borderColor: theme.border }}
                      >
                        <div>
                          <span className="text-sm font-bold text-[#2a2723]">{link.title}</span>
                          <p className="mt-0.5 text-[10px] uppercase tracking-wider text-gray-500">
                            {link.sub}
                          </p>
                        </div>
                        <ExternalLink size={16} style={{ color: theme.gold }} />
                      </a>
                    ))}
                  </div>
                  <div className="mb-6 rounded-2xl border border-rose-100 bg-rose-50/80 p-4 text-center text-[10px] font-bold uppercase leading-relaxed tracking-wider text-rose-800 shadow-sm">
                    <span className="mb-2 inline-block rounded-md bg-rose-200 px-2 py-1 text-rose-900">
                      Please Note
                    </span>
                    <br />
                    Ubers and taxis are very limited in the area — please pre-book transport in advance.
                  </div>
                  <h5 className="mb-3 font-serif text-lg text-[#2a2723]">Pre-Book Local Transport</h5>
                  <p className="mb-4 text-sm font-light leading-relaxed text-gray-600">
                    These local providers service Montville and the hinterland. We recommend calling ahead to arrange pick-ups, especially for evenings and weekends.
                  </p>
                  <div className="mb-6 space-y-3">
                    {taxiContacts.map((contact) => (
                      <div
                        key={contact.name}
                        className="rounded-2xl border bg-white/80 p-4 shadow-sm"
                        style={{ borderColor: theme.border }}
                      >
                        <p className="text-sm font-bold text-[#2a2723]">{contact.name}</p>
                        <p className="mt-1 text-[10px] leading-relaxed uppercase tracking-wider text-gray-500">
                          {contact.note}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {contact.phones.map((phone) => (
                            <a
                              key={phone.href}
                              href={phone.href}
                              className="inline-flex items-center gap-1.5 rounded-xl border bg-[#f7f4ee] px-3 py-2 text-xs font-bold tracking-wide text-[#2a2723] transition-colors hover:bg-white"
                              style={{ borderColor: theme.border }}
                            >
                              <Phone size={12} style={{ color: theme.gold }} />
                              {phone.display}
                            </a>
                          ))}
                          <a
                            href={contact.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl border bg-[#f7f4ee] px-3 py-2 text-xs font-bold tracking-wide text-[#2a2723] transition-colors hover:bg-white"
                            style={{ borderColor: theme.border }}
                          >
                            <ExternalLink size={12} style={{ color: theme.gold }} />
                            Website
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                  <h5 className="mb-2 border-t pt-4 font-serif text-lg text-[#2a2723]" style={{ borderColor: theme.border }}>
                    Courtesy Shuttle Service
                  </h5>
                  <p className="mb-3 text-sm font-light leading-relaxed text-gray-600">
                    For guests staying in or around Montville, a courtesy shuttle will be provided. The bus will:
                  </p>
                  <ul className="list-disc space-y-2 pl-5 text-sm font-light leading-relaxed text-gray-600">
                    <li>Collect you prior to the ceremony.</li>
                    <li>Run back and forth during the break between the ceremony and reception (perfect for a costume change!).</li>
                    <li>Offer several return trips at the end of the evening.</li>
                  </ul>
                  <button
                    type="button"
                    onClick={() => setActiveTab("shuttle")}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-xs font-bold uppercase tracking-widest shadow-md transition-transform active:scale-95"
                    style={{ backgroundColor: theme.btnDark, color: theme.gold }}
                  >
                    <Bus size={16} /> Live Wedding Shuttle
                  </button>
                </>
              ),
            },
            {
              id: "driving",
              title: "Driving & Parking",
              content: (
                <>
                  <p className="mb-3 text-sm font-light leading-relaxed text-gray-600">
                    If your accommodation falls outside the designated Montville shuttle route, please plan to meet at one of our finalised shuttle stops or make your own way to the venue.
                  </p>
                  <p className="text-sm font-light leading-relaxed text-gray-600">
                    If you choose to drive, on-site parking is available at the estate.
                  </p>
                </>
              ),
            },
            {
              id: "flights",
              title: "Flights + Getting to the Venue",
              content: (
                <>
                  <div className="mb-4 flex items-center gap-2">
                    <Plane size={20} style={{ color: theme.gold }} />
                    <p className="text-sm font-light leading-relaxed text-gray-600">
                      Tap a section below for airport options, travel costs, and how to get to Spicers Clovelly Estate.
                    </p>
                  </div>
                  <TravelAccordion items={flightTransferAccordion} defaultOpenId="booking-flights" />
                </>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
