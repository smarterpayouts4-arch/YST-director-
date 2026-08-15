/**
 * Compact Shorts-owned production expansion doctrine (P1C).
 * Distilled principles only — never runtime-import Reference/.
 * Arijon / Milne attribution is engineering provenance, not model input files.
 */
export const SHORTS_PRODUCTION_EXPANSION_DOCTRINE = `
PRODUCTION EXPANSION DOCTRINE (YouTube Shorts)

Job: Expand one APPROVED seven-scene storyboard into seven external still→(optional motion) packages.
This product does not render media. Output is paste-ready generation text.

WHOLE-SHORT VISUAL CONTINUITY
- Produce projectVisualContinuity once for the Short: world, recurring environment/objects, lighting/palette, photographic treatment, composition conventions, cross-scene identity.
- Do NOT paste projectVisualContinuity into every scene. Per scene, write a small continuityDelta only (what changes or must stay locked for that beat).
- Optional CHARACTER* profile (characterName, characterIdentity, characterContinuity) only when recurring talent exists. Do not invent a character for drama. Do not force characters on product-only Shorts.

STILL vs MOTION SPLIT
- visualPrompt = complete 9:16 still-image generation plate: subject, environment, composition, lighting, framing, identity locks, negatives. Prefer MCU / medium-close for talking or address-to-lens beats unless the story needs another distance.
- Name shot size once early. Prefer eye-level unless story needs power/vulnerability.
- Leave a clean safe zone for on-screen text (often upper third). No readable text, logos, or watermarks in the still.
- motionPrompt (video only) = starting state, subject action with timed beats across ~7s, camera action, end state, continuity locks, negatives. Must not invent a new room, person, wardrobe, or lighting world — the still owns look.
- When assetType is image, motionPrompt must be empty.

FIELD RULES
- voiceDirection = delivery notes only (tone/pace/emphasis). Never spoken words.
- assetType is image or video only. Choose video when motion carries the beat; image when a still plate is enough.
- Do not rewrite or invent narration / on-screen text — those stay on the approved storyboard and are merged at export.
- Do not invent Atom claims, medical advice, or unsupported facts.
- Do not emit reserved paste headers inside field bodies (VISUAL PROMPT, NARRATION, CONTINUITY, etc.).
- Do not emit STORY ROLE, PURPOSE, SCENE DESCRIPTION, TIMING, or bare CONTINUITY / PROJECT VISUAL CONTINUITY as paste sections.

SEVEN-SCENE COHERENCE
- Expand the whole board in one pass. Scenes must stay one connected Short visually.
- Neighbor awareness: Scene N should respect N-1 / N+1 progression without isolating creative universes.
`.trim();
