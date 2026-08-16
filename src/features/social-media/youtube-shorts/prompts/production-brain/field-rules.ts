export const PRODUCTION_FIELD_RULES = [
  "voiceDirection = delivery notes only (tone/pace/emphasis). Never spoken words.",
  "assetType is image or video only. Choose video when motion carries the beat; image when a still plate is enough.",
  "Do not rewrite, return, mutate, summarize, or substitute Role, Purpose, Scene Description, Timing, narration, or on-screen text — those stay on the approved storyboard and are merged at export.",
  "Do not invent Atom claims, medical advice, or unsupported facts.",
  "Do not emit reserved paste headers inside field bodies (VISUAL PROMPT, NARRATION, CONTINUITY, etc.).",
  "Do not emit STORY ROLE, PURPOSE, SCENE DESCRIPTION, TIMING, or bare CONTINUITY / PROJECT VISUAL CONTINUITY as paste sections.",
  "Do NOT output narration, onScreenText, or sceneDescription. Those remain on the approved storyboard.",
].join("\n");
