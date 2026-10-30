# Votación de imágenes

Next.js + TypeScript + Tailwind + Firebase (Firestore + Auth anónima).

## Configuración

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com).
2. **Authentication** → Método de acceso → habilita **Anónimo**.
3. **Firestore Database** → crea la base de datos.
4. **Firestore** → pestaña **Reglas** → pega el contenido de `firestore.rules` y publica.
5. Registra una **app web** y copia la configuración:
   ```bash
   cp .env.local.example .env.local   # y completa los valores
   ```
6. Edita las imágenes en `src/data/candidates.ts` (puedes poner archivos en `public/`).

## Desarrollo

```bash
npm run dev
```

Abre http://localhost:3000.

## Cómo funciona

- Cada visitante inicia sesión de forma anónima y obtiene un `uid`.
- `votes/{uid}` guarda el voto de cada persona (solo uno por uid).
- `results/{imageId}` guarda el contador de votos de cada imagen.
- El voto se registra en una transacción y las reglas de Firestore impiden votar dos veces
  o manipular los contadores.
- Los resultados se actualizan en tiempo real.

> Nota: la sesión anónima es por navegador. Si alguien borra los datos del navegador o usa
> modo incógnito puede volver a votar. Para algo más estricto, cambia a inicio de sesión con Google.
