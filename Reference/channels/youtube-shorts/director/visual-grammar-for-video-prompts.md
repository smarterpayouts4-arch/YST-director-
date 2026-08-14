# Visual grammar for video-generation prompts

**Authority:** advisory derived reference — never project truth, never runtime-imported.  
**Product job:** improve the **video-generation-ready prompt** this channel will later emit. This product does not render video.

**Source book:** Daniel Arijon, *Grammar of the Film Language* (Silman-James; originally Focal Press).  
**Source hash (SHA256):** `30F6817844E0C88783842BF11C9D81C27ACEFF937542FBBA66303B9AE98B7362`  
**PDF pages cited below** are 1-based pages in the Calibre ebook copy used for this distill (726 pp).

**How to read this file**

Every reusable idea is split on purpose:

- **ARIJON-DERIVED PRINCIPLE** — paraphrased film grammar, with chapter/page.  
- **SHORTS / 9:16 / AI-VIDEO ADAPTATION** — *not* from Arijon. Vertical composition, still-then-motion prompt split, identity locks, negatives.

Never attribute 9:16 safe zones, Shorts UI chrome, identity locking, negative prompting, or model limits to Arijon.

Do not copy Scene 1 topic, talent, or claims into prompts. Scene 1 is cited only as **craft evidence** (how a strong plate + motion package used this grammar).

---

## How to use this when writing a prompt

*(SHORTS / 9:16 / AI-VIDEO ADAPTATION — not Arijon)*

This product writes prompts for an **external** generation system. A high-quality Shorts package is usually two prompts, not one essay:

1. **IMAGE GENERATION** — subject, environment, composition, lighting, framing, identity, constraints. Empty sector if text will be burned later; no readable text in the image.  
2. **IMAGE-TO-VIDEO GENERATION** — starting state, subject action, camera action, end state, continuity, negatives. The still already owns look and style; the motion prompt must not invent a new room, person, or costume.

Named downstream models are **not** product law. See **MODEL-SPECIFIC EVIDENCE / HISTORICAL EXAMPLE** at the end of this file. Re-evaluate against whichever generators are actually used.

---

## 1. Shot vocabulary

### ARIJON-DERIVED PRINCIPLE

**PRINCIPLE:** Practice uses five conceptual distances, not measured metres: close-up / big close-up, close shot, medium shot, full shot, long shot. Names are elastic (a “close shot of a house” is not the same distance as a “close shot of a person”).  
**WHY IT MATTERS:** Distance is the main control of *what the audience is allowed to see* and where emphasis falls. Approaching or receding governs story emphasis.  
**VIDEO-PROMPT APPLICATION:** Name the opening shot size in the plate. If motion changes scale, name the end size too (“MCU → CU”).  
**WHEN TO USE:** Every scene package.  
**WHEN NOT TO USE:** Do not stack two incompatible opening sizes in one sentence.  
**SOURCE:** Ch.3 “Distances,” PDF pp.32–35.  
**CONFIDENCE:** High.

**PRINCIPLE:** Human figures have pleasing “cutting heights”: under armpits, chest, waist, crotch, knees. A full shot of a person should include the feet; cutting above the ankles looks unfinished.  
**WHY IT MATTERS:** Ugly crops pull attention to the frame edge instead of the story.  
**VIDEO-PROMPT APPLICATION:** For people, say the crop explicitly (“chest-up MCU,” “head-and-shoulders CU,” “full figure including feet”).  
**WHEN TO USE:** Any human plate.  
**WHEN NOT TO USE:** Product-only inserts.  
**SOURCE:** Ch.3, PDF pp.34–35, Fig. 3.6.  
**CONFIDENCE:** High.

### SHORTS / 9:16 / AI-VIDEO ADAPTATION

In 9:16, MCU / medium-close (chest-up or head-and-shoulders) is the reliable default for a talking or looking-to-lens beat. Distant full-body in a busy room starves identity models. Scene 1’s successful hook used **Medium Close-Up**, not a wide establishing shot.

State shot size once, early, in the still. If motion changes scale, name the end size in the motion prompt (“vertical 9:16 medium close-up… camera slowly pushes in to a close-up”).

