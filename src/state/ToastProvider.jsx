import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ToastContext = createContext(null)

let idSeq = 1

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    setToasts((arr) => arr.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((message, type = 'info', opts = {}) => {
    const id = idSeq++
    const ttl = typeof opts.ttl === 'number' ? opts.ttl : 2500
    setToasts((arr) => [...arr, { id, message, type }])
    if (ttl > 0) {
      setTimeout(() => remove(id), ttl)
    }
    return id
  }, [remove])

  const value = useMemo(() => ({ addToast }), [addToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Simple inline toast list; uses .chip style if available; no ad-hoc CSS */}
      {toasts.length > 0 && (
        <div className="hide-when-exporting" aria-live="polite" aria-atomic="true">
          <ul>
            {toasts.map((t) => (
              <li key={t.id}>
                <span className="chip">{t.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>')
  return ctx
}
