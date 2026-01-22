# ✅ Intégration CV Upload — Terminée

L'intégration complète du système d'upload de CV pour les modales de candidature de la page carrière a été effectuée avec succès.

## 📁 Fichiers créés

### 1. `js/career-cv-upload.js`
- Gestion client-side de la sélection de fichiers CV
- Validation des formats (PDF, DOC, DOCX)
- Validation de la taille (max 5MB)
- Affichage dynamique des fichiers sélectionnés
- Soumission asynchrone des formulaires avec `fetch`
- Gestion des états de chargement et des messages d'erreur

### 2. `api/submit-career-form.js`
- API serverless Vercel pour traiter les candidatures
- Parsing multipart avec `formidable`
- Support des pièces jointes CV
- Envoi d'emails professionnels via Resend
- Email de confirmation automatique aux candidats
- Gestion des erreurs et nettoyage des fichiers temporaires

## 📝 Fichiers modifiés

### 1. `carriere.html`
**Modifications apportées aux 3 modales de candidature :**
- ✅ Changement de `method="get"` à `method="post"`
- ✅ Ajout de `enctype="multipart/form-data"`
- ✅ IDs de formulaires uniques (`wf-form-Contact-1-Form-1`, `-2`, `-3`)
- ✅ Classe `career-form` ajoutée pour la détection JavaScript
- ✅ Correction du champ téléphone : `type="email"` → `type="tel"`
- ✅ IDs uniques pour les champs téléphone (`Contact-1-Phone-1`, `-2`, `-3`)
- ✅ Champ Message n'est plus requis
- ✅ Section d'upload CV ajoutée après le champ Message avec :
  - Bouton "Ajouter votre CV"
  - Affichage du fichier sélectionné
  - Bouton "Retirer" pour supprimer le fichier
- ✅ Script `career-cv-upload.js` ajouté avant `</body>`

### 2. `package.json`
- ✅ Ajout de `resend: ^2.0.0`
- ✅ Ajout de `formidable: ^3.5.1`

## 🎨 Fonctionnalités

### Upload de CV
- ✅ Sélection de fichier via bouton stylisé
- ✅ Formats acceptés : PDF, DOC, DOCX
- ✅ Limite de taille : 5MB
- ✅ Validation côté client ET serveur
- ✅ Affichage du nom et taille du fichier
- ✅ Possibilité de retirer le fichier

### Soumission de formulaire
- ✅ Soumission asynchrone (pas de rechargement de page)
- ✅ Indicateur de chargement ("Envoi en cours...")
- ✅ Désactivation du bouton pendant l'envoi
- ✅ Gestion des erreurs avec messages en français
- ✅ Affichage des messages de succès
- ✅ Réinitialisation automatique du formulaire

### Emails
- ✅ **Email professionnel** envoyé à `info@constpmm.com` avec :
  - Design moderne et responsive
  - Informations du candidat (nom, email, téléphone)
  - Message du candidat (si fourni)
  - CV en pièce jointe (si fourni)
  - Bouton CTA "Répondre au Candidat"
  
- ✅ **Email de confirmation** envoyé au candidat avec :
  - Message de remerciement personnalisé
  - Délai de réponse indiqué (5-7 jours ouvrables)
  - Récapitulatif de la candidature

## ⚙️ Configuration requise

### Variables d'environnement Vercel
Vous devez configurer ces variables dans votre projet Vercel :

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
FROM_EMAIL=noreply@constructionpmm.com
```

**Important :** L'email de destination est codé en dur dans `api/submit-career-form.js` :
```javascript
const businessEmail = 'info@constpmm.com';
```

### Installation des dépendances
Avant de déployer, exécutez :

```bash
npm install
```

## 🚀 Prochaines étapes

1. **Installer les dépendances** :
   ```bash
   npm install
   ```

2. **Configurer Resend** :
   - Créer un compte sur [resend.com](https://resend.com)
   - Obtenir votre clé API
   - Vérifier votre domaine d'envoi
   - Ajouter les variables d'environnement dans Vercel

3. **Tester localement** (optionnel) :
   ```bash
   npm run dev
   ```
   
4. **Déployer sur Vercel** :
   ```bash
   git add .
   git commit -m "feat: Add CV upload to career modals"
   git push
   ```

5. **Vérifier le déploiement** :
   - Tester l'upload de CV sur les 3 modales
   - Vérifier la réception des emails
   - Tester avec différents formats de CV
   - Tester la limite de taille (5MB)

## 📊 Structure des emails

### Email professionnel (info@constpmm.com)
```
Sujet : 📋 Nouvelle Candidature - [Nom du candidat]

Contenu :
- En-tête avec titre "Nouvelle Candidature"
- Tableau des informations du candidat
- Message du candidat (si fourni)
- Bouton CTA "Répondre au Candidat"
- CV en pièce jointe (si fourni)
```

### Email de confirmation (candidat)
```
Sujet : Merci pour votre candidature - Construction PMM

Contenu :
- Remerciement personnalisé
- Délai de traitement (5-7 jours ouvrables)
- Récapitulatif de la candidature
- Signature de l'équipe
```

## 🔒 Sécurité

- ✅ Validation des formats de fichiers (client + serveur)
- ✅ Limite de taille stricte (5MB)
- ✅ Nettoyage automatique des fichiers temporaires
- ✅ Protection contre les erreurs de parsing
- ✅ Headers CORS configurés
- ✅ Gestion des erreurs complète

## 🎯 Tests à effectuer

- [ ] Upload d'un CV PDF (< 5MB)
- [ ] Upload d'un CV DOC/DOCX (< 5MB)
- [ ] Tentative d'upload d'un fichier trop volumineux (> 5MB)
- [ ] Tentative d'upload d'un format non supporté
- [ ] Soumission sans CV
- [ ] Soumission avec CV
- [ ] Vérification de la réception des emails
- [ ] Vérification de la pièce jointe dans l'email
- [ ] Test sur mobile
- [ ] Test sur les 3 modales (Charpentier, Aide-charpentier, Contremaître)

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez que les variables d'environnement sont correctes dans Vercel
2. Vérifiez que votre domaine est vérifié dans Resend
3. Consultez les logs Vercel pour les erreurs
4. Vérifiez la console du navigateur pour les erreurs JavaScript

---

**Intégration complétée le :** 21 janvier 2026  
**Fichiers modifiés :** 3 (carriere.html, package.json, et 2 nouveaux fichiers créés)  
**Status :** ✅ Prêt pour le déploiement
