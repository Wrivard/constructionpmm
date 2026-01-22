# 🔍 DÉBOGAGE - Formulaire Production

## 🎯 Situation
- ✅ Variables d'environnement configurées dans Vercel
- ✅ Fonctionne en DEV
- ❌ Ne fonctionne PAS en PRODUCTION (constructionpmm.com)

---

## 🚨 ÉTAPE 1: Vérifier les logs Vercel en temps réel

C'est LA chose la plus importante pour comprendre le problème.

### Comment accéder aux logs:

1. Va sur https://vercel.com/
2. Ouvre ton projet **constructionpmm**
3. Clique **Deployments** (menu du haut)
4. Clique sur le déploiement avec le badge **"Production"** (celui qui est actif)
5. Scroll vers le bas → Section **"Functions"**
6. Clique sur `submit-contact-form`
7. En haut, clique sur **"Logs"**
8. **GARDE CETTE PAGE OUVERTE**

### Maintenant teste le formulaire:

1. Ouvre un nouvel onglet
2. Va sur https://constructionpmm.com/contact.html
3. Remplis le formulaire:
   - Nom: Test
   - Email: ton@email.com
   - Message: Test production
   - ✓ Accepte les conditions
4. Clique **Envoyer**
5. **RETOURNE IMMÉDIATEMENT sur l'onglet des logs Vercel**

### Que chercher dans les logs:

#### ✅ Si tu vois "✅ Email sent successfully":
**Le formulaire fonctionne!** Le problème est peut-être intermittent ou résolu.

#### ❌ Si tu vois "RESEND_API_KEY not found":
```
❌ RESEND_API_KEY not found in environment variables
```
**Solution:**
- Les variables ne sont pas bien configurées
- Va dans Settings → Environment Variables
- Vérifie que `RESEND_API_KEY` a bien ✓ Production coché
- Redéploie le site

#### ❌ Si tu vois une erreur Resend:
```
Business email error: { statusCode: 403, message: 'Invalid API key' }
```
**Solutions possibles:**
1. **Clé API invalide ou expirée**
   - Va sur https://resend.com/api-keys
   - Vérifie que ta clé est toujours active
   - Crée une nouvelle clé si nécessaire
   - Remplace dans Vercel → Environment Variables
   - Redéploie

2. **Limite de quota atteinte**
   - Va sur https://resend.com/
   - Vérifie ton usage (plan gratuit = 3000 emails/mois)
   - Upgrade si nécessaire

3. **Email non vérifié**
```
Error: Email must be verified
```
   - Va sur https://resend.com/domains
   - Si tu utilises `onboarding@resend.dev` → Ça devrait marcher
   - Si tu utilises un email custom → Vérifie ton domaine

#### ❌ Si tu vois "Function invocation timeout":
```
Error: Function execution timed out
```
**Solution:**
- Problème de connexion avec Resend API
- Vérifie ta connexion internet
- Réessaye dans quelques minutes

#### ❌ Si tu ne vois AUCUN log:
**Le formulaire n'appelle pas l'API!**
**Solutions:**
1. Cache du navigateur:
   - Fais Ctrl+Shift+R (Windows) ou Cmd+Shift+R (Mac)
   - Réessaye

2. Mauvaise URL:
   - Vérifie que tu es bien sur `constructionpmm.com` (sans "www")
   - Pas sur un sous-domaine Vercel

---

## 🚨 ÉTAPE 2: Vérifier les variables d'environnement

Double-vérifie la configuration:

1. Va sur Vercel → Settings → Environment Variables
2. Pour **RESEND_API_KEY**:
   - [ ] La valeur commence par `re_`
   - [ ] ✓ Production est coché
   - [ ] ✓ Preview est coché
   - [ ] ✓ Development est coché
   - [ ] Pas d'espaces avant/après la valeur

3. Pour **FROM_EMAIL**:
   - [ ] Valeur = `onboarding@resend.dev` (exactement)
   - [ ] ✓ Production est coché
   - [ ] ✓ Preview est coché
   - [ ] ✓ Development est coché
   - [ ] Pas d'espaces avant/après la valeur

### Si tu as modifié quelque chose:
**IMPORTANT:** Redéploie le site!
```bash
git commit --allow-empty -m "fix: update env vars"
git push origin main
```

Ou via Vercel Dashboard:
Deployments → ... → Redeploy

---

## 🚨 ÉTAPE 3: Tester la clé API Resend manuellement

Vérifie que ta clé API fonctionne vraiment:

### Via curl (dans ton terminal):

```bash
curl --request POST \
  --url https://api.resend.com/emails \
  --header 'Authorization: Bearer TA_CLE_API_ICI' \
  --header 'Content-Type: application/json' \
  --data '{
    "from": "onboarding@resend.dev",
    "to": "ton@email.com",
    "subject": "Test API",
    "html": "<p>Test</p>"
  }'
```

