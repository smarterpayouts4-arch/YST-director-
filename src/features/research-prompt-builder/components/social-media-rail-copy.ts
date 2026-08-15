import { journeyChapterById } from "@/features/research-prompt-builder/config/journey-chapters";

/**
 * Presentation-only Social Media rail copy.
 * When `activeChannelLabel` is set (channel page), the header focuses the
 * channel; the scroll keeps Social Media as parent with its hub description.
 * When omitted (hub / RPB / CI), header + shell stay the Social Media leaf.
 */
export type SocialMediaRailCopy = {
  /** True when a channel surface label is present. */
  channelSurface: boolean;
  headerTitle: string;
  /** Hub / next-chapter description under the header title; null on channel surface. */
  headerDescription: string | null;
  parentLabel: string;
  parentDescription: string;
  channelLabel: string | null;
};

export function socialMediaRailCopy(
  activeChannelLabel?: string,
): SocialMediaRailCopy {
  const social = journeyChapterById("social-media");
  const trimmed = activeChannelLabel?.trim();
  if (trimmed) {
    return {
      channelSurface: true,
      headerTitle: trimmed,
      headerDescription: null,
      parentLabel: social.label,
      parentDescription: social.description,
      channelLabel: trimmed,
    };
  }
  return {
    channelSurface: false,
    headerTitle: social.label,
    headerDescription: social.description,
    parentLabel: social.label,
    parentDescription: social.description,
    channelLabel: null,
  };
}
