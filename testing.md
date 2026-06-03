# Manuel de Test GANDAL (Connexion Backend & API)

Ce document décrit le flow d'exécution complet pour tester tous les endpoints du backend déployé à l'adresse **https://gandal-api.onrender.com** et leur intégration dans le frontend GANDAL.

---

## 1. Flow d'Authentification (Auth API)

### A. Inscription d'un Étudiant (`POST /api/v1/auth/signup`)
- **Action UI** : Se rendre sur `/signup`, remplir le formulaire à l'étape 1 et 2 (Matricule, Niveau, Département, Email, Mot de passe).
- **Test curl direct** :
  ```bash
  curl -X POST https://gandal-api.onrender.com/api/v1/auth/signup \
    -H "Content-Type: application/json" \
    -d '{
      "username": "Nguetchuissi Brunel",
      "email": "brunel@enspy-uy1.cm",
      "password": "monpasswordsecure",
      "matricule": "22P250",
      "level": "4",
      "departement": "Informatique"
    }'
  ```

### B. Connexion de l'Utilisateur (`POST /api/v1/auth/login`)
- **Action UI** : Se rendre sur `/login`, entrer l'adresse email et le mot de passe, cliquer sur Connexion.
- **Validation** : Vérifier que le cookie/token `gandal_auth_token` est défini dans le local storage et redirige vers `/dashboard`.
- **Test curl direct** :
  ```bash
  curl -X POST https://gandal-api.onrender.com/api/v1/auth/login \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=brunel@enspy-uy1.cm&password=monpasswordsecure"
  ```

### C. Récupération du Profil Courant (`GET /api/v1/auth/me`)
- **Action UI** : Au chargement de `/dashboard`, l'application envoie une requête pour identifier le rôle (`student` ou `teacher`) et rediriger dynamiquement.
- **Test curl direct** :
  ```bash
  curl -X GET https://gandal-api.onrender.com/api/v1/auth/me \
    -H "Authorization: Bearer <VOTRE_TOKEN>"
  ```

### D. Mise à jour de Profil (`PUT /api/v1/etudiant/{id}` ou `/api/v1/enseignant/{id}`)
- **Action UI** : Se rendre dans l'onglet **Mon Profil**, cliquer sur **Modifier**, changer les informations et sauvegarder.
- **Test curl direct** :
  ```bash
  curl -X PUT https://gandal-api.onrender.com/api/v1/etudiant/1 \
    -H "Authorization: Bearer <VOTRE_TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{
      "username": "Brunel Modifié",
      "matricule": "22P250",
      "level": "5",
      "departement": "Informatique"
    }'
  ```

---

## 2. Flow de Gestion des Machines Virtuelles (VMs API)

### A. Liste des VMs (`GET /api/v1/vms`)
- **Action UI** : Disponible dans l'onglet **Mes VMs** (Étudiant), **Instancier** (Enseignant) et **VMs** (Super Admin).
- **Test curl direct** :
  ```bash
  curl -X GET https://gandal-api.onrender.com/api/v1/vms \
    -H "Authorization: Bearer <VOTRE_TOKEN>"
  ```

### B. Création d'une VM (`POST /api/v1/vms`)
- **Action UI** : Ouvrir la boîte modale de création de VM, spécifier les ressources (vCPU, RAM, Disque, OS) et valider.
- **Test curl direct** :
  ```bash
  curl -X POST https://gandal-api.onrender.com/api/v1/vms \
    -H "Authorization: Bearer <VOTRE_TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{
      "user_id": 1,
      "size_rom": 40,
      "size_ram": 4,
      "n_cpu": 2,
      "status": "stopped",
      "iso": "Ubuntu Server",
      "node": "ma-vm-test"
    }'
  ```

### C. Contrôle d'État (Démarrer/Arrêter/Pause)
- **Actions UI** : Cliquer sur les boutons Play/Pause/Stop de chaque machine virtuelle.
- **Démarrer (`POST /api/v1/vms/{id}/start`)** :
  ```bash
  curl -X POST https://gandal-api.onrender.com/api/v1/vms/1/start -H "Authorization: Bearer <VOTRE_TOKEN>"
  ```
