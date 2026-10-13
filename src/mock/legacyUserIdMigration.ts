import { userIds } from './users'

/**
 * Historical IDs used by older Masar builds. Kept isolated from canonical user
 * data so current users, emails, and credentials have a single source of truth.
 * This file is only for one-time persistence migration.
 */
export const legacyUserIdMap: Record<string, string> = {
  'user-ahmed-ali': userIds.adam,
  'user-sara-hassan': userIds.sarah,
  'user-omar-khaled': userIds.daniel,
  'user-layla-mostafa': userIds.maya,
  'user-noura-ibrahim': userIds.olivia,
  'user-karim-saleh': userIds.james,
  'user-fatima-nasser': userIds.emma,
}

export function normalizeLegacyUserId(userId: string | null | undefined): string | null | undefined {
  if (userId == null) return userId
  return legacyUserIdMap[userId] ?? userId
}
