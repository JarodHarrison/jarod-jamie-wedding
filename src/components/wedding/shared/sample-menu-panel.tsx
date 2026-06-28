"use client";

import { ContentAccordion } from "@/components/wedding/shared/content-accordion";
import type { SampleMenu } from "@/lib/little-truffle-menu";
import { theme } from "@/lib/theme";

type SampleMenuPanelProps = {
  menu: SampleMenu;
};

function courseTitle(title: string, note?: string) {
  return note ? `${title} · ${note}` : title;
}

export function SampleMenuPanel({ menu }: SampleMenuPanelProps) {
  return (
    <div
      className="mb-3 rounded-2xl border bg-[#faf8f4] p-3"
      style={{ borderColor: theme.border }}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-[#c3a379]">Sample menu</p>
          <h5 className="font-serif text-base text-[#2a2723]">{menu.title}</h5>
        </div>
        {menu.pdfUrl && (
          <a
            href={menu.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-lg border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#2a2723]"
            style={{ borderColor: theme.border }}
          >
            PDF
          </a>
        )}
      </div>

      <ContentAccordion
        multiple
        items={menu.courses.map((course, index) => ({
          id: `course-${index}`,
          title: courseTitle(course.title, course.note),
          content: (
            <ul className="space-y-1.5">
              {course.items.map((item) => (
                <li key={item.name} className="text-[11px] leading-relaxed text-gray-600">
                  <span className="font-medium text-[#2a2723]">{item.name}</span>
                  {item.description && <span> — {item.description}</span>}
                  {item.dietary && (
                    <span className="ml-1 text-[9px] font-bold uppercase tracking-wider text-[#c3a379]">
                      ({item.dietary})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ),
        }))}
      />

      {menu.footnote && (
        <p className="mt-3 border-t pt-2 text-[10px] text-gray-500" style={{ borderColor: theme.border }}>
          {menu.footnote}
        </p>
      )}
    </div>
  );
}
