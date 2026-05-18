# Architecture

## Overview

ECYTV Tools is a static single-page application (SPA). There is no backend, no build step, and no framework. All logic runs in the browser using ES6 modules.

## Routing

The app uses hash-based routing (`window.location.hash`). The `Router` class in `js/router.js` maps hash fragments to DOM sections:

| Route      | Section            | Renderer          |
| ---------- | ------------------ | ----------------- |
| `#info`    | `#info-section`    | `InfoRenderer`    |
| `#tools`   | `#tools-section`   | Tools catalog     |
| `#formats` | `#formats-section` | `FormatsRenderer` |
| `#docs`    | `#docs-section`    | `DocsRenderer`    |
| `#qa`      | `#qa-section`      | `QARenderer`      |

Each section is a `<section>` in `index.html`. Only the active section has class `active`.

## Bootstrap Flow

1. `index.html` loads `js/ui.js` (synchronous) and `js/app.js` (module)
2. `js/app.js` imports and initialises all modules
3. Router starts listening for `hashchange`

## Data Layer

Data lives in static `.js` modules under `data/`:

- `tools.js` — tool catalog entries
- `formats.js` — format definitions
- `docs.js` — document metadata
- `info-cards.js` — info section cards
- `qa.js` — FAQ entries

Data is imported directly by renderers. No fetch calls, no API.

## Form System

Forms (F1–F4) follow a modular architecture in `js/forms/f{N}/`:

```
f{N}/
├── f{N}-config.js    # Field definitions and layout
├── f{N}-data.js      # Default values and serialization
├── f{N}-form.js      # DOM building and event binding
├── f{N}-history.js   # Undo/redo (command pattern)
├── f{N}-io.js        # JSON import/export
└── f{N}-pdf.js       # PDF generation (html2pdf.js wrapper)
```

Shared utilities live in `js/forms/common/`:

- `dom.js` — element creation helpers
- `dropdown.js` — custom dropdown component
- `form-factory.js` — form builder factory
- `validation.js` — field validation
- `history.js` — base history class
- `io-config.js` — IO configuration helpers
- `esc-html.js` — HTML escaping

## Theming

CSS custom properties in `css/variables.css` define light and dark themes. The `ThemeManager` in `js/utils/theme.js` toggles a `data-theme` attribute on `<html>`.

## Testing

Tests use Vitest + jsdom under `test/`, mirroring the source tree. Each module should have a corresponding test file covering main branches and edge cases. Coverage thresholds are enforced in `vitest.config.mjs`.

## Key Design Decisions

- **No framework**: Keeps the bundle small and zero-dependency. The project is simple enough that vanilla JS is clearer than a framework.
- **Hash routing**: No server config needed. Works with any static host.
- **Static data**: No backend means instant loading and easy hosting. Data updates are git-based.
- **ES6 modules without bundler**: Modern browsers support `import` natively. Saves build complexity.