---

## 2. Camera angle / height

### ARIJON-DERIVED PRINCIPLE

**PRINCIPLE:** Default conversation height is **eye-level with the subject** (sitting or standing). If one person stands and one sits, reverse-shot heights should follow the people.  
**WHY IT MATTERS:** We normally look at people from near their eye height.  
**VIDEO-PROMPT APPLICATION:** Default “eye-level” or “lens at seated eye height.”  
**WHEN TO USE:** Ordinary conversation coverage.  
**WHEN NOT TO USE:** When the story needs power, vulnerability, or shock.  
**SOURCE:** Ch.5 “Camera and actor height,” PDF pp.92–94.  
**CONFIDENCE:** High.

**PRINCIPLE:** Extreme high or low tilts look unreal because we rarely look at people that way. Reserve them as “shockers” for important story points.  
**WHY IT MATTERS:** Unmotivated acute high/low viewpoints become decoration.  
**VIDEO-PROMPT APPLICATION:** Use “slight low angle” only to stress dominance; “high angle” only to diminish. Never as default style.  
**WHEN TO USE:** Rare, story-justified.  
**WHEN NOT TO USE:** Every scene “cinematic low angle.”  
**SOURCE:** Ch.5, PDF p.95.  
**CONFIDENCE:** High. (Terms like Dutch / worm’s-eye / god’s-eye are later slang, not Arijon’s words.)

**PRINCIPLE:** In fiction, performers should normally **not** look into the lens. Direct lens address is an exception for motivated monologue-to-audience or announcer-style delivery, used sparingly and with a strong reason. A camera sitting *on* the line of interest (Ch.4 Figs. 4.8–4.9) or behaving as a player’s eyes (Ch.20 rule 2) is **subjective POV**, not the same as a Shorts hook.  
**WHY IT MATTERS:** Unmotivated lens stare collapses the scene into “you are being addressed.”  
**VIDEO-PROMPT APPLICATION:** Default “eyes off lens, looking at [object / off-screen partner].” Write “eyes into the camera lens” only when the beat *is* address.  
**WHEN TO USE (exception):** Motivated aside, announcer, or one planted question.  
**WHEN NOT TO USE:** Every scene; or when the subject should be observing an object.  
**SOURCE:** Ch.5, PDF pp.89–94 (primary). Ch.4 Figs. 4.8–4.9 and Ch.20 rule 2 are POV geometry, not hook doctrine.  
**CONFIDENCE:** High.

### SHORTS / 9:16 / AI-VIDEO ADAPTATION

Scene 1 combined MCU + gaze into lens and labeled it “Arijon Subjective Direct-Address.” That **label is not in the book**. The pairing works as Shorts **announcer / planted-question** mode (Ch.5 exception), not as default fiction grammar. Hold eyeline; do not add a head-turn away from lens unless that *is* the beat (Scene 1 does a glance-down then look-up, then locks contact).

Still prompt: “eye-level, facing camera, eyes into lens.” Avoid “selfie / phone camera” unless that is the story.

---

## 3. Centre of interest

### ARIJON-DERIVED PRINCIPLE

**PRINCIPLE:** The audience must know what to look at. Distance, glances of other people, and who is nearest the camera decide the centre of interest. Competing glances or a busy background group will split attention. Background motion must stay inconspicuous or it steals the foreground.  
**WHY IT MATTERS:** If the viewer must choose, they stop following the story.  
**VIDEO-PROMPT APPLICATION:** One dominant subject. Background exists as support, not a second story.  
**WHEN TO USE:** Always.  
**WHEN NOT TO USE:** Only if the beat *is* split attention (rare; say so).  
**SOURCE:** Ch.3 “Centre of interest,” PDF pp.43–45.  
**CONFIDENCE:** High.

**PRINCIPLE:** Heads and eyes are the strongest direction pointers. The line of interest runs between **heads**, not bodies.  
**WHY IT MATTERS:** Viewers lock on faces first.  
**VIDEO-PROMPT APPLICATION:** Face sharp; eyes readable; prop can be secondary at chest height (not fighting the face).  
**WHEN TO USE:** People scenes.  
**WHEN NOT TO USE:** Pure product insert (then the object *is* the head-equivalent).  
**SOURCE:** Ch.4 “Importance of the heads,” PDF pp.50–52.  
**CONFIDENCE:** High.

