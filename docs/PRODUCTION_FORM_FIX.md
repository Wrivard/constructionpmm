# 🔥 FORMULAIRE DE SOUMISSION - FIX PRODUCTION

## ❌ Problème
✅ Fonctionne en DEV
❌ Ne fonctionne PAS en PRODUCTION

**Erreur:** 500 Internal Server Error - "Erreur lors de l'envoi de l'email"

---

## 🎯 Cause
Les **variables d'environnement** ne sont pas configurées (ou pas synchronisées) sur Vercel Production.

---

## ✅ SOLUTION RAPIDE (5 minutes)

### Étape 1: Vérifier les variables sur Vercel

1. Va sur https://vercel.com/
2. Ouvre ton projet **constructionpmm**
3. Clique **Settings** → **Environment Variables**

**Tu devrais voir:**
- `RESEND_API_KEY` = `re_xxxxxxxxxxxxxxxx`
- `FROM_EMAIL` = `onboarding@resend.dev` (ou ton email vérifié)

### Étape 2A: Si les variables EXISTENT déjà ✅

**Les variables existent mais le site n'a pas été redéployé après leur ajout!**

**Solution:** Force un redéploiement

**Option 1 - Via Vercel Dashboard:**
1. Clique **Deployments** (menu du haut)
2. Clique sur le **dernier déploiement** (le plus récent)
3. Clique le bouton **"..."** (trois points) en haut à droite
4. Clique **"Redeploy"**
5. Confirme en cliquant **"Redeploy"** encore
6. Attends 1-2 minutes ⏱️

**Option 2 - Via Git:**
```bash
git commit --allow-empty -m "fix: redeploy for env vars"
git push origin main
```

### Étape 2B: Si les variables N'EXISTENT PAS ❌

**Tu dois les ajouter:**

1. Sur la page **Environment Variables**, clique **"Add New"**

2. **Première variable:**
   - **Key:** `RESEND_API_KEY`
   - **Value:** Ta clé API Resend (commence par `re_`)
   - **Environments:** Coche ✓ Production, ✓ Preview, ✓ Development
   - Clique **Save**

3. **Deuxième variable:**
   - **Key:** `FROM_EMAIL`
   - **Value:** `onboarding@resend.dev`
   - **Environments:** Coche ✓ Production, ✓ Preview, ✓ Development
   - Clique **Save**

4. **Redéploie** (voir Étape 2A ci-dessus)

---

## 🔍 Tu n'as pas de clé API Resend?

**Obtiens-en une en 5 minutes:**

1. Va sur https://resend.com/
2. Crée un compte gratuit (3000 emails/mois)
3. Clique **API Keys** → **Create API Key**
4. Nom: `Construction PMM`
5. **Copie la clé** (commence par `re_`) - tu ne pourras plus la voir!
6. Retourne à l'Étape 2B ci-dessus

---

## 🧪 TESTER

Après le redéploiement:

1. Va sur **ton site de production:** https://constructionpmm.com/contact.html
2. Remplis le formulaire de contact (ou carrière)
3. Clique **Envoyer**

### ✅ Succès si:
- Message vert "✓ Envoyé !"
- Aucune erreur 500
- Email reçu à `info@constpmm.com`

---

## 🆘 Toujours une erreur?

### Vérifier les logs en temps réel:

1. Dans Vercel, clique **Deployments**
2. Clique sur le déploiement actif (avec le badge "Production")
3. Clique **Functions**
4. Clique sur `api/submit-contact-form`
5. Clique **Logs** (en haut)
6. **Soumets le formulaire pendant que tu regardes les logs**

**Cherche:**
- ❌ `RESEND_API_KEY not found` → Les variables ne sont pas là
- ❌ `Invalid API key` → Ta clé API n'est pas valide
- ❌ `Email not verified` → Tu dois vérifier ton domaine dans Resend
- ✅ `Email sent successfully` → Ça fonctionne!

---

## 📊 Checklist de diagnostic

- [ ] Les variables sont dans Vercel Settings → Environment Variables
- [ ] Les variables ont ✓ Production coché
- [ ] Le site a été redéployé APRÈS avoir ajouté les variables
- [ ] La clé API Resend est valide (commence par `re_`)
- [ ] Le déploiement est terminé (statut "Ready" ✅)
- [ ] Les logs Vercel ne montrent pas d'erreurs

---

## 💡 Note importante

**Les changements de variables d'environnement ne s'appliquent qu'après un redéploiement!**

Si tu ajoutes/modifies une variable:
1. Sauvegarde-la dans Vercel
2. **PUIS** redéploie le site
3. **SINON** elle ne sera pas prise en compte

---

## ✨ Résumé ultra-rapide

```bash
1. Vercel → Settings → Environment Variables
2. Ajouter: RESEND_API_KEY + FROM_EMAIL
3. Deployments → ... → Redeploy
4. Attendre "Ready" (1-2 min)
5. Tester le formulaire
```

**Temps total: 5 minutes ⏱️**

---

Besoin d'aide? Partage-moi une capture d'écran des logs Vercel! 🚀
