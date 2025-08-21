import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthProvider.jsx'
import { useAppState } from './AppStateProvider.jsx'
import { formatDateISOLocal } from '../utils/dateUtils.js'
import { listStaff } from '../services/staffService.js'

const ShiftsContext = createContext(null)

const STAFF_KEY = 'mr_staff'
const weekShiftsKey = (weekISO) => `mr_shifts_${weekISO}`

export function notifyOfflineDataChanged() {
  try {
    window.dispatchEvent(new Event('mr-offline-changed'))
  } catch {}
}

export function ShiftsProvider({ children }) {
  const { uid, firebase } = useAuth()
  const { selectedWeekStart } = useAppState()
  const weekISO = useMemo(() => formatDateISOLocal(selectedWeekStart), [selectedWeekStart])

  const online = !!(firebase && uid)

  const [staff, setStaff] = useState([])
  const [shiftsMap, setShiftsMap] = useState({}) // key `${staffId}|${dateISO}` -> { start, end, remarks }

  // Staff subscription
  useEffect(() => {
    let unsub = null
    let cancelled = false
    ;(async () => {
      if (!online) {
        setStaff([])
        return
      }
      try {
        unsub = await listStaff(uid, firebase.db, (items) => {
          if (cancelled) return
          setStaff(items)
        })
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('ShiftsProvider: staff subscribe failed', err)
      }
    })()
    return () => {
      cancelled = true
      if (typeof unsub === 'function') unsub()
    }
  }, [online, uid, firebase])

  // Weekly shifts subscription
  useEffect(() => {
    let unsub = null
    let cancelled = false
    ;(async () => {
      if (!online) {
        setShiftsMap({})
        return
      }
      try {
        const { collection, onSnapshot } = await import(/* @vite-ignore */ 'firebase/firestore')
        const col = collection(firebase.db, 'weeks', `${uid}_${weekISO}`, 'shifts')
        unsub = onSnapshot(col, (snap) => {
          if (cancelled) return
          const next = {}
          snap.docs.forEach((d) => {
            const data = d.data() || {}
            if (!data.staffId || !data.dateISO) return
            next[`${data.staffId}|${data.dateISO}`] = {
              start: data.start,
              end: data.end,
              remarks: data.remarks || '',
            }
          })
          setShiftsMap(next)
        })
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('ShiftsProvider: week shifts subscribe failed', err)
      }
    })()
    return () => {
      cancelled = true
      if (typeof unsub === 'function') unsub()
    }
  }, [online, uid, firebase, weekISO])

  // Offline fallback: load from localStorage and listen for changes
  useEffect(() => {
    if (online) return
    const load = () => {
      try {
        const sRaw = localStorage.getItem(STAFF_KEY)
        const s = sRaw ? JSON.parse(sRaw) : []
        setStaff(Array.isArray(s) ? s : [])
      } catch {
        setStaff([])
      }
      try {
        const mRaw = localStorage.getItem(weekShiftsKey(weekISO))
        const m = mRaw ? JSON.parse(mRaw) : {}
        setShiftsMap(m && typeof m === 'object' ? m : {})
      } catch {
        setShiftsMap({})
      }
    }
    load()
    const onStorage = (e) => {
      if (!e) return
      if (e.key === STAFF_KEY || e.key === weekShiftsKey(weekISO)) load()
    }
    const onCustom = () => load()
    window.addEventListener('storage', onStorage)
    window.addEventListener('mr-offline-changed', onCustom)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('mr-offline-changed', onCustom)
    }
  }, [online, weekISO])

  const value = useMemo(() => ({ staff, shiftsMap, weekISO }), [staff, shiftsMap, weekISO])

  return <ShiftsContext.Provider value={value}>{children}</ShiftsContext.Provider>
}

export function useShifts() {
  const ctx = useContext(ShiftsContext)
  if (!ctx) throw new Error('useShifts must be used within <ShiftsProvider>')
  return ctx
}

export { STAFF_KEY, weekShiftsKey }
