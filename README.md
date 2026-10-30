# Maratón de Lectura — Votación

Next.js + TypeScript + Tailwind + Firebase (Firestore + inicio de sesión con Google).

## Configuración

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com).
2. **Authentication** → Método de acceso → habilita **Google**.
   Si publicas la app (por ejemplo en Vercel), agrega su dominio en
   **Authentication → Configuración → Dominios autorizados**.
3. **Firestore Database** → crea la base de datos.
4. **Firestore** → pestaña **Reglas** → pega el contenido de `firestore.rules` y publica.
5. Registra una **app web** y copia la configuración:
   ```bash
   cp .env.local.example .env.local   # y completa los valores
   ```
6. Edita los disfraces y stands en `src/data/candidates.ts` (puedes poner las fotos en `public/`).

## Desarrollo

```bash
npm run dev
```

Abre http://localhost:3000.

## Cómo funciona

- Cada persona inicia sesión con su cuenta de Google y obtiene un `uid`.
- Hay dos categorías: **Disfraces** y **Stands**. Cada persona vota una vez en cada una.
- `categories/{categoria}/votes/{uid}` guarda el voto de cada persona.
- `categories/{categoria}/results/{id}` guarda el contador de votos de cada participante.
- El voto se registra en una transacción y las reglas de Firestore impiden votar dos veces
  o manipular los contadores.
- Los resultados se actualizan en tiempo real.
- Al ser un voto por cuenta de Google, cambiar de navegador o usar modo incógnito no permite volver a votar.
