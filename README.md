# Dead Pixel Tester

A web-based display diagnostics tool built with **NestJS**. It detects your screen's hardware capabilities directly in the browser and runs a guided dead pixel test across 8 solid-colour screens. Results are stored via a REST API and can be exported as a formatted PDF report.

---

## Features

### Display Detection
Collects display metadata on page load using browser-native APIs — no plugins or extensions required.

| Detected Property | API Used |
|---|---|
| Logical & physical resolution | `window.screen`, `window.devicePixelRatio` |
| Device pixel ratio (DPR) | `window.devicePixelRatio` |
| Color depth & pixel depth | `screen.colorDepth`, `screen.pixelDepth` |
| HDR support | CSS `dynamic-range` media query |
| Color gamut (sRGB / P3 / Rec.2020) | CSS `color-gamut` media query |
| Screen orientation | Screen Orientation API |
| Touch support | `navigator.maxTouchPoints` |
| Estimated refresh rate | `requestAnimationFrame` timing (60-sample average) |

### Dead Pixel Test
A fullscreen canvas-based test that cycles through 8 solid colours chosen to isolate every type of sub-pixel defect:

| Colour | What it reveals |
|---|---|
| **Black** | Hot pixels — pixels that stay bright |
| **White** | Dead pixels — pixels that stay dark |
| **Red** | Stuck green or blue sub-pixels |
| **Green** | Stuck red or blue sub-pixels |
| **Blue** | Stuck red or green sub-pixels |
| **Cyan** | Stuck red sub-pixels (green+blue on, red off) |
| **Magenta** | Stuck green sub-pixels (red+blue on, green off) |
| **Yellow** | Stuck blue sub-pixels (red+green on, blue off) |

**Controls during the test**

| Key | Action |
|---|---|
| `→` / `Space` | Next colour |
| `←` | Previous colour |
| `Esc` | Pause — offers Resume or Quit |
| Click on canvas | Log a defect at that pixel |

**Defect scopes**

When logging a defect the user picks both a **type** and a **scope**:
- **This colour only** — defect is specific to the current screen (e.g. a stuck sub-pixel only visible on red)
- **All colours (common)** — defect is visible on every screen (e.g. a fully dead pixel); displayed with an orange double-ring marker and shown on all colour pages of the PDF

**Defect types**

| Type | Description |
|---|---|
| Dead | Pixel receives no power — always black |
| Stuck | Pixel is locked to one colour |
| Hot | Pixel is always on — always white/bright |

### PDF Report Export
After completing a test, an **Export PDF** button generates a structured report using jsPDF:

| Page | Content |
|---|---|
| 1 — Cover | Title, verdict badge, quick display stats, generation date |
| 2 — Display Info | Full table of all detected display properties and user agent |
| 3 — Test Summary | Verdict banner, defect stat cards, session timing, full defect table with Scope column |
| 4–11 — Colour Screens | One page per test colour: coloured rectangle, defect markers at proportional positions, description of what the colour reveals, defect list |

Common defects appear on every colour page with an orange double-ring marker. Colour-specific defects appear only on their respective page.

---

## Tech Stack

### Backend
| Technology | Role |
|---|---|
| **NestJS 10** | Application framework — modules, controllers, services, DI |
| **@nestjs/serve-static** | Serves the frontend from `/public` |
| **@nestjs/swagger** | Auto-generated OpenAPI docs at `/api/docs` |
| **class-validator** | DTO validation with decorators |
| **class-transformer** | Request body deserialization |
| **uuid** | Unique IDs for sessions, display records, reports |
| **TypeScript 5** | Type safety across the entire backend |

### Frontend
| Technology | Role |
|---|---|
| **Vanilla JS (ES2021)** | No framework — keeps the bundle zero-dependency |
| **Canvas API** | Fullscreen dead pixel test rendering |
| **CSS Custom Properties** | Theming (dark UI, accent colours, status colours) |
| **jsPDF 2.5** (CDN) | Client-side PDF generation |
| **Screen API** | Resolution, color depth, orientation |
| **matchMedia API** | HDR and color gamut detection |
| **requestAnimationFrame** | Refresh rate estimation |
| **Fullscreen API** | True fullscreen during the pixel test |

### Architecture
The backend follows NestJS's modular architecture with three feature modules:

```
src/
├── main.ts                        # Bootstrap, Swagger, global pipes & filters
├── app.module.ts                  # Root module
├── config/
│   └── app.config.ts              # Test colour definitions, port config
├── common/
│   ├── filters/http-exception.filter.ts   # Unified error response shape
│   └── interceptors/response.interceptor.ts  # Wraps all responses: { success, data, timestamp }
└── modules/
    ├── display/                   # Display detection records
    ├── pixel-test/                # Test session state machine
    └── reports/                   # Report generation (joins display + test → verdict)
```

Storage is in-memory (a `Map` per service). To add persistence, swap the service stores for a TypeORM/Prisma repository — the controller and DTO layers need no changes.

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Install & Run

```bash
# Install dependencies
npm install

# Development (watch mode)
npm run start:dev

# Production build
npm run build
npm start
```

The app runs on **http://localhost:3000**
Swagger UI is available at **http://localhost:3000/api/docs**

---

## API Overview

All endpoints are prefixed with `/api`. Every response is wrapped:

```json
{ "success": true, "data": { ... }, "timestamp": "..." }
```

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/display` | Submit detected display info |
| `GET` | `/api/display` | List display records (filter by `?sessionId=`) |
| `GET` | `/api/display/:id` | Get a single display record |
| `POST` | `/api/pixel-test/start` | Start a new test session |
| `GET` | `/api/pixel-test/colors` | Get the 8 test colours |
| `PATCH` | `/api/pixel-test/:id/pixels` | Log defects for the current colour |
| `PATCH` | `/api/pixel-test/:id/color` | Advance the colour index |
| `PATCH` | `/api/pixel-test/:id/complete` | Mark the test as complete |
| `PATCH` | `/api/pixel-test/:id/abandon` | Abandon the test |
| `GET` | `/api/pixel-test/:id/summary` | Get defect counts |
| `POST` | `/api/reports` | Generate a report from a completed test |
| `GET` | `/api/reports/:id` | Retrieve a report |

Full interactive documentation with request/response schemas is at `/api/docs`.

---

## Project Structure

```
Display_tester/
├── src/                        # NestJS backend
│   ├── modules/
│   │   ├── display/            # Display info module
│   │   ├── pixel-test/         # Pixel test state machine module
│   │   └── reports/            # Report generation module
│   └── common/                 # Shared filters and interceptors
├── public/                     # Static frontend (served by NestJS)
│   ├── index.html
│   └── assets/
│       ├── css/styles.css
│       └── js/
│           ├── display-detector.js   # Browser API detection
│           ├── pixel-tester.js       # Fullscreen canvas test engine
│           ├── modal.js              # Themed dialog system
│           ├── pdf-export.js         # jsPDF report generator
│           └── main.js               # App orchestration
├── nest-cli.json
├── tsconfig.json
└── package.json
```
