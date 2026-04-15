# ![Discord](https://img.shields.io/badge/Discord-Bot-7289DA?logo=discord\&logoColor=white) Bot Discord français multifonctions

Un bot Discord multifonctions français développé avec Node.js et discord.js v14+. Facile à configurer et à déployer sur GitHub, Railway, Replit, ou VPS.

---

## ⚙️ Fonctionnalités

* Commandes de modération (ban, kick, mute, warn, etc.)
* Commandes d'information (userinfo, serverinfo, ping, etc.)
* Mini-jeux (morpion, bataille navale, quiz, etc.)
* Commandes fun (combat, claque, caresse, etc.)
* Systèmes anti-raid et captcha
* Attribution automatique de rôles selon le statut des utilisateurs
* Support des commandes slash
* Messages de bienvenue/départ

---

## 🚀 Installation

### 1. Prérequis

* Node.js **v18 ou supérieur**
* npm

Vérifiez :

```bash
node -v
npm -v
```

---

### 2. Télécharger le projet

```bash
git clone https://github.com/votre-repo/Bot-Multifonctions-FR.git
cd Bot-Multifonctions-FR
```

Ou télécharger le projet en ZIP et extraire.

---

### 3. Installer les dépendances

```bash
npm install
```

Dépendance principale :

* discord.js

---

## ⚙️ Configuration

Le bot utilise **`config.js`** pour les paramètres :

```js
module.exports = {
  token: process.env.DISCORD_TOKEN || "ton-token-ici",
  prefix: "+",
  embedColor: "#49ff02",
  ownerId: process.env.OWNER_ID || "ton-id-ici",
  supportServerInvite: "https://discord.gg/tqxJPf4YFc",
};
```

---

## 🛠 Création du bot Discord

1. Allez sur : Discord Developer Portal
2. Créez une **application**.
3. Dans **Bot**, cliquez sur **Add Bot** et copiez le **token**.
4. Activez les **intents** nécessaires :

   * MESSAGE CONTENT INTENT
   * SERVER MEMBERS INTENT

---

## 🔗 Inviter le bot

Dans **OAuth2 → URL Generator** :

* Cochez `bot`
* Permissions recommandées : **Administrator**
* Minimum : Manage Messages, Kick Members, Ban Members, Manage Roles

Générez l’URL et invitez le bot sur votre serveur.

---

## ▶️ Lancer le bot

```bash
node index.js
```

Le bot sera en ligne et prêt à utiliser les commandes avec le préfixe `+`.

---

## ☁️ Hébergement (24/7)

### Gratuit

* Replit
* Railway
* Render

### VPS / Cloud

* OVHcloud
* Hetzner
* DigitalOcean

---

## 🗂 Structure du projet

```
├── index.js              # Main entry point
├── config.js             # Configuration (reads from env vars)
├── version.js            # Version tracking
├── data/                 # JSON data storage
└── src/
    ├── commands/         # Prefix commands (+help, +ban, etc.)
    ├── events/           # Discord event listeners
    ├── slashCommands/    # Slash commands
    ├── structure/        # Command/event handlers
    └── utils/            # Utility functions
```

---

## 📌 Contribution

Contributions bienvenues :

1. Fork du projet
2. Créer une branche
3. Pull Request

---

## 📄 Licence

Projet libre d'utilisation et de modification.
