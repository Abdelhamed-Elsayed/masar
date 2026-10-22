import { exportStoredRequests, putStoredRequests } from './requestStorage'
import { clearMasarDatabase, exportStoredAudit, exportStoredNotifications, dataStorage } from './dataStorage'

const STORAGE_PREFIX = 'masar-'
const SENSITIVE_KEYS = new Set(['masar-local-credentials'])

export interface MasarBackup {
  version: 2
  exportedAt: string
  localStorage: Record<string, string>
  requests: import('@/types/request').Request[]
  notifications: import('@/types/notification').Notification[]
  audit: import('@/store/auditStore').AuditEntry[]
}

export async function exportMasarData(): Promise<MasarBackup> {
  const data: Record<string, string> = {}
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index)
    if (key?.startsWith(STORAGE_PREFIX)) {
      const value = localStorage.getItem(key)
      if (value !== null && !SENSITIVE_KEYS.has(key)) data[key] = value
    }
  }
  const [requests, notifications, audit] = await Promise.all([exportStoredRequests(), exportStoredNotifications(), exportStoredAudit()])
  return { version: 2, exportedAt: new Date().toISOString(), localStorage: data, requests, notifications, audit }
}

export async function downloadMasarBackup() {
  const backup = await exportMasarData()
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `masar-backup-${new Date().toISOString().slice(0, 10)}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

export async function importMasarBackup(file: File) {
  const text = await file.text()
  const backup = JSON.parse(text) as Partial<MasarBackup>
  if (![1, 2].includes(backup.version ?? 0) || !backup.localStorage || typeof backup.localStorage !== 'object') {
    throw new Error('Invalid Masar backup file.')
  }
  await dataStorage.clearAll()
  for (const [key, value] of Object.entries(backup.localStorage)) {
    if (key.startsWith(STORAGE_PREFIX) && !SENSITIVE_KEYS.has(key) && typeof value === 'string') localStorage.setItem(key, value)
  }
  if (Array.isArray(backup.requests)) await putStoredRequests(backup.requests)
  if (Array.isArray(backup.notifications)) await dataStorage.putNotifications(backup.notifications)
  if (Array.isArray(backup.audit)) await dataStorage.putAuditEntries(backup.audit)
}

export async function resetMasarData() {
  await clearMasarDatabase()
  if ('indexedDB' in window) {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase('masar-files')
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error ?? new Error('Unable to clear stored attachments.'))
      request.onblocked = () => reject(new Error('Stored attachments are in use by another tab.'))
    })
  }
  for (let index = localStorage.length - 1; index >= 0; index -= 1) {
    const key = localStorage.key(index)
    if (key?.startsWith(STORAGE_PREFIX)) localStorage.removeItem(key)
  }
}
