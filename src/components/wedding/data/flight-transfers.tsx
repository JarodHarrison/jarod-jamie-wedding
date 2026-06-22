import { TransferShareForm } from "@/components/wedding/forms/transfer-share-form";
import type { TravelAccordionItem } from "@/components/wedding/shared/travel-accordion";

function Body({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3">{children}</div>;
}

function PriceList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export const flightTransferAccordion: TravelAccordionItem[] = [
  {
    id: "booking-flights",
    title: "Booking Your Flights",
    content: (
      <Body>
        <p>
          If you have yet to book your flights, there are two airport options depending on where you
          are flying from and your travel plans:
        </p>
        <PriceList
          items={[
            "Sunshine Coast Airport (MCY): The closest option. It is approximately a 35-minute drive (30km) to Spicers Clovelly Estate.",
            "Brisbane Airport (BNE): A major international and domestic hub. It is approximately a 90-minute drive (100km) to the estate.",
          ]}
        />
      </Body>
    ),
  },
  {
    id: "bne-cheapest",
    title: "Getting to the venue from BNE: Cheapest option",
    content: (
      <Body>
        <p className="text-xs font-bold uppercase tracking-widest text-[#c3a379]">Airtrain & Taxi</p>
        <p>The most cost-effective option for individuals or couples.</p>
        <p>
          You can catch the Airtrain directly from the airport terminal, which connects seamlessly
          to the Sunshine Coast train line. Take the train to Landsborough Station (approx. 2 hours).
          From Landsborough, Montville is just a 15–20 minute drive up the range.
        </p>
        <p>
          You can catch a local taxi, Uber, or pre-book a transfer from the station to your
          accommodation for around $30 – $50.
        </p>
      </Body>
    ),
  },
  {
    id: "bne-uber-taxi",
    title: "Getting to the venue from BNE: Uber/Taxi",
    content: (
      <Body>
        <PriceList
          items={[
            "Uber / Rideshare directly from Airport: $150 – $220 (Note: It can sometimes be difficult to get an Uber driver to accept this long-distance trip from the airport).",
            "Taxi directly from Airport: $250 – $350",
            "Private Charter / Pre-booked Transfer: $250 – $400+",
          ]}
        />
      </Body>
    ),
  },
  {
    id: "mcy-public",
    title: "Getting to the venue from MCY: Public transport",
    content: (
      <Body>
        <p>
          Because this airport is so close to the venue, taking public buses requires multiple
          transfers and takes significantly longer.
        </p>
        <p>We highly recommend travelling by car directly from the airport.</p>
      </Body>
    ),
  },
  {
    id: "mcy-uber-taxi",
    title: "Getting to the venue from MCY: Uber/Taxi",
    content: (
      <Body>
        <PriceList
          items={[
            "Uber / Rideshare: $50 – $80",
            "Taxi: $80 – $110",
            "Private Charter / Pre-booked Transfer: $120 – $180 (Highly recommended for reliability, especially if travelling with a group or arriving late).",
          ]}
        />
      </Body>
    ),
  },
  {
    id: "return-airport",
    title: "Getting back to the airport from the venue",
    content: (
      <Body>
        <p>Please note: Montville is in the Sunshine Coast hinterland.</p>
        <p>
          While getting an Uber to Montville from the airports or train stations is usually fine,
          getting an Uber out of Montville can be very difficult due to a lack of local drivers.
        </p>
        <p>We highly recommend pre-booking your return airport transport well in advance.</p>
      </Body>
    ),
  },
  {
    id: "share-transport",
    title: "Can I share transport to get to the venue?",
    content: (
      <Body>
        <p>
          Let us know if you&apos;d like to share airport transport with other guests to save on costs.
        </p>
        <TransferShareForm />
      </Body>
    ),
  },
];
