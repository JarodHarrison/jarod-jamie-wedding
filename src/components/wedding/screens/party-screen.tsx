"use client";

import { useState } from "react";
import { ChevronDown, MessageCircle, Phone } from "lucide-react";
import { theme } from "@/lib/theme";

const PERSON_PLACEHOLDER = "/party/person-placeholder.svg";

type PartyMember = {
  name: string;
  role: string;
  phone?: string;
  imageSrc?: string;
};

const weddingParty: PartyMember[] = [
  { name: "Kirra ten-Hove Smith", role: "J-rod's Best Bitch", phone: "+61400123456" },
  { name: "Samantha Cooper", role: "Jamo's Best Bitch", phone: "+61400987654" },
];

const jrodFamily: PartyMember[] = [
  { name: "Bernadette Harrison", role: "Mother" },
  { name: "John Harrison", role: "Father" },
  { name: "Grace Dillon", role: "Sister" },
  { name: "Max Dillon", role: "Brother-in-law" },
  { name: "Rosie Dillon", role: "Niece (Flower girl)" },
];

const jamoFamily: PartyMember[] = [
  { name: "Tracey Gooden", role: "Mother Figure" },
  { name: "Akara Gooden", role: "Sister" },
  { name: "Kai", role: "Nephew (Ring bearer)" },
  { name: "Jo Bloodworth", role: "Father figure" },
  { name: "AJ Heta", role: "Jo's husband" },
];

const familyGroups = [
  { id: "jrod", title: "J-rod's Family", members: jrodFamily },
  { id: "jamo", title: "Jamo's Family", members: jamoFamily },
];

function PersonAvatar({ name, imageSrc }: { name: string; imageSrc?: string }) {
  return (
    <div
      className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 bg-[#f7f4ee] shadow-sm"
      style={{ borderColor: theme.border }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc ?? PERSON_PLACEHOLDER}
        alt={name}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

function PersonRow({ person }: { person: PartyMember }) {
  return (
    <div
      className="flex items-center gap-3 border-b py-3 last:border-0 last:pb-0"
      style={{ borderColor: theme.border }}
    >
      <PersonAvatar name={person.name} imageSrc={person.imageSrc} />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-[#2a2723]">{person.name}</p>
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{person.role}</p>
      </div>
    </div>
  );
}

function FamilyAccordion({
  title,
  members,
  defaultOpen = false,
}: {
  title: string;
  members: PartyMember[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className="overflow-hidden rounded-3xl border bg-white/80 shadow-sm"
      style={{ borderColor: theme.border }}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 p-5 text-left"
        aria-expanded={open}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex -space-x-2">
            {members.slice(0, 3).map((member) => (
              <div
                key={member.name}
                className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-[#f7f4ee]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={member.imageSrc ?? PERSON_PLACEHOLDER}
                  alt=""
                  className="h-full w-full object-cover"
                  aria-hidden
                />
              </div>
            ))}
          </div>
          <div className="min-w-0">
            <h4 className="font-serif text-lg text-[#2a2723]">{title}</h4>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              {members.length} members
            </p>
          </div>
        </div>
        <ChevronDown
          size={18}
          className={`shrink-0 text-[#c3a379] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="border-t px-5 pb-5 pt-1" style={{ borderColor: theme.border }}>
          {members.map((member) => (
            <PersonRow key={member.name} person={member} />
          ))}
        </div>
      )}
    </div>
  );
}

export function PartyScreen() {
  return (
    <div className="animate-fade-in animate-slide-up pb-10">
      <div className="wedding-screen-top px-8 pb-6 text-center">
        <h2 className="mb-2 font-serif text-sm uppercase tracking-[0.15em] text-gray-500">VIPs</h2>
        <h1 className="font-serif text-3xl text-[#2a2723]">Wedding Party & Family</h1>
      </div>

      <div className="space-y-8 px-6">
        <div>
          <h3
            className="mb-4 border-b pb-2 font-serif text-xl"
            style={{ borderColor: theme.border, color: theme.gold }}
          >
            The Wedding Party
          </h3>
          <div className="grid gap-4">
            {weddingParty.map((person) => (
              <div
                key={person.name}
                className="flex items-center justify-between gap-3 rounded-2xl border bg-white/80 p-4 shadow-sm"
                style={{ borderColor: theme.border }}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <PersonAvatar name={person.name} imageSrc={person.imageSrc} />
                  <div>
                    <p className="font-serif text-lg text-[#2a2723]">{person.name}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      {person.role}
                    </p>
                  </div>
                </div>
                {person.phone && (
                  <div className="flex shrink-0 gap-2">
                    <a
                      href={`tel:${person.phone}`}
                      className="rounded-full border bg-gray-50 p-2.5 shadow-sm transition-transform active:scale-90"
                      style={{ borderColor: theme.border, color: theme.gold }}
                      aria-label={`Call ${person.name}`}
                    >
                      <Phone size={16} />
                    </a>
                    <a
                      href={`sms:${person.phone}`}
                      className="rounded-full border bg-gray-50 p-2.5 shadow-sm transition-transform active:scale-90"
                      style={{ borderColor: theme.border, color: theme.gold }}
                      aria-label={`Message ${person.name}`}
                    >
                      <MessageCircle size={16} />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3
            className="border-b pb-2 font-serif text-xl"
            style={{ borderColor: theme.border, color: theme.gold }}
          >
            The Families
          </h3>

          {familyGroups.map((family, index) => (
            <FamilyAccordion
              key={family.id}
              title={family.title}
              members={family.members}
              defaultOpen={index === 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
