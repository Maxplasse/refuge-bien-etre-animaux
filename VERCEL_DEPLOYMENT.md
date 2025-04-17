# Déploiement sur Vercel

Ce guide explique comment déployer l'application "Refuge Bien-être Animaux" sur Vercel.

## Prérequis

1. Un compte [Vercel](https://vercel.com)
2. Avoir accès au projet GitHub (si le code est hébergé sur GitHub)

## Étapes de déploiement

### 1. Connectez-vous à Vercel

Rendez-vous sur [Vercel](https://vercel.com) et connectez-vous avec votre compte (GitHub, GitLab, Bitbucket ou email).

### 2. Importez votre projet

1. Cliquez sur "Add New..." puis "Project"
2. Connectez votre compte GitHub/GitLab/Bitbucket si ce n'est pas déjà fait
3. Sélectionnez le dépôt "refuge-bien-etre-animaux"

### 3. Configurez le projet

Configurez les paramètres de déploiement comme suit :

- **Framework Preset**: Vite
- **Build Command**: `npm run build` (déjà configuré dans vercel.json)
- **Output Directory**: `dist` (déjà configuré dans vercel.json)
- **Development Command**: `npm run dev` (déjà configuré dans vercel.json)

### 4. Variables d'environnement

Ajoutez les variables d'environnement suivantes dans l'interface Vercel (Settings > Environment Variables) :

```
VITE_SUPABASE_URL=https://tonsdvqvvvuvmshkuxty.supabase.co
VITE_SUPABASE_ANON_KEY=[votre clé anon Supabase]
```

> **Note**: Utilisez les mêmes valeurs que dans votre fichier `.env.local` mais assurez-vous d'utiliser la clé d'API appropriée pour l'environnement de production.

### 5. Déployez

Cliquez sur "Deploy" et attendez que le déploiement soit terminé.

## Après le déploiement

### Configurer un domaine personnalisé (optionnel)

1. Allez dans les paramètres du projet sur Vercel
2. Cliquez sur "Domains"
3. Ajoutez votre domaine personnalisé et suivez les instructions pour configurer les DNS

### Déploiements automatiques

Vercel est configuré par défaut pour redéployer automatiquement votre application à chaque push sur la branche principale. Vous pouvez modifier ce comportement dans les paramètres du projet.

## Support

En cas de problème avec le déploiement :

1. Vérifiez les logs de build sur Vercel
2. Assurez-vous que toutes les variables d'environnement sont correctement configurées
3. Vérifiez que le fichier `vercel.json` est bien présent à la racine du projet 