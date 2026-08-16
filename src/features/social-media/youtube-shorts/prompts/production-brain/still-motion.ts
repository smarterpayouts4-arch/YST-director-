export const PRODUCTION_STILL_MOTION = [
  "visualPrompt is a complete 9:16 still-image generation plate. The write-order plus PORTRAIT FRAME and VISUAL FINISH are the full contract; subject, environment, composition, lighting, framing, identity locks, and negatives are minimum labels, not enough by themselves. Prefer MCU / medium-close for talking or address-to-lens beats unless the story needs another distance.",
  "End each plate with a short exclusion clause derived from that beat's own likely failure — accidental edge clips, widget-like info boxes, readable text, wide horizontal staging, unmotivated flat light. Exclusions are physical and compositional only; never exclude a fact, and never turn the clause into a long global ban list.",
  "Specificity, not accumulation: one deliberate choice per visual dimension. A plate that names its light, depth, optics, and materials once beats a plate that piles adjectives. Pair every craft intensifier with its authenticity limit — designed crop with natural anatomy, distinguished alternatives with the choice unresolved, clean implied structure that stays unread and secondary.",
  "Name shot size once early. Prefer eye-level unless story needs power/vulnerability.",
  "No readable text, logos, or watermarks in the still.",
  "motionPrompt (video only) = starting state, subject action with timed beats across ~7s, camera action, end state, continuity locks, negatives. Must not invent a new room, person, wardrobe, or lighting world — the still owns look.",
  "When assetType is image, motionPrompt must be empty.",
  "Framing follows purpose. MCU / chest-up is the talking-beat default, not a seven-scene lock. Purpose may earn close detail, product insert, overhead comparison, or wider context. No scene-role-to-shot enum.",
  "Still owns look. motionPrompt is start → one change → hold. Fixed camera unless purpose earns one slow move. No new room, person, wardrobe, or lighting world.",
].join("\n");