### SHORTS / 9:16 / AI-VIDEO ADAPTATION

Vertical frames punish two competing high-contrast objects. Place the primary subject deliberately. If on-screen text will be added later, reserve a **clean, low-detail sector** (Scene 1: upper-left third as empty wall). That reservation is **not** Arijon.

Still: “crisp subject, soft background, cinematic depth of field.”  
Motion: “no other people enter the frame.”

---

## 4. Line of interest / screen direction

### ARIJON-DERIVED PRINCIPLE

**PRINCIPLE:** Between two people (or a person and what they look at) a **line of interest** runs along the exchanged looks. Cover from **one side** of that line and stay there. Crossing it swaps screen left/right and confuses the audience. This is one of the most respected rules in the book.  
**WHY IT MATTERS:** Geography and who-is-looking-at-whom stay readable.  
**VIDEO-PROMPT APPLICATION:** Name who looks at whom (or at what). Keep that axis across adjacent clips.  
**WHEN TO USE:** Any sequence with a recurring person or a look between people/objects.  
**WHEN NOT TO USE:** Do not import full triangle / multi-camera coverage recipes (see §12).  
**SOURCE:** Ch.4 “Line of interest,” PDF pp.47–50.  
**CONFIDENCE:** High.

**PRINCIPLE:** For a **lone** subject, gaze direction sets the line of interest and governs where the camera may sit. If he looks straight ahead, east–west reverse placements break the sense of direction.  
**SOURCE:** Ch.4 “Triangle principle: One person,” PDF pp.73–74.  
**CONFIDENCE:** High. Treating the viewer-as-partner (gaze into lens) is a Shorts adaptation of this rule, not the book’s fiction default.

**PRINCIPLE:** Matched looks between two people are **opposed**. If both look the same way in separate shots, they are looking at a third thing, not each other.  
**WHY IT MATTERS:** Eyeline errors make relationships meaningless.  
**VIDEO-PROMPT APPLICATION:** If Scene A looks right at a bottle and Scene B is the bottle, the bottle’s “address” should feel like the answering look, not a random still.  
**WHEN TO USE:** Two-subject or subject-to-object beats.  
**WHEN NOT TO USE:** Direct-to-lens monologue (the viewer *is* the other look).  
**SOURCE:** Ch.3 “Matching the look” / opposed glances, PDF pp.39–42.  
**CONFIDENCE:** High.

**PRINCIPLE:** A moving subject has a **line of movement**. Cameras covering that path stay on one side or the travel direction flips on screen. Any change of path must be **shown**. Neutral motion (straight toward/away from camera) is safer for direction changes.  
**WHY IT MATTERS:** Reversed travel looks like a new destination.  
**VIDEO-PROMPT APPLICATION:** “She walks left to right; keep her on the right third.” Do not secretly flip in the next scene.  
**WHEN TO USE:** Walking, handing, entering.  
**WHEN NOT TO USE:** Locked seated MCU with no travel.  
**SOURCE:** Ch.9, PDF pp.214–217.  
**CONFIDENCE:** High.

### SHORTS / 9:16 / AI-VIDEO ADAPTATION

Scene 1 put the subject on the **right 2/3**, facing the lens, gaze axis to the viewer. That is Arijon’s “constant screen position” + one-person triangle (Ch.4, PDF pp.72–73: the lone player’s **look direction** sets the triangle) adapted to a vertical split: subject occupies two-thirds, one-third stays clean for text.

Across a Short, keep that side unless the story shows her turning. “Do not turn her head to the side” is a line-of-interest lock, not a style flourish.

---

## 5. Continuity (match position, movement, look)

### ARIJON-DERIVED PRINCIPLE

