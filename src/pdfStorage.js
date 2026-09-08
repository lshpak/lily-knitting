const DB_NAME = 'lily-knitting-pdfs'
const STORE_NAME = 'patterns'
const BANK_STORE = 'pattern-bank'

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2)
    request.onupgradeneeded = (e) => {
      const db = request.result
      if (e.oldVersion < 1) {
        db.createObjectStore(STORE_NAME)
      }
      if (e.oldVersion < 2) {
        db.createObjectStore(BANK_STORE)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function savePDF(projectId, file) {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  tx.objectStore(STORE_NAME).put(
    { name: file.name, blob: file },
    projectId
  )
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getPDF(projectId) {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readonly')
  const request = tx.objectStore(STORE_NAME).get(projectId)
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result ?? null)
    request.onerror = () => reject(request.error)
  })
}

export async function deletePDF(projectId) {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  tx.objectStore(STORE_NAME).delete(projectId)
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function saveBankPattern(id, file) {
  const db = await openDB()
  const tx = db.transaction(BANK_STORE, 'readwrite')
  tx.objectStore(BANK_STORE).put({ name: file.name, blob: file }, id)
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getBankPattern(id) {
  const db = await openDB()
  const tx = db.transaction(BANK_STORE, 'readonly')
  const request = tx.objectStore(BANK_STORE).get(id)
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result ?? null)
    request.onerror = () => reject(request.error)
  })
}

export async function deleteBankPattern(id) {
  const db = await openDB()
  const tx = db.transaction(BANK_STORE, 'readwrite')
  tx.objectStore(BANK_STORE).delete(id)
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
