# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/ea4eb66c-62e4-4259-af5f-706e254a5593

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/ea4eb66c-62e4-4259-af5f-706e254a5593) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/ea4eb66c-62e4-4259-af5f-706e254a5593) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Configuration de l'envoi d'emails

L'application utilise le système SMTP intégré à Supabase pour envoyer des emails de bienvenue aux nouveaux utilisateurs. Pour configurer l'envoi d'emails, suivez ces étapes :

1. Connectez-vous au dashboard de Supabase
2. Allez dans "Authentication" → "Email Templates"
3. Personnalisez les modèles d'emails selon vos besoins
4. Allez dans "Authentication" → "Emails" → "SMTP Settings"
5. Configurez votre serveur SMTP (Postmark, SendGrid, Mailgun, etc.)

### Configuration SMTP
Pour configurer un serveur SMTP, vous avez besoin de :
- Hostname SMTP (ex: smtp-broadcasts.postmarkapp.com)
- Port (généralement 587 ou 465)
- Identifiants (username et password)
- Adresse email d'expédition

L'application est configurée pour utiliser automatiquement les paramètres SMTP définis dans Supabase. Lorsqu'un utilisateur est créé via `auth.signUp()`, Supabase envoie automatiquement un email de confirmation si la configuration SMTP est correcte.

### Templates d'emails
Vous pouvez personnaliser les templates d'emails dans le dashboard Supabase :
1. Connectez-vous au dashboard de Supabase
2. Allez dans "Authentication" → "Email Templates"
3. Modifiez les templates "Confirm signup", "Invite user" et "Magic Link" selon vos besoins

### Test du système d'emails
Pour tester le système d'emails, créez simplement un nouvel utilisateur depuis le portail d'administration. Un email de bienvenue sera automatiquement envoyé à l'adresse spécifiée si la configuration SMTP est correcte.
