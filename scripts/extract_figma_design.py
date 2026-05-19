#!/usr/bin/env python3
"""
Script pour extraire le design system Duolingo du projet Figma
"""

import requests
import json
import os

# Configuration
# ⚠️ Ne pas commit — utiliser une variable d'environnement FIGMA_TOKEN
FIGMA_TOKEN = os.environ.get("FIGMA_TOKEN", "")
FILE_ID = "BNVMEmUCHD2co4IWUTEHzg"
NODE_ID = "2001-1604"

headers = {
    "X-Figma-Token": FIGMA_TOKEN
}

def test_connection():
    """Teste la connexion à l'API Figma"""
    print("🔗 Test de connexion à l'API Figma...")
    url = f"https://api.figma.com/v1/files/{FILE_ID}"
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Connexion réussie!")
            print(f"📁 Fichier: {data.get('name', 'Inconnu')}")
            print(f"📅 Dernière modification: {data.get('lastModified', 'Inconnu')}")
            print(f"📊 Version: {data.get('version', 'Inconnu')}")
            return True
        else:
            print(f"❌ Erreur {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False

def get_node_info():
    """Récupère les informations du nœud spécifique"""
    print(f"\n🎨 Récupération du nœud {NODE_ID}...")
    url = f"https://api.figma.com/v1/files/{FILE_ID}/nodes?ids={NODE_ID}"
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            data = response.json()
            nodes = data.get("nodes", {})
            if NODE_ID in nodes:
                node = nodes[NODE_ID]
                print(f"✅ Nœud trouvé: {node.get('document', {}).get('name', 'Sans nom')}")
                print(f"📐 Type: {node.get('document', {}).get('type', 'Inconnu')}")
                
                # Sauvegarder les données pour analyse
                with open("figma_node_data.json", "w") as f:
                    json.dump(node, f, indent=2)
                print("💾 Données sauvegardées dans figma_node_data.json")
                return node
            else:
                print("❌ Nœud non trouvé")
                return None
        else:
            print(f"❌ Erreur {response.status_code}: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Exception: {e}")
        return None

def extract_colors(node_data):
    """Extrait les couleurs du design system"""
    print("\n🎨 Extraction des couleurs...")
    
    colors = {}
    
    def traverse(node, path=""):
        if isinstance(node, dict):
            # Chercher les styles de couleur
            if "styles" in node:
                for style_id, style_name in node["styles"].items():
                    if "fill" in style_name.lower() or "color" in style_name.lower():
                        print(f"  🎨 Style trouvé: {style_name}")
            
            # Chercher les fills
            if "fills" in node and isinstance(node["fills"], list):
                for fill in node["fills"]:
                    if fill.get("type") == "SOLID" and "color" in fill:
                        color = fill["color"]
                        r = int(color.get("r", 0) * 255)
                        g = int(color.get("g", 0) * 255)
                        b = int(color.get("b", 0) * 255)
                        a = color.get("a", 1)
                        hex_color = f"#{r:02x}{g:02x}{b:02x}"
                        
                        if a < 1:
                            hex_color += f"{int(a * 255):02x}"
                        
                        node_name = node.get("name", "Sans nom")
                        colors[f"{path}/{node_name}"] = hex_color
                        print(f"  🎨 Couleur: {hex_color} ({node_name})")
            
            # Parcourir les enfants
            if "children" in node and isinstance(node["children"], list):
                for child in node["children"]:
                    traverse(child, f"{path}/{node.get('name', '')}")
    
    if node_data and "document" in node_data:
        traverse(node_data["document"])
    
    return colors

def extract_typography(node_data):
    """Extrait la typographie du design system"""
    print("\n🔤 Extraction de la typographie...")
    
    typography = {}
    
    def traverse(node, path=""):
        if isinstance(node, dict):
            # Chercher les styles de texte
            if "style" in node and isinstance(node["style"], dict):
                style = node["style"]
                if "fontFamily" in style or "fontSize" in style:
                    font_family = style.get("fontFamily", "Inconnu")
                    font_size = style.get("fontSize", 0)
                    font_weight = style.get("fontWeight", 400)
                    line_height = style.get("lineHeightPx", 0)
                    
                    node_name = node.get("name", "Sans nom")
                    key = f"{path}/{node_name}"
                    typography[key] = {
                        "fontFamily": font_family,
                        "fontSize": font_size,
                        "fontWeight": font_weight,
                        "lineHeight": line_height
                    }
                    print(f"  🔤 Typographie: {font_family} {font_size}px ({node_name})")
            
            # Parcourir les enfants
            if "children" in node and isinstance(node["children"], list):
                for child in node["children"]:
                    traverse(child, f"{path}/{node.get('name', '')}")
    
    if node_data and "document" in node_data:
        traverse(node_data["document"])
    
    return typography

def main():
    print("=" * 60)
    print("EXTRACTION DU DESIGN SYSTEM DUOLINGO DE FIGMA")
    print("=" * 60)
    
    # Test de connexion
    if not test_connection():
        print("\n❌ Impossible de se connecter à l'API Figma")
        print("Vérifiez le token et la connexion internet.")
        return
    
    # Récupérer les informations du nœud
    node_data = get_node_info()
    if not node_data:
        print("\n❌ Impossible de récupérer les données du nœud")
        return
    
    # Extraire les couleurs
    colors = extract_colors(node_data)
    
    # Extraire la typographie
    typography = extract_typography(node_data)
    
    # Générer un rapport
    print("\n" + "=" * 60)
    print("RAPPORT D'EXTRACTION")
    print("=" * 60)
    print(f"🎨 Couleurs extraites: {len(colors)}")
    print(f"🔤 Styles typographiques extraits: {len(typography)}")
    
    # Sauvegarder le design system
    design_system = {
        "colors": colors,
        "typography": typography,
        "source": f"Figma File: {FILE_ID}, Node: {NODE_ID}",
        "extracted_at": "2026-04-22"
    }
    
    with open("figma_design_system.json", "w") as f:
        json.dump(design_system, f, indent=2)
    
    print("\n💾 Design system sauvegardé dans figma_design_system.json")
    print("✅ Extraction terminée!")

if __name__ == "__main__":
    main()