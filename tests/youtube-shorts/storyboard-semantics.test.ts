import { describe, expect, it } from "vitest";
import {
  validateGeneratedStoryboard,
  validateStoryboardSemantics,
  type YouTubeShortsStoryArchitecture,
  type YouTubeShortsStoryboard,
} from "@/features/social-media/youtube-shorts/schemas/youtube-shorts-storyboard";

function scene(
  n: number,
  patch: Partial<YouTubeShortsStoryboard["scenes"][number]> = {},
) {
  return {
    sceneNumber: n,
    storyRole: `role-${n}`,
    purpose: `purpose-${n}`,
    narration: `narration-${n}`,
    sceneDescription: `description-${n}`,
    onScreenText: "",
    durationTargetSeconds: 7,
    ...patch,
  };
}

function architectureA(): YouTubeShortsStoryArchitecture {
  return {
    storyPromise: "A cheaper-looking serving can hide a different declared amount.",
    carrierMode: "single",
    primaryCarrier: "declared amount line",
    comparisonCarriers: [],
    excludedCarriers: ["second catalog variant"],
    viewerOpening: "The shopper is about to pick the lower cost per serving.",
    hookMechanism: "The apparent bargain may not be an equivalent serving.",
    hookWhy: "This viewer is about to treat a lower cost as proof the servings match.",
    openingQuestion: "Are these servings actually equivalent amounts?",
    scene1Withholds: "How to read the declared amount line.",
    payoff: "Match the declared amount before comparing price.",
    beats: [
      { sceneNumber: 1, job: "Plant the equivalent-amount question", because: "" },
      {
        sceneNumber: 2,
        job: "Show why serving counts can still mismatch",
        because: "The opening question stays open until the shortcut is shown incomplete.",
      },
      {
        sceneNumber: 3,
        job: "Point to the declared amount line",
        because: "Once counts fail, the viewer needs the next place that can settle the amounts.",
      },
      {
        sceneNumber: 4,
        job: "Explain the declared amount comparison",
        because: "Seeing the line is not enough until the two amounts are compared.",
      },
      {
        sceneNumber: 5,
        job: "Keep teaching on that same label line",
        because: "The comparison still has one more distinction to finish on the same carrier.",
      },
      {
        sceneNumber: 6,
        job: "Reframe price as a later step",
        because: "Price only becomes useful after the amounts are known to match.",
      },
      {
        sceneNumber: 7,
        job: "Resolve with match-then-compare-price",
        because: "The opening question can close only after the match-then-price order is clear.",
      },
    ],
  };
}

function boardA(): YouTubeShortsStoryboard {
  return {
    storyArchitecture: architectureA(),
    estimatedTotalSeconds: 49,
    scenes: [
      scene(1, {
        purpose: "Plant the equivalent-amount question",
        narration:
          "These servings look cheaper, but are they actually equivalent amounts?",
        sceneDescription: "Two listings sit open with the declared amount line still unread.",
      }),
      scene(2, {
        purpose: "Show why serving counts can still mismatch",
        narration: "Matching serving counts does not prove the amounts match.",
      }),
      scene(3, {
        purpose: "Point to the declared amount line",
        narration: "Read the declared amount line on each label first.",
        sceneDescription: "Attention moves to the declared amount line.",
      }),
      scene(4, {
        purpose: "Explain the declared amount comparison",
        narration: "Compare those declared amounts before any price math.",
      }),
      scene(5, {
        purpose: "Keep teaching on that same label line",
        narration: "Stay with that label line instead of adding another subject.",
      }),
      scene(6, {
        purpose: "Reframe price as a later step",
        narration: "Price only becomes useful after the amounts match.",
      }),
      scene(7, {
        purpose: "Resolve with match-then-compare-price",
        narration: "Match the declared amount before comparing price.",
      }),
    ],
  };
}