**PRINCIPLE:** To join shots of the same continuous action you must match: **(1) position** (body, gesture, place on the set, and place in the frame), **(2) movement** (kind and screen direction), **(3) look**. Clothing must also stay the same from shot to shot.  
**WHY IT MATTERS:** Mismatches force the viewer to re-find the person and drop the story.  
**VIDEO-PROMPT APPLICATION:** This is the core of “continuity locks” in a motion prompt — stated as preserve/do-not, not as film-set jargon.  
**WHEN TO USE:** Every adjacent scene; every still→motion pair.  
**WHEN NOT TO USE:** Intentional jump in time/place (then say it is a new setup).  
**SOURCE:** Ch.3 “Scene matching,” PDF pp.37–39 (position / movement / look); Ch.9 “Conditions of the cut,” PDF pp.229–230 (clothing).  
**CONFIDENCE:** High.

**PRINCIPLE:** On the same visual axis, a person on the left in a full shot stays on the left in the closer shot. The screen can be thought of as two or three vertical sectors; matching happens inside those sectors.  
**WHY IT MATTERS:** Axis cuts that hop the subject across the frame feel like a new shot of a new person.  
**VIDEO-PROMPT APPLICATION:** “Keep her in the right two-thirds; do not re-center unless the camera move is the story.”  
**SOURCE:** Ch.3, PDF pp.38–39, Fig. 3.7.  
**CONFIDENCE:** High.

### SHORTS / 9:16 / AI-VIDEO ADAPTATION

Arijon never says “identity lock” or “no extra limbs.” Those are generator constraints. Translate his triad into motion-prompt locks:

- Position → lock shoulders, seat, prop height, room geometry  
- Movement → one planned action; no unplanned gestures  
- Look → named eyeline path (down to object, then into lens)

Scene 1 motion constraints are this triad in operator English. The still should already contain the wardrobe/prop/room so the motion prompt is not asked to invent them.

---

## 6. Subject movement

### ARIJON-DERIVED PRINCIPLE

**PRINCIPLE:** Control two things: recording **distance** and the **motions of the subjects**. A turn in place ≈ a pan, horizontal travel ≈ a track, rise/sit ≈ a tilt. A change of screen direction must be **shown**. Toward/away from camera is the safest neutral pivot when reversing travel.  
**WHY IT MATTERS:** Unshown turns break geography.  
**VIDEO-PROMPT APPLICATION:** Describe one readable action with direction. Prefer small, complete gestures over several half-actions.  
**WHEN TO USE:** Any beat that is not a freeze.  
**WHEN NOT TO USE:** Do not stack several major actions in one clip.  
**SOURCE:** Ch.9, PDF pp.214–219.  
**CONFIDENCE:** High.

**PRINCIPLE:** Almost every shot should **begin on some movement** (even a mouth opening, an eye shift, a breath) because motion hides the jar of a scale change. Dominant motion is what you match; background motion only if it is conspicuous.  
**WHY IT MATTERS:** Static-to-static scale cuts jump.  
**VIDEO-PROMPT APPLICATION:** Start motion on a small live action (glance, breath, blink), not a dead freeze unless the plate is a still-only scene.  
**SOURCE:** Ch.9 “Cutting on action,” PDF pp.230–231.  
**CONFIDENCE:** High for edit grammar; Medium for single-clip i2v (no cut inside the clip).

### SHORTS / 9:16 / AI-VIDEO ADAPTATION

Current image-to-video generators often fail on multiple major actions and on torso twists / large walks. One primary action per clip. Scene 1 used three **phases of one action** (hold → raise eyes → hold contact), not three stories. Prefer slow, small, single motion. Re-evaluate if a later model handles more.

This product does not cut internally; “cutting on action” becomes **transition intent between exported clips** (end Scene N on a motion peak that Scene N+1 can continue) — an adaptation, not in-app editing.

---

## 7. Camera movement (pan, track/push, pull, tilt, zoom)

### ARIJON-DERIVED PRINCIPLE

**PRINCIPLE:** Three on-film movement types: (1) things move in front of a still camera, (2) camera moves around still things, (3) both. Camera moves are pan, travel/track, or zoom. Success is knowing **how, when, and why**. Unjudicious movement destroys illusion and fights the story. Ford’s exaggeration: nail the camera down and depend on cutting — a warning, not a ban.  
**SOURCE:** Ch.20 opening, PDF p.471.  
**CONFIDENCE:** High.

