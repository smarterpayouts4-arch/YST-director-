"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FieldDecision } from "@/features/research-prompt-builder/components/company-understanding/types";
import type { CompanyUnderstanding } from "@/features/research-prompt-builder/types";
import {
  buildConfirmedProfile,
  fieldsForSection,
  getActiveProfileSections,
  getUnderstandingFields,
  sectionIsReviewed,
  sectionsReady,
  type ProfileSection,
} from "@/features/research-prompt-builder/lib/profile";

export function useSectionReview(understanding: CompanyUnderstanding) {
  const fields = useMemo(() => getUnderstandingFields(understanding), [understanding]);
  const sections = useMemo(() => getActiveProfileSections(fields), [fields]);
  const panelScrollRef = useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [editing, setEditing] = useState(false);
  const [ownerNotes, setOwnerNotes] = useState("");
  const [sectionConfirmed, setSectionConfirmed] = useState<Record<string, boolean>>({});
  const [decisions, setDecisions] = useState<Record<string, FieldDecision>>(() =>
    Object.fromEntries(
      fields.map((f) => [f.key, { status: "unresolved" as const, value: f.field.value }]),
    ),
  );

  const ready = sectionsReady(sections, decisions, sectionConfirmed);
  const activeSection = sections[activeIndex] ?? sections[0];
  const activeFields = activeSection ? fieldsForSection(fields, activeSection) : [];

  const reviewedCount = sections.filter((s) =>
    sectionIsReviewed(s, decisions, sectionConfirmed),
  ).length;

  useEffect(() => {
    panelScrollRef.current?.scrollTo({ top: 0 });
  }, [activeIndex]);

  const completeSection = (section: ProfileSection) => {
    setDecisions((prev) => {
      const next = { ...prev };
      for (const key of section.fieldKeys) {
        if (!next[key]) continue;
        if (next[key].status === "unresolved") {
          next[key] = { ...next[key], status: "confirmed" };
        }
      }
      return next;
    });
    setSectionConfirmed((prev) => ({ ...prev, [section.id]: true }));
    setEditing(false);
    setActiveIndex((current) =>
      current < sections.length - 1 ? current + 1 : current,
    );
  };

  const goPrevious = () => {
    setEditing(false);
    setActiveIndex((i) => Math.max(0, i - 1));
  };

  const openSection = (index: number, section: ProfileSection) => {
    const reviewed = sectionIsReviewed(section, decisions, sectionConfirmed);
    const isPriorOrActive = index <= activeIndex || reviewed;
    if (!isPriorOrActive && index !== activeIndex) return;
    setActiveIndex(index);
    setEditing(false);
  };

  const buildProfile = () =>
    buildConfirmedProfile(understanding, decisions, ownerNotes);

  return {
    fields,
    sections,
    panelScrollRef,
    activeIndex,
    editing,
    setEditing,
    ownerNotes,
    setOwnerNotes,
    decisions,
    setDecisions,
    sectionConfirmed,
    ready,
    activeSection,
    activeFields,
    reviewedCount,
    completeSection,
    goPrevious,
    openSection,
    buildProfile,
  };
}
