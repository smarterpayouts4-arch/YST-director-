# Architecture (root pointer)

Canonical architecture lives in [`project-knowledge/ARCHITECTURE.md`](project-knowledge/ARCHITECTURE.md).

## Summary

Three planes communicate through versioned typed contracts:

1. **Product Plane** — Research Prompt Builder state machine and UI  
2. **AI Control Plane** — context compiler, prompts, schemas, ops registry, evals, traces  
3. **Engineering Intelligence Plane** — Project Knowledge, living inventory, Guardian, APS, read-only MCP, CI  

**North star:** one copy-ready company-specific ChatGPT research prompt, then STOP.