**PRINCIPLE:** A pan/track from A to B has **three parts**: static start → moving middle → static end. Do not cut from a still-moving camera onto a static same subject (jump). Time the move; too short or too long works against the story. Start and end in **pictorially balanced** frames.  
**SOURCE:** Ch.20 rules 7, 15, 16, PDF pp.473–474.  
**CONFIDENCE:** High.

**PRINCIPLE:** A straight cut is faster than traveling to a new point. If you pan/track, photograph **significant** things along the way or the move is wasted footage.  
**SOURCE:** Ch.20 rule 5, PDF p.473.  
**CONFIDENCE:** High.

**PRINCIPLE:** Pan = horizontal scan or follow. Tilt = vertical pivot. Track/travel = camera body moves (parallax). Zoom = optical change of field (Ch.3: distances can be physical or optical).  
**SOURCE:** Ch.3 “Movement,” PDF p.33; Ch.21 opening, PDF p.476.  
**CONFIDENCE:** High.

**PRINCIPLE:** Tracking toward a subject changes perspective (foreground grows faster than background). An equivalent zoom magnifies all planes equally. At telephoto, depth flattens and the background appears pulled toward the foreground. Three zoom uses: (1) toward/away from a static subject, (2) covering a moving subject, (3) camera body moving while zooming.  
**WHY IT MATTERS:** “Push in” and “zoom in” are not synonyms. The first has parallax; the second is optical scale.  
**VIDEO-PROMPT APPLICATION:** If you want nearer *space*, write a physical push/dolly. If you only want magnification with a locked body, write zoom — and expect a flatter look.  
**WHEN TO USE:** Short, motivated optical change.  
**WHEN NOT TO USE:** Full-range zooms, zoom + track + actor motion stacked, or opposed track-and-zoom (that pairing is a distortion effect).  
**SOURCE:** Ch.23 “Zooming,” PDF pp.579–580, 585–586.  
**CONFIDENCE:** High.

**PRINCIPLE:** Zooming in short sections is generally more effective than using the full focal range. A zoom toward a static subject draws attention to the zoom itself. Fast zoom = visual punctuation / shock. Slow zoom at a constant rate can feel intimate (Arijon’s example: quietly creeping toward tear-filled eyes). Slow-fast-slow is the book’s preferred speed envelope. The zoom integrates better if the player’s body or head move motivates the optical change.  
**SOURCE:** Ch.23, PDF pp.579–581.  
**CONFIDENCE:** High.

**PRINCIPLE:** A crane is mostly a way to *place* the camera at a height that would otherwise be hard, not a default movement tool. When it does move, keep it simple and usually gentle: follow someone up/down a level, or a slow vertical for mood. A vertical foreground prop (tree, railing) increases the sensation of height.  
**WHEN NOT TO USE:** Crane-as-style for a seated MCU.  
**SOURCE:** Ch.23 opening, PDF p.572.  
**CONFIDENCE:** High.

**PRINCIPLE:** Execute moves with certainty. Jerky, undecided pivots read as amateur. Prefer simple camera paths; let the actor do the complicated motion inside the frame.  
**SOURCE:** Ch.20 rules 12, 14, PDF p.474.  
**CONFIDENCE:** High.

### SHORTS / 9:16 / AI-VIDEO ADAPTATION

Reliable motion-prompt moves (external craft, not Arijon): **slow push-in / dolly-in**, **fixed camera**, slow pan, slow tilt with named start and end regions. Dolly-out and orbits have been weaker in prior testing. Avoid whip pan, crash zoom, handheld chaos.

**Push-in vs zoom in prompts:** “camera slowly pushes in” (physical approach, usually safer) vs “slowly zooms in” (magnification, less parallax). Scene 1 used a **fixed frame + imperceptible 3% push-in over ~7s** — one move, tiny amplitude, 50mm *feel* (lens feel is prompt language, not Arijon law).

Name opening size → one move → end size. Do not request two opening sizes.

---

## 8. Motivated movement

### ARIJON-DERIVED PRINCIPLE

