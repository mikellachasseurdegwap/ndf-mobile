# Backend mobile NDF

Backend Next.js utilise uniquement comme API pour l'application mobile Expo.

Il ne contient plus les pages web du site. Les routes conservees servent a :

- authentifier les utilisateurs mobiles ;
- creer et lister les notes de frais mobiles ;
- gerer l'espace admin mobile ;
- uploader les justificatifs ;
- generer les PDF ;
- gerer la demande de mot de passe oublie.

## Lancement

```bash
PATH=/opt/homebrew/opt/node@22/bin:$PATH npm run dev -- -H 0.0.0.0
```

Le `-H 0.0.0.0` est necessaire pour que le backend soit joignable depuis un vrai telephone sur le meme reseau.

## Routes principales

- `POST /api/mobile/auth/login`
- `POST /api/mobile/auth/register`
- `GET /api/mobile/expenses`
- `POST /api/mobile/expenses`
- `GET /api/mobile/admin/expenses`
- `PATCH /api/mobile/admin/expenses/[id]`
- `POST /api/upload`
- `GET /api/pdf/[id]`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
