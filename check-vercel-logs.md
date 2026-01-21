# 🔍 Comment vérifier les logs Vercel

## Méthode 1: Via Vercel CLI (Rapide)

```bash
# Installer Vercel CLI si pas déjà fait
npm i -g vercel

# Se connecter
vercel login

# Voir les logs en temps réel
vercel logs --follow
```

Puis soumettre le formulaire et observer les logs.

## Méthode 2: Via Vercel Dashboard (Plus facile)

### Étape 1: Aller sur Vercel
1. Ouvre https://vercel.com/
2. Connecte-toi avec ton compte
3. Clique sur ton projet "constructionpmm"

### Étape 2: Accéder aux logs
Dans la navigation, clique sur une de ces options:
- **"Logs"** (dans la sidebar)
- OU **"Functions"** → Clique sur `/api/submit-career-form`
- OU **"Deployments"** → Clique sur le dernier déploiement → "Function Logs"

### Étape 3: Filtrer les logs
- Si possible, filtre par `/api/submit-career-form`
- Ou cherche l'heure de ta dernière tentative

### Étape 4: Soumettre le formulaire
1. Garde la page des logs ouverte
2. Dans un autre onglet, va sur https://constructionpmm.com/carriere
3. Remplis et soumet le formulaire
4. Retourne voir les logs en temps réel

### Étape 5: Identifier l'erreur
Les logs devraient montrer quelque chose comme:

#### ✅ Si ça fonctionne:
```
🚀 API /submit-career-form called
📝 Parsing form data...
✅ Form parsed successfully
📋 Extracted fields:
  Name: Test User
  Email: test@example.com
🔑 Checking environment variables...
  RESEND_API_KEY: ✓ Set
  FROM_EMAIL: onboarding@resend.dev
📧 Sending business email...
✅ Business email sent successfully
🎉 Career form submission completed!
```

#### ❌ Si RESEND_API_KEY manque:
```
🚀 API /submit-career-form called
📝 Parsing form data...
✅ Form parsed successfully
🔑 Checking environment variables...
  RESEND_API_KEY: ❌ Missing
❌ RESEND_API_KEY is missing!
Error: RESEND_API_KEY environment variable missing
```

#### ❌ Si problème d'email:
```
🚀 API /submit-career-form called
📝 Parsing form data...
✅ Form parsed successfully
🔑 Checking environment variables...
  RESEND_API_KEY: ✓ Set
📧 Sending business email...
❌ Business email error: {...}
Error details: Email not verified
```

---

## 🔑 Vérifier les Variables d'Environnement

### Sur Vercel Dashboard:

1. **Projet constructionpmm** → **Settings** → **Environment Variables**

2. **Vérifier que ces 2 variables existent:**

```
RESEND_API_KEY = re_xxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL = onboarding@resend.dev
```

### Si elles manquent:

#### A. Obtenir RESEND_API_KEY:

1. Va sur https://resend.com/
2. Crée un compte (gratuit - 3000 emails/mois)
3. Dashboard → **API Keys**
4. Clique **"Create API Key"**
5. Donne un nom (ex: "Construction PMM")
6. Copie la clé (commence par `re_`)

#### B. Ajouter dans Vercel:

1. Vercel Dashboard → Settings → Environment Variables
2. Clique **"Add New"**
3. **Key:** `RESEND_API_KEY`
4. **Value:** `re_xxxxxxxxxxxxx` (colle ta clé)
5. **Environments:** Sélectionne **Production, Preview, Development**
6. Clique **"Save"**

7. Répète pour `FROM_EMAIL`:
   - **Key:** `FROM_EMAIL`
   - **Value:** `onboarding@resend.dev`
   - **Environments:** Production, Preview, Development
   - **Save**

#### C. REDÉPLOYER (CRUCIAL!):

Les variables ne s'appliquent qu'après un nouveau déploiement.

**Option 1 - Trigger un redéploiement:**
1. Vercel Dashboard → Deployments
2. Clique sur le dernier déploiement
3. Clique "..." (menu) → **"Redeploy"**

**Option 2 - Push un petit changement:**
```bash
git commit --allow-empty -m "trigger: redeploy for env vars"
git push origin main
```

---

## 🧪 Test après configuration

1. Attends que le redéploiement soit terminé (1-2 min)
2. Va sur https://constructionpmm.com/carriere
3. Remplis le formulaire avec **TON EMAIL**
4. Soumet
5. Vérifie:
   - ✅ Message de succès
   - ✅ Email reçu sur wrivard@kua.quebec
   - ✅ Email de confirmation reçu sur ton email

---

## 📋 Checklist de débogage

```
Logs Vercel:
  [ ] J'ai accédé aux logs Vercel
  [ ] J'ai soumis le formulaire en regardant les logs
  [ ] J'ai identifié la dernière ligne avant l'erreur
  [ ] J'ai noté le message d'erreur exact

Variables d'environnement:
  [ ] RESEND_API_KEY existe et commence par "re_"
  [ ] FROM_EMAIL = onboarding@resend.dev
  [ ] J'ai redéployé après les avoir ajoutées
  [ ] Le redéploiement est terminé

Test:
  [ ] Formulaire soumis
  [ ] Message de succès reçu
  [ ] Email business reçu (wrivard@kua.quebec)
  [ ] Email confirmation reçu (mon email)
```

---

## 🆘 Si tu es bloqué

**Partage-moi:**
1. Le dernier message des logs Vercel (copie-colle)
2. Les variables d'environnement configurées (juste dire si elles existent, pas les valeurs)
3. Une capture d'écran des logs si possible

Avec ces infos, je pourrai t'aider précisément ! 🎯