function architectureB(): YouTubeShortsStoryArchitecture {
  return {
    storyPromise: "A faster delivery promise can still miss the date the buyer needs.",
    carrierMode: "single",
    primaryCarrier: "delivery date promise",
    comparisonCarriers: [],
    excludedCarriers: ["warehouse map"],
    viewerOpening: "The buyer is about to choose the option that says arrives sooner.",
    hookMechanism: "The sooner badge may not be the date that matters.",
    hookWhy: "This buyer is about to treat a sooner badge as the date that matters.",
    openingQuestion: "Does sooner actually meet the needed arrival date?",
    scene1Withholds: "How to check the promised arrival date.",
    payoff: "Check the promised arrival date before trusting sooner.",
    beats: [
      { sceneNumber: 1, job: "Plant the arrival-date question", because: "" },
      {
        sceneNumber: 2,
        job: "Show why a sooner badge can mislead",
        because: "The opening question stays open until the badge is shown incomplete.",
      },
      {
        sceneNumber: 3,
        job: "Point to the delivery date promise",
        because: "Once the badge fails, the viewer needs the promised date itself.",
      },
      {
        sceneNumber: 4,
        job: "Compare promised arrival against the need",
        because: "Seeing the promise is not enough until it is checked against the needed date.",
      },
      {
        sceneNumber: 5,
        job: "Keep the date promise as the carrier",
        because: "The check still has one more distinction to finish on the same carrier.",
      },
      {
        sceneNumber: 6,
        job: "Reframe sooner as a later check",
        because: "Sooner only becomes useful after the arrival date is known to fit.",
      },
      {
        sceneNumber: 7,
        job: "Resolve with date-before-sooner",
        because: "The opening question can close only after date-before-sooner is clear.",
      },
    ],
  };
}

function architectureC(): YouTubeShortsStoryArchitecture {
  return {
    storyPromise: "A short daily practice beats a long session the learner will abandon.",
    carrierMode: "single",
    primaryCarrier: "ten-minute daily practice",
    comparisonCarriers: [],
    excludedCarriers: ["weekend crash course"],
    viewerOpening: "The learner is about to block a long empty Saturday.",
    hookMechanism: "The long session feels serious but is the thing that gets skipped.",
    hookWhy:
      "This learner already trusts a long block more than a small daily one, so interrupting that habit opens the gap better than a generic motivation line.",
    openingQuestion: "Will that long Saturday session actually happen again next week?",
    scene1Withholds: "Why a short daily practice sticks.",
    payoff: "Keep the practice small enough to repeat tomorrow.",
    beats: [
      { sceneNumber: 1, job: "Interrupt the long-Saturday plan", because: "" },
      {
        sceneNumber: 2,
        job: "Show why the long block fades",
        because: "The opening stays open until the skipped-Saturday pattern is visible.",
      },
      {
        sceneNumber: 3,
        job: "Point to the ten-minute daily practice",
        because: "Once the long block fails, the viewer needs the smaller repeatable unit.",
      },
      {
        sceneNumber: 4,
        job: "Make the small practice feel sufficient",
        because: "Seeing the short slot is not enough until it feels like real progress.",
      },
      {
        sceneNumber: 5,
        job: "Keep teaching on that same daily slot",
        because: "The story still has one distinction left on the same practice.",
      },
      {
        sceneNumber: 6,
        job: "Reframe the long Saturday as optional",
        because: "The long block only helps after the daily practice already exists.",
      },
      {
        sceneNumber: 7,
        job: "Resolve with small-enough-to-repeat",
        because: "The opening can close only after the repeatable size is clear.",
      },
    ],
  };
}

function boardC(): YouTubeShortsStoryboard {
  return {
    storyArchitecture: architectureC(),
    estimatedTotalSeconds: 49,
    scenes: [
      scene(1, {
        purpose: "Interrupt the long-Saturday plan",
        narration: "You blocked Saturday. Will that long session happen again next week?",
        sceneDescription: "A calendar shows one long Saturday block and empty weekdays.",
      }),
      scene(2, {
        purpose: "Show why the long block fades",
        narration: "That long block looks serious, then life fills the day and it slips.",
      }),
      scene(3, {
        purpose: "Point to the ten-minute daily practice",
        narration: "Start with a ten-minute daily practice you can keep.",
        sceneDescription: "A short daily slot sits on an ordinary weekday morning.",
      }),
      scene(4, {
        purpose: "Make the small practice feel sufficient",
        narration: "Ten honest minutes still count as progress you can feel.",
      }),
      scene(5, {
        purpose: "Keep teaching on that same daily slot",
        narration: "Stay with that daily slot instead of hunting a bigger plan.",
      }),
      scene(6, {
        purpose: "Reframe the long Saturday as optional",
        narration: "A long Saturday can wait until the daily practice already exists.",
      }),
      scene(7, {
        purpose: "Resolve with small-enough-to-repeat",
        narration: "Keep the practice small enough to repeat tomorrow.",
        sceneDescription: "The same short daily practice is written again for tomorrow.",
      }),
    ],
  };
}

