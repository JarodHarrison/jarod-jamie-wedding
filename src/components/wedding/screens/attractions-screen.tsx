import { AttractionCard } from "@/components/wedding/shared/attraction-card";
import { SubHeader } from "@/components/wedding/shared/sub-header";
import {
  adventureAttractions,
  doAttractions,
  eatAttractions,
  oddityAttractions,
} from "@/components/wedding/data/attractions";
import { theme } from "@/lib/theme";
import type { AppTab } from "@/types/wedding";

const sections = [
  { title: "Where to Eat", items: eatAttractions },
  { title: "What to Do", items: doAttractions },
  { title: "Adventures", items: adventureAttractions },
  { title: "Local Oddities", items: oddityAttractions },
];

export function AttractionsScreen({ setActiveTab }: { setActiveTab: (tab: AppTab) => void }) {
  return (
    <div className="animate-fade-in animate-slide-right pb-10">
      <SubHeader title="Explore Montville" subtitle="Attractions" onBack={() => setActiveTab("guide")} />
      <div className="mt-6 space-y-8 px-6">
        <p className="mb-6 text-center text-sm text-gray-500">
          Make a weekend out of it! The Sunshine Coast Hinterland is packed with beautiful walks,
          amazing food, and quirky local oddities.
        </p>
        {sections.map(({ title, items }) => (
          <div key={title}>
            <h3
              className="mb-4 border-b pb-2 font-serif text-2xl"
              style={{ borderColor: theme.border, color: theme.gold }}
            >
              {title}
            </h3>
            <div className="space-y-5">
              {items.map((item) => (
                <AttractionCard key={item.title} {...item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
