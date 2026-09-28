# KeyStash Maintainer & Agent Instructions

KeyStash is a minimalist, personal self-hosted secret vault for API keys and tokens.
It runs as a single Docker container with SQLite and persistent volumes.

## High-risk boundaries
- **Crypto**: Never store unencrypted secrets in SQLite. Always use AES-256-GCM with separate IV and tag. Never modify crypto primitives without running `tests/crypto.test.ts`.
- **Master Key**: Kept separated from `keystash.db`. Auto-generated in `data/master.key` with `0600` permissions.
- **LAN HTTP Support**: Cookies must support `SameSite: Lax` and `HttpOnly` without forcing HTTPS so `http://<nas-ip>:2509` works out of the box.
- **Ports**: Dev server is `2499`, production Docker port is `2509:2509` (ADR 0008).
- **i18n**: All UI text must be defined in the 4 supported languages (`en`, `fr`, `es`, `de`).

## Verification commands
```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run check
```

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