**PRINCIPLE:** Camera movement must have **justification at all times**. Use it only when it makes storytelling clearer, more dynamic, or more precise.  
**SOURCE:** Ch.20 “Solid dramatic motivation,” PDF p.475.  
**CONFIDENCE:** High.

**PRINCIPLE:** **Subject movement draws attention away from camera motion.** Let the subject move **first**, then follow. **Stop the camera before the subject stops**, so they still travel a little in frame.  
**SOURCE:** Ch.20 rule 13, PDF p.474.  
**CONFIDENCE:** High — this is the rule Scene 1’s look-up + micro push-in is echoing.

**PRINCIPLE:** A small pan/track can re-balance the frame when someone enters or leaves. These moves are slow and small.  
**SOURCE:** Ch.20 rule 17, PDF pp.474–475.  
**CONFIDENCE:** High.

### SHORTS / 9:16 / AI-VIDEO ADAPTATION

If nothing in the beat requires a move, write **“fixed camera / locked shot.”**

If you add a push-in, motivate it with attention (she looks up → we move toward the question on her face). Do not add “cinematic drift” for texture. Prefer **slow / gradual / steady / single continuous shot**.

---

## 9. Visual emphasis

### ARIJON-DERIVED PRINCIPLE

**PRINCIPLE:** Emphasis is governed by approaching or receding (distance), by who is nearest the camera, by glance direction of others, and by inserting a closer fragment of the master. A closer shot highlights expression; a wider shot restores geography.  
**SOURCE:** Ch.3 PDF pp.32–33, 36.  
**CONFIDENCE:** High.

**PRINCIPLE:** An **insert** substitutes a closer piece of what the master already covers (same visual axis, or a reverse that shows the beat more clearly). A **cut-away** shows something or someone the master camera never covered. Inserts pinpoint an object *or* a face reaction. In the book, “insert” is often synonymous with close shot. The insert is justified when it makes the story clearer; skipping a needed insert is the mistake.  
**WHY IT MATTERS:** Emphasis is a *closer look at the same beat*, not a new location.  
**VIDEO-PROMPT APPLICATION:** This product does not cut internally. An Arijon insert becomes either (a) a **separate exported clip** of the closer fragment, or (b) the prop held in-frame inside the same plate (Scene 1’s bottle-in-hand). Do not write coverage recipes (master + two inserts + re-establish) into one generation prompt.  
**WHEN TO USE:** One beat that needs a closer object or a closer face.  
**WHEN NOT TO USE:** As a Hollywood coverage checklist.  
**SOURCE:** Ch.8 “Inserts and cut-aways,” PDF pp.189–195.  
**CONFIDENCE:** High.

**PRINCIPLE:** In two-player external reverse, the speaker facing camera often gets about **two-thirds** of the frame; the back-turned partner about one-third. Depth (near/far planes) and slight defocus on the rear figure strengthen that emphasis. For a **lone** subject, give the figure about two-thirds and leave empty “air” in front of the look (breathing space) — not centered filler.  
**SOURCE:** Ch.4, PDF pp.58–61, Fig. 4.24 p.69.  
**CONFIDENCE:** High for the 2/3 idea; do not treat percentages as pixel law. Reserving a third for burned-in captions is a Shorts adaptation, not Arijon.

**PRINCIPLE:** Over a sequence, **approach closer for peaks** and **recede to medium for rest** before the next peak. A silent listener’s face is often more expressive than the speaker’s. A **re-establishing** wider view restores place and acts as a visual pause after close work — an emphasis tool, not a mandatory coverage formula.  
**SOURCE:** Ch.8, PDF pp.186–189.  
**CONFIDENCE:** High.

**PRINCIPLE:** Stories need *what happens* and *how people react*. Grouping the act, then the response, makes meaning clearer than mixing them. Only **peak moments** are shown; dead time is dropped; time can be compressed or expanded so the fragment still feels complete. In parallel editing, each piece of film is a peak in a series of actions and reactions.  
**WHY IT MATTERS:** A Short is already a fragment. The job is choosing the peak, not covering the whole event.  
**VIDEO-PROMPT APPLICATION:** One clip = one peak micro-arc (act → silent response), not a walk-in plus the beat plus a walk-out.  
**WHEN TO USE:** Every scene package.  
**WHEN NOT TO USE:** Do not inherit Ch.2’s *multi-location* parallel-editing recipes. Inherit contrast (before/after, act/face), not two storylines.  
**SOURCE:** Ch.2 “The Importance of Parallel Film Editing,” PDF pp.26–29.  
**CONFIDENCE:** High.

