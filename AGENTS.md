# AGENTS.md

Operational instructions for AI contributors on the ECYTV Tools project.

## Commands

| Action          | Command              |
| --------------- | -------------------- |
| Install         | `pnpm install`       |
| Dev server      | `pnpm dev`           |
| Test (watch)    | `pnpm test`          |
| Test + coverage | `pnpm test:coverage` |
| Lint            | `pnpm lint`          |
| Format          | `pnpm format`        |

## Stack

- **Language**: Vanilla JavaScript (ES6+ modules, no framework)
- **Styles**: CSS3 with custom properties (light/dark theme)
- **Runtime**: Browser — static HTML, no build step
- **Testing**: Vitest + jsdom
- **Quality**: ESLint (flat config), Prettier

## Architecture

### SPA Routing

Hash-based routing via `js/router.js`:

- `#info` → info section (default)
- `#tools` → tools catalog
- `#formats` → form generators
- `#docs` → documentation
- `#qa` → FAQ

### Form System (F1–F4)

Each form (`js/forms/f{N}/`) follows a consistent pattern:

- `f{N}-config.js` — field definitions, layout config
- `f{N}-data.js` — data model, defaults, serialization
- `f{N}-form.js` — form builder + event handlers
- `f{N}-history.js` — undo/redo stack per form
- `f{N}-io.js` — import/export (JSON)
- `f{N}-pdf.js` — PDF generation
- `f{N}-xlsx.js` / `f{N}-ods.js` — spreadsheet export (F1 only)

Shared form utilities in `js/forms/common/`: dom.js, dropdown.js, form-factory.js, validation.js, history.js, io-config.js, esc-html.js.

### Data Layer

Static JS modules in `data/` exporting arrays/objects consumed by renderers. No API calls, no backend.

### Tools Catalog

`js/components/tools/`:

- `tools-filters.js` — filter logic (category, level, platform, price)
- `tools-filter-bar.js` — filter bar UI
- `tools-renderer.js` — grid renderer
- `tools-card.js` — individual tool card
- `tools-favorites.js` — localStorage favorites

## Rules

1. Never edit migration files manually
2. Use `pnpm`, not `npm`
3. Run `pnpm test` before committing
4. Keep files under 300 LOC
5. Add tests for new behavior
6. Prefer small, focused commits
7. Use ES module syntax (`export` / `import`) — no CommonJS
8. No default exports in shared modules (exceptions: singleton instances like `Router`)

## Code Quality

- Run `pnpm test` after each modification
- Maintain coverage thresholds (statements ≥75%, branches ≥80%, functions ≥75%, lines ≥70%)
- Run `pnpm lint` and `pnpm format` before commits

## Common Tasks

### Add a tool to the catalog

1. Add entry to `data/tools.js`
2. Verify rendering in the tools grid
3. Add filter support if introducing a new category

### Add a new form type (F5)

1. Create `js/forms/f5/` with config, data, form, history, io, pdf modules
2. Create `test/forms/f5/` with corresponding tests
3. Register in the formats renderer

### Add a test

1. Mirror the source path under `test/`
2. Use Vitest + jsdom
3. Import the module under test
4. Cover at least the main branches and edge cases
