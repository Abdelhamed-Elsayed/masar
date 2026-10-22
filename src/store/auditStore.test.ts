import { describe, expect, it, beforeEach } from 'vitest'
import { useAuditStore } from './auditStore'

beforeEach(() => {
  useAuditStore.setState({ entries: [], hydrated: false })
})

describe('audit store', () => {
  it('adds a timestamped audit entry', () => {
    useAuditStore.getState().addEntry({ actorId: 'u1', targetId: 'r1', targetType: 'request', action: 'Test', details: 'Test' })
    const entry = useAuditStore.getState().entries[0]
    expect(entry.id).toMatch(/^audit-/)
    expect(entry.timestamp).toBeTruthy()
  })
})
