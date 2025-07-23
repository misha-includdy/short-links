# Shortlinks

Générateur de liens courts moderne avec authentification Kinde et stockage Redis.

## Fonctionnalités

- **Next.js 15** avec App Router et TypeScript
- **Authentification Kinde** avec login/logout
- **Stockage Redis** via Upstash pour les liens courts
- **Vérification des doublons** - empêche la création de slugs identiques
- **Interface française** minimaliste avec shadcn/ui (thème Stone)
- **Déployable sur Vercel**

## Installation

1. **Cloner et installer les dépendances :**
   ```bash
   git clone <repo>
   cd short-links
   npm install
   ```

2. **Configuration des variables d'environnement :**
   
   Copiez `.env.local` et mettez à jour avec vos credentials :
   ```bash
   # Kinde Auth Configuration
   KINDE_CLIENT_ID=votre_client_id
   KINDE_CLIENT_SECRET=votre_client_secret
   KINDE_ISSUER_URL=https://votre-domain.kinde.com
   KINDE_SITE_URL=http://localhost:3000
   KINDE_POST_LOGOUT_REDIRECT_URL=http://localhost:3000
   KINDE_POST_LOGIN_REDIRECT_URL=http://localhost:3000

   # Upstash Redis Configuration
   UPSTASH_REDIS_REST_URL=votre_upstash_redis_rest_url
   UPSTASH_REDIS_REST_TOKEN=votre_upstash_redis_rest_token
   ```

3. **Démarrer le serveur de développement :**
   ```bash
   npm run dev
   ```

## Configuration Kinde

1. Créez un compte sur [Kinde](https://kinde.com)
2. Créez une nouvelle application
3. Configurez les URLs dans votre app Kinde :
   - **Callback URLs :** `http://localhost:3000/api/auth/kinde_callback`
   - **Logout redirect URLs :** `http://localhost:3000`
4. Copiez vos credentials dans `.env.local`

## Configuration Upstash Redis

1. Créez un compte sur [Upstash](https://upstash.com)
2. Créez une nouvelle base Redis
3. Copiez l'URL REST et le token depuis votre dashboard Upstash
4. Ajoutez-les dans `.env.local`

## Fonctionnement

- **Stockage :** Les slugs sont utilisés comme clés Redis, les URLs comme valeurs
- **Validation :** Vérification automatique des doublons de slugs
- **Sécurité :** API protégée par authentification Kinde
- **Interface :** Formulaire simple avec gestion d'erreurs

## API Endpoints

- `POST /api/generate` - Crée un lien court (authentification requise)
- `GET /api/redirect/[slug]` - Récupère l'URL originale par slug

## Déploiement sur Vercel

1. **Déployer :**
   ```bash
   vercel --prod
   ```

2. **Variables d'environnement :**
   - Ajoutez toutes les variables dans les paramètres du projet Vercel
   - Mettez à jour les URLs Kinde avec votre domaine de production

3. **URLs Kinde production :**
   - Callback: `https://votre-domain.vercel.app/api/auth/kinde_callback`
   - Logout: `https://votre-domain.vercel.app`

## Documentation

- [Kinde App Router SDK](https://kinde.com/docs/developer-tools/nextjs-sdk/)
- [Upstash Redis](https://docs.upstash.com/redis)
- [shadcn/ui](https://ui.shadcn.com/)
