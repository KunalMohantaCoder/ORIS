# ORIS - Orbital Risk Intelligence System

ORIS is a full-stack scientific intelligence dashboard for orbital debris tracking, satellite dependency awareness, collision-risk analysis, Kessler Syndrome simulation, and future orbital sustainability modeling.

The project uses only free public APIs and local fallback datasets. Paid APIs are intentionally excluded.

## Stack

- Frontend: Next.js, Tailwind CSS, Framer Motion, Three.js, Recharts, Zustand
- Backend: Node.js, Express
- Database-ready: PostgreSQL or Supabase via `DATABASE_URL`
- Export: PDF chart capture with `jspdf` and `html2canvas`

## Local Setup

```bash
npm install
npm run dev
```

Open:

- Web app: `http://localhost:3000`
- API health: `http://localhost:4000/api/health`

## Environment

Copy `.env.example` to `.env` when you want custom configuration.

```bash
PORT=4000
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
API_CACHE_TTL_SECONDS=900
CORS_ORIGIN=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/oris
SUPABASE_URL=
SUPABASE_ANON_KEY=
DISABLE_DEFAULT_FREE_APIS=false
NASA_API_KEY=
N2YO_API_KEY=
SPACE_TRACK_USERNAME=
SPACE_TRACK_PASSWORD=
ORIS_CUSTOM_API_KEY=
```

The app runs without a database by using bundled fallback datasets. If `DATABASE_URL` is present and the schema is applied, survey analytics can read from PostgreSQL/Supabase.

## API Keys

ORIS does not require paid APIs. Keep all optional free API keys in `.env`; do not paste secrets directly into source files.

1. Copy `.env.example` to `.env`.
2. Add only the free keys you actually use, for example `NASA_API_KEY=your_key_here`.
3. Add API sources to `config/FREE_API_INPUT_SECTION.md`.
4. Reference keys with `${ENV_VAR_NAME}` inside a source URL or headers object.
5. Restart `npm run dev` so the backend reloads `.env`.

URL-key example:

```json
{"name":"NASA Example Feed","url":"https://api.nasa.gov/example?api_key=${NASA_API_KEY}","type":"generic-json","category":"active","limit":500}
```

Header-key example:

```json
{"name":"Bearer Token Example","url":"https://example.org/free-orbital-data.json","type":"generic-json","headers":{"Authorization":"Bearer ${ORIS_CUSTOM_API_KEY}"},"limit":500}
```

The transparency endpoint masks sensitive query parameters and reports missing environment variables without exposing their values.

## Free API Input Section

Paste free API URLs or JSON source definitions into `config/FREE_API_INPUT_SECTION.md`.

```text
--------------------------------------------------
FREE API INPUT SECTION
--------------------------------------------------

[ORBITAL DATA APIs]
PASTE APIs HERE

[SPACE DEBRIS APIs]
PASTE APIs HERE

[SATELLITE TRACKING APIs]
PASTE APIs HERE

[EARTH / SPACE VISUALIZATION APIs]
PASTE APIs HERE

[PHYSICS / EDUCATIONAL DATA APIs]
PASTE APIs HERE

[SURVEY / ANALYTICS APIs]
PASTE APIs HERE

--------------------------------------------------
```

Supported source formats:

```text
https://example.org/free-data.json
My Free Source=https://example.org/free-data.json
{"name":"My Free Source","url":"https://example.org/free-data.json","type":"generic-json","limit":500}
```

Default free CelesTrak adapters are stored in `config/default-free-apis.json`, including GEO, GPS, debris-fragment, and visible-object catalogs. Rocket bodies from the visible-object catalog are normalized as inactive orbital objects. Set `DISABLE_DEFAULT_FREE_APIS=true` to use only sources pasted into the input section.

## Folder Structure

```text
app/                         Next.js pages and route screens
components/                  Reusable dashboard, chart, visualization, and lab components
config/                      Free API input section and default public API adapters
database/schema.sql          PostgreSQL/Supabase schema
lib/                         Frontend API helpers
server/src/config/           API registry and environment config
server/src/data/             Fallback orbital, survey, launch, and reference datasets
server/src/db/               Optional PostgreSQL/Supabase connection
server/src/routes/           Express API routes
server/src/services/         Modular data, simulation, normalization, cache, and analytics services
server/src/utils/            Shared math utilities
store/                       Zustand state management
```

## API Layer

Core endpoints:

- `GET /api/orbital/objects`
- `GET /api/orbital/summary`
- `GET /api/orbital/heatmap`
- `GET /api/collision/crowding`
- `POST /api/collision/simulate`
- `GET|POST /api/kessler/simulate`
- `GET /api/survey/analytics`
- `GET /api/physics/concepts`
- `POST /api/physics/calculate`
- `GET /api/sustainability/forecast`
- `GET /api/sources`

The backend normalizes API payloads into a common orbital object format, caches responses, reports source health, and falls back to bundled datasets if external APIs fail.

## Database

Apply the schema in `database/schema.sql` to PostgreSQL or Supabase:

```bash
psql "$DATABASE_URL" -f database/schema.sql
```

Tables include:

- `api_sources`
- `orbital_objects`
- `survey_responses`
- `collision_simulations`
- `kessler_runs`

## Deployment Notes

1. Deploy the Express API to a free Node-capable host.
2. Set `PORT`, `CORS_ORIGIN`, and optional `DATABASE_URL`.
3. Deploy the Next.js frontend and set `NEXT_PUBLIC_API_BASE_URL` to the API URL.
4. Keep `config/FREE_API_INPUT_SECTION.md` and `config/default-free-apis.json` versioned for transparent source control.

For local production testing:

```bash
npm run build
npm run start
```