**Remplace:**
- `TA_CLE_API_ICI` par ta vraie clé (commence par `re_`)
- `ton@email.com` par ton vrai email

### Résultats possibles:

#### ✅ Succès:
```json
{"id":"49a3999c-0ce1-4ea6-ab68-afcd6dc2e794"}
```
**Ta clé fonctionne!** Le problème est ailleurs.

#### ❌ Erreur 403:
```json
{"statusCode":403,"message":"Invalid API key"}
```
**Ta clé est invalide!**
- Crée une nouvelle clé sur https://resend.com/api-keys
- Mets-la à jour dans Vercel
- Redéploie

#### ❌ Erreur 422:
```json
{"statusCode":422,"message":"Invalid email"}
```
**Email format invalide** (vérifie la syntaxe)

---

## 🚨 ÉTAPE 4: Vérifier l'accès à l'API sur le domaine

Teste si l'API est accessible sur ton domaine de production:

### Via navigateur:

1. Ouvre la console (F12)
2. Va dans l'onglet **Console**
3. Colle ce code:

```javascript
fetch('https://constructionpmm.com/api/submit-contact-form', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test',
    email: 'test@test.com',
    message: 'Test message',
    acceptTerms: 'true'
  })
})
.then(r => r.json())
.then(d => console.log('✅ Réponse:', d))
.catch(e => console.error('❌ Erreur:', e));
```

4. Appuie sur Entrée

### Résultats:

#### ✅ Si tu vois:
```javascript
✅ Réponse: {success: false, message: "Erreur lors de l'envoi de l'email."}
```
**L'API est accessible!** Le problème vient de Resend (voir logs).

#### ❌ Si tu vois:
```javascript
❌ Erreur: Failed to fetch
```
**L'API n'est pas accessible!**
- Problème de routing Vercel
- Vérifie `vercel.json`
- Vérifie que le dossier `api/` existe dans le déploiement

---

## 🚨 ÉTAPE 5: Vérifier vercel.json

Le fichier `vercel.json` doit contenir:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ]
}
```

Si ce n'est pas le cas, ajoute-le et redéploie.

---

## 🚨 ÉTAPE 6: Comparer DEV vs PROD

### Ce qui marche en DEV:

Quand tu testes localement avec `vercel dev`:
- Quelle URL utilises-tu? `localhost:3000` ou autre?
- Est-ce que tu utilises les mêmes variables d'environnement?

### Vérifier si les env vars sont les mêmes:

Dans Vercel → Settings → Environment Variables:
- [ ] RESEND_API_KEY a la même valeur en Dev et Prod
- [ ] FROM_EMAIL a la même valeur en Dev et Prod

---

## 📊 Checklist de débogage complète

- [ ] J'ai vérifié les logs Vercel en temps réel
- [ ] J'ai vu l'erreur exacte dans les logs
- [ ] Les variables ont ✓ Production coché
- [ ] J'ai redéployé après avoir modifié les variables
- [ ] Ma clé API Resend fonctionne (test curl)
- [ ] L'API est accessible via fetch dans la console
- [ ] Le fichier vercel.json contient les rewrites
- [ ] J'ai vidé le cache du navigateur (Ctrl+Shift+R)
- [ ] Le déploiement est terminé (statut "Ready")

---

## 💡 Solutions rapides selon l'erreur

| Erreur dans les logs | Solution |
|---------------------|----------|
| `RESEND_API_KEY not found` | Variables mal configurées, vérifie que Production est coché |
| `Invalid API key` | Clé API invalide, crée une nouvelle clé sur resend.com |
| `Email must be verified` | Change FROM_EMAIL pour `onboarding@resend.dev` |
| `Function timeout` | Problème réseau, réessaye dans 5 min |
| Aucun log | L'API n'est pas appelée, vérifie vercel.json et cache |
| `Quota exceeded` | Limite atteinte, upgrade ton plan Resend |

---

## 🆘 Partage-moi ces infos

Si ça ne marche toujours pas, envoie-moi:

1. **Screenshot des logs Vercel** quand tu soumets le formulaire
2. **Screenshot de la page Environment Variables** (masque les valeurs sensibles)
3. **L'erreur exacte** que tu vois dans la console du navigateur (F12)
4. **Le résultat** du test curl (ÉTAPE 3)

Avec ça, je pourrai t'aider précisément! 🚀

---

## 🎯 Action immédiate

**Fais l'ÉTAPE 1 maintenant** (vérifier les logs en temps réel).

C'est la seule façon de savoir exactement ce qui ne va pas.

Les logs te diront:
- Si la clé API est invalide
- Si les variables ne sont pas chargées
- Si Resend rejette les emails
- Si le quota est dépassé
- Quelle erreur exacte se produit

**Sans les logs, on devine. Avec les logs, on sait.** 🔍
