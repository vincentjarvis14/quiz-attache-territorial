# 🚀 Zone d'import emergent.SH — V3

Ce dossier reçoit le code frontend de la V3 généré par emergent.SH.

## Structure

```
emergent/
├── components/     # Composants React
├── pages/          # Pages (si besoin)
├── hooks/          # Custom hooks
├── lib/            # Utilitaires
└── styles/         # Fichiers CSS supplémentaires
```

## Règles d'import

1. **Ne pas toucher** : `db/`, `lib/auth.ts`, `lib/supabase.ts`, `scripts/`, `Source RAG/`, `store/`
2. **Libre** : tout le frontend (pages, composants, styles, hooks)
3. **Alias disponible** : `@emergent/*` → `./emergent/*`
4. **Stack** : Next.js 16 App Router, Tailwind CSS, Zustand, Framer Motion
