# Checklist Lancement KAYGO

## Technique

- [ ] `pnpm install` exécuté sur monorepo complet
- [ ] `PORT=4173 BASE_PATH=/Kaygo/ pnpm run typecheck` OK
- [ ] `PORT=4173 BASE_PATH=/Kaygo/ pnpm --filter @workspace/kaygo-admin run build` OK
- [ ] Workflow GitHub Pages vert
- [ ] Fallback SPA `404.html` présent
- [ ] `VITE_API_BASE_URL` renseigné côté GitHub si API disponible
- [ ] `VITE_WHATSAPP_URL` renseigné seulement avec lien officiel validé

## Routes Publiques

- [ ] `/Kaygo/` affiche la landing publique
- [ ] `/Kaygo/estimer` affiche l'estimation indicative
- [ ] `/Kaygo/objets-autorises` affiche les règles colis
- [ ] `/Kaygo/faq` affiche la FAQ Martinique
- [ ] `/Kaygo/contact` affiche les CTA contact sans faux numéro

## Routes Admin

- [ ] `/Kaygo/admin`
- [ ] `/Kaygo/admin/utilisateurs`
- [ ] `/Kaygo/admin/trajets`
- [ ] `/Kaygo/admin/colis`
- [ ] `/Kaygo/admin/matching`
- [ ] `/Kaygo/admin/paiements`
- [ ] `/Kaygo/admin/litiges`
- [ ] `/Kaygo/admin/parametres`

## Produit

- [ ] Promesse France ⇄ Martinique claire
- [ ] Aucun chiffre marketing non prouvé
- [ ] Aucun wording laissant croire que GitHub Pages héberge l'API
- [ ] Objets interdits visibles
- [ ] CTA principaux visibles sur mobile
- [ ] Admin séparé de la landing publique

## Smoke Test Manuel

- [ ] Charger la landing sur mobile
- [ ] Cliquer `Envoyer un colis`
- [ ] Cliquer `Publier un trajet`
- [ ] Cliquer `Estimer un prix`
- [ ] Ouvrir l'admin
- [ ] Rafraîchir une sous-route admin
- [ ] Vérifier la console navigateur
