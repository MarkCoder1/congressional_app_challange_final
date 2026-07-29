"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Check, PenLine } from "lucide-react";
import { subjects, categories } from "@/lib/subjects";

interface SubjectPickerProps {
  selected: string;
  isCustom: boolean;
  customValue: string;
  onSelect: (subject: string) => void;
  onCustomToggle: () => void;
  onCustomChange: (value: string) => void;
  onNext: () => void;
  error?: string;
  disabled?: boolean;
}

export function SubjectPicker({
  selected,
  isCustom,
  customValue,
  onSelect,
  onCustomToggle,
  onCustomChange,
  onNext,
  error,
  disabled,
}: SubjectPickerProps) {
  const [search, setSearch] = useState("");

  const filteredCategories = useMemo(() => {
    if (!search.trim()) {
      return categories.map((cat) => ({
        category: cat,
        subjects: subjects.filter((s) => s.category === cat),
      })).filter((g) => g.subjects.length > 0);
    }

    const q = search.toLowerCase().trim();
    const matched = subjects.filter((s) => s.name.toLowerCase().includes(q));

    const groups = new Map<string, typeof matched>();
    for (const s of matched) {
      const arr = groups.get(s.category) || [];
      arr.push(s);
      groups.set(s.category, arr);
    }

    return Array.from(groups.entries()).map(([category, subs]) => ({
      category,
      subjects: subs,
    }));
  }, [search]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          autoFocus
          type="text"
          placeholder="Search subjects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-base pl-10"
          disabled={disabled}
        />
      </div>

      {/* Subject grid */}
      <div className="max-h-[320px] overflow-y-auto -mx-1 px-1 space-y-5 scroll-smooth">
        {filteredCategories.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No subjects found. Select &ldquo;Other Subject&rdquo; below.
          </p>
        )}

        {filteredCategories.map(({ category, subjects: subs }) => (
          <div key={category}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5 px-0.5">
              {category}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {subs.map((subject) => {
                const Icon = subject.icon;
                const isActive = !isCustom && selected === subject.name;
                return (
                  <button
                    key={subject.name}
                    type="button"
                    onClick={() => {
                      onSelect(subject.name);
                      setSearch("");
                    }}
                    disabled={disabled}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all duration-200 ${
                      isActive
                        ? "border-primary bg-primary-tint ring-1 ring-primary"
                        : "border-border bg-card hover:border-muted-foreground/30"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
                    }`}>
                      <Icon size={15} />
                    </div>
                    <span className="text-sm font-medium text-foreground truncate flex-1">
                      {subject.name}
                    </span>
                    {isActive && <Check size={13} className="text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Other Subject */}
        {(!search.trim() || "other".includes(search.toLowerCase())) && (
          <>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5 px-0.5">
              Not listed?
            </p>
            <button
              type="button"
              onClick={onCustomToggle}
              disabled={disabled}
              className={`w-full p-3 rounded-xl border text-left transition-all duration-200 ${
                isCustom
                  ? "border-primary bg-primary-tint ring-1 ring-primary"
                  : "border-border bg-card hover:border-muted-foreground/30"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isCustom ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
                }`}>
                  <PenLine size={15} />
                </div>
                <span className="text-sm font-medium text-foreground">Other Subject</span>
                {isCustom && <Check size={13} className="text-primary shrink-0 ml-auto" />}
              </div>
            </button>
            {isCustom && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
              >
                <input
                  autoFocus
                  type="text"
                  placeholder="Enter your subject..."
                  value={customValue}
                  onChange={(e) => onCustomChange(e.target.value)}
                  className="input-base"
                  disabled={disabled}
                  onKeyDown={(e) => e.key === "Enter" && onNext()}
                />
              </motion.div>
            )}
          </>
        )}
      </div>

      {error && (
        <p className="text-xs text-error ml-1">{error}</p>
      )}
    </div>
  );
}
