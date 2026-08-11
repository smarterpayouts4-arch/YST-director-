# Design working files (advisory)

Owner mockups and fixtures for UI work. Not product truth — implement against live `src/` and approve canon in `project-knowledge/` when a screen ships.

| File | Use |
|------|-----|
| `understanding-target-cards.png` | Historical side-by-side card mock (superseded) |
| `understanding-current-annotated.png` | Annotated pain: scroll, redundancy |
| `interview-target-reference.png` | Interview visual reference (suggested answer / upload tabs) |
| `../fixtures/zynava-company.csv` | Approved ZYNAVA sample company CSV |

## Live target — company understanding (Step 2)

**Sequential strategy confirmation (one section open at a time):**

1. Heading: “Confirm strategy facts”
2. Only one of five sections expanded; completing it opens the next
3. Sections: Who we’re helping… · What your company does and offers · Where to focus… · Why people should trust you · Off-limits & other guidance
4. Layout: compact step list on the left (hugs content) + one open panel on the right
5. Actions: Looks right · Edit · optional other guidance on section 5 only
6. Progress: `N of 5 reviewed` inside the section nav
7. Primary CTA: “Everything looks right — continue” (unlocked after all five sections)

Implemented in `src/features/research-prompt-builder/components/company-understanding.tsx`.
