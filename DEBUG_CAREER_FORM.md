# 🐛 Debug Guide - Career Form 500 Error

## 📋 Situation actuelle

Le formulaire de carrière retourne une erreur **500 (Internal Server Error)** lors de la soumission.

## ✅ Ce qui a été fait

### 1. Logging amélioré ✓

J'ai ajouté des logs détaillés à chaque étape du processus:

```javascript
// Logs API:
🚀 API /submit-career-form called
📝 Parsing form data...
✅ Form parsed successfully
📋 Extracted fields
📎 CV File
✅ Validation passed
🔑 Checking environment variables
📧 Email config
📧 Sending business email
✅ Business email sent successfully
📧 Sending confirmation email
✅ Confirmation email sent successfully
🎉 Career form submission completed successfully
```

### 2. Error handling amélioré ✓

- Stack traces complètes
- Messages d'erreur détaillés
- JSON error output en dev mode

## 🔍 Comment débugger

### Étape 1: Vérifier les logs Vercel

1. **Aller sur Vercel Dashboard:**
   - https://vercel.com/wrivard/[project-name]

2. **Aller dans "Logs" ou "Functions"**
   - Cliquer sur la fonction `/api/submit-career-form`
   - Regarder les logs en temps réel

3. **Soumettre le formulaire** et observer les logs

4. **Identifier l'étape qui échoue:**
   ```
   🚀 API called          ✓ OK
   📝 Parsing form        ❌ FAIL HERE?
   📋 Extracted fields    ❌ OR HERE?
   🔑 Env variables       ❌ OR HERE?
   📧 Sending email       ❌ OR HERE?
   ```

### Étape 2: Vérifier les variables d'environnement

**Sur Vercel Dashboard → Settings → Environment Variables**

Vérifier que ces variables existent:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx  # ✓ REQUIRED
FROM_EMAIL=onboarding@resend.dev # ✓ REQUIRED (ou un email vérifié)
```

**⚠️ IMPORTANT:** Après avoir ajouté/modifié les env vars, il faut **REDÉPLOYER** !

### Étape 3: Tester localement (optionnel)

```bash
# 1. Installer les dépendances
npm install

# 2. Créer .env.local
echo "RESEND_API_KEY=re_xxxxx" > .env.local
echo "FROM_EMAIL=onboarding@resend.dev" >> .env.local

# 3. Lancer Vercel dev
npx vercel dev

# 4. Tester le formulaire sur http://localhost:3000/carriere
```

## 🔧 Causes possibles et solutions

### Cause 1: RESEND_API_KEY manquante ❌

**Symptômes:**
```
❌ RESEND_API_KEY is missing!
Error: RESEND_API_KEY environment variable missing
```

**Solution:**
1. Aller sur https://resend.com/api-keys
2. Créer une nouvelle API key
3. L'ajouter dans Vercel:
   ```
   Settings → Environment Variables
   Name: RESEND_API_KEY
   Value: re_xxxxxxxxxxxx
   ```
4. **REDÉPLOYER** le projet

---

### Cause 2: FROM_EMAIL non vérifiée ❌

**Symptômes:**
```
❌ Business email error: { message: "Email not verified" }
```

**Solution:**

#### Option A: Utiliser l'email de test Resend (recommandé pour tester)
```bash
FROM_EMAIL=onboarding@resend.dev
```

#### Option B: Vérifier votre domaine
1. Aller sur Resend Dashboard
2. Add Domain → constructionpmm.com
3. Ajouter les DNS records (SPF, DKIM, DMARC)
4. Attendre la vérification (quelques heures)
5. Utiliser `no-reply@constructionpmm.com`

---

### Cause 3: Fichier CV trop gros ❌

**Symptômes:**
```
Le fichier CV est trop volumineux (maximum 5MB)
```

**Solution:**
- Réduire la taille du PDF
- Ou augmenter la limite dans `api/submit-career-form.js`:
  ```javascript
  maxFileSize: 10 * 1024 * 1024, // 10MB
  ```

---

### Cause 4: Formidable parsing error ❌

**Symptômes:**
```
❌ Parse error: [error details]
```

**Solution:**
- Vérifier que `formidable` est installé:
  ```bash
  npm install formidable@^3.5.1
  ```
- Vérifier que le formulaire utilise bien `enctype="multipart/form-data"`
- **REDÉPLOYER**

---

### Cause 5: Resend API error ❌

**Symptômes:**
```
❌ Business email error: { ... }
Error details: { statusCode: 403, ... }
```

**Solutions possibles:**

**403 Forbidden:**
- API key invalide → Régénérer la clé
- Domaine non vérifié → Utiliser `onboarding@resend.dev`
- Rate limit dépassé → Attendre ou upgrader le plan

**429 Too Many Requests:**
- Rate limit atteint
- Attendre quelques minutes
- Ou upgrader le plan Resend

**500 Internal Server Error (Resend):**
- Problème côté Resend
- Attendre et réessayer
- Vérifier https://status.resend.com

---

### Cause 6: Timeout ⏱️

**Symptômes:**
```
Function execution timeout
```

**Solution:**
- Augmenter le timeout dans `vercel.json`:
  ```json
  {
    "functions": {
      "api/submit-career-form.js": {
        "maxDuration": 30
      }
    }
  }
  ```

---

## 📊 Checklist de débogage

Utilise cette checklist pour identifier le problème:

```
Logs Vercel:
  [ ] Les logs s'affichent ?
  [ ] Quelle est la dernière étape réussie ?
  [ ] Quel est le message d'erreur exact ?

