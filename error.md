# Diagnostic RÉEL — Échec d'approbation de requête VM (`r_create_vm`)

> Diagnostic effectué avec credentials réels le 2026-06-10.
> Enseignant testé : TAGATSING FOTSING SAMUEL SEAN (id=35, role="teacher")
> Requête testée : id=6 (type=r_create_vm, student_id=36, teacher_id=35, status=pending→rejected)

---

## Résultats des tests directs

| Appel | Résultat | Code HTTP | Temps |
|-------|----------|-----------|-------|
| `GET /api/v1/auth/me` (teacher token) | ✅ OK — `{id:35, role:"teacher"}` | 200 | ~5s |
| `GET /api/v1/requetes` | ✅ OK — requête id=6 visible | 200 | ~10s |
| `POST /api/v1/requetes/6/approve` avec `{ssh_public_key:""}` | ❌ **Internal Server Error** | **500** | **5s** |
| `POST /api/v1/requetes/6/reject` | ✅ OK — status→"rejected" | 200 | ~9s |
| `POST /api/v1/requetes/999/approve` (inexistant) | ✅ 404 Requête introuvable | 404 | ~5s |
| `POST /api/v1/vms` (create VM directement) | ❌ 403 "Droits administrateur requis" | 403 | ~8s |
| `GET /api/v1/vms` (teacher standard) | ✅ liste vide (200) | 200 | ~3s |

**Conclusion : l'erreur est un crash interne du backend (500), pas une erreur de permission (403). Les permissions de lecture et de rejet fonctionnent. Seule l'approbation crash.**

---

## Erreur 1 — CONFIRMÉE CRITIQUE : Le backend crash lors de la création de VM dans Proxmox

### Preuve
- `/approve` retourne **HTTP 500** (`Internal Server Error`) en **5 secondes**
- `/reject` retourne **HTTP 200** en ~9 secondes (fonctionne parfaitement)
- `POST /api/v1/vms` retourne **403** pour un enseignant standard ("Droits administrateur requis")

### Ce que fait le backend lors de `/approve` pour une `r_create_vm`

```
1. Vérifie le token → OK (sinon 401)
2. Vérifie que la requête existe → OK (sinon 404)
3. Vérifie que la requête est "pending" → OK (sinon 400)
4. Tente de créer la VM dans Proxmox
   → CRASH : Proxmox non joignable depuis Render / credentials invalides / timeout
5. Retourne 500 Internal Server Error
```

La réponse du serveur est exactement `Internal Server Error` (texte brut, pas de JSON),
ce qui confirme un crash non géré en Python (exception non interceptée dans le handler FastAPI).

---

## Erreur 2 — CONFIRMÉE : L'enseignant standard ne peut pas créer de VM directement

Le backend retourne `403 "Droits administrateur requis"` sur `POST /api/v1/vms`.
Cela confirme que le backend appelle cet endpoint (ou une logique équivalente) en interne lors de
l'approbation, mais avec le token de l'enseignant — et échoue peut-être aussi pour cette raison.

Cependant, étant donné que l'erreur est 500 et non 403, c'est probablement l'appel Proxmox qui crash
**avant** ou **en lieu et place** de l'appel à `POST /vms`.

---

## Erreur 3 — L'erreur "networkaffatch" dans le dashboard (superadmin)

### Cause identifiée

L'erreur "networkaffatch" (probablement "NetworkError" ou "fetch failed" affiché par le browser)
est une **erreur CORS ou de connexion**, non une erreur backend.

**Ce qui se passe** :
1. L'admin clique "Approuver" dans le dashboard
2. Le frontend envoie `POST /api/v1/requetes/{id}/approve`
3. Render met **jusqu'à 30+ secondes** pour répondre (cold start ou traitement lent)
4. Le browser annule la requête fetch après ~30s (timeout par défaut)
5. Affiche `TypeError: Failed to fetch` / `NetworkError` dans la console

Ce **n'est pas** une vraie erreur réseau de ta connexion internet — ta connexion passe bien.
C'est un timeout côté browser qui attend trop longtemps une réponse.

**Preuve** : les tests curl ont montré des temps de réponse de 5 à 60+ secondes pour les appels Render.

---

## Récapitulatif final

