# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1.0 | :x:                |

## Cryptographic Design

- **Encryption at rest**: Secrets are encrypted using standard **AES-256-GCM** via Node.js native cryptographic primitives (`node:crypto`). Each secret is encrypted with a unique 12-byte random initialization vector (IV) and a 16-byte authentication tag.
- **Master Key**: The encryption key is strictly separated from the SQLite database. A cryptographically random 256-bit key is automatically generated on first boot in `data/master.key` with restricted `0600` permissions, or provided via the `KEYSTASH_MASTER_KEY` environment variable.
- **Authentication**: Local authentication uses **Argon2id** password hashing. Login requests are rate-limited on the LAN to mitigate brute-force attempts.
- **Network Boundaries**: KeyStash does not force HTTPS, allowing deployment on home networks, VPNs, and Tailscale without certificate setup. If exposed to the internet, run KeyStash behind a TLS-terminating reverse proxy.

## Reporting a Vulnerability

Please do not report security vulnerabilities via public GitHub issues. Instead, report security issues privately through GitHub's Security Advisories tab or contact `security@lucaslepajollec.com`.
