# 🎨 Améliorations UX - Upload CV Carrière

## ✅ Modifications complétées

### 1. 🎨 Couleurs de marque (#d4a574)

**Bouton "Ajouter votre CV"**
- Couleur principale : `#d4a574` (or/bronze PMM)
- Hover : `#c99a66` (version plus foncée)
- Shadow : `rgba(212, 165, 116, 0.3)`
- Effet hover : Translation Y + ombre plus prononcée

**État "CV sélectionné"**
- Texte en `#d4a574` avec checkmark `✓`
- Style : italique + gras

### 2. ⚡ Animation d'envoi moderne

**Phase 1 : Envoi en cours**
- Bouton désactivé avec background `#d4a574`
- Spinner rotatif animé (border-top blanc)
- Animation CSS : `spin 0.8s linear infinite`
- Texte du bouton vide pendant le chargement

**Phase 2 : Succès**
- Checkmark `✓ Envoyé !` affiché
- Background change en vert `#4caf50`
- Animation pulse : `successPulse 0.6s ease`
- Délai de 1.2s avant d'afficher le message de succès

**Phase 3 : Erreur**
- Suppression du spinner
- Restauration du bouton original
- Message d'erreur affiché en français

### 3. 🎯 Pré-sélection du poste

**Détection automatique**
- Capture du clic sur les boutons "Postuler"
- Extraction du titre du poste depuis `.heading-style-h5`
- Stockage dans `window.selectedJobs[modalIndex]`

**3 postes disponibles :**
1. **Charpentier-menuisier** → Modal 1
2. **Aide-charpentier** → Modal 2
3. **Contremaître de chantier** → Modal 3

**Injection dans le formulaire**
- Champ caché `<input type="hidden" name="Job-Title">` dans chaque modal
- Mise à jour automatique de la valeur après 100ms
- Envoi avec le reste des données du formulaire

### 4. 📧 Titre du poste dans les emails

**Email professionnel (info@constpmm.com)**
```
Sujet : 📋 Nouvelle Candidature - [POSTE] - [NOM]

Contenu :
- Badge coloré avec le nom du poste dans l'en-tête
- Ligne "Poste: [NOM DU POSTE]" en haut du tableau
- Style : couleur #d4a574 (or PMM)
```

**Email de confirmation (candidat)**
```
Corps :
"Merci de votre intérêt pour Construction PMM 
pour le poste de [POSTE] !"

Récapitulatif :
✅ Poste: [NOM DU POSTE]
✅ CV joint / ℹ️ Aucun CV joint
✅ Message inclus
```

## 📁 Fichiers modifiés

### `js/career-cv-upload.js`
- ✅ Ajout de `window.selectedJobs = {}`
- ✅ Fonction `updateCVDisplay()` avec nouvelles couleurs
- ✅ Event listeners pour hover des boutons CV
- ✅ Logique de capture du poste cliqué
- ✅ Animation spinner + succès dans submit
- ✅ Envoi du `Job-Title` dans FormData

### `carriere.html`
- ✅ Ajout de 3 champs cachés `<input type="hidden" name="Job-Title">`
- ✅ Un dans chaque formulaire modal

### `api/submit-career-form.js`
- ✅ Extraction de `jobTitle` depuis les fields
- ✅ Badge du poste dans l'en-tête de l'email business
- ✅ Ligne "Poste" dans le tableau des infos
- ✅ Sujet de l'email incluant le poste
- ✅ Mention du poste dans l'email de confirmation
- ✅ Poste dans le récapitulatif de la candidature

## 🎭 Styles CSS injectés

```css
/* Animation spinner */
@keyframes spin {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}

/* Animation succès */
@keyframes successPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* Bouton CV */
.cv-upload-btn {
  background: #d4a574;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(212, 165, 116, 0.3);
}

.cv-upload-btn:hover {
  background: #c99a66;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(212, 165, 116, 0.4);
}
```

## 🔄 Flow utilisateur

1. **Utilisateur clique sur "Postuler"** pour un poste spécifique
2. **Modal s'ouvre** avec le poste pré-sélectionné (champ caché)
3. **Utilisateur remplit** le formulaire
4. **Utilisateur ajoute** son CV (bouton or PMM)
5. **Utilisateur soumet** le formulaire
6. **Animation de chargement** avec spinner rotatif
7. **Animation de succès** avec checkmark + pulse vert
8. **Message de confirmation** affiché après 1.2s
9. **Email envoyé** avec le nom du poste inclus

## 📊 Résultat

### Avant
- ❌ Boutons bleus génériques
- ❌ Pas d'animation d'envoi
- ❌ Pas d'indication du poste souhaité
- ❌ Emails sans contexte du poste

### Après
- ✅ Boutons couleur marque PMM (#d4a574)
- ✅ Animation moderne (spinner → checkmark)
- ✅ Poste automatiquement capturé et envoyé
- ✅ Emails contextualisés avec le nom du poste

## 🚀 Test

Pour tester :
1. Aller sur la page carrière
2. Cliquer sur "Postuler" pour "Charpentier-menuisier"
3. Vérifier que le bouton CV est or/bronze
4. Ajouter un CV
5. Remplir le formulaire
6. Soumettre et observer l'animation
7. Vérifier l'email reçu → doit contenir "Charpentier-menuisier"

## 🎯 Avantages

1. **Branding cohérent** - Couleurs PMM partout
2. **UX moderne** - Animations fluides et professionnelles
3. **Tracking amélioré** - Savoir quel poste intéresse le candidat
4. **Emails contextualisés** - Meilleure organisation des candidatures
5. **Expérience candidat** - Confirmation claire du poste

---

**Date :** 21 janvier 2026  
**Status :** ✅ Complété et prêt pour le déploiement
