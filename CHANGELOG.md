# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-09-28

### Added
- First public release of KeyStash.
- AES-256-GCM encryption at rest with separate auto-generated master key.
- Argon2id master password authentication and session management.
- Instant search (`/` or `Ctrl+K`) and zero-latency single-click copy.
- Masked secret previews with temporary reveal/hide toggle.
- Category filters (AI, Development, Infrastructure, Finance, Other, and custom) and tags.
- Quad-lingual UI supporting English (default), French, Spanish, and German.
- Single-container Docker deployment with persistent SQLite storage and ADR 0008 port mapping (`2509:2509`).
- Complete test suite, type checking, and reproducible build pipeline.
