import { useEffect, useState } from 'react'

export default function ShiftDialog({ open, initialValue, onClose, onSave, onRemove }) {
  const [form, setForm] = useState(() => ({ start: '', end: '', remarks: '' }))
  const [errors, setErrors] = useState({})

  // Reset form whenever dialog opens or initial value changes
  useEffect(() => {
    if (!open) return
    setForm(
      initialValue ?? {
        start: '',
        end: '',
        remarks: '',
      }
    )
    setErrors({})
  }, [open, initialValue])

  // Esc to close
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const validate = () => {
    const e = {}
    const { start, end, remarks } = form

    if (!start) e.start = 'Start time is required'
    if (!end) e.end = 'End time is required'

    if (start && end) {
      // Compare HH:mm strings by minutes
      const toMin = (s) => {
        const [h, m] = s.split(':').map(Number)
        return h * 60 + m
      }
      if (toMin(start) >= toMin(end)) e.end = 'End must be after start'
    }

    if (remarks && remarks.length > 120) e.remarks = 'Max 120 characters'

    return e
  }

  const onSubmit = (e) => {
    e.preventDefault()
    const eObj = validate()
    setErrors(eObj)
    if (Object.keys(eObj).length) return
    onSave?.(form)
    onClose?.()
  }

  if (!open) return null

  const labelId = 'shift-dialog-title'

  return (
    <div role="dialog" aria-modal="true" aria-labelledby={labelId}>
      <h3 id={labelId}>Edit Shift</h3>
      <form onSubmit={onSubmit} noValidate>
        <div>
          <label>
            Start
            <input
              type="time"
              name="start"
              inputMode="numeric"
              step={60}
              value={form.start}
              onChange={onChange}
              aria-invalid={errors.start ? 'true' : 'false'}
              required
            />
          </label>
          {errors.start ? <div role="alert">{errors.start}</div> : null}
        </div>

        <div>
          <label>
            End
            <input
              type="time"
              name="end"
              inputMode="numeric"
              step={60}
              value={form.end}
              onChange={onChange}
              aria-invalid={errors.end ? 'true' : 'false'}
              required
            />
          </label>
          {errors.end ? <div role="alert">{errors.end}</div> : null}
        </div>

        <div>
          <label>
            Remarks
            <input
              name="remarks"
              value={form.remarks}
              onChange={onChange}
              placeholder="optional"
              aria-invalid={errors.remarks ? 'true' : 'false'}
              maxLength={120}
            />
          </label>
          {errors.remarks ? <div role="alert">{errors.remarks}</div> : null}
        </div>

        <div>
          {typeof onRemove === 'function' && initialValue ? (
            <button type="button" onClick={() => { onRemove?.(); onClose?.() }}>Remove</button>
          ) : null}
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit">Save</button>
        </div>
      </form>
    </div>
  )
}
