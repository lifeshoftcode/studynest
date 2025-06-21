# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Project structure

La estructura propuesta del proyecto es la siguiente:

```
SayIt/
├─ public/
├─ src/
│  ├─ components/
│  │  └─ Teleprompter.jsx
│  ├─ firebase/
│  │  └─ firebaseConfig.js
│  ├─ hooks/
│  ├─ pages/
│  ├─ App.jsx
│  ├─ main.jsx
│  └─ index.css
├─ .env          # variables de entorno locales (NO subir al repositorio)
└─ README.md
```

### Firebase

1. Instala la dependencia:

```bash
npm install firebase
```

2. Copia el siguiente ejemplo a un archivo `.env` en la raíz del proyecto y completa tus credenciales de Firebase:

```bash
# .env (NO lo subas al repositorio)
VITE_FIREBASE_API_KEY="tu_api_key"
VITE_FIREBASE_AUTH_DOMAIN="tu_proyecto.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="tu_proyecto"
VITE_FIREBASE_STORAGE_BUCKET="tu_proyecto.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="tu_sender_id"
VITE_FIREBASE_APP_ID="tu_app_id"
```

3. El módulo `src/firebase/firebaseConfig.js` lee estas variables e inicializa Firebase. Importa cualquiera de los servicios donde los necesites:

```js
import { auth, db } from "@/firebase/firebaseConfig";
```

¡Listo! Ahora tu proyecto tiene una base ordenada y preparada para usar Firebase.
