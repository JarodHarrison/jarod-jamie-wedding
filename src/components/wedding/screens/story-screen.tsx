import { SubHeader } from "@/components/wedding/shared/sub-header";
import type { AppTab } from "@/types/wedding";

export function StoryScreen({ setActiveTab }: { setActiveTab: (tab: AppTab) => void }) {
  return (
    <div className="animate-fade-in animate-slide-right pb-10">
      <SubHeader title="Our Story" subtitle="How we met" onBack={() => setActiveTab("home")} />
      <div className="mt-8 space-y-6 px-8 text-sm font-light leading-relaxed text-gray-700">
        <p>
          Jarod and Jamie had been chatting online for years though they&apos;d never met in person,
          each hiding a growing crush behind the safety of their screens. On November 30, 2022, Jarod
          decided it was time to change that...
        </p>
        <p>
          From that serendipitous day, their love story unfolded like a classic rom-com. They
          travelled far and wide, exploring hidden gems and bustling cities, always hand in hand. To
          top it all off, they decided to grow their family with the addition of a gorgeous baby
          girl—Brie.
        </p>
        <p>
          Now, they want you to join them on their most fabulous journey yet—their wedding at Spicers
          Clovelly Estate in the mountainous paradise of Montville.
        </p>
      </div>
    </div>
  );
}
