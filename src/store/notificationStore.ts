import { create } from 'zustand'
import { mockNotifications } from '@/mock/notifications'
import { NotificationType } from '@/types/notification'
import type { Notification } from '@/types/notification'
import { dataStorage } from '@/utils/dataStorage'

const MAX_NOTIFICATIONS = 2000

interface NotificationState {
  notifications: Notification[]
  hydratedUserId: string | null
  hydrateForUser: (userId: string | null) => Promise<void>
  addNotification: (notification: Notification) => void
  markAsRead: (id: string) => void
  markAllAsRead: (userId: string) => void
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],
  hydratedUserId: null,
  hydrateForUser: async (userId) => {
    if (!userId) {
      set({ hydratedUserId: null, notifications: [] })
      return
    }
    try {
      let stored = await dataStorage.listNotifications()
      if (stored.length === 0 && mockNotifications.length > 0) {
        await dataStorage.putNotifications(mockNotifications)
        stored = mockNotifications
      }
      set({
        hydratedUserId: userId,
        notifications: stored
          .filter((item) => item.userId === userId)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .slice(0, MAX_NOTIFICATIONS),
      })
    } catch {
      set({
        hydratedUserId: userId,
        notifications: mockNotifications.filter((item) => item.userId === userId).slice(0, MAX_NOTIFICATIONS),
      })
    }
  },
  addNotification: (notification) => {
    void dataStorage.putNotification(notification).catch(() => undefined)
    set((state) => {
      if (state.notifications.some((item) => item.id === notification.id)) return state
      const currentUserId = state.hydratedUserId
      if (currentUserId && notification.userId !== currentUserId) return state
      return { notifications: [notification, ...state.notifications].slice(0, MAX_NOTIFICATIONS) }
    })
  },
  markAsRead: (id) => {
    const item = get().notifications.find((notification) => notification.id === id)
    if (!item) return
    const updated = { ...item, isRead: true }
    void dataStorage.putNotification(updated).catch(() => undefined)
    set((state) => ({ notifications: state.notifications.map((notification) => notification.id === id ? updated : notification) }))
  },
  markAllAsRead: (userId) => {
    const current = get().notifications.filter((item) => item.userId === userId && !item.isRead)
    const updated = current.map((item) => ({ ...item, isRead: true }))
    void Promise.all(updated.map((item) => dataStorage.putNotification(item))).catch(() => undefined)
    set((state) => ({ notifications: state.notifications.map((item) => item.userId === userId ? { ...item, isRead: true } : item) }))
  },
}))

export function createNotification(input: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Notification {
  return {
    ...input,
    id: `notif-${crypto.randomUUID()}`,
    isRead: false,
    createdAt: new Date().toISOString(),
  }
}

export { NotificationType }
