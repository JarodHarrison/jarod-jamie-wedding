import { ExternalLink, MapPin } from "lucide-react";
import { theme } from "@/lib/theme";

type AttractionCardProps = {
  title: string;
  category: string;
  distance: string;
  desc: string;
  imageUrl?: string;
  websiteUrl?: string;
};

export function AttractionCard({
  title,
  category,
  distance,
  desc,
  imageUrl,
  websiteUrl,
}: AttractionCardProps) {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl border bg-white/60 shadow-sm"
      style={{ borderColor: theme.border }}
    >
      {imageUrl && (
        <div className="relative h-40 w-full shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-start justify-between">
          <div className="pr-2">
            <span
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: theme.gold }}
            >
              {category}
            </span>
            <h4 className="mt-1 font-serif text-lg leading-tight text-[#2a2723]">{title}</h4>
          </div>
          <span
            className="flex shrink-0 items-center gap-1 rounded-md border bg-[#f7f4ee] px-2 py-1 text-[10px] font-bold tracking-wider"
            style={{ color: theme.textDark, borderColor: theme.border }}
          >
            <MapPin size={10} style={{ color: theme.gold }} /> {distance}
          </span>
        </div>
        <p className="mb-4 mt-2 flex-1 text-sm font-light leading-relaxed text-gray-600">
          {desc}
        </p>
        {websiteUrl && (
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl border bg-white py-2.5 text-[10px] font-bold uppercase tracking-widest shadow-sm transition-transform active:scale-95"
            style={{ borderColor: theme.border, color: theme.textDark }}
          >
            Visit Website <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  );
}
