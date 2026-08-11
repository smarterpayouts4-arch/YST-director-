---
id: test-and-verify
version: 1.1.0
title: Test and Verify
---

# Test and Verify

Choose and run appropriate verification against IntentContract acceptance criteria; label evidence honestly.

1. Compile or reuse IntentContract with `taskType: verify`.
2. Suggested ladder: lint → typecheck → unit tests → knowledge:check → mcp:test → build.
3. Mock OpenAI in automated tests.
4. Report correction-cost signals if the developer had to restate intent or expand scope.
