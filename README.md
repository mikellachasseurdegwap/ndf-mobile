# Mobile NDF

Application mobile Expo Go alignée sur le backend du site de notes de frais.

## Démarrage

Dans un terminal, lancer le site depuis `backend` :

```bash
cd backend
npm run dev
```

Dans un autre terminal, lancer l'app mobile :

```bash
cd mobile-ndf
npm install
npm run start
```

Pour Expo Go sur téléphone, définir l'URL réseau du backend :

```bash
EXPO_PUBLIC_API_BASE_URL=http://ADRESSE_IP_DU_MAC:3000 npm run start
```