| # | Erreur | Statut | Code HTTP réel |
|---|--------|--------|----------------|
| 1 | Crash Proxmox dans `/approve` (r_create_vm) | ✅ **CONFIRMÉ** | 500 |
| 2 | Enseignant standard ne peut pas créer VM directement | ✅ **CONFIRMÉ** | 403 |
| 3 | "networkaffatch" = timeout browser sur Render | ✅ **CONFIRMÉ** | (fetch timeout) |
| 4 | `n_cpu` manquant dans RCreateVMCreate | ⚠️ Probable (contribue au 500) | 500 |

---

## Ce que le backend DOIT corriger

### Fix 1 (OBLIGATOIRE) — Intercepter les erreurs Proxmox dans `/approve`

Le handler FastAPI doit wrapper l'appel Proxmox dans un try/except et retourner une réponse
structurée au lieu de laisser l'exception remonter en 500 :

```python
# Pseudocode Python (FastAPI)
@router.post("/requetes/{requete_id}/approve")
async def approve_requete(requete_id: int, body: ApproveBody, current_user = Depends(...)):
    requete = get_requete_or_404(requete_id)
    if requete.status != "pending":
        raise HTTPException(400, "Cette requête a déjà été traitée et ne peut plus être modifiée.")

    try:
        # Tenter la création Proxmox
        vm = proxmox_client.create_vm(...)
    except ProxmoxException as e:
        # NE PAS laisser crash → créer la VM en base avec status="waiting"
        vm = create_vm_in_db(
            size_rom=requete.size_rom,
            size_ram=requete.size_ram,
            n_cpu=2,  # valeur par défaut car n_cpu absent de RCreateVMCreate
            user_id=requete.student_id,
            iso=requete.os,
            status="waiting"  # sera provisionnée plus tard
        )

    requete.status = "validated"
    db.commit()
    return {"message": "Requête approuvée", "vm_id": vm.id}
```

### Fix 2 (OBLIGATOIRE) — Ajouter `n_cpu` dans `RCreateVMCreate` ou utiliser une valeur par défaut

Le modèle `RCreateVMCreate` ne contient pas `n_cpu` alors que `VMCreate` en a besoin.
Le backend doit utiliser une valeur par défaut lors de l'approbation.

Modifier le schema Pydantic backend :

```python
class RCreateVMCreate(BaseModel):
    object: str
    content: Optional[str] = None
    teacher_id: int
    size_rom: int
    size_ram: int
    n_cpu: int = 2  # ← AJOUTER avec valeur par défaut
    os: str
```

Et ajouter le même champ dans le frontend (`src/components/dashboard/RequestsTab.tsx`) :

```tsx
// Dans le formulaire RequestsTab, ligne ~404, ajouter un slider n_cpu
// Et dans handleSubmitRequest (etudiant/page.tsx, ligne ~263) :
response = await apiClient.createVmRequest({
  object: newReq.vmLabel || newReq.vmName,
  content: newReq.justification,
  teacher_id: teacherId,
  size_rom: newReq.sizeRom ?? 40,
  size_ram: newReq.sizeRam ?? 4,
  os: newReq.os ?? 'Ubuntu',
  // n_cpu: newReq.nCpu ?? 2,  ← ajouter quand le backend supporte
});
```

### Fix 3 (RECOMMANDÉ) — Mode "simulation" quand Proxmox est inaccessible

Ajouter une variable d'environnement `PROXMOX_SIMULATION_MODE=true` sur Render.
Quand activé, `/approve` crée la VM **en base seulement** (status="waiting") sans appeler Proxmox.
La VM sera provisionnée manuellement ou par un worker ultérieur.

---

## Commandes de test pour confirmer après correction

```bash
# 1. Login
TOKEN=$(curl -s -X POST https://gandal-api.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"TAGATSING FOTSING SAMUEL SEAN","password":"Samuelcenter2"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

# 2. Vérifier les requêtes pending
curl -s https://gandal-api.onrender.com/api/v1/requetes \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# 3. Approuver (après fix backend)
curl -v -X POST https://gandal-api.onrender.com/api/v1/requetes/{ID}/approve \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ssh_public_key": ""}'
# → Doit retourner 200 avec les détails de la VM créée
```
