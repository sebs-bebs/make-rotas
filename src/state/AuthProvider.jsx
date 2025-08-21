import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { ensureFirebase, isFirebaseConfigured } from '../services/firebaseClient.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [ready, setReady] = useState(false)
  const [user, setUser] = useState(null)
  const [firebaseRefs, setFirebaseRefs] = useState(null)

  useEffect(() => {
    let unsub = null
    let cancelled = false

    async function boot() {
      if (!isFirebaseConfigured()) {
        setReady(true)
        return
      }
      const fb = await ensureFirebase()
      if (!fb) {
        setReady(true)
        return
      }
      if (cancelled) return
      setFirebaseRefs(fb)
      const { auth } = fb
      const { onAuthStateChanged, signInAnonymously } = await import(/* @vite-ignore */ 'firebase/auth')

      unsub = onAuthStateChanged(auth, async (u) => {
        setUser(u)
        setReady(true)
        if (!u) {
          try {
            await signInAnonymously(auth)
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('Anonymous sign-in failed', e)
          }
        }
      })
    }

    boot()

    return () => {
      cancelled = true
      if (typeof unsub === 'function') unsub()
    }
  }, [])

  const value = useMemo(() => ({ ready, user, uid: user?.uid ?? null, firebase: firebaseRefs }), [ready, user, firebaseRefs])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
