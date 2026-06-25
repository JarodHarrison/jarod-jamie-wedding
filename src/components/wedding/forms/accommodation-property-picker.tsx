"use client";

import { useEffect, useId, useRef, useState } from "react";
import { MapPin, Search } from "lucide-react";
import {
  accommodationCategoryLabel,
  findHinterlandAccommodationByName,
  searchHinterlandAccommodations,
} from "@/lib/hinterland-accommodations";
import { theme } from "@/lib/theme";

const inputClass =
  "w-full rounded-xl border bg-white px-4 py-3.5 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#c3a379]";

type AccommodationPropertyPickerProps = {
  accommodationType: string;
  name: string;
  address: string;
  onNameChange: (value: string) => void;
  onAddressChange: (value: string) => void;
};

export function AccommodationPropertyPicker({
  accommodationType,
  name,
  address,
  onNameChange,
  onAddressChange,
}: AccommodationPropertyPickerProps) {
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const suggestions = searchHinterlandAccommodations(name, {
    accommodationType,
    limit: 8,
  });

  const showSuggestions = open && suggestions.length > 0;

  useEffect(() => {
    setHighlightIndex(-1);
  }, [name, accommodationType]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const selectSuggestion = (suggestionName: string, suggestionAddress: string) => {
    onNameChange(suggestionName);
    onAddressChange(suggestionAddress);
    setOpen(false);
    setHighlightIndex(-1);
  };

  const handleNameChange = (value: string) => {
    onNameChange(value);
    const match = findHinterlandAccommodationByName(value);
    if (match) {
      onAddressChange(match.address);
    }
    setOpen(true);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightIndex((current) => Math.min(current + 1, suggestions.length - 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter" && highlightIndex >= 0) {
      event.preventDefault();
      const item = suggestions[highlightIndex];
      if (item) selectSuggestion(item.name, item.address);
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
      setHighlightIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className="space-y-3">
      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          role="combobox"
          aria-expanded={showSuggestions}
          aria-controls={listId}
          aria-autocomplete="list"
          placeholder="Property, hotel, Airbnb, or motel"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className={`${inputClass} pl-10`}
          style={{ borderColor: theme.border }}
          autoComplete="off"
        />

        {showSuggestions && (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border bg-white p-2 shadow-lg"
            style={{ borderColor: theme.border }}
          >
            {suggestions.map((item, index) => (
              <li key={item.id} role="option" aria-selected={highlightIndex === index}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectSuggestion(item.name, item.address)}
                  className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                    highlightIndex === index ? "bg-[#f7f4ee]" : "hover:bg-[#f7f4ee]"
                  }`}
                >
                  <MapPin size={14} className="mt-0.5 shrink-0 text-[#c3a379]" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-[#2a2723]">{item.name}</span>
                    <span className="mt-0.5 block text-xs text-gray-500">
                      {item.town} · {accommodationCategoryLabel(item.category)}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-[10px] leading-relaxed text-gray-400">
        Start typing to see hotels, motels, B&Bs, and rentals around Montville and Maleny — or enter
        your own.
      </p>

      <input
        type="text"
        placeholder="Address"
        value={address}
        onChange={(e) => onAddressChange(e.target.value)}
        className={inputClass}
        style={{ borderColor: theme.border }}
      />
    </div>
  );
}
