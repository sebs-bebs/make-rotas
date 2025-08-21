import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../state/AuthProvider.jsx'
import { listStaff, createStaff, deleteStaff } from '../services/staffService.js'
import { STAFF_KEY, notifyOfflineDataChanged } from '../state/ShiftsProvider.jsx'
import { useToast } from '../state/ToastProvider.jsx'

const ID_RE = /^[a-zA-Z0-9._-]+$/

export default function StaffTable() {
  const { uid, firebase } = useAuth()
  const online = !!(firebase && uid)
  const { addToast } = useToast()
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ staffId: '', fullName: '', role: '', location: '' })
  const [errors, setErrors] = useState({})

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const existingIdsLower = useMemo(() => new Set(items.map((i) => i.staffId.toLowerCase())), [items])

  const validate = () => {
    const e = {}
    const staffId = form.staffId.trim()
    const fullName = form.fullName.trim()

    if (!staffId) e.staffId = 'Staff ID is required'
    else if (!ID_RE.test(staffId)) e.staffId = 'Only letters, numbers, dot, underscore, hyphen'
    else if (existingIdsLower.has(staffId.toLowerCase())) e.staffId = 'This Staff ID already exists'

    if (!fullName) e.fullName = 'Full name is required'
    return e
  }

  const onSubmit = (e) => {
    e.preventDefault()
    const eObj = validate()
    setErrors(eObj)
    if (Object.keys(eObj).length) return

    const next = {
      staffId: form.staffId.trim(),
      fullName: form.fullName.trim(),
      role: form.role.trim(),
      location: form.location.trim(),
    }
    if (online) {
      ;(async () => {
        try {
          // Optimistic add
          setItems((prev) => (prev.some((i) => i.staffId === next.staffId) ? prev : [...prev, next]))
          await createStaff(uid, firebase.db, next)
          addToast('Staff added')
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Failed to create staff', err)
          // Rollback optimistic add
          setItems((prev) => prev.filter((i) => i.staffId !== next.staffId))
          addToast('Failed to add staff')
        }
      })()
    } else {
      const nextItems = [...items, next]
      setItems(nextItems)
      try {
        localStorage.setItem(STAFF_KEY, JSON.stringify(nextItems))
      } catch {}
      notifyOfflineDataChanged()
      addToast('Staff saved locally')
    }
    setForm({ staffId: '', fullName: '', role: '', location: '' })
  }

  const remove = (staffId) => {
    const ok = window.confirm(`Delete staff ${staffId}?`)
    if (!ok) return
    if (online) {
      ;(async () => {
        try {
          // Optimistic remove
          setItems((prev) => prev.filter((i) => i.staffId !== staffId))
          await deleteStaff(uid, firebase.db, staffId)
          addToast('Staff deleted')
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Failed to delete staff', err)
          // Rollback optimistic remove (best-effort)
          setItems((prev) => (prev.some((i) => i.staffId === staffId) ? prev : [...prev, { staffId, fullName: '', role: '', location: '' }]))
          addToast('Failed to delete staff')
        }
      })()
    } else {
      const nextItems = items.filter((i) => i.staffId !== staffId)
      setItems(nextItems)
      try {
        localStorage.setItem(STAFF_KEY, JSON.stringify(nextItems))
      } catch {}
      notifyOfflineDataChanged()
      addToast('Staff removed locally')
    }
  }

  // Subscribe to Firestore staff when online
  useEffect(() => {
    let unsub = null
    let cancelled = false
    ;(async () => {
      if (!online) return
      try {
        unsub = await listStaff(uid, firebase.db, (items) => {
          if (cancelled) return
          setItems(items)
        })
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to subscribe staff', err)
      }
    })()
    return () => {
      cancelled = true
      if (typeof unsub === 'function') unsub()
    }
  }, [online, uid, firebase])

  // Offline: load from localStorage and watch for changes
  useEffect(() => {
    if (online) return
    const load = () => {
      try {
        const raw = localStorage.getItem(STAFF_KEY)
        const parsed = raw ? JSON.parse(raw) : []
        setItems(Array.isArray(parsed) ? parsed : [])
      } catch {
        setItems([])
      }
    }
    load()
    const onStorage = (e) => {
      if (!e) return
      if (e.key === STAFF_KEY) load()
    }
    const onCustom = () => load()
    window.addEventListener('storage', onStorage)
    window.addEventListener('mr-offline-changed', onCustom)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('mr-offline-changed', onCustom)
    }
  }, [online])

  return (
    <section>
      <h2>Staff</h2>

      <form onSubmit={onSubmit} noValidate>
        <div>
          <label>
            Staff ID
            <input
              name="staffId"
              value={form.staffId}
              onChange={onChange}
              placeholder="e.g. jdoe"
              aria-invalid={errors.staffId ? 'true' : 'false'}
              required
            />
          </label>
          {errors.staffId ? (
            <div role="alert">{errors.staffId}</div>
          ) : null}
        </div>

        <div>
          <label>
            Full name
            <input
              name="fullName"
              value={form.fullName}
              onChange={onChange}
              placeholder="e.g. Jane Doe"
              aria-invalid={errors.fullName ? 'true' : 'false'}
              required
            />
          </label>
          {errors.fullName ? (
            <div role="alert">{errors.fullName}</div>
          ) : null}
        </div>

        <div>
          <label>
            Role
            <input name="role" value={form.role} onChange={onChange} placeholder="optional" />
          </label>
        </div>

        <div>
          <label>
            Location
            <input
              name="location"
              value={form.location}
              onChange={onChange}
              placeholder="optional"
            />
          </label>
        </div>

        <div>
          <button type="submit">Add Staff</button>
        </div>
      </form>

      <hr />

      <table aria-label="Staff list">
        <thead>
          <tr>
            <th>Staff ID</th>
            <th>Full name</th>
            <th>Role</th>
            <th>Location</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan="5">No staff yet</td>
            </tr>
          ) : (
            items.map((s) => (
              <tr key={s.staffId}>
                <td>{s.staffId}</td>
                <td>{s.fullName}</td>
                <td>{s.role}</td>
                <td>{s.location}</td>
                <td>
                  <button type="button" onClick={() => remove(s.staffId)} aria-label={`Delete ${s.fullName}`}>
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  )
}
