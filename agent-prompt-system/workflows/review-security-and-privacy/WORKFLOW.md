---
id: review-security-and-privacy
version: 1.1.0
title: Review Security and Privacy
---

# Review Security and Privacy

Check secrets, untrusted uploads, data classification, logging, and MCP write bans.

1. Compile IntentContract with `taskType: security`.
2. Read SECURITY.md via pointer; confirm no arbitrary-path MCP tools and no secret logging.
3. Discovery first from SECURITY + code; ask only for true owner security decisions.
4. End with findings + acceptanceCriteria for any follow-on hardening.
