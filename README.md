# GANDAL — Plateforme Data Center ENSPY

> Infrastructure locale de virtualisation et d'orchestration multi-agent pour les projets académiques du Département de Génie Informatique de l'École Nationale Supérieure Polytechnique de Yaoundé (ENSPY) — Université de Yaoundé I.

---

## 🎯 Présentation

**GANDAL** est une plateforme académique de gestion centralisée de projets étudiants. Elle repose sur un système multi-agent (conforme aux spécifications FIPA) permettant le déploiement, la supervision et la migration de machines virtuelles au sein d'un data center local dédié au département de Génie Informatique.

---

## 🛠️ Stack Technique

| Couche | Technologie |
|---|---|
| Framework | Next.js 16 (App Router + Turbopack) |
| UI | React 19 + Tailwind CSS |
| Langage | TypeScript |
| Polices | Geist Sans / Geist Mono (Google Fonts) |
| Icônes | Lucide React |

---

## 🚀 Démarrage Rapide

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## 📁 Structure du Projet

```
src/
├── app/
│   ├── layout.tsx          # Layout racine + métadonnées SEO
│   ├── page.tsx            # Gestionnaire intro → landing
│   ├── login/page.tsx      # Page de connexion
│   ├── signup/page.tsx     # Page d'inscription (2 étapes)
│   ├── projects/page.tsx   # Catalogue des projets
│   └── intro/page.tsx      # Route directe vers l'introduction
├── components/
│   ├── IntroPage.tsx       # Séquence d'introduction cinématique
│   ├── LandingPage.tsx     # Page d'accueil principale
│   └── Navbar.tsx          # Navigation globale (thème blanc)
public/
│   └── logo-removebg-preview (1).png  # Logo officiel GANDAL
```

---

## 👥 Acteurs du Système

- **Étudiants** — Déposent leurs projets et accèdent aux environnements virtuels.
- **Enseignants** — Supervisent et évaluent les projets déployés.
- **Administrateurs** — Gèrent les ressources et les allocations du data center.

## 🤖 Agents du Système Multi-Agent

| Agent | Rôle |
|---|---|
| Agent de Déploiement | Instancie les machines virtuelles |
| Agent de Supervision | Monitore l'état du système en temps réel |
| Agent de Migration | Assure l'équilibrage et la haute disponibilité |

---

## 🏫 Institution

**École Nationale Supérieure Polytechnique de Yaoundé (ENSPY)**  
Département de Génie Informatique — Promotion **GI27**  
Université de Yaoundé I

---

© 2026 GANDAL Data Center • ENSPY Yaoundé. Tous droits réservés.