**PRINCIPLE:** Stillness can punctuate. Inaction at the start or end of a shot eases a transition; a static image can be a visual pause so the next beat reads as the peak. A camera advance *during* speech tends toward intimacy; an advance *after* the phrase stresses the reaction. Repeated forward tracks become disturbing emphasis.  
**SOURCE:** Ch.28 “Film Punctuation,” PDF pp.707–708, 712–714.  
**CONFIDENCE:** High for the ideas; do not inherit fades, dissolves, wipes, iris, freeze-frame lab tricks, or black-leader as product defaults.

### SHORTS / 9:16 / AI-VIDEO ADAPTATION

One peak per ~7s clip. Scene 1’s peak is the look-up into lens, not the bottle. The bottle is a supporting insert-in-hand, held at chest, so it does not replace the face as centre.

Still: “high contrast, crisp subject, soft background.”  
Do not ask the motion prompt to also “emphasize” via lighting changes mid-shot — lighting drift is a common image-to-video failure.

---

## 10. Temporal action

### ARIJON-DERIVED PRINCIPLE

**PRINCIPLE:** A motivated camera move has a beginning state, a middle change, and an end state (rule 7). Timing must serve the story (rule 16).  
**SOURCE:** Ch.20, PDF pp.473–474.  
**CONFIDENCE:** High.

**PRINCIPLE:** Continuous action can be shown in **sectors** from one side of the line; that is often livelier than one unbroken wide take — *in edited film*.  
**SOURCE:** Ch.9, PDF p.214.  
**CONFIDENCE:** High for cinema; for us it becomes “one sector of the action per clip,” an adaptation.

### SHORTS / 9:16 / AI-VIDEO ADAPTATION

Write time as **natural-language phases**, not as a fake timestamp schema (`[0–3s]` style belongs to some multi-shot tools, not to this product).

Pattern (from Scene 1 craft, not from Arijon):

1. What is true at the start (pose, eyeline, camera)  
2. What changes (one action and/or one camera move)  
3. Where attention shifts (object → eyes → lens)  
4. What state we hold at the end  

The product target is ≈7s per scene. Prefer one slow push-in or a locked camera plus a small face/eye move. If a downstream model drifts at that length, simplify the motion — do not add prompt text.

---

## 11. Cross-scene continuity

### ARIJON-DERIVED PRINCIPLE

**PRINCIPLE:** Same-side line of interest, constant screen sector, matched clothing/place, matched look, matched travel direction. Heads remain the anchor. Show any turn that would flip the line.  
**SOURCE:** Ch.3–4, Ch.9 as above.  
**CONFIDENCE:** High.

### SHORTS / 9:16 / AI-VIDEO ADAPTATION

Carry a short **handoff card** between scene prompts (doctrine later, not runtime now):

- Subject screen side  
- Eyeline (lens / object / off-screen left or right)  
- Wardrobe and hero object  
- Room geometry and key lights  
- Motion amplitude (still vs micro vs travel)

Do not re-center a recurring person every scene “for variety.” Variety comes from **distance and action**, not from flipping the line.

---

## 12. What NOT to inherit from Arijon

Do **not** make these product law or default prompt furniture:

- Full two- / three- / four-player **triangle coverage recipes** and master-shot intercut systems (Ch.4–8)  
- Multi-camera, motor-driven newsreel, or studio **equipment** technique  
- Analog cutting-room overlap math (“1/3 of first take, 2/3 of second”) as a generator setting  
- Optical **fade / dissolve / wipe / iris** as default Shorts punctuation (Ch.3 p.37; Ch.28) — we hand off clips; the external editor/model can hard-cut  
- Horizontal widescreen “central third” recipes as 9:16 law  
- Process screen, treadmill, lighting-on-a-car-mockup (Ch.20 rules 18–20)  
- Chase pans, acrobatic pans, crane-as-default  
- “Nail down the camera” as a ban on all movement (it is a warning against decoration)  
- Direct-address for an entire feature (Arijon cites the limitations)

