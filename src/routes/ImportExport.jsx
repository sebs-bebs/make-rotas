import { useMemo, useState } from 'react'
import { useAuth } from '../state/AuthProvider.jsx'
import { useShifts } from '../state/ShiftsProvider.jsx'
import { STAFF_KEY, weekShiftsKey, notifyOfflineDataChanged } from '../state/ShiftsProvider.jsx'
import { createStaff } from '../services/staffService.js'
import { upsertShift } from '../services/shiftsService.js'
import { useToast } from '../state/ToastProvider.jsx'

function splitCSVLine(line) {
  const out = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      out.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  out.push(cur)
  return out
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length === 0) return { headers: [], rows: [] }
  const headers = splitCSVLine(lines[0]).map((h) => h.trim())
  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCSVLine(lines[i])
    const obj = {}
    headers.forEach((h, idx) => {
      obj[h] = (cols[idx] ?? '').trim()
    })
    rows.push(obj)
  }
  return { headers, rows }
}

export default function ImportExport() {
  const { uid, firebase } = useAuth()
  const online = !!(firebase && uid)
  const { staff, shiftsMap, weekISO } = useShifts()
  const { addToast } = useToast()

  const [importType, setImportType] = useState('staff') // 'staff' | 'shifts'
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null) // { headers, rows }

  const onFile = (e) => {
    const f = e.target.files && e.target.files[0]
    setFile(f || null)
    setPreview(null)
  }

  const doPreview = () => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const txt = String(reader.result || '')
        const parsed = parseCSV(txt)
        setPreview(parsed)
        addToast('Preview ready')
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('CSV parse failed', e)
        addToast('Failed to parse CSV')
      }
    }
    reader.readAsText(file)
  }

  const exportStaffCSV = () => {
    const headers = ['staffId', 'fullName', 'role', 'location']
    const rows = staff.map((s) => headers.map((h) => (s[h] ?? '')).join(','))
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'staff.csv'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const exportWeekShiftsCSV = () => {
    const headers = ['weekStartISO', 'staffId', 'dateISO', 'start', 'end', 'remarks']
    const rows = Object.entries(shiftsMap).map(([key, v]) => {
      const [staffId, dateISO] = key.split('|')
      return [weekISO, staffId, dateISO, v.start || '', v.end || '', v.remarks || ''].join(',')
    })
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `week_${weekISO}_shifts.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const applyImport = async () => {
    if (!preview || !preview.rows.length) return

    if (importType === 'staff') {
      const required = ['staffId', 'fullName']
      const missing = required.filter((h) => !preview.headers.includes(h))
      if (missing.length) {
        addToast(`Missing headers: ${missing.join(', ')}`)
        return
      }

      if (online) {
        let ok = 0, fail = 0
        for (const row of preview.rows) {
          const item = {
            staffId: row.staffId,
            fullName: row.fullName || '',
            role: row.role || '',
            location: row.location || '',
          }
          try {
            await createStaff(uid, firebase.db, item)
            ok++
          } catch {
            fail++
          }
        }
        addToast(`Imported staff: ${ok} ok${fail ? `, ${fail} failed` : ''}`)
      } else {
        // Merge into localStorage with unique staffId
        try {
          const existingRaw = localStorage.getItem(STAFF_KEY)
          const existing = existingRaw ? JSON.parse(existingRaw) : []
          const map = new Map(existing.map((s) => [s.staffId, s]))
          preview.rows.forEach((r) => {
            const item = {
              staffId: r.staffId,
              fullName: r.fullName || '',
              role: r.role || '',
              location: r.location || '',
            }
            map.set(item.staffId, item)
          })
          const next = Array.from(map.values())
          localStorage.setItem(STAFF_KEY, JSON.stringify(next))
          notifyOfflineDataChanged()
          addToast(`Imported locally: ${preview.rows.length} staff`)
        } catch {
          addToast('Failed local import')
        }
      }
      return
    }

    if (importType === 'shifts') {
      const required = ['weekStartISO', 'staffId', 'dateISO', 'start', 'end']
      const missing = required.filter((h) => !preview.headers.includes(h))
      if (missing.length) {
        addToast(`Missing headers: ${missing.join(', ')}`)
        return
      }

      if (online) {
        let ok = 0, fail = 0
        for (const row of preview.rows) {
          try {
            await upsertShift(uid, firebase.db, {
              weekStartISO: row.weekStartISO,
              staffId: row.staffId,
              dateISO: row.dateISO,
              start: row.start,
              end: row.end,
              remarks: row.remarks || '',
            })
            ok++
          } catch {
            fail++
          }
        }
        addToast(`Imported shifts: ${ok} ok${fail ? `, ${fail} failed` : ''}`)
      } else {
        try {
          // Group by weekStartISO
          const byWeek = new Map()
          for (const r of preview.rows) {
            const w = r.weekStartISO
            if (!byWeek.has(w)) byWeek.set(w, [])
            byWeek.get(w).push(r)
          }
          byWeek.forEach((rows, w) => {
            const raw = localStorage.getItem(weekShiftsKey(w))
            const map = raw ? JSON.parse(raw) : {}
            rows.forEach((r) => {
              const key = `${r.staffId}|${r.dateISO}`
              map[key] = { start: r.start, end: r.end, remarks: r.remarks || '' }
            })
            localStorage.setItem(weekShiftsKey(w), JSON.stringify(map))
          })
          notifyOfflineDataChanged()
          addToast(`Imported locally: ${preview.rows.length} shifts`)
        } catch {
          addToast('Failed local import')
        }
      }
    }
  }

  const summary = useMemo(() => {
    if (!preview) return null
    return {
      headers: preview.headers,
      count: preview.rows.length,
    }
  }, [preview])

  return (
    <section>
      <h2>Import/Export</h2>

      <div className="hide-when-exporting">
        <fieldset>
          <legend>Export</legend>
          <div>
            <button type="button" onClick={exportStaffCSV}>Export Staff CSV</button>
          </div>
          <div>
            <button type="button" onClick={exportWeekShiftsCSV}>Export Current Week Shifts CSV</button>
          </div>
        </fieldset>

        <hr />

        <fieldset>
          <legend>Import</legend>
          <div>
            <label>
              Type
              <select value={importType} onChange={(e) => { setImportType(e.target.value); setPreview(null); setFile(null) }}>
                <option value="staff">Staff CSV</option>
                <option value="shifts">Week Shifts CSV</option>
              </select>
            </label>
          </div>
          <div>
            <input type="file" accept=".csv,text/csv" onChange={onFile} />
          </div>
          <div>
            <button type="button" onClick={doPreview} disabled={!file}>Preview</button>
            <button type="button" onClick={applyImport} disabled={!preview}>Apply Import</button>
          </div>
          {summary && (
            <div>
              <p><span className="chip">{summary.count} rows parsed</span></p>
              <p>Headers: {summary.headers.join(', ')}</p>
            </div>
          )}
        </fieldset>
      </div>
    </section>
  )
}
