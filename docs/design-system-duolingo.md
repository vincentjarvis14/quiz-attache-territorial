# Design System Duolingo - Documentation

## Source
Projet Figma public : https://www.figma.com/design/BNVMEmUCHD2co4IWUTEHzg/Hoo-Dini--Design-System-for-Duolingo--Community-?node-id=2001-1604&t=aVThUN4uMcFzTjcC-1

## Objectif
Intégrer complètement le design system Duolingo dans le jeu quizz "Attaché Territorial"

## Tokens de couleur (à valider avec le Figma)

### Couleurs principales Duolingo (recherche web)
- Vert principal: #58CC02
- Vert foncé (ombre): #58A700 
- Vert clair: #D7FFB8
- Texte vert: #3C8500

- Bleu: #1CB0F6
- Bleu foncé: #1899D6
- Bleu clair: #DDF4FF

- Rouge: #FF4B4B
- Rouge foncé: #EA2B2B
- Rouge clair: #FFDFE0

- Jaune: #FFC800
- Jaune foncé: #DDA800
- Jaune clair: #FFF9C4

- Violet: #CE82FF
- Violet foncé: #9C3EE8

### Gris (échelle Duolingo)
- Gris 1 (texte principal): #3C3C3C
- Gris 2 (texte secondaire): #777777
- Gris 3 (texte désactivé): #AFAFAF
- Gris 4 (bordures): #E5E5E5
- Gris 5 (arrière-plan): #F7F7F7
- Blanc: #FFFFFF

## Typographie
- Police principale: "Nunito" (déjà utilisée)
- Poids: 400 (Regular), 600 (SemiBold), 700 (Bold), 800 (ExtraBold), 900 (Black)
- Tailles (à valider):
  - xs: 0.75rem (12px)
  - sm: 0.875rem (14px)
  - base: 1rem (16px)
  - lg: 1.125rem (18px)
  - xl: 1.375rem (22px)
  - 2xl: 1.75rem (28px)
  - 3xl: 2.25rem (36px)

## Espacement (scale)
- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 20px
- 2xl: 24px
- 3xl: 32px
- 4xl: 40px

## Bordures
- Radius sm: 8px
- Radius md: 12px
- Radius lg: 16px
- Radius xl: 20px
- Radius pill: 999px

## Ombres
- Bouton vert: 0 4px 0 #58A700
- Bouton bleu: 0 4px 0 #1899D6
- Bouton gris: 0 4px 0 #E5E5E5
- Bouton rouge: 0 4px 0 #EA2B2B
- Ombre carte: 0 4px 12px rgba(0, 0, 0, 0.08)

## Composants à intégrer

### 1. Boutons
- Bouton principal (vert)
- Bouton secondaire (bleu)
- Bouton tertiaire (gris)
- Bouton destructif (rouge)
- États: normal, hover, active, disabled

### 2. Cartes
- Carte de sélection de thème
- Carte d'option de quiz
- Carte de score

### 3. Inputs
- Sélecteur de nombre
- Toggle mode de jeu

### 4. Indicateurs
- Barre de progression
- Compteur de vies
- Badge Bloom

### 5. Navigation
- Header avec bouton retour
- Barre d'action fixe

### 6. Modales
- Modale source complète

## Assets visuels
- Icônes pour chaque thème
- Illustrations pour états vides
- Illustrations pour résultats
- Animations de feedback

## Priorités d'implémentation
1. Mettre à jour les tokens CSS
2. Refondre les boutons
3. Refondre les cartes/chips
4. Intégrer les icônes
5. Ajouter les illustrations
6. Polir les animations