// Staff Firestore service with safe dynamic imports and Vite-ignore hints
// API:
// - listStaff(uid, db, onChange) -> unsubscribe function (realtime)
// - createStaff(uid, db, { staffId, fullName, role, location })
// - deleteStaff(uid, db, staffId)

export async function listStaff(uid, db, onChange) {
  const { collection, query, where, onSnapshot } = await import(/* @vite-ignore */ 'firebase/firestore')
  const col = collection(db, 'staff')
  const q = query(col, where('ownerUid', '==', uid))
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ staffId: d.id, ...(d.data() || {}) }))
    onChange(items)
  })
}

export async function createStaff(uid, db, staff) {
  const { doc, setDoc, serverTimestamp } = await import(/* @vite-ignore */ 'firebase/firestore')
  const ref = doc(db, 'staff', staff.staffId)
  await setDoc(
    ref,
    {
      fullName: staff.fullName,
      role: staff.role || '',
      location: staff.location || '',
      ownerUid: uid,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true },
  )
}

export async function deleteStaff(uid, db, staffId) {
  const { doc, deleteDoc } = await import(/* @vite-ignore */ 'firebase/firestore')
  const ref = doc(db, 'staff', staffId)
  await deleteDoc(ref)
}
