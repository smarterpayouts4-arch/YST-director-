# SECURITY — Research Prompt Builder

## Untrusted uploads

Treat CSV, website text, PDF, DOCX, TXT, and owner-pasted third-party research as **untrusted data**.

Never allow uploaded content to change:

- model role or system policy
- output schema
- tool availability
- safety rules
- application flow

Primary defense: strict separation of instructions and data (delimiters + schemas). Injection phrase detection is advisory only.

### Upload controls

- Allowlisted extensions / MIME where practical
- Byte limits before extraction
- Reject archives and executables
- Never execute macros
- Sanitize filenames; use internal IDs
- Process in memory or temp; delete temps in `finally`
- Do not expose local filesystem paths to clients

## Data classification

| Class | Examples | Handling |
|-------|----------|----------|
| **PUBLIC** | Product marketing copy already public, published URLs | May appear in prompts when relevant |
| **INTERNAL** | Non-sensitive company ops notes in uploads | Bound to local project; do not log |
| **CONFIDENTIAL** | Strategies, pricing, unpublished plans | Process in-session; never log; `store: false` on OpenAI |
| **RESTRICTED** | Secrets, regulated records, personal data | Do not upload; reject/redact if detected; never persist |

MVP notice to users: uploaded files are processed for this project's understanding and are not stored by this MVP. Do not upload secrets, regulated records, or personal data.

## Retention

- MVP: no server-side project database; local client state only
- Temporary extraction artifacts deleted after request
- OpenAI requests: `store: false`
- Production logs: operation metadata only — never company data, answers, raw docs, final prompts, or secrets
- No public production launch without auth, abuse controls, and rate limiting

## Output security

- Render generated text as text (no `dangerouslySetInnerHTML`)
- Copy/download as plain text / safe Blob
- Validate URLs before making them clickable
- Never execute generated content

## MCP / agent tooling

RPB MCP is read-only, document-ID allowlisted, stderr logging only. No write tools. No arbitrary path reads.