- **Arrêter (`POST /api/v1/vms/{id}/stop`)** :
  ```bash
  curl -X POST https://gandal-api.onrender.com/api/v1/vms/1/stop -H "Authorization: Bearer <VOTRE_TOKEN>"
  ```
- **Pause/Suspendre (`POST /api/v1/vms/{id}/pause`)** :
  ```bash
  curl -X POST https://gandal-api.onrender.com/api/v1/vms/1/pause -H "Authorization: Bearer <VOTRE_TOKEN>"
  ```

### D. Suppression d'une VM (`DELETE /api/v1/vms/{id}`)
- **Action UI** : Cliquer sur le bouton Supprimer, puis confirmer la suppression.
- **Test curl direct** :
  ```bash
  curl -X DELETE https://gandal-api.onrender.com/api/v1/vms/1 \
    -H "Authorization: Bearer <VOTRE_TOKEN>"
  ```

---

## 3. Flow de Gestion des Requêtes (Requests API)

### A. Liste des requêtes (`GET /api/v1/requetes`)
- **Action UI** : Onglet **Requêtes** (Étudiant), **Inscriptions** / **Demandes VM** (Enseignant), **Requêtes** (Super Admin).
- **Test curl direct** :
  ```bash
  curl -X GET https://gandal-api.onrender.com/api/v1/requetes \
    -H "Authorization: Bearer <VOTRE_TOKEN>"
  ```

### B. Soumission de Requête de Création VM (`POST /api/v1/requetes/create-vm`)
- **Action UI** : Envoyer une demande de création de ressources depuis l'espace étudiant.
- **Test curl direct** :
  ```bash
  curl -X POST https://gandal-api.onrender.com/api/v1/requetes/create-vm \
    -H "Authorization: Bearer <VOTRE_TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{
      "object": "Simulation SMA",
      "content": "Besoin de ressources CPU supplémentaires",
      "teacher_id": 2,
      "size_rom": 50,
      "size_ram": 8,
      "os": "Ubuntu"
    }'
  ```

### C. Approbation de Requête (`POST /api/v1/requetes/{id}/validate`)
- **Action UI** : Onglets Inscriptions/VMs de l'Enseignant/Super Admin, cliquer sur **Accepter**.
- **Test curl direct** :
  ```bash
  curl -X POST https://gandal-api.onrender.com/api/v1/requetes/1/validate \
    -H "Authorization: Bearer <VOTRE_TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{"feedback": "Ressources validées et allouées"}'
  ```

### D. Rejet de Requête (`POST /api/v1/requetes/{id}/reject`)
- **Action UI** : Cliquer sur **Rejeter** dans le panel de supervision.
- **Test curl direct** :
  ```bash
  curl -X POST https://gandal-api.onrender.com/api/v1/requetes/1/reject \
    -H "Authorization: Bearer <VOTRE_TOKEN>"
  ```

---

## 4. Flow de Dépôt de Projets (Publications API)

### A. Liste des publications (`GET /api/v1/publications`)
- **Action UI** : Onglet **Publications** de l'Étudiant ou Enseignant.
- **Test curl direct** :
  ```bash
  curl -X GET https://gandal-api.onrender.com/api/v1/publications
  ```

### B. Création de Publication (`POST /api/v1/publications`)
- **Action UI** : Remplir le formulaire dans l'onglet Publications et soumettre.
- **Test curl direct** :
  ```bash
  curl -X POST https://gandal-api.onrender.com/api/v1/publications \
    -H "Authorization: Bearer <VOTRE_TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{
      "nom": "Portail Supervision SMA",
      "description": "Système multi-agents de supervision",
      "lien": "https://github.com/enspy-gi27/supervision-sma",
      "photo": "Système Multi-Agent",
      "user_id": 1,
      "status": "published"
    }'
  ```
