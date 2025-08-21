// Firebase client initialization (env-based, dynamic import)
// Safe to include without firebase installed: only imports when env is configured.

let cached = {
  app: null,
  auth: null,
  db: null,
}

export function isFirebaseConfigured() {
  const env = import.meta.env
  return !!(
    env?.VITE_FIREBASE_API_KEY &&
    env?.VITE_FIREBASE_AUTH_DOMAIN &&
    env?.VITE_FIREBASE_PROJECT_ID &&
    env?.VITE_FIREBASE_APP_ID
  )
}

export async function ensureFirebase() {
  if (!isFirebaseConfigured()) return null
  if (cached.app && cached.auth && cached.db) return cached

  const env = import.meta.env
  const [{ initializeApp }, { getAuth }, { getFirestore }] = await Promise.all([
    import(/* @vite-ignore */ 'firebase/app'),
    import(/* @vite-ignore */ 'firebase/auth'),
    import(/* @vite-ignore */ 'firebase/firestore'),
  ])

  const app = initializeApp({
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  })

  const auth = getAuth(app)
  const db = getFirestore(app)

  cached = { app, auth, db }
  return cached
}
