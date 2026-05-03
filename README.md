# KAYGO

KAYGO est une application ciblée France ⇄ Martinique pour organiser l'envoi de petits colis via voyageurs vérifiés.

## État actuel

KayGo est prêt pour une présentation pilote publique contrôlée.

- Site public statique hébergé sur GitHub Pages.
- Admin masqué sans session admin côté interface.
- Login admin branché sur l'API séparée.
- Estimation branchée sur `/api/pricing/estimate` avec message de fallback si l'API est absente.
- Pages légales minimales disponibles : CGU, confidentialité, objets interdits, douane Martinique.

KayGo n'est pas encore un service de production complet. Avant ouverture commerciale réelle, l'API doit être déployée, sécurisée, testée et reliée au front via `KAYGO_API_BASE_URL`.

## Architecture

- Front public et admin : `artifacts/kaygo-admin`
- Landing publique : `/`
- Admin : `/admin`
- Login admin : `/admin/login`
- Pages légales : `/legal/*`
- API : `artifacts/api-server`, hébergement séparé
- Client API : `lib/api-client-react`
- Base path GitHub Pages : `/Kaygo/`

GitHub Pages héberge uniquement le front statique. L'API doit rester déployée séparément et être fournie au build via `VITE_API_BASE_URL`.

## Variables d'environnement

Variables utilisées par le front local :

```bash
PORT=4173
BASE_PATH=/Kaygo/
VITE_API_BASE_URL=https://api.example.com
VITE_WHATSAPP_URL=https://wa.me/...
```

Variables recommandées côté GitHub Actions :

```bash
KAYGO_API_BASE_URL=https://api.example.com
KAYGO_WHATSAPP_URL=https://wa.me/...
```

`KAYGO_WHATSAPP_URL` / `VITE_WHATSAPP_URL` est optionnelle. Si elle est absente, le site n'affiche pas de faux numéro et renvoie vers `/contact`.

## Sécurité

- Le front masque l'admin sans session locale valide.
- Le token JWT stocké côté navigateur est envoyé automatiquement dans l'en-tête `Authorization: Bearer <token>` par le client API.
- La vraie sécurité doit rester côté API : chaque route admin doit vérifier le JWT, le rôle `admin` et les permissions.
- Aucun secret ne doit être commité dans le dépôt.
- `JWT_SECRET`, les identifiants DB et les clés privées doivent rester dans l'hébergeur API ou les secrets GitHub.

## Développement local

```bash
pnpm install
PORT=4173 BASE_PATH=/Kaygo/ pnpm --filter @workspace/kaygo-admin run dev
```

## Build

```bash
PORT=4173 BASE_PATH=/Kaygo/ pnpm --filter @workspace/kaygo-admin run build
PORT=4173 BASE_PATH=/Kaygo/ pnpm run typecheck
```

## Déploiement GitHub Pages

Le workflow `.github/workflows/deploy-kaygo-admin-pages.yml` :

- installe pnpm
- exécute le typecheck
- build `@workspace/kaygo-admin`
- copie `index.html` vers `404.html` pour le fallback SPA
- ajoute des redirects statiques pour les routes critiques
- publie `artifacts/kaygo-admin/dist/public`

Variables GitHub recommandées :

- `KAYGO_API_BASE_URL` dans Repository Variables ou Secrets
- `KAYGO_WHATSAPP_URL` si le canal WhatsApp officiel est validé

## Vérification post-déploiement

- Ouvrir `/Kaygo/`
- Ouvrir `/Kaygo/admin`
- Vérifier la redirection sans session vers `/Kaygo/admin/login`
- Ouvrir `/Kaygo/admin/login`
- Tester `/Kaygo/estimer`
- Tester `/Kaygo/legal/cgu`
- Tester `/Kaygo/legal/confidentialite`
- Tester `/Kaygo/legal/objets-interdits`
- Tester `/Kaygo/legal/douane-martinique`
- Vérifier que les assets chargent sous `/Kaygo/`
- Vérifier que l'admin affiche un état honnête si l'API est absente

## Avant production réelle

1. Déployer `artifacts/api-server` sur un hébergeur adapté.
2. Configurer `JWT_SECRET`, CORS, origine GitHub Pages, base de données et variables serveur.
3. Créer un vrai compte admin.
4. Configurer `KAYGO_API_BASE_URL` dans GitHub.
5. Relancer le workflow Pages.
6. Tester login réel, estimation réelle, refus mauvais token et refus rôle non admin.
7. Faire relire les pages légales par une personne compétente avant exploitation commerciale complète.

## Rollback

1. Identifier le dernier commit stable :

```bash
git log --oneline
```

2. Revenir par revert non destructif :

```bash
git revert <commit>
git push origin main
```

3. Vérifier GitHub Pages après le workflow.

## Troubleshooting

- `PORT environment variable is required` : exporter `PORT=4173`.
- `BASE_PATH environment variable is required` : exporter `BASE_PATH=/Kaygo/`.
- API non joignable : vérifier `VITE_API_BASE_URL` ou `KAYGO_API_BASE_URL`, sans supposer que GitHub Pages héberge l'API.
- Login bloqué : vérifier l'API, `/api/auth/login`, le compte admin, le rôle `admin` et CORS.
- Estimation bloquée : vérifier `/api/pricing/estimate` et `KAYGO_API_BASE_URL`.
- Refresh 404 sur sous-route : vérifier que `404.html` et les redirects statiques sont présents dans `dist/public`.
