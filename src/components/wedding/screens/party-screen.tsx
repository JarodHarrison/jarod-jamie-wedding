import { MessageCircle, Phone } from "lucide-react";
import { theme } from "@/lib/theme";

const weddingParty = [
  { name: "Kirra ten-Hove Smith", role: "J-rod's Best Bitch", phone: "+61400123456" },
  { name: "Samantha Cooper", role: "Jamo's Best Bitch", phone: "+61400987654" },
];

const jrodFamily = [
  { name: "Bernadette Harrison", role: "Mother" },
  { name: "John Harrison", role: "Father" },
  { name: "Grace Dillon", role: "Sister" },
  { name: "Max Dillon", role: "Brother-in-law" },
  { name: "Rosie Dillon", role: "Niece (Flower girl)" },
];

const jamoFamily = [
  { name: "Tracey Gooden", role: "Mother" },
  { name: "Akara Gooden", role: "Sister" },
  { name: "Kai", role: "Nephew (Ring bearer)" },
  { name: "Jo Bloodworth", role: "Father figure" },
  { name: "AJ Heta", role: "Jo's husband" },
];

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
                className="flex items-center justify-between rounded-2xl border bg-white/80 p-5 shadow-sm"
                style={{ borderColor: theme.border }}
              >
                <div>
                  <p className="font-serif text-lg text-[#2a2723]">{person.name}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    {person.role}
                  </p>
                </div>
                <div className="flex gap-2">
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
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3
            className="border-b pb-2 font-serif text-xl"
            style={{ borderColor: theme.border, color: theme.gold }}
          >
            The Families
          </h3>

          {[
            { title: "J-rod's Family", members: jrodFamily },
            { title: "Jamo's Family", members: jamoFamily },
          ].map(({ title, members }) => (
            <div
              key={title}
              className="rounded-3xl border bg-white/60 p-6 shadow-sm"
              style={{ borderColor: theme.border }}
            >
              <h4 className="mb-4 text-center font-serif text-lg text-[#2a2723]">{title}</h4>
              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.name}
                    className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                    style={{ borderColor: theme.border }}
                  >
                    <span className="text-sm font-bold text-[#2a2723]">{member.name}</span>
                    <span className="text-[10px] uppercase tracking-wider text-gray-500">
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
