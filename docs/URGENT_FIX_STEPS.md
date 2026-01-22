# 🚨 URGENT: 3 ÉTAPES POUR FIXER L'ERREUR 500

## ❌ Problème actuel
Le formulaire retourne une erreur 500. **Cause probable: Variables d'environnement manquantes sur Vercel.**

---

## ✅ SOLUTION EN 3 ÉTAPES

### 📍 ÉTAPE 1: Obtenir une clé API Resend (5 minutes)

1. **Va sur:** https://resend.com/
2. **Clique:** "Sign Up" (ou "Login" si tu as déjà un compte)
3. **Crée un compte gratuit** (3000 emails/mois gratuits)
4. **Une fois connecté:**
   - Clique sur **"API Keys"** dans le menu
   - Clique **"Create API Key"**
   - Nom: `Construction PMM Production`
   - Clique **"Create"**
   - **COPIE LA CLÉ** (commence par `re_`)
   - ⚠️ Tu ne pourras plus la voir après !

**✓ Tu as maintenant:** `re_xxxxxxxxxxxxxxxxxxxxxxxxxx`

---

### 📍 ÉTAPE 2: Ajouter les variables dans Vercel (3 minutes)

1. **Va sur:** https://vercel.com/
2. **Clique sur ton projet:** `constructionpmm`
3. **Clique:** **Settings** (dans le menu du haut)
4. **Clique:** **Environment Variables** (dans le menu de gauche)

5. **Ajouter la première variable:**
   - Clique **"Add New"**
   - **Key:** `RESEND_API_KEY`
   - **Value:** Colle la clé que tu as copiée (ex: `re_xxxxxx...`)
   - **Environments:** ✓ Production ✓ Preview ✓ Development
   - Clique **"Save"**

6. **Ajouter la deuxième variable:**
   - Clique **"Add New"** encore
   - **Key:** `FROM_EMAIL`
   - **Value:** `onboarding@resend.dev`
   - **Environments:** ✓ Production ✓ Preview ✓ Development
   - Clique **"Save"**

**✓ Tu as maintenant 2 variables configurées**

---

### 📍 ÉTAPE 3: Redéployer le site (2 minutes)

**Les variables ne s'appliquent qu'après un redéploiement !**

#### Option A - Via Vercel Dashboard (plus simple):

1. Reste sur Vercel Dashboard
2. Clique sur **"Deployments"** (dans le menu du haut)
3. Clique sur la ligne du **premier déploiement** (le plus récent)
4. Clique sur le bouton **"..." (trois points)** en haut à droite
5. Clique **"Redeploy"**
6. Confirme en cliquant **"Redeploy"**

**Attends 1-2 minutes** que le statut passe à "Ready" ✅

#### Option B - Via Git (alternative):

```bash
git commit --allow-empty -m "trigger: redeploy with env vars"
git push origin main
```

**✓ Le site est redéployé avec les nouvelles variables**

---

## 🧪 ÉTAPE 4: TESTER (1 minute)

1. **Va sur:** https://constructionpmm.com/carriere
2. **Remplis le formulaire:**
   - Nom: Test User
   - Email: **TON EMAIL** (pour recevoir la confirmation)
   - Téléphone: 514-555-1234
   - Message: Test
   - Clique sur un poste (ex: Charpentier-menuisier)
   - ✓ Accepte les termes
3. **Clique:** Soumettre

### ✅ Si ça fonctionne:
- Message de succès vert ✓
- Tu reçois un email de confirmation (check ton inbox)
- wrivard@kua.quebec reçoit un email avec tes infos

### ❌ Si ça ne fonctionne toujours pas:
**Vérifier les logs Vercel** (voir `check-vercel-logs.md`)

---

## 📊 Récapitulatif visuel

```
┌─────────────────────────────────────┐
│ ÉTAPE 1: Resend API Key             │
│ ───────────────────────────────────│
│ resend.com → API Keys → Create      │
│ ✓ Copier la clé: re_xxxxxxxxxx      │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ ÉTAPE 2: Ajouter dans Vercel        │
│ ───────────────────────────────────│
│ Settings → Environment Variables    │
│ ✓ RESEND_API_KEY = re_xxxxx...      │
│ ✓ FROM_EMAIL = onboarding@resend.dev│
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ ÉTAPE 3: Redéployer                 │
│ ───────────────────────────────────│
│ Deployments → ... → Redeploy        │
│ ✓ Attendre "Ready" (1-2 min)        │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ ÉTAPE 4: Tester                     │
│ ───────────────────────────────────│
│ constructionpmm.com/carriere        │
│ ✓ Soumettre le formulaire           │
│ ✓ Vérifier les emails               │
└─────────────────────────────────────┘
```

---

## ⏱️ Temps total estimé: **10 minutes**

## 🎯 Après ces étapes, le formulaire devrait fonctionner !

---

## 🆘 Si tu es toujours bloqué

**Partage-moi une capture d'écran de:**
1. La page "Environment Variables" de Vercel (masque les valeurs sensibles)
2. Les logs Vercel quand tu soumet le formulaire

Et je t'aiderai à débugger ! 💪
