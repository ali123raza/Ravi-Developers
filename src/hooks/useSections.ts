"use client";

import { useGetSections, type PageSection } from "@/lib/api";

type SectionMap = Record<string, PageSection>;

export function useSections(page: string) {
  const { data: sections, ...rest } = useGetSections(page);

  const sectionMap: SectionMap = {};
  if (sections) {
    for (const s of sections) {
      sectionMap[s.sectionKey] = s;
    }
  }

  const getSection = (key: string): PageSection | undefined => sectionMap[key];
  const getTitle = (key: string, fallback: string = ""): string => sectionMap[key]?.title ?? fallback;
  const getSubtitle = (key: string, fallback: string = ""): string => sectionMap[key]?.subtitle ?? fallback;
  const getContent = (key: string): Record<string, unknown> => sectionMap[key]?.content ?? {};
  const getImages = (key: string): string[] => sectionMap[key]?.images ?? [];
  const getButtons = (key: string) => sectionMap[key]?.buttons ?? [];
  const isActive = (key: string): boolean => sectionMap[key]?.isActive ?? true;

  return {
    sections,
    sectionMap,
    getSection,
    getTitle,
    getSubtitle,
    getContent,
    getImages,
    getButtons,
    isActive,
    ...rest,
  };
}
