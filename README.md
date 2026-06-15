# Kaygo

**Kaygo** est une application ciblée France ⇄ Martinique pour organiser l'envoi de petits colis via voyageurs vérifiés.

## Stack

| Couche | Technologie |
|--------|-------------|
| **Monorepo** | pnpm workspaces + TypeScript ~5.9 |
| **Frontend Web** | React 19, Vite 7, Tailwind CSS 4, Radix UI, Framer Motion |
| **Mobile** | Expo Router 54, React Native 0.81 |
| **API** | Express 5, Drizzle ORM, Zod, JWT |
| **Base de données** | PostgreSQL (via Drizzle) |
| **Schémas / Validation** | Zod, Orval (codegen) |
| **CI / Déploiement** | GitHub Actions, GitHub Pages |

## Prérequis

- **Node.js** 18 ou supérieur (recommandé : 20+)
- **pnpm** 10+ ([installation](https://pnpm.io/installation))
- Git

> ⚠️ Ce projet utilise exclusivement pnpm. N'utilisez pas npm ou yarn.

## Installation

```bash
git clone https://github.com/CVlad97/Kaygo.git
cd Kaygo
pnpm install
```

## Variables d'environnement

Copiez le fichier d'exemple et renseignez vos valeurs :

```bash
cp .env.example .env
```

Variables clés :

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | URL du projet Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clé anonyme Supabase |
| `VITE_API_BASE_URL` | URL de l'API déployée |
| `PORT` | Port de dev (défaut : `4173`) |
| `BASE_PATH` | Chemin de base (ex: `/Kaygo/` pour GitHub Pages) |

## Scripts disponibles

```bash
# Linter de types (tous les packages)
pnpm typecheck

# Build tous les packages web
pnpm build

# Build web uniquement
pnpm build:web

# Build mobile uniquement
pnpm build:mobile
```

## Architecture du monorepo

```
Kaygo/
├── artifacts/           # Applications déployables
│   ├── api-server/      # API Express
│   ├── kaygo-admin/     # Frontend admin & public
│   ├── kaygo-mobile/    # App mobile Expo
│   └── mockup-sandbox/  # Bac à sable UI
├── lib/                 # Bibliothèques partagées
│   ├── api-client-react/# Client API React (TanStack Query)
│   ├── api-spec/        # Spécifications Orval / codegen
│   ├── api-zod/         # Schémas Zod partagés
│   └── db/              # Schémas Drizzle / DB
├── scripts/             # Scripts utilitaires
├── supabase/            # Config Supabase
├── .env.example         # Variables d'environnement
├── pnpm-workspace.yaml  # Configuration workspace
└── tsconfig.base.json   # Base TypeScript
```

## État actuel

Kaygo est prêt pour une présentation pilote publique contrôlée. Voir [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md) pour les détails.

## Développement local

```bash
# Lancer le frontend admin
PORT=4173 BASE_PATH=/Kaygo/ pnpm --filter @workspace/kaygo-admin run dev

# Lancer l'API en mode développement
pnpm --filter @workspace/api-server run dev
```

## Déploiement (GitHub Pages)

Le workflow `.github/workflows/deploy-kaygo-admin-pages.yml` :
- Installe pnpm
- Exécute le typecheck
- Build `@workspace/kaygo-admin`
- Copie `index.html` → `404.html` (fallback SPA)
- Publie `artifacts/kaygo-admin/dist/public`

Variables GitHub recommandées :
- `KAYGO_API_BASE_URL` — URL de l'API déployée
- `KAYGO_WHATSAPP_URL` — Canal WhatsApp business pilote

## Sécurité

- Aucun secret ne doit être commité. Voir `.gitignore` et `.env.example`.
- Le JWT est stocké côté navigateur et envoyé en en-tête `Authorization`.
- La sécurité réelle est côté API : vérification JWT, rôle `admin`, permissions.
- `JWT_SECRET`, identifiants DB et clés privées restent dans les secrets d'hébergement.

## Licence

MIT
