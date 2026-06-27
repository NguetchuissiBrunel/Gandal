# DESIGN BRIEF — Refonte visuelle de la console GANDAL / Omega

> Document de handoff pour une **refonte du design** (pas du fond fonctionnel).
> Donne ce fichier + des captures d'écran (voir checklist en bas) à l'agent design.

---

## 1. Ce qu'est le produit

**GANDAL / Omega** est la **console web d'un cluster Proxmox** (datacenter privé, on‑premise), à usage **académique multi‑utilisateurs**. Trois rôles :

- **Étudiant** : voit/gère **ses** VMs, fait des **demandes** (création de VM, compte, nom de domaine), suit leur statut.
- **Enseignant** : approuve/rejette les demandes, suit ses étudiants.
- **Superadmin** : plan de contrôle complet du cluster (topologie, distribution des VMs, GPU, migrations, DNS, publications).

Le cœur visuel est une **« toile » / canvas de topologie** (React Flow) où les VMs et les nœuds sont des cartes reliées par des liens réseau — c'est la signature de l'app, à **conserver** mais à **embellir**.

## 2. Stack & contraintes techniques (NON négociables)

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4** (config via `@theme` dans `src/app/globals.css`)
- **@xyflow/react** (React Flow) pour le canvas de topologie
- **lucide-react** pour les icônes
- **Thème clair/sombre** piloté par la **classe `.dark` sur `<html>`** (PAS l'OS) — variant Tailwind : `@custom-variant dark (&:where(.dark, .dark *))`. Hook existant : `src/components/workspace/useTheme.ts`. **Les deux thèmes doivent rester impeccables.**
- **Ne pas casser** : les appels API (`src/lib/apiClient.ts`), la logique métier, les props des composants, les routes. La refonte est **visuelle** (markup/classes Tailwind, tokens, espacements, typographie, couleurs, micro‑interactions).
- Build de validation : `npm run build` doit passer ; `npx tsc --noEmit` sans erreur.

## 3. Design system ACTUEL (à refondre)

Dans `src/app/globals.css` :
```css
--background: #ffffff;  --foreground: #171717;   /* clair */
html.dark body { background:#0a0a0a; color:#ededed; }  /* sombre */
--font-sans: Inter, system-ui, …
@keyframes gandal-blink  /* surbrillance orange d'une VM trouvée (recherche) */
```
- Accent actuel : **bleu** (`#2563eb`) pour les VMs actives, **gris** (`#94a3b8`) pour les arrêtées, **noir** pour les liens réseau (épais), fond de canvas beige/clair, cercles décoratifs bleus.
- Icônes lucide, cartes à coins arrondis (`rounded-xl`), bordures `border-2`, ombres légères.
- **Problème** (retour utilisateur) : *« l'UI n'est pas assez propre »* → trop chargé / pas assez pro / hiérarchie visuelle et espacements perfectibles, cohérence des composants à renforcer.

## 4. STYLE VISÉ  ⚠️ À COMPLÉTER PAR LE PROPRIÉTAIRE

> Remplir cette section avant le handoff (l'agent design s'y conformera).

- **Direction** : _(ex. épuré, professionnel, dark‑first, dense mais aéré, « cloud console » type Vercel/Linear/Railway…)_
- **Références aimées** : _(2–3 produits/sites)_
- **À éviter** : _(ex. trop de couleurs, dégradés criards, ombres lourdes…)_
- **Accent souhaité** : _(garder le bleu ? autre couleur de marque ?)_

*(Défaut proposé si non rempli : design **épuré et professionnel, dark‑first**, palette resserrée — 1 accent + neutres, plus d'air/espacement, typographie hiérarchisée, micro‑interactions sobres, esprit « plan de contrôle cloud » moderne.)*

## 5. Écrans & composants à refondre (inventaire réel)

**Pages** (`src/app/`) : `/` (landing), `/intro`, `/login`, `/signup`, `/projects`, `/dashboard`, `/dashboard/etudiant`, `/dashboard/teacher`, `/dashboard/superadmin`.

**Console / Workspace** (`src/components/workspace/`) — le cœur :
- `Workspace.tsx`, `WorkspacePage.tsx` — shell + barre d'outils + recherche.
- `FlowCanvas.tsx` — le canvas React Flow (fond, liens, contrôles, zoom).
- `VMFlowNode.tsx` — **carte VM** (bandeau d'en‑tête coloré, IP, CPU/RAM/VRAM, statut, actions internet/gérer). *Composant le plus visible — soigner.*
- `RouterNode.tsx`, `VMInspector.tsx`, `NewVMModal.tsx`.
- `management/` : `RequestsView.tsx` (demandes — table + modal « Nouvelle requête » avec onglets Création VM / **Domaine** / Compte), `DnsView.tsx`, `UsersView.tsx`, `PublicationsView.tsx`, `ui.tsx` (primitives : `Card`, `Badge`, `Empty`, `inputCls`, `btnPrimary`, `btnGhost`, `MgmtView`).

**Dashboards** (`src/components/dashboard/`) : `DashboardShell.tsx`, `OverviewTab.tsx`, `AdminOverviewTab.tsx`, `TeacherOverviewTab.tsx`, `VMsTab.tsx`, `RequestsTab.tsx`, `DNSTab.tsx`, `PublicationsTab.tsx`, `ProfileTab.tsx`, modals (`EntityDetailModal`, `CredentialsModal`, `PublicationEditModal`), `superadmin/` (`RequestsPanel`, `StudentsPanel`).

## 6. Objectifs de la refonte (mesurables)

1. **Système de design unifié** : tokens de couleur/espacement/rayon/ombre dans `globals.css` (`@theme`), réutilisés partout (fini les classes ad‑hoc divergentes). Primitives propres dans `management/ui.tsx`.
2. **Hiérarchie & lisibilité** : typographie à 3–4 niveaux clairs, densité maîtrisée, plus d'air.
3. **Cohérence** : boutons, cartes, badges, inputs, modals, tables — un seul langage visuel, états (hover/focus/disabled/loading/empty/error) homogènes.
4. **Canvas signature** : embellir les cartes VM/nœuds et les liens sans nuire à la lisibilité ni aux perfs React Flow.
5. **Clair ET sombre** parfaits, contrastes **AA** (accessibilité).
6. **Responsive** correct (au moins desktop large + tablette).
7. **Micro‑interactions sobres** (transitions, focus rings, skeletons de chargement).

## 7. Livrables attendus de l'agent design

- Tokens/thème mis à jour dans `src/app/globals.css`.
- Composants refondus (markup + classes Tailwind) — **sans changer les props ni la logique**.
- Une courte **note de design** (palette, typo, principes) en tête de `globals.css` ou un `DESIGN_SYSTEM.md`.
- `npm run build` et `npx tsc --noEmit` qui passent.

## 8. Comment lancer / prévisualiser

```bash
cd /home/blhack/Projets/Omega/Gandal
npm install        # si besoin
npm run dev        # http://localhost:3000
# Connexion à l'API on‑premise via NEXT_PUBLIC_API_BASE (.env.local)
```
En prod : déployé sur la VM console `10.50.30.50` (`gandal-front.service`, `next start`). **Toute modif de source nécessite un `npm run build` + restart** (sinon l'ancien build est servi).

## 9. Checklist captures d'écran à fournir (clair + sombre)

- [ ] Landing `/` et `/login`
- [ ] **Workspace / canvas** (vue d'ensemble avec plusieurs VMs + liens)
- [ ] Une **carte VM** zoomée (`VMFlowNode`) — active et arrêtée
- [ ] `VMInspector` (panneau latéral) ouvert
- [ ] **Requêtes** : la table + le modal « Nouvelle requête » (onglet Domaine)
- [ ] Dashboard superadmin (overview, topologie, DNS)
- [ ] Un modal (ex. `NewVMModal` / `EntityDetailModal`)

---

*Brief généré le 27 juin 2026. Le périmètre est purement visuel : ne pas modifier les contrats API, la logique, ni les routes.*
