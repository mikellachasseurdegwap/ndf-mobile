# Mobile NDF

Application mobile Expo Go alignée sur le backend du site de notes de frais.

## Démarrage

Dans un terminal, lancer le site depuis `backend` :

```bash
cd backend
PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run dev -- -H 0.0.0.0
```

Dans un autre terminal, lancer l'app mobile :

```bash
cd mobile-ndf
npm install
cp .env.example .env
# Remplacer ADRESSE_IP_DU_MAC par l'adresse IP Wi-Fi du Mac.
PATH=/opt/homebrew/opt/node@22/bin:$PATH npx expo start --lan --clear --port 8081
```

Pour Expo Go sur téléphone, définir l'URL réseau du backend :

```bash
EXPO_PUBLIC_API_BASE_URL=http://ADRESSE_IP_DU_MAC:3000 PATH=/opt/homebrew/opt/node@22/bin:$PATH npx expo start --lan --clear --port 8081
```

Ne pas utiliser `localhost`, `127.0.0.1` ou `0.0.0.0` dans `EXPO_PUBLIC_API_BASE_URL` pour un téléphone physique.
Sur un iPhone ou Android réel, `localhost` désigne le téléphone, pas le Mac.