function boardB(): YouTubeShortsStoryboard {
  return {
    storyArchitecture: architectureB(),
    estimatedTotalSeconds: 49,
    scenes: [
      scene(1, {
        purpose: "Plant the arrival-date question",
        narration: "It says sooner — but does that meet the needed arrival date?",
        sceneDescription: "A checkout screen highlights a sooner badge beside the delivery date promise.",
      }),
      scene(2, {
        purpose: "Show why a sooner badge can mislead",
        narration: "A sooner badge can hide a date that still misses the need.",
      }),
      scene(3, {
        purpose: "Point to the delivery date promise",
        narration: "Read the delivery date promise itself, not the badge.",
        sceneDescription: "Attention moves to the delivery date promise.",
      }),
      scene(4, {
        purpose: "Compare promised arrival against the need",
        narration: "Compare that promised arrival against the date you actually need.",
      }),
      scene(5, {
        purpose: "Keep the date promise as the carrier",
        narration: "Stay with the date promise instead of opening another subject.",
      }),
      scene(6, {
        purpose: "Reframe sooner as a later check",
        narration: "Sooner is useful only after the arrival date is right.",
      }),
      scene(7, {
        purpose: "Resolve with date-before-sooner",
        narration: "Check the promised arrival date before trusting sooner.",
      }),
    ],
  };
}

