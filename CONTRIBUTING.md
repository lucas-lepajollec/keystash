# Contributing to KeyStash

Thank you for your interest in contributing to KeyStash! KeyStash is designed to remain minimalist, fast, and free of unnecessary enterprise complexity.

## Development Setup

```bash
# Clone the repository
git clone https://github.com/lucas-lepajollec/keystash.git
cd keystash

# Install dependencies
npm ci

# Start the development server (http://127.0.0.1:2499)
npm run dev

# Run for LAN access
npm run dev:lan
```

## Quality and Verification

Before submitting a pull request, ensure all checks pass:

```bash
# Run lint, typecheck, unit tests, and production build
npm run check
```

## Pull Request Guidelines

- Keep pull requests focused on a single feature or bugfix.
- Maintain the calm, distraction-free aesthetic (no bloated dashboards or unnecessary dependencies).
- Ensure any added strings are translated across all 4 supported languages (`en`, `fr`, `es`, `de`).
