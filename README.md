# KAYGO

KAYGO est une application ciblée France ⇄ Martinique pour organiser l'envoi de petits colis via voyageurs vérifiés.

## Architecture

- Front public et admin : `artifacts/kaygo-admin`
- Landing publique : `/`
- Admin : `/admin`
- API : `artifacts/api-server`, hébergement séparé
- Client API : `lib/api-client-react`
- Base path GitHub Pages : `/Kaygo/`

GitHub Pages héberge uniquement le front statique. L'API doit rester déployée séparément et être fournie au build via `VITE_API_BASE_URL`.

## Variables d'environnement

Variables utilisées par le front :

```bash
PORT=4173
BASE_PATH=/Kaygo/
VITE_API_BASE_URL=https://api.example.com
VITE_WHATSAPP_URL=https://wa.me/...
```

`VITE_WHATSAPP_URL` est optionnelle. Si elle est absente, le site n'affiche pas de faux numéro et renvoie vers `/contact`.

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
- publie `artifacts/kaygo-admin/dist/public`

Variables GitHub recommandées :

- `KAYGO_API_BASE_URL` dans Repository Variables ou Secrets
- `VITE_WHATSAPP_URL` si le canal WhatsApp officiel est validé

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

## Vérification post-déploiement

- Ouvrir `/Kaygo/`
- Ouvrir `/Kaygo/admin`
- Rafraîchir `/Kaygo/admin/trajets`
- Tester `/Kaygo/estimer`
- Vérifier que les assets chargent sous `/Kaygo/`
- Vérifier que l'admin affiche un état honnête si l'API est absente

## Troubleshooting

- `PORT environment variable is required` : exporter `PORT=4173`.
- `BASE_PATH environment variable is required` : exporter `BASE_PATH=/Kaygo/`.
- API non joignable : vérifier `VITE_API_BASE_URL`, sans supposer que GitHub Pages héberge l'API.
- Refresh 404 sur sous-route : vérifier que `404.html` est copié dans `dist/public`.
