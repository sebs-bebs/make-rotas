// Shifts Firestore service (dynamic imports guarded for Vite)
// Canonical doc path: weeks/{uid}_{weekStartISO}/shifts/{staffId}_{dateISO}
// Each doc contains: { staffId, dateISO, weekStartISO, start, end, remarks, updatedAt }

function keyFor(staffId, dateISO) {
  return `${staffId}_${dateISO}`
}

export async function upsertShift(uid, db, { weekStartISO, staffId, dateISO, start, end, remarks }) {
  const { doc, setDoc, serverTimestamp } = await import(/* @vite-ignore */ 'firebase/firestore')
  const ref = doc(db, 'weeks', `${uid}_${weekStartISO}`, 'shifts', keyFor(staffId, dateISO))
  await setDoc(
    ref,
    { staffId, dateISO, weekStartISO, start, end, remarks: remarks || '', updatedAt: serverTimestamp() },
    { merge: true },
  )
}

export async function deleteShiftByKey(uid, db, { weekStartISO, staffId, dateISO }) {
  const { doc, deleteDoc } = await import(/* @vite-ignore */ 'firebase/firestore')
  const ref = doc(db, 'weeks', `${uid}_${weekStartISO}`, 'shifts', keyFor(staffId, dateISO))
  await deleteDoc(ref)
}

export async function listenDayShift(uid, db, { weekStartISO, staffId, dateISO }, onChange) {
  const { doc, onSnapshot } = await import(/* @vite-ignore */ 'firebase/firestore')
  const ref = doc(db, 'weeks', `${uid}_${weekStartISO}`, 'shifts', keyFor(staffId, dateISO))
  return onSnapshot(ref, (snap) => {
    onChange(snap.exists() ? snap.data() : null)
  })
}

export async function listWeekShifts(uid, db, { weekStartISO, staffId }, onChange) {
  const { collection, query, where, onSnapshot } = await import(/* @vite-ignore */ 'firebase/firestore')
  const col = collection(db, 'weeks', `${uid}_${weekStartISO}`, 'shifts')
  const q = query(col, where('staffId', '==', staffId))
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }))
    onChange(items)
  })
}
