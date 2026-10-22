import { userIds } from './users'

/**
 * Historical IDs used by older Masar builds. Kept isolated from canonical user
 * data so current users, emails, and credentials have a single source of truth.
 * This file is only for one-time persistence migration.
 */
export const legacyUserIdMap: Record<string, string> = {
  'user-adam-carter': userIds.ahmedAyman,
  'user-sarah-mitchell': userIds.ahmedMohamed,
  'user-daniel-brooks': userIds.abdelrahmanMohamed,
  'user-maya-wilson': userIds.mostafaKamel,
  'user-olivia-bennett': userIds.abdelrahmanGhoneim,
  'user-james-anderson': userIds.abdelhamid,
  'user-emma-collins': userIds.mohamedAbdelfattah,
  'user-ahmed-ali': userIds.ahmedAyman,
  'user-sara-hassan': userIds.ahmedMohamed,
  'user-omar-khaled': userIds.abdelrahmanMohamed,
  'user-layla-mostafa': userIds.mostafaKamel,
  'user-noura-ibrahim': userIds.abdelrahmanGhoneim,
  'user-karim-saleh': userIds.abdelhamid,
  'user-fatima-nasser': userIds.mohamedAbdelfattah,
}

export function normalizeLegacyUserId(userId: string | null | undefined): string | null | undefined {
  if (userId == null) return userId
  return legacyUserIdMap[userId] ?? userId
}
