import { create } from 'zustand'
import { dataStorage } from '@/utils/dataStorage'

export interface AuditEntry {
  id: string
  action: string
  actorId: string | null
  targetId: string
  targetType: string
  timestamp: string
  details: string
}

interface AuditState {
  entries: AuditEntry[]
  hydrated: boolean
  hydrate: () => Promise<void>
  addEntry: (entry: Omit<AuditEntry, 'id' | 'timestamp'> & Partial<Pick<AuditEntry, 'id' | 'timestamp'>>) => void
  clear: () => Promise<void>
}

const MAX_AUDIT_ENTRIES = 5000

export const useAuditStore = create<AuditState>()((set) => ({
  entries: [],
  hydrated: false,
  hydrate: async () => {
    try {
      const entries = (await dataStorage.listAudit())
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
        .slice(0, MAX_AUDIT_ENTRIES)
      set({ entries, hydrated: true })
    } catch {
      set({ hydrated: true })
    }
  },
  addEntry: (entry) => {
    const value: AuditEntry = {
      id: entry.id ?? `audit-${crypto.randomUUID()}`,
      timestamp: entry.timestamp ?? new Date().toISOString(),
      actorId: entry.actorId,
      targetId: entry.targetId,
      targetType: entry.targetType,
      action: entry.action,
      details: entry.details,
    }
    void dataStorage.putAudit(value).catch(() => undefined)
    set((state) => ({ entries: [value, ...state.entries].slice(0, MAX_AUDIT_ENTRIES) }))
  },
  clear: async () => {
    await dataStorage.clearAudit().catch(() => undefined)
    set({ entries: [] })
  },
}))
