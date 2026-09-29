<p align="center">
  <img src="assets/logo.svg" width="96" height="96" alt="KeyStash Logo" />
</p>

<h1 align="center">KeyStash</h1>

<p align="center">
  <strong>Minimalist, self-hosted API token and secret vault built for homelab & NAS.</strong><br>
  Zero telemetry &bull; Single Docker container &bull; AES-256-GCM encrypted &bull; Instant one-click copy &bull; English &bull; Français &bull; Español &bull; Deutsch
</p>

---

## 1. Overview

**KeyStash** was created to solve a simple homelab frustration: API keys, tokens, and personal credentials scattered across multiple `.env` files, notes, and dashboards. 

KeyStash is **not** an enterprise secrets engine like HashiCorp Vault or Infisical. It does not have billing, enterprise permissions, complicated teams, or noisy dashboards. Instead, it is an ultra-fast, calm personal vault designed around a single interaction:

> **Open &rarr; Search with 2 keystrokes &rarr; Find key &rarr; Click Copy &rarr; Done.**

## 2. Product preview

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│  ⬡ KeyStash  8 secrets                              EN   ☀   🔒  + New secret │
│                                                                              │
│  ⌕  Search secrets, categories, tags or notes                   /   Ctrl K   │
│                                                                              │
│  All 8    AI 2    Development 3    Infrastructure 2    Media 1               │
│                                                                              │
│  Forgejo  Development                            fgo••••••••1a0b  👁  Copy  ⋯ │
│  Self-hosted git server access token                                        │
│  #self-hosted #git                                                          │
│  ──────────────────────────────────────────────────────────────────────────  │
│  Cloudflare  Infrastructure                    clf••••••••9876  👁  Copy  ⋯ │
│  Global API token with DNS Edit Zone permissions                            │
│  #dns #zones                                                                 │
│  ──────────────────────────────────────────────────────────────────────────  │
│  Anthropic  AI                               sk-ant-••••••••6789  👁  Copy  ⋯ │
│  API key with Claude 3.7 Sonnet access                                      │
│  #production #claude-3-7                                                    │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 3. Highlights

- **Instant zero-latency copy**: Copy your token to clipboard in 1 click with instantaneous visual confirmation.
- **Fast keyboard navigation**: Focus search with `/` or `Ctrl+K` (`Cmd+K`), close panels with `Escape`, create with `N`, navigate rows with arrow keys and copy with `Enter`.
- **Calm, distraction-free UI**: Inspired by the serene aesthetics of Linear, Raycast, and 1Password. Polished graphite dark mode and crisp light mode, both meeting WCAG AA contrast.
- **Reveal on demand**: Values stay masked until you explicitly reveal them, then re-mask automatically after 15 seconds.
- **Accessible by construction**: Full keyboard reach, visible focus rings, semantic landmarks, screen-reader labels on every control, and reduced-motion support.
- **Encrypted at rest**: Secrets encrypted with **AES-256-GCM**. Encryption master key strictly separated from the SQLite database.
- **Argon2id authentication**: Local master password hashing with rate-limited login protection.
- **Zero cloud dependencies**: Runs 100% locally on your NAS or server with SQLite in WAL mode.
- **LAN-ready**: Works directly over HTTP (`http://<nas-ip>:2509`) or Tailscale without certificate headaches.
- **Multilingual (i18n)**: English (default), Français, Español, and Deutsch.

## 4. Quick start

Deploy KeyStash with Docker Compose in seconds:

```yaml
# docker-compose.yml
services:
  keystash:
    image: ghcr.io/lucas-lepajollec/keystash:latest
    ports:
      - "2509:2509"
    volumes:
      - ./data:/app/data
    security_opt:
      - no-new-privileges:true
    restart: unless-stopped
```

Start the container:

```bash
docker compose up -d
```

Open `http://<your-nas-or-server-ip>:2509` in your browser and set your master password on first launch.

## 5. Configuration and persistence

KeyStash is zero-configuration by default. All data is persisted in the `./data` directory mounted into `/app/data`:

| Path | Purpose |
| --- | --- |
| `./data/keystash.db` | SQLite database storing config, session tokens, and encrypted secrets |
| `./data/master.key` | Auto-generated 256-bit AES encryption key (file permissions `0600`) |

### Optional Environment Variables

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `2509` | HTTP listener port inside the container |
| `KEYSTASH_MASTER_KEY` | *(read from file)* | Optional 64-character hex key override for master encryption |
| `KEYSTASH_DATA_DIR` | `/app/data` (or `./data` in dev) | Path to persistent storage directory |

## 6. Security, privacy, and limitations

- **AES-256-GCM**: Each secret is encrypted with an isolated 12-byte initialization vector (IV) and a 16-byte authentication tag. Ciphertext cannot be tampered with undetected.
- **Key Separation**: The master encryption key is never written inside `keystash.db`.
- **Masked Previews**: Values are never revealed unmasked in list views unless explicitly toggled by the user.
- **Rate Limiting**: Brute-force protection limits failed login attempts from client IPs.
- **Scope & Limitations**: KeyStash is a personal single-user vault. It intentionally omits team RBAC, multi-tenant billing, automated cloud rotations, and webhook integrations.

## 7. Architecture

KeyStash is packaged as a lean single-container service:

```text
[ Browser / Client ]
        │  (HTTP / LAN / Tailscale)
        ▼
[ KeyStash Container (Node 22 / Next.js 16) ]
  ├── Client State (Instant Search, Decrypted Vault in Memory)
  ├── Route Handlers (/api/secrets, /api/auth, /api/health)
  ├── Argon2id Password Verifier
  └── AES-256-GCM Engine
        │
        ├── Reads Key:   /app/data/master.key (0600)
        └── Writes DB:   /app/data/keystash.db (SQLite WAL)
```

## 8. Development and quality

```bash
# Clone the repository
git clone https://github.com/lucas-lepajollec/keystash.git
cd keystash

# Install dependencies
npm ci

# Start local development server (http://127.0.0.1:2499)
npm run dev

# Start development server accessible over LAN (http://0.0.0.0:2499)
npm run dev:lan

# Run automated tests
npm run test

# Run full quality check (lint, typecheck, tests, build)
npm run check
```

## 9. Local deployment

To build from source on your local machine or NAS:

```bash
docker compose -f docker-compose.yml -f docker-compose.build.yml up -d --build
```

Access KeyStash on `http://127.0.0.1:2509` or `http://<server-ip>:2509`.

## 10. Documentation and community

- **Bug Reports**: Open an issue on [GitHub Issues](https://github.com/lucas-lepajollec/keystash/issues).
- **Security Inquiries**: See [SECURITY.md](SECURITY.md).
- **Contribution Guide**: See [CONTRIBUTING.md](CONTRIBUTING.md).
- **License**: Released under the [MIT License](LICENSE).