Variables d'environnement:
  [ ] RESEND_API_KEY existe ?
  [ ] FROM_EMAIL existe ?
  [ ] Projet redéployé après ajout des vars ?

Formulaire:
  [ ] enctype="multipart/form-data" présent ?
  [ ] Les noms de champs correspondent ?
    - Contact-1-Name
    - Contact-1-Email
    - Contact-1-Phone
    - Contact-1-Message
    - Contact-1-CV
    - Job-Title
  [ ] Le CV est < 5MB ?

Resend:
  [ ] API key valide ?
  [ ] Email vérifié ou utilise onboarding@resend.dev ?
  [ ] Rate limit OK ?
  [ ] Status Resend OK ? (https://status.resend.com)

Code:
  [ ] formidable installé ?
  [ ] resend installé ?
  [ ] API route déployée ?
  [ ] Pas d'erreur de syntax ?
```

---

## 🧪 Test manuel rapide

### Test 1: Sans CV

```
Formulaire:
- Nom: Test User
- Email: test@example.com (TON EMAIL pour recevoir la confirmation)
- Téléphone: 514-555-1234
- Message: Test message
- Job: [Sélectionner un poste]
- CV: [Ne pas joindre]
- ✓ Accepter les termes

→ Soumettre
```

**Résultat attendu:**
- ✅ Message de succès
- ✅ Email reçu sur wrivard@kua.quebec (business)
- ✅ Email reçu sur test@example.com (confirmation)

---

### Test 2: Avec CV

```
Formulaire:
- Nom: Test User
- Email: test@example.com
- Téléphone: 514-555-1234
- Message: Test avec CV
- Job: Charpentier-menuisier
- CV: [Joindre un PDF < 5MB]
- ✓ Accepter les termes

→ Soumettre
```

**Résultat attendu:**
- ✅ Message de succès
- ✅ Email reçu sur wrivard@kua.quebec avec CV en pièce jointe
- ✅ Email reçu sur test@example.com (confirmation)

---

## 🚀 Actions immédiates

### 1. Vérifier les logs Vercel (PRIORITÉ #1)

```bash
# Sur Vercel Dashboard:
1. Aller dans "Logs" ou "Functions"
2. Filtrer par "/api/submit-career-form"
3. Soumettre le formulaire
4. Observer les logs en temps réel
5. Noter le dernier log avant l'erreur
```

### 2. Vérifier les env vars (PRIORITÉ #2)

```bash
# Sur Vercel Dashboard:
1. Settings → Environment Variables
2. Vérifier RESEND_API_KEY
3. Vérifier FROM_EMAIL
4. Si manquantes → Les ajouter
5. REDÉPLOYER (important!)
```

### 3. Tester avec l'email de dev Resend (PRIORITÉ #3)

```bash
FROM_EMAIL=onboarding@resend.dev
```

Ce domaine est **pré-vérifié** par Resend et fonctionne toujours pour les tests.

---

## 📧 Email de test Resend

**Pour tester rapidement sans vérifier de domaine:**

```javascript
// Dans vercel environment variables:
FROM_EMAIL=onboarding@resend.dev

// OU dans le code (api/submit-career-form.js):
const fromEmail = 'onboarding@resend.dev';
```

**Avantages:**
- ✅ Pas besoin de vérifier un domaine
- ✅ Fonctionne immédiatement
- ✅ Parfait pour les tests

**Inconvénient:**
- ⚠️ L'email vient de "onboarding@resend.dev" (pas professionnel)
- ⚠️ À changer pour la production

---

## 📝 Prochaines étapes selon le problème

### Si RESEND_API_KEY manquante:
1. Créer une clé API sur resend.com
2. L'ajouter dans Vercel env vars
3. Redéployer
4. Tester à nouveau

### Si FROM_EMAIL non vérifiée:
1. Utiliser `onboarding@resend.dev` temporairement
2. OU vérifier le domaine constructionpmm.com dans Resend
3. Redéployer
4. Tester à nouveau

### Si autre erreur:
1. Noter le message d'erreur exact des logs
2. Chercher dans ce guide
3. Ou me le partager pour analyser ensemble

---

## 🔗 Ressources utiles

- **Resend Dashboard:** https://resend.com/
- **Resend Docs:** https://resend.com/docs
- **Vercel Dashboard:** https://vercel.com/
- **Resend Status:** https://status.resend.com
- **Formidable Docs:** https://github.com/node-formidable/formidable

---

## 💬 Message type d'erreur

Si tu vois toujours l'erreur 500, **envoie-moi:**

1. **Le dernier log avant l'erreur** (depuis Vercel)
2. **Les env vars configurées** (juste dire si elles existent, pas les valeurs)
3. **L'email FROM_EMAIL utilisé**

Avec ces infos, je pourrai identifier le problème exact ! 🎯

---

**Date:** 21 janvier 2026  
**Status:** 🐛 DEBUGGING MODE ACTIVÉ  
**Commit:** Prochainement avec logs améliorés  

**Next:** Vérifier les logs Vercel pour identifier la cause exacte ! 🔍
