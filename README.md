# ECYTV Tools

Herramientas centralizadas para los estudiantes de la Escuela de Cine y TV de la Universidad Nacional (ECYTV).

## Stack

- **Frontend**: HTML5, CSS3 (custom properties), Vanilla JS (ES6+ modules)
- **Testing**: Vitest + jsdom
- **Quality**: ESLint, Prettier
- **Runtime**: Static site — no build step, no framework

## Features

| Section   | Description                                                                                                                               |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Tools** | Catalog of 50+ tools (Edición, Diseño, Audio, 3D, VFX, Producción, Screenplay, Videojuegos, Encoders) with search, filters, and favorites |
| **Forms** | F1–F4 format generators with PDF/XLSX/ODS export                                                                                          |
| **Info**  | Space request forms, studio schedules (TV, Animation, Cinematography)                                                                     |
| **Docs**  | Camera manuals, technical guides, reference docs                                                                                          |
| **FAQ**   | Frequently asked questions                                                                                                                |

## Directory Structure

```
ecytv-tools/
├── index.html            # SPA entry point with hash-based routing
├── css/                  # Stylesheets
│   ├── main.css          # Base layout and reset
│   ├── tools.css         # Tools catalog styles
│   ├── ui.css            # UI components (cards, buttons, filters)
│   └── variables.css     # CSS custom properties (theming)
├── js/
│   ├── app.js            # App bootstrap — initialises all modules
│   ├── router.js         # Hash-based SPA router
│   ├── ui.js             # Shared UI helpers (theme toggle, hamburger)
│   ├── components/       # View renderers
│   │   ├── formats-renderer.js
│   │   ├── info-renderer.js
│   │   ├── docs/         # Docs filters + renderer
│   │   ├── qa/           # FAQ renderer + template
│   │   └── tools/        # Tools catalog (card, filters, favorites, renderer)
│   ├── forms/            # Form generators (F1–F4)
│   │   ├── common/       # Shared form logic (DOM, dropdown, factory, validation, history, IO)
│   │   ├── f1/ … f4/     # Per-form config, data, form, history, IO, PDF, XLSX, ODS
│   └── utils/            # Utilities (constants, hamburger, theme)
├── data/                 # Static data files (tools, docs, formats, info-cards, QA)
├── test/                 # Test suite (mirrors js/ structure)
├── assets/               # Favicon, tool icons (SVG)
└── coverage/             # Generated test coverage reports
```

## Run

```bash
pnpm install
pnpm dev
```

Opens at `http://localhost:8000`.

## Test

```bash
pnpm test          # Run tests (Vitest watch)
pnpm test:coverage # Run tests with coverage report
```

## Lint & Format

```bash
pnpm lint          # ESLint
pnpm format        # Prettier
```

## Deploy

Static site — deploy to any static host (GitHub Pages, Vercel, Netlify, Railway).

```bash
# Example: deploy to GitHub Pages
git push origin main
# Enable GitHub Pages from root / main branch in repo settings
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## AI Contributors

See [AGENTS.md](AGENTS.md) for operational instructions when working on this repo autonomously.
