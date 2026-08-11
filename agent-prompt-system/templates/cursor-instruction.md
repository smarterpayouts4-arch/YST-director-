# Cursor instruction render (boring on purpose)

Emit this block after compiling the IntentContract. Do not add personas, chain-of-thought commandments, or copies of repository doctrine.

```text
APS INTENT CONTRACT

Goal:
<goal>

Task:
<taskType>

Scope:
In:
- <paths / stages>
Out:
- <explicit non-goals>

Constraints:
- <must remain true>

Project evidence:
- <real paths / symbols / tests / rules / specs>

User decisions:
- <from original request and/or clarification>
(or: none)

Acceptance:
- <observable conditions>

Unresolved:
<material items, or: none>

Instruction:
Investigate the relevant code first. Follow project rules and existing
patterns. Implement the smallest coherent change satisfying the criteria.
Verify with the project's existing checks.
```

Notes:

- No Assumptions section — material inferences go under Unresolved; verifiable ones stay internal.
- Keep prose short. Precision over ambition.
