import type { Notification } from '@/types/notification'
import type { Request } from '@/types/request'
import type { AuditEntry } from '@/store/auditStore'
import { normalizeLegacyUserId } from '@/mock/legacyUserIdMigration'

const DB_NAME = 'masar-data'
const DB_VERSION = 2
const STORES = {
  requests: 'requests',
  notifications: 'notifications',
  audit: 'audit',
} as const

function openDatabase(): Promise<IDBDatabase> {
  if (!('indexedDB' in window)) return Promise.reject(new Error('IndexedDB is not available.'))
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      for (const storeName of Object.values(STORES)) {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' })
        }
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Unable to open Masar storage.'))
  })
}

function readAll<T>(storeName: string): Promise<T[]> {
  return openDatabase().then((db) => new Promise<T[]>((resolve, reject) => {
    const request = db.transaction(storeName, 'readonly').objectStore(storeName).getAll()
    request.onsuccess = () => { db.close(); resolve(request.result as T[]) }
    request.onerror = () => { db.close(); reject(request.error ?? new Error(`Unable to read ${storeName}.`)) }
  }))
}

function putOne<T extends { id: string }>(storeName: string, value: T): Promise<void> {
  return openDatabase().then((db) => new Promise<void>((resolve, reject) => {
    const request = db.transaction(storeName, 'readwrite').objectStore(storeName).put(value)
    request.onsuccess = () => { db.close(); resolve() }
    request.onerror = () => { db.close(); reject(request.error ?? new Error(`Unable to save ${storeName}.`)) }
  }))
}

function putMany<T extends { id: string }>(storeName: string, values: T[]): Promise<void> {
  return openDatabase().then((db) => new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    values.forEach((value) => store.put(value))
    transaction.oncomplete = () => { db.close(); resolve() }
    transaction.onerror = () => { db.close(); reject(transaction.error ?? new Error(`Unable to save ${storeName}.`)) }
  }))
}

function clearStore(storeName: string): Promise<void> {
  return openDatabase().then((db) => new Promise<void>((resolve, reject) => {
    const request = db.transaction(storeName, 'readwrite').objectStore(storeName).clear()
    request.onsuccess = () => { db.close(); resolve() }
    request.onerror = () => { db.close(); reject(request.error ?? new Error(`Unable to clear ${storeName}.`)) }
  }))
}

export const dataStorage = {
  listRequests: () => readAll<Request>(STORES.requests),
  putRequest: (request: Request) => putOne(STORES.requests, request),
  putRequests: (requests: Request[]) => putMany(STORES.requests, requests),
  clearRequests: () => clearStore(STORES.requests),
  listNotifications: () => readAll<Notification>(STORES.notifications),
  putNotification: (notification: Notification) => putOne(STORES.notifications, notification),
  putNotifications: (notifications: Notification[]) => putMany(STORES.notifications, notifications),
  clearNotifications: () => clearStore(STORES.notifications),
  listAudit: () => readAll<AuditEntry>(STORES.audit),
  putAudit: (entry: AuditEntry) => putOne(STORES.audit, entry),
  putAuditEntries: (entries: AuditEntry[]) => putMany(STORES.audit, entries),
  clearAudit: () => clearStore(STORES.audit),
  clearAll: async () => {
    await Promise.all([clearStore(STORES.requests), clearStore(STORES.notifications), clearStore(STORES.audit)])
  },
}

export async function migratePersistedUserIds(): Promise<void> {
  const db = await openDatabase()
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(Object.values(STORES), 'readwrite')
    const requestsStore = transaction.objectStore(STORES.requests)
    const notificationsStore = transaction.objectStore(STORES.notifications)
    const auditStore = transaction.objectStore(STORES.audit)

    requestsStore.getAll().onsuccess = (event) => {
      const records = (event.target as IDBRequest<Request[]>).result
      records.forEach((record) => {
        const requesterId = normalizeLegacyUserId(record.requesterId) ?? record.requesterId
        if (requesterId !== record.requesterId) requestsStore.put({ ...record, requesterId })
      })
    }
    notificationsStore.getAll().onsuccess = (event) => {
      const records = (event.target as IDBRequest<Notification[]>).result
      records.forEach((record) => {
        const userId = normalizeLegacyUserId(record.userId) ?? record.userId
        if (userId !== record.userId) notificationsStore.put({ ...record, userId })
      })
    }
    auditStore.getAll().onsuccess = (event) => {
      const records = (event.target as IDBRequest<AuditEntry[]>).result
      records.forEach((record) => {
        const actorId = normalizeLegacyUserId(record.actorId) ?? null
        const targetId = record.targetType === 'user' ? (normalizeLegacyUserId(record.targetId) ?? record.targetId) : record.targetId
        if (actorId !== record.actorId || targetId !== record.targetId) auditStore.put({ ...record, actorId, targetId })
      })
    }
    transaction.oncomplete = () => { db.close(); resolve() }
    transaction.onerror = () => { db.close(); reject(transaction.error ?? new Error('Unable to migrate Masar user IDs.')) }
    transaction.onabort = () => { db.close(); reject(transaction.error ?? new Error('Unable to migrate Masar user IDs.')) }
  })
}

export async function clearMasarDatabase(): Promise<void> {
  if (!('indexedDB' in window)) return
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error ?? new Error('Unable to clear Masar browser data.'))
    request.onblocked = () => reject(new Error('Masar browser data is in use by another tab.'))
  })
}

export async function exportStoredNotifications(): Promise<Notification[]> {
  return dataStorage.listNotifications()
}

export async function exportStoredAudit(): Promise<AuditEntry[]> {
  return dataStorage.listAudit()
}
