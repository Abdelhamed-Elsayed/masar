import { describe, expect, it, beforeEach } from 'vitest'
import { dataStorage, clearMasarDatabase } from './dataStorage'

const indexedDbAvailable = typeof indexedDB !== 'undefined'

describe.skipIf(!indexedDbAvailable)('dataStorage', () => {
  beforeEach(async () => {
    await clearMasarDatabase()
  })

  it('persists notifications and audit entries outside localStorage', async () => {
    const notification = { id: 'n1', userId: 'u1', type: 'REQUEST_MOVED' as const, title: 'Test', body: 'Test', requestId: null, isRead: false, createdAt: new Date().toISOString() }
    const audit = { id: 'a1', actorId: 'u1', targetId: 'r1', targetType: 'request', action: 'Test', details: 'Test', timestamp: new Date().toISOString() }
    await dataStorage.putNotification(notification)
    await dataStorage.putAudit(audit)
    expect(await dataStorage.listNotifications()).toHaveLength(1)
    expect(await dataStorage.listAudit()).toHaveLength(1)
  })
})
