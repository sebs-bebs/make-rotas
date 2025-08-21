import { useEffect, useMemo, useState } from 'react'
import { WEEKDAY_SHORT, getDateForWeekday, formatDateISOLocal } from '../utils/dateUtils.js'
import { diffMinutes, minutesToLabel } from '../utils/timeUtils.js'
import ShiftDialog from './ShiftDialog.jsx'
import { useAuth } from '../state/AuthProvider.jsx'
import { useShifts } from '../state/ShiftsProvider.jsx'
import { weekShiftsKey, notifyOfflineDataChanged } from '../state/ShiftsProvider.jsx'
import { upsertShift, deleteShiftByKey } from '../services/shiftsService.js'
import { useToast } from '../state/ToastProvider.jsx'

export default function RotaDayList({ weekStart, activeDay }) {
  const { uid, firebase } = useAuth()
  const { staff, shiftsMap } = useShifts()
  const { addToast } = useToast()
  const online = !!(firebase && uid)
  const dayDate = useMemo(() => getDateForWeekday(weekStart, activeDay), [weekStart, activeDay])
  const label = `${WEEKDAY_SHORT[activeDay]} ${dayDate.getDate()}`
  const iso = formatDateISOLocal(dayDate)
  const weekISO = formatDateISOLocal(weekStart)

  // Local, per-staff/day shift map keyed by `${staffId}|${iso}` -> { start, end, remarks }
  const [dayShifts, setDayShifts] = useState({})

  // Staff selection (defaults to first staff when available). Fallback 'default' if none.
  const [selectedStaffId, setSelectedStaffId] = useState('')
  const effectiveStaffId = selectedStaffId || 'default'

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogInitial, setDialogInitial] = useState(null)

  // Effective key for current selection
  const shiftKey = `${effectiveStaffId}|${iso}`
  const providerShift = shiftsMap[shiftKey]
  const offlineShift = dayShifts[shiftKey]
  const shift = providerShift ?? offlineShift

  const openAdd = () => {
    setDialogInitial(null)
    setDialogOpen(true)
  }
  const openEdit = () => {
    setDialogInitial(shift)
    setDialogOpen(true)
  }
  const onClose = () => setDialogOpen(false)

  const onSave = (val) => {
    // Replace prompt if a shift already exists for this day
    if (shift) {
      const oldStr = `${shift.start} – ${shift.end}${shift.remarks ? ` · ${shift.remarks}` : ''}`
      const newStr = `${val.start} – ${val.end}${val.remarks ? ` · ${val.remarks}` : ''}`
      const ok = window.confirm(`Replace existing shift?\n\nOld: ${oldStr}\nNew: ${newStr}`)
      if (!ok) return
    }
    if (!online) {
      setDayShifts((m) => ({ ...m, [shiftKey]: val }))
      try {
        const key = weekShiftsKey(weekISO)
        const raw = localStorage.getItem(key)
        const map = raw ? JSON.parse(raw) : {}
        map[shiftKey] = val
        localStorage.setItem(key, JSON.stringify(map))
        notifyOfflineDataChanged()
        addToast('Shift saved locally')
      } catch {}
    }

    // Persist online when Firebase is available
    if (firebase && uid) {
      ;(async () => {
        try {
          await upsertShift(uid, firebase.db, {
            weekStartISO: weekISO,
            staffId: effectiveStaffId,
            dateISO: iso,
            start: val.start,
            end: val.end,
            remarks: val.remarks || '',
          })
          addToast('Shift saved')
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('Failed to save shift', e)
          addToast('Failed to save shift')
        }
      })()
    }
  }

  const onRemove = () => {
    const ok = window.confirm('Remove shift for this day?')
    if (!ok) return
    if (!online) {
      setDayShifts((m) => {
        const { [shiftKey]: _omit, ...rest } = m
        return rest
      })
      try {
        const key = weekShiftsKey(weekISO)
        const raw = localStorage.getItem(key)
        const map = raw ? JSON.parse(raw) : {}
        if (map && typeof map === 'object') {
          delete map[shiftKey]
          localStorage.setItem(key, JSON.stringify(map))
          notifyOfflineDataChanged()
          addToast('Shift removed locally')
        }
      } catch {}
    }

    if (firebase && uid) {
      ;(async () => {
        try {
          await deleteShiftByKey(uid, firebase.db, { weekStartISO: weekISO, staffId: effectiveStaffId, dateISO: iso })
          addToast('Shift removed')
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('Failed to delete shift', e)
          addToast('Failed to delete shift')
        }
      })()
    }
  }

  // No direct day subscription now; rely on ShiftsProvider for online, local state for offline.

  // Default select first staff when list changes
  useEffect(() => {
    if (staff.length && !selectedStaffId) {
      setSelectedStaffId(staff[0].staffId)
    } else if (selectedStaffId && !staff.find((s) => s.staffId === selectedStaffId)) {
      setSelectedStaffId(staff[0]?.staffId || '')
    }
  }, [staff, selectedStaffId])

  return (
    <section aria-label="Day rota">
      <h3>{label}</h3>
      {staff.length > 0 ? (
        <div>
          <label>
            Staff
            <select value={selectedStaffId} onChange={(e) => setSelectedStaffId(e.target.value)}>
              {staff.map((s) => (
                <option key={s.staffId} value={s.staffId}>{s.staffId} — {s.fullName}</option>
              ))}
            </select>
          </label>
        </div>
      ) : (
        <div>No staff yet — add on the Staff tab. You can still add a temporary shift.</div>
      )}

      {shift ? (
        <div>
          <div>
            {shift.start} – {shift.end}
            {shift.remarks ? ` · ${shift.remarks}` : ''}
            {' '}
            <span className="chip">{minutesToLabel(diffMinutes(shift.start, shift.end))}</span>
          </div>
          <div>
            <button type="button" onClick={openEdit}>Edit Shift</button>{' '}
            <button type="button" onClick={onRemove}>Remove</button>
          </div>
        </div>
      ) : (
        <div>
          <div>No shifts yet</div>
          <button type="button" onClick={openAdd}>Add Shift</button>
        </div>
      )}

      <ShiftDialog
        open={dialogOpen}
        initialValue={dialogInitial}
        onClose={onClose}
        onSave={onSave}
        onRemove={shift ? onRemove : undefined}
      />
    </section>
  )
}
