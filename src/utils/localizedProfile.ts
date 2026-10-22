import type { ProfileContent, ProfileLocale, UserProfileData } from '@/types/user'

export const EMPTY_PROFILE: ProfileContent = { bio: '', experiences: [], skills: [], education: [], certifications: [] }

/** The profile as it should be shown in `locale`: the matching version first, the base fields as the fallback. */
export function getLocalizedProfile(profile: UserProfileData | undefined, locale: ProfileLocale): ProfileContent {
  if (!profile) return EMPTY_PROFILE
  const version = profile.localized?.[locale]
  return {
    bio: version?.bio ?? profile.bio,
    skills: version?.skills ?? profile.skills,
    experiences: version?.experiences ?? profile.experiences,
    education: version?.education ?? profile.education,
    certifications: version?.certifications ?? profile.certifications,
  }
}

/** Saves edited fields into the version for `locale`, keeping every other language untouched. */
export function withLocalizedFields(profile: UserProfileData | undefined, locale: ProfileLocale, patch: Partial<ProfileContent>): UserProfileData {
  const base = profile ?? { ...EMPTY_PROFILE }
  const baseIsEmpty = !base.bio && base.skills.length === 0
  return {
    ...base,
    ...(baseIsEmpty ? patch : {}),
    localized: { ...base.localized, [locale]: { ...base.localized?.[locale], ...patch } },
  }
}
