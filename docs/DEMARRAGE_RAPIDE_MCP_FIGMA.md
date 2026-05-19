# 🚀 Démarrage Rapide - MCP Figma

## ✅ Configuration déjà terminée
Le serveur MCP Figma est **entièrement configuré** et prêt à l'emploi.

## 📋 Pour les prochaines sessions

### Option 1: Démarrage automatique (Recommandé)
1. **Ouvrez Cursor/Claude Dev** - Le serveur se connectera automatiquement
2. **Utilisez les outils Figma** directement :
   - `get_figma_data` - Pour récupérer les métadonnées
   - `download_figma_images` - Pour télécharger des images

### Option 2: Vérification rapide
Pour vérifier que tout fonctionne :
```bash
npx -y figma-developer-mcp --version
```
→ Doit afficher `0.11.0` ou supérieur

## 🎯 Comment utiliser

### Étape 1: Coller un lien Figma
Exemple : `https://www.figma.com/file/BNVMEmUCHD2co4IWUTEHzg/...`

### Étape 2: Demander une action
Exemples de prompts :
- "Peux-tu extraire le design system de ce fichier Figma ?"
- "Implémente ce design en HTML/CSS"
- "Récupère les couleurs et typographies de ce frame"

### Étape 3: Le MCP fournit les données
Cursor utilisera automatiquement le MCP Figma pour :
- Récupérer les métadonnées du design
- Extraire les couleurs, typographies, composants
- Télécharger les images nécessaires

## 🔧 Configuration existante
Vérifiée dans : `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

```json
"github.com/GLips/Figma-Context-MCP": {
  "command": "npx",
  "args": [
    "-y",
    "figma-developer-mcp",
    "--figma-api-key=TON_TOKEN_FIGMA_ICI",
    "--stdio"
  ],
  "env": {},
  "disabled": false,
  "autoApprove": ["get_figma_data"]
}
```

## 🚨 Dépannage rapide

### Si les outils n'apparaissent pas :
1. Redémarrez Cursor/Claude Dev
2. Vérifiez que le serveur n'est pas désactivé dans les paramètres

### Si erreur de connexion :
1. Vérifiez votre token Figma (valide dans `extract_figma_design.py`)
2. Testez la connexion :
```bash
python3 extract_figma_design.py
```

## 📞 Support
- Documentation : https://www.framelink.ai/docs/quickstart
- Discord : https://framelink.ai/discord

---

**Résumé** : Tout est configuré ! Utilisez simplement les liens Figma dans le chat et demandez des actions de design. 🎨