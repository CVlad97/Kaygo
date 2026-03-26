# KAYGO — "Le colis qui voyage malin"

## Overview
KAYGO is a peer-to-peer logistics platform for sending small packages between France and Martinique via verified travelers.

## Brand
- **Name**: KAYGO
- **Slogan**: "Le colis qui voyage malin"
- **Colors**: Navy `#0F2044` + Turquoise `#00C4CC`

## Architecture

### Artifacts
| Artifact | Kind | Path | Port |
|---|---|---|---|
| API Server | api | `/artifacts/api-server` | 8080 |
| KAYGO Admin Dashboard | web | `/artifacts/kaygo-admin` | dynamic |
| KAYGO Mobile | mobile (Expo) | `/artifacts/kaygo-mobile` | dynamic |

### Shared Libraries
- `lib/db` — Drizzle ORM schema + migrations (PostgreSQL)
- `lib/api-spec` — OpenAPI YAML spec (source of truth)
- `lib/api-client-react` — Generated React Query hooks + Zod schemas

## Database Schema (PostgreSQL via Drizzle ORM)
Tables: `users`, `traveler_profiles`, `trips`, `shipments`, `matches`, `payments`, `proofs`, `admin_actions`, `notifications`

### Key columns added post-initial-migration (applied via SQL):
- `shipments`: `title`, `value_eur`, `is_fragile`, `service_level`, `notes`, `departure_city`, `arrival_city`

## Backend API (`artifacts/api-server`)
Express + Drizzle ORM + Pino logging. All routes mounted at `/api/`.

Endpoints:
- `POST /api/auth/login` — JWT login (bcryptjs)
- `POST /api/auth/register` — Register (bcryptjs hash)
- `GET/POST/PATCH /api/users` — User management
- `GET/POST/PATCH /api/trips` — Trip CRUD
- `GET/POST/PATCH /api/shipments` — Shipment CRUD
- `GET/POST /api/matches` — Match creation/management
- `GET/POST /api/payments` — Payments
- `GET/POST /api/proofs` — Delivery proofs
- `GET /api/notifications` — Notifications
- `GET /api/admin/stats` — Dashboard stats
- `POST /api/pricing/estimate` — Éco/Confort/Premium pricing

### Pricing Engine
- Transport = max(8, weight * 4)€
- Platform fee = 15%
- Pickup (Premium): ~8.5€
- Delivery (Confort/Premium): ~11€

## Admin Dashboard (`artifacts/kaygo-admin`)
React + Vite + Tailwind CSS v4 + Recharts + Framer Motion

Pages:
- `/` — Vue d'ensemble (Dashboard with KPIs)
- `/utilisateurs` — User management (verify/reject)
- `/trajets` — Trip management
- `/colis` — Shipment management
- `/matching` — Manual match creation
- `/paiements` — Payment tracking
- `/litiges` — Disputes (coming soon)
- `/parametres` — Settings (coming soon)

## Mobile App (`artifacts/kaygo-mobile`)
Expo + React Native + expo-router v6

Screens:
- `/` (index) — Splash/landing with animations
- `/onboarding` — 3-slide onboarding
- `/auth` — Login + Register with role selector
- `/(tabs)/` — Home (hero, CTA, how-it-works, pricing, items, trust)
- `/(tabs)/track` — Shipment tracking with timeline
- `/(tabs)/history` — History (colis / trajets / gains)
- `/(tabs)/profile` — User profile + menu
- `/trip/create` — Trip creation form
- `/shipment/create` — 3-step shipment creation
- `/shipment/estimate` — Price simulator
- `/faq` — FAQ accordion
- `/allowed-items` — Allowed/forbidden items list

### Auth Context
`context/KaygoContext.tsx` — user, token, login, logout persisted via AsyncStorage

### Environment Variables
- `EXPO_PUBLIC_DOMAIN` — Dev domain for API calls
- `JWT_SECRET` — JWT signing secret (fallback: "kaygo-dev-secret-2024")
- `DATABASE_URL` — PostgreSQL connection string

## Demo Data (Seeded)
Users:
- `admin@kaygo.fr` / password (bcrypt hash in DB) — Admin
- `marie@example.com` — Verified traveler (2 trips seeded)
- `luc@example.com` — Verified sender (3 shipments seeded)
- `sophie@example.com` — Pending traveler
- `jean@example.com` — Verified sender

## Dependencies (key)
- `expo-linear-gradient` — Mobile gradients
- `@react-native-async-storage/async-storage` — Token persistence
- `bcryptjs` + `jsonwebtoken` — Auth
- `drizzle-orm` + `drizzle-kit` — ORM + migrations
- `recharts` — Admin charts
- `framer-motion` — Admin animations
- `tailwindcss@4` + `@tailwindcss/vite` — Admin styling
