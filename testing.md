# Manuel de Test du Dashboard Étudiant GANDAL

Ce document décrit l'organisation du Dashboard Étudiant GANDAL, le guide de configuration locale, les scripts de test interactifs et les modèles de données sous-jacents.

---

## 1. Guide de Démarrage Rapide

### Prérequis
- **Node.js** v18.0.0 ou supérieur
- **npm** ou **yarn**

### Installation locale
1. Clonez ou ouvrez le dossier du projet :
   ```bash
   cd /home/samuelsean/Gandal
   ```
2. Installez les dépendances nécessaires :
   ```bash
   npm install
   ```
3. Démarrez le serveur de développement :
   ```bash
   npm run dev
   ```
4. Accédez à l'application dans votre navigateur à l'adresse suivante : [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

---

## 2. Structure des Dossiers & Routes

Les fichiers créés ou modifiés pour cette implémentation sont répartis comme suit :
```
src/
├── app/
│   ├── dashboard/
│   │   └── page.tsx         # Page principale et conteneur du Dashboard (Client component)
│   ├── login/
│   │   └── page.tsx         # Modifié : Redirection vers /dashboard après connexion réussie
├── components/
│   └── dashboard/
│       ├── OverviewTab.tsx  # Onglet principal : quotas, logs SMA temps réel, activités
│       ├── VMsTab.tsx       # Onglet VMs : filtres, actions de contrôle, modal de création
│       ├── RequestsTab.tsx  # Onglet Requêtes : historique, détails, formulaire de demande
│       ├── PublicationsTab.tsx # Onglet Publications : dépôt, checklist de passation
│       └── ProfileTab.tsx   # Onglet Profil : édition des infos, thème, préférences d'alertes
```

---

## 3. Scénarios de Test pour chaque Fonctionnalité

### A. Test de l'Onglet "Vue d'ensemble" (Overview)
1. **Objectif** : Vérifier l'affichage des quotas de ressources et le flux de logs en temps réel.
2. **Étapes** :
   - Cliquez sur l'onglet **Vue d'ensemble** dans la barre latérale gauche.
   - Observez le panneau supérieur affichant votre message de bienvenue personnalisé ("Bonjour, Nguetchuissi Brunel !") et les informations promotionnelles.
   - Examinez les cartes de quotas (Machines Virtuelles, Cores vCPU, RAM, Disque SSD) équipées de barres de progression.
   - Regardez le widget **Système Multi-Agent GANDAL** et attendez quelques secondes. Vérifiez qu'un nouveau log s'affiche automatiquement toutes les 4,5 secondes avec des libellés d'agents colorés (`Agent-Supervision`, `Agent-Maître`, etc.).
   - Consultez la section **Activités Récentes** affichant l'historique initial.

### B. Test de l'Onglet "Mes VMs" (VM Manager)
1. **Objectif** : Tester le filtrage, les actions d'état (démarrer/arrêter/redémarrer), la suppression et le formulaire de création avec limites de quotas.
2. **Étapes** :
   - Accédez à l'onglet **Mes VMs**.
   - **Filtres & Recherche** : Cliquez sur les boutons de filtre (`Toutes`, `Active`, `Arrêtée`) et saisissez un terme dans la barre de recherche (ex: `enspy`) pour observer la mise à jour instantanée de la grille.
   - **Copier la ligne SSH** : Sur la carte de la VM active, cliquez sur le bouton de copie à côté de la commande `ssh student@...`. Vérifiez que l'icône change temporairement en crochet vert et que le texte est dans votre presse-papiers.
   - **Actions d'État** : Cliquez sur `Arrêter` sur une machine active. Observez le changement instantané de badge de statut vers `Arrêtée`. Cliquez sur `Démarrer` pour la relancer. Cliquez sur l'icône de redémarrage pour simuler un cycle de reboot par l'Agent de Déploiement.
   - **Création de VM & Validation des Quotas** :
     - Cliquez sur **Créer une VM**.
     - Saisissez un nom avec des majuscules ou espaces. Constatez l'erreur de validation.
     - Augmentez les jauges de ressources (ex: 4 Cores, 8Go RAM, 100Go Disque). La boîte d'impact de quotas en bas indiquera un dépassement de quota (les totaux dépasseront les quotas alloués : 8 Cores, 16Go RAM). Tentez de soumettre et constatez le blocage avec message d'erreur.
     - Ajustez les ressources à des valeurs valides (ex: 2 Cores, 4Go RAM, 40Go Disque), choisissez l'OS "Debian 12" et cliquez sur **Valider la création**.
     - Vérifiez que la nouvelle VM apparaît dans la liste avec le statut `En cours`, puis passe à `Active` après 3 secondes (temps nécessaire à l'Agent de Déploiement pour configurer l'instance).

### C. Test de l'Onglet "Mes Requêtes" (Requests Manager)
1. **Objectif** : Soumettre une requête technique et suivre l'historique et les feedbacks.
2. **Étapes** :
   - Accédez à l'onglet **Mes Requêtes**.
   - **Historique** : Cliquez sur une ligne de requête de l'historique (ex: la requête rejetée). Vérifiez que les motivations détaillées et le feedback de l'administrateur s'affichent de façon fluide (accordéon).
   - **Nouvelle Requête** :
     - Cliquez sur **Nouvelle Requête** dans le sélecteur d'en-tête.
     - Sélectionnez un type de ressource (ex: "Ouverture Port Réseau") et la machine virtuelle cible.
     - Saisissez la quantité (ex: "Port 9000 en UDP").
     - Écrivez une justification courte (moins de 15 caractères) et validez. Constatez l'alerte d'erreur.
     - Complétez avec une motivation de plus de 15 caractères et validez.
     - Vérifiez l'affichage du message de succès, la redirection automatique vers l'onglet Historique après 1,8 seconde, et l'apparition de la nouvelle requête avec le statut `En attente`.

### D. Test de l'Onglet "Mes Publications" (Catalogue & Passation)
1. **Objectif** : Soumettre un projet académique avec sa checklist de livraison pour le transfert entre cohortes.
2. **Étapes** :
   - Accédez à l'onglet **Mes Publications**.
   - Observez le catalogue existant. Notez les indicateurs de passation (ex: "Passation complète : Validée" ou "Passation incomplète").
   - Cliquez sur **Nouvelle publication**.
   - Saisissez un titre, une description détaillée (au moins 30 caractères) et une adresse Git valide (ex: `https://github.com/...`).
   - Cochez certaines cases de la checklist de passation (ex: "Code source complet" et "VM de démonstration active").
   - Soumettez le formulaire. Vérifiez que la nouvelle carte apparaît avec le statut `2 / 4 étapes`.

### E. Test de l'Onglet "Mon Profil"
1. **Objectif** : Mettre à jour ses données de profil et configurer ses préférences d'interface et d'alertes.
2. **Étapes** :
   - Accédez à l'onglet **Mon Profil**.
   - **Changer d'avatar** : Cliquez sur le bouton "Modifier", puis sélectionnez une autre icône d'avatar dans le catalogue proposé.
   - **Édition des données** : Modifiez votre nom complet ou votre matricule dans le formulaire, puis cliquez sur **Sauvegarder**. Observez la mise à jour immédiate de vos données sur le bandeau supérieur de la page et dans le bloc utilisateur en bas de la barre latérale.
   - **Thème Visuel (Dark Mode)** : Dans les paramètres généraux, cliquez sur **Mode Clair / Sombre**. Constatez le basculement immédiat du thème de l'application (adaptant les couleurs de fond et de bordure au format dark/light).

---

## 4. Modèles de Données (Types TypeScript)

Les objets de données manipulés par le dashboard respectent les types suivants :

```typescript
// Profil Étudiant
interface StudentInfo {
  username: string;     // Nom complet
  email: string;        // E-mail ENSPY
  matricule: string;    // Matricule étudiant (ex: 22P250)
  level: string;        // Année académique (ex: 4 pour GI4)
  department: string;   // Option (ex: Informatique)
}

// Machine Virtuelle
interface VM {
  id: string;
  name: string;         // Nom d'hôte de la VM
  os: 'Ubuntu' | 'Debian' | 'CentOS' | 'Windows';
  status: 'Active' | 'Arrêtée' | 'En cours';
  cpu: number;          // Nombre de Cores
  ram: number;          // Mémoire en Go
  disk: number;         // Stockage en Go
  ip: string;           // Adresse IP locale sur le réseau GANDAL
  project: string;      // Titre du projet associé
  handover: 'Prêt' | 'En cours' | 'Non initié'; // Statut de livraison du projet
}

// Requête administrative
interface RequestItem {
  id: string;
  type: string;         // Ressource ou modification réseau demandée
  vmName: string;       // VM ciblée
  details: string;      // Quantité demandée
  justification: string;// Explication technique
  status: 'En attente' | 'Validée' | 'Rejetée' | 'En cours';
  date: string;
  adminFeedback?: string; // Motif d'approbation ou de rejet
}

// Projet publié (Catalogue & Passation)
interface Publication {
  id: string;
  title: string;        // Nom du projet
  category: string;     // Type de technologie
  desc: string;         // Description ou résumé
  vmName: string;       // Machine de démonstration
  gitUrl: string;       // Dépôt de code
  date: string;
  checklist: {          // Éléments de passation requis
    code: boolean;
    report: boolean;
    guide: boolean;
    vm: boolean;
  };
  views: number;
  likes: number;
}
```
