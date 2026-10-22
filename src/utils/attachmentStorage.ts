const DB_NAME = 'masar-files'
const STORE_NAME = 'attachments'
const DB_VERSION = 1

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME)
    }
  })
}

export async function saveAttachmentFile(id: string, file: File): Promise<void> {
  if (typeof indexedDB === 'undefined') return
  const db = await openDatabase()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(file, id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  db.close()
}

export async function getAttachmentFile(id: string): Promise<File | Blob | undefined> {
  if (typeof indexedDB === 'undefined') return undefined
  const db = await openDatabase()
  const value = await new Promise<File | Blob | undefined>((resolve, reject) => {
    const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(id)
    request.onsuccess = () => resolve(request.result as File | Blob | undefined)
    request.onerror = () => reject(request.error)
  })
  db.close()
  return value
}