Keep the **ideas**: one side of the line, match triad, motivated move, subject-first, peak emphasis, eye-level default.

---

## Worked craft mapping (Scene 1) — not a content template

| Scene 1 craft choice | Arijon? | Adaptation? |
|----------------------|---------|-------------|
| Medium close-up | Yes — Ch.3 distance / emphasis | 9:16 default scale |
| Subjective direct-address / eyes to lens | Partial — Ch.5 exception (avoid lens by default); Ch.4/20 are POV geometry | Shorts hook / announcer mode |
| Right 2/3 placement | Partial — constant sector + lone-subject air (Ch.4) | Split with text third is not Arijon |
| Upper-left clean third | No | 9:16 + overlay safe sector |
| 50mm feel | No (book is not a lens-mm cookbook) | Still/motion prompt language |
| 3% / slow push-in | Partial — motivated, small, start/end stable (Ch.20) | Amplitude / 3% is prior-test craft only |
| Glance down → look up → hold | Yes — centre of interest + motion then settle | Timed motion phases |
| Lock body, room, light, hands | Yes — match position/look | Plus AI identity / extra-limb negatives |
| Still then motion (two prompts) | No | External generation stack |
| Magnesium / Nighttime Woman | No | **Do not reuse as defaults** |

---

## IMAGE GENERATION (adaptation — not Arijon)

Bundle **subject, environment, composition, lighting, framing, identity, constraints** in one block. Be specific; use photographic terms; say you want an image.

Useful locked phrases:

- “Generate an image of…” / photoreal cinematic still  
- MCU or CU, 50mm feel, eye-level  
- “eyes into the lens” or named off-lens eyeline  
- key + fill directions (Scene 1 pattern: warm key one side, cool fill the other)  
- “crisp subject, soft background”  
- “vertical 9:16”  
- “no text, no logos, no watermarks”  
- “natural hand anatomy, five fingers, correct proportions” if hands are in frame  

---

## IMAGE-TO-VIDEO GENERATION (adaptation — not Arijon)

Structure:

```text
[Starting 9:16 shot size of the SAME subject as the plate]
[One small action, slow]
[One camera move: fixed | slow push-in | slow pan | slow tilt]
[End framing / end eyeline]
[Lighting and background unchanged]
[Preserve face, hands, wardrobe, prop, room]
[No extra people, no morphing]
```

Prefer: “The camera slowly pushes in toward her face.” / “Static camera, locked shot.”  
Avoid: whip pan, crash zoom, orbit, crowd, lighting transformation, entrance + sit + speak in one clip.

Negatives (generator craft, not Arijon): morphing, identity change, warped hands, extra limbs, flicker, camera shake, extra people, text overlay, watermark.

---

## MODEL-SPECIFIC EVIDENCE / HISTORICAL EXAMPLE

**NOT PRODUCT LAW.** Re-evaluate against whichever downstream models are actually used.

- **Gemini** (or a Gemini-class still generator) was the still generator in the prior Scene 1 example.  
- **Wan 2.1** (or a Wan-class image-to-video generator) was the motion generator in that same example. Slow / simple / single motion appeared more reliable in that prior testing.  
- Official Wan-family i2v phrasing that was useful then: the **image** owns entity, scene, and style; the **text** owns motion and camera. Phrases included “camera pushes in,” “camera moves left,” and “fixed camera.”  
- Do not treat Gemini, Wan, Veo, or any other named model as timeless visual doctrine.

---

## Sufficiency for this project

This file is the **active working crib sheet** for writing Shorts generation prompts in this project. GATE 0B verdict: **YES-WITH-GAPS** (attribution and a few missing sentences folded in after red-team). Owner 2026-08-14: **PASS** as a book replacement for this project’s prompt-writing needs.

It is **not** a substitute for owning/archiving the book. It does **not** teach 9:16 from Arijon. It does **not** authorize topic claims.

**Do not runtime-import this file.** Distill later into compact TypeScript doctrine if P1B/P1C needs it.