describe("storyboard semantic validation", () => {
  it("accepts three materially different locked stories", () => {
    expect(validateGeneratedStoryboard(boardA())).toEqual([]);
    expect(validateGeneratedStoryboard(boardB())).toEqual([]);
    expect(validateGeneratedStoryboard(boardC())).toEqual([]);
    expect(boardA().storyArchitecture?.primaryCarrier).not.toBe(
      boardB().storyArchitecture?.primaryCarrier,
    );
    expect(boardA().storyArchitecture?.primaryCarrier).not.toBe(
      boardC().storyArchitecture?.primaryCarrier,
    );
    expect(boardB().storyArchitecture?.primaryCarrier).not.toBe(
      boardC().storyArchitecture?.primaryCarrier,
    );
    expect(boardA().storyArchitecture?.hookMechanism).not.toBe(
      boardB().storyArchitecture?.hookMechanism,
    );
    expect(boardA().storyArchitecture?.hookMechanism).not.toBe(
      boardC().storyArchitecture?.hookMechanism,
    );
    expect(boardA().storyArchitecture?.payoff).not.toBe(
      boardC().storyArchitecture?.payoff,
    );
    expect(boardA().storyArchitecture?.beats[2]?.job).not.toBe(
      boardC().storyArchitecture?.beats[2]?.job,
    );
    expect(boardA().scenes[0]?.storyRole).toBe("role-1");
  });

  it("rejects a missing lock, a delayed carrier, and a sibling hijack", () => {
    expect(
      validateStoryboardSemantics({
        estimatedTotalSeconds: 49,
        scenes: boardA().scenes,
      }),
    ).toContain("storyArchitecture is required for a new storyboard.");

    const delayed = boardA();
    delayed.scenes[0] = scene(1, {
      purpose: "Plant the equivalent-amount question",
      narration: "These servings look cheaper, but are they actually equivalent amounts?",
      sceneDescription: "Two listings sit open.",
    });
    delayed.scenes[2] = scene(3, {
      purpose: "Point to the next checklist item",
      narration: "Look at another field on the listing.",
    });
    expect(validateStoryboardSemantics(delayed)).toContain(
      "primaryCarrier must be grounded in scenes 1–3 (distinctive words, not a delayed example).",
    );

    const paraphrased = boardA();
    paraphrased.scenes[0] = scene(1, {
      purpose: "Plant the equivalent-amount question",
      narration:
        "These servings look cheaper, but are they actually equivalent amounts?",
      sceneDescription: "Two listings sit open.",
    });
    paraphrased.scenes[2] = scene(3, {
      purpose: "Point to the declared amount line",
      narration: "Read the declared amount on each label first.",
      sceneDescription: "Attention moves to the amount on the label.",
    });
    expect(validateStoryboardSemantics(paraphrased)).toEqual([]);

    const hijack = boardA();
    hijack.scenes[5] = scene(6, {
      purpose: "Reframe price as a later step",
      narration: "The second catalog variant shows the same rule again.",
    });
    expect(validateStoryboardSemantics(hijack)).toContain(
      "An excludedCarrier appears in a later scene purpose, narration, or on-screen text.",
    );
  });

  it("rejects empty because on scenes 2–7", () => {
    const missing = boardA();
    if (!missing.storyArchitecture) return;
    missing.storyArchitecture.beats[2] = {
      ...missing.storyArchitecture.beats[2]!,
      because: "   ",
    };
    expect(validateStoryboardSemantics(missing)).toContain(
      "storyArchitecture.beats[3].because must be nonempty for scenes 2–7.",
    );
  });

  it("rejects narration that copies five consecutive Atom words", () => {
    const copied = boardA();
    copied.scenes[1] = scene(2, {
      purpose: "Show why serving counts can still mismatch",
      narration:
        "A serving is a label-defined unit, not proof the amounts match.",
    });
    const issues = validateStoryboardSemantics(copied, {
      tension:
        "A serving is a label-defined unit, not proof that the amount being compared is equivalent.",
      desiredTakeaway: "Match both the serving definition and the declared amount.",
      decisionQuestion:
        "Which product dimensions must be equivalent before price becomes meaningful?",
    });
    const hit = issues.find((issue) =>
      issue.startsWith("scenes[2].narration copies tension"),
    );
    expect(hit).toBeDefined();
    expect(hit).toMatch(/\("[^"]+" from "[^"]+"\)/);
  });

  it("names the copied gram against the frozen tension and lets a translated Scene 4 pass", () => {
    const frozenTension =
      "A serving is a label-defined unit, not proof that the amount being compared is equivalent; mineral labels add another source of confusion because they report elemental amounts rather than the total weight of the ingredient compound.";

    const recited = boardA();
    recited.scenes[3] = scene(4, {
      purpose: "Explain the declared amount comparison",
      narration: "A serving is a label-defined unit, not the amount you get.",
    });
    const recitedIssues = validateStoryboardSemantics(recited, {
      tension: frozenTension,
    });
    const recitedHit = recitedIssues.find((issue) =>
      issue.startsWith("scenes[4].narration copies tension"),
    );
    expect(recitedHit).toBeDefined();
    expect(recitedHit).toMatch(/\("[^"]+" from "[^"]+"\)/);
    expect(recitedHit).toMatch(/a serving is a label/);

    const translated = boardA();
    translated.scenes[3] = scene(4, {
      purpose: "Explain the declared amount comparison",
      narration:
        "If one serving gives a different amount, price per serving can mislead.",
    });
    expect(
      validateStoryboardSemantics(translated, { tension: frozenTension }),
    ).toEqual([]);
  });

  it("rejects narration over 22 words and over 2 sentences", () => {
    const long = boardA();
    long.scenes[1] = scene(2, {
      purpose: "Show why serving counts can still mismatch",
      narration:
        "Matching serving counts does not prove the amounts match, and that is why you still have to keep reading past the first number you notice on the listing.",
    });
    expect(validateStoryboardSemantics(long)).toContain(
      "scenes[2].narration exceeds 22 words.",
    );

    const many = boardA();
    many.scenes[1] = scene(2, {
      purpose: "Show why serving counts can still mismatch",
      narration: "Counts can match. Amounts can still differ. That is the trap.",
    });
    expect(validateStoryboardSemantics(many)).toContain(
      "scenes[2].narration exceeds 2 sentences.",
    );

    const ok = boardA();
    ok.scenes[1] = scene(2, {
      purpose: "Show why serving counts can still mismatch",
      narration: "A matching serving count can still hide a different amount.",
    });
    expect(validateStoryboardSemantics(ok)).toEqual([]);
  });

  it("rejects a drifted Scene 7 that shares no token with Scene 1 or the carrier", () => {
    const drifted = boardA();
    drifted.scenes[6] = scene(7, {
      purpose: "Resolve with match-then-compare-price",
      narration: "Sleep earlier and drink more water tomorrow.",
      sceneDescription: "Match the declared amount before comparing price.",
    });
    expect(validateStoryboardSemantics(drifted)).toContain(
      "scenes[7].narration must share a content token with scenes[1].narration or primaryCarrier.",
    );
  });

  it("rejects ordinal checklist jobs and allows a turning-point job", () => {
    const checklist = boardA();
    if (!checklist.storyArchitecture) return;
    checklist.storyArchitecture.beats[1] = {
      ...checklist.storyArchitecture.beats[1]!,
      job: "second match",
    };
    checklist.scenes[1] = scene(2, {
      purpose: "Reveal the second match on the listing",
      narration: "A matching serving count can still hide a different amount.",
    });
    expect(validateStoryboardSemantics(checklist)).toContain(
      "storyArchitecture.beats[2].job is an ordinal checklist label.",
    );

    const turning = boardA();
    if (!turning.storyArchitecture) return;
    turning.storyArchitecture.beats[3] = {
      ...turning.storyArchitecture.beats[3]!,
      job: "define the turning point",
    };
    turning.scenes[3] = scene(4, {
      purpose: "define the turning point for the comparison",
      narration: "Compare those declared amounts before any price math.",
    });
    expect(validateStoryboardSemantics(turning)).toEqual([]);
  });

  it("rejects distinctive long-field copies in narration and onScreenText", () => {
    const copied = boardA();
    copied.scenes[3] = scene(4, {
      purpose: "Explain the declared amount comparison",
      narration: "First match the serving definition before any price math.",
    });
    const copiedIssues = validateStoryboardSemantics(copied, {
      premise:
        "Shoppers should first match the serving definition before any price math starts happening.",
    });
    expect(
      copiedIssues.some((issue) =>
        issue.startsWith("scenes[4].narration copies premise"),
      ),
    ).toBe(true);

    const overlay = boardA();
    overlay.scenes[3] = scene(4, {
      purpose: "Explain the declared amount comparison",
      narration: "Compare those declared amounts before any price math.",
      onScreenText: "First match the serving definition before any price math.",
    });
    const overlayIssues = validateStoryboardSemantics(overlay, {
      supportingInsights: [
        "Shoppers should first match the serving definition before any price math starts happening.",
      ],
    });
    expect(
      overlayIssues.some((issue) =>
        issue.startsWith("scenes[4].onScreenText copies supportingInsights"),
      ),
    ).toBe(true);
  });

  it("does not treat a stopword 5-gram as a distinctive long-field copy", () => {
    const board = boardA();
    board.scenes[3] = scene(4, {
      purpose: "Explain the declared amount comparison",
      narration: "This is not the same as that one.",
    });
    expect(
      validateStoryboardSemantics(board, {
        premise: "This is not the same as that one in the set.",
      }),
    ).toEqual([]);
  });

  it("satisfies Scene 1 overlap from purpose and sceneDescription without narration echo", () => {
    const spoken = boardA();
    spoken.scenes[0] = scene(1, {
      purpose: "Plant the equivalent-amount question",
      narration: "Two listings sit on your shortlist. One looks cheaper.",
      sceneDescription: "Two listings sit open with the declared amount line still unread.",
    });
    expect(validateStoryboardSemantics(spoken)).toEqual([]);
  });

  it("skips overlap when the architecture source has no content tokens", () => {
    const thin = boardA();
    if (!thin.storyArchitecture) return;
    thin.storyArchitecture.openingQuestion = "Is it so?";
    expect(validateStoryboardSemantics(thin)).toEqual([]);
  });

  it("rejects a content-token bigram repeated across 3+ narrations and names the scenes", () => {
    const echoed = boardA();
    echoed.scenes[2] = scene(3, {
      purpose: "Point to the declared amount line",
      narration: "Read the serving definition on each label first.",
      sceneDescription: "Attention moves to the declared amount line.",
    });
    echoed.scenes[3] = scene(4, {
      purpose: "Explain the declared amount comparison",
      narration: "Check the serving definition before any price math.",
    });
    echoed.scenes[5] = scene(6, {
      purpose: "Reframe price as a later step",
      narration: "Price waits until the serving definition matches.",
    });
    expect(validateStoryboardSemantics(echoed)).toContain(
      'narration repeats the phrase "serving definition" across scenes 3, 4, 6 — rename it in viewer language.',
    );
  });

  it("allows the same content-token bigram in only two narrations", () => {
    const twice = boardA();
    twice.scenes[2] = scene(3, {
      purpose: "Point to the declared amount line",
      narration: "Read the serving definition on each label first.",
      sceneDescription: "Attention moves to the declared amount line.",
    });
    twice.scenes[3] = scene(4, {
      purpose: "Explain the declared amount comparison",
      narration: "Check the serving definition before any price math.",
    });
    expect(validateStoryboardSemantics(twice)).toEqual([]);
  });

  it("exempts a repeated bigram that uses a primaryCarrier content token", () => {
    const carrierEcho = boardA();
    carrierEcho.scenes[3] = scene(4, {
      purpose: "Explain the declared amount comparison",
      narration: "Compare the declared amount before any price math.",
    });
    carrierEcho.scenes[5] = scene(6, {
      purpose: "Reframe price as a later step",
      narration: "Price waits until the declared amount matches.",
    });
    expect(validateStoryboardSemantics(carrierEcho)).toEqual([]);
  });
});
