# Houblon chez toi — site de commande en ligne

Projet de départ : Next.js + Prisma + authentification par session (cookie signé).
Catalogue, création de compte (particulier/professionnel), commandes, admin basique.

## Ce qui est fait
- Catalogue de bières (lu depuis la base de données)
- Création de compte / connexion / déconnexion (mot de passe hashé avec bcrypt)
- Passage et historique de commandes (API `/api/orders`)
- Page admin `/admin` (réservée au compte marqué `isAdmin`)

## Ce qu'il reste à faire
- Interface de commande complète (panier, sélection créneau) — la structure API existe déjà (`POST /api/orders`), il manque le formulaire côté `/app/page.js`
- Intégration Stripe pour le paiement en ligne (à faire une fois ton compte Stripe actif)
- Génération de vraies factures PDF
- Design final (ce scaffold reprend les couleurs de la maquette mais pas encore tous les styles détaillés du prototype HTML)

## Lancer en local

```bash
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Le site tourne sur http://localhost:3000. Le compte admin de départ est
`admin@houbloncheztoi.fr` / `change-moi-immediatement` — **change ce mot de passe
avant toute mise en ligne réelle**.

## Déployer en production (Vercel + Neon)

SQLite (utilisé en local) ne fonctionne pas sur Vercel, qui n'a pas de disque
persistant. Il faut basculer sur une vraie base Postgres hébergée.

1. **Créer la base de données** — va sur [neon.tech](https://neon.tech) (ou
   [supabase.com](https://supabase.com)), crée un projet gratuit, copie l'URL
   de connexion Postgres fournie.

2. **Adapter le schéma** — dans `prisma/schema.prisma`, remplace :
   ```
   provider = "sqlite"
   ```
   par :
   ```
   provider = "postgresql"
   ```

3. **Pousser le code sur GitHub** :
   ```bash
   git init
   git add .
   git commit -m "Premier commit"
   git remote add origin <url-de-ton-repo-github>
   git push -u origin main
   ```

4. **Déployer sur Vercel** — va sur [vercel.com](https://vercel.com), importe
   le dépôt GitHub, et dans les paramètres du projet ajoute ces variables
   d'environnement :
   - `DATABASE_URL` → l'URL Postgres copiée à l'étape 1
   - `SESSION_SECRET` → une valeur aléatoire (génère-la avec `openssl rand -base64 32`)

5. **Initialiser la base en production** — une fois déployé, exécute une seule
   fois depuis ton poste (avec le bon `DATABASE_URL` dans `.env`) :
   ```bash
   npx prisma migrate deploy
   npm run seed
   ```

6. Vercel redéploie automatiquement à chaque `git push`.

## Sécurité — à ne pas oublier avant mise en ligne réelle
- Change le mot de passe du compte admin de démarrage
- Génère un vrai `SESSION_SECRET` aléatoire (jamais la valeur par défaut)
- Active HTTPS (Vercel le fait automatiquement)
- Ne commit jamais le fichier `.env` (déjà exclu par `.gitignore`)
