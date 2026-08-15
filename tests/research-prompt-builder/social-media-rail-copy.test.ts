import { describe, expect, it } from "vitest";
import { socialMediaRailCopy } from "@/features/research-prompt-builder/components/social-media-rail-copy";

describe("socialMediaRailCopy", () => {
  it("keeps Social Media leaf copy when channel label is omitted", () => {
    const copy = socialMediaRailCopy();
    expect(copy.channelSurface).toBe(false);
    expect(copy.headerTitle).toBe("Social Media");
    expect(copy.headerDescription).toBe(
      "Choose a channel — each owns its creative brain.",
    );
    expect(copy.parentLabel).toBe("Social Media");
    expect(copy.parentDescription).toBe(
      "Choose a channel — each owns its creative brain.",
    );
    expect(copy.channelLabel).toBeNull();
  });

  it("focuses the channel header and keeps Social Media as parent when label is set", () => {
    const copy = socialMediaRailCopy("YouTube Shorts");
    expect(copy.channelSurface).toBe(true);
    expect(copy.headerTitle).toBe("YouTube Shorts");
    expect(copy.headerDescription).toBeNull();
    expect(copy.parentLabel).toBe("Social Media");
    expect(copy.parentDescription).toBe(
      "Choose a channel — each owns its creative brain.",
    );
    expect(copy.channelLabel).toBe("YouTube Shorts");
  });

  it("treats whitespace-only label as omitted", () => {
    const copy = socialMediaRailCopy("   ");
    expect(copy.channelSurface).toBe(false);
    expect(copy.headerTitle).toBe("Social Media");
    expect(copy.channelLabel).toBeNull();
  });
});
