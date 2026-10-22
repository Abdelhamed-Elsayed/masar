import { describe, expect, it } from 'vitest'
import { mockUsers, userIds } from '@/mock/users'
import { getLocalizedProfile, withLocalizedFields } from './localizedProfile'

const hasArabic = (value: string) => /[؀-ۿ]/.test(value)
const everyText = (profile: ReturnType<typeof getLocalizedProfile>) => [
  profile.bio,
  ...profile.skills,
  ...profile.experiences.flatMap((item) => [item.role, item.company, item.period, item.description]),
  ...profile.education.flatMap((item) => [item.degree, item.institution]),
  ...profile.certifications.flatMap((item) => [item.title, item.issuer]),
]

describe('localized profiles', () => {
  it('every seeded profile is fully Arabic in Arabic and fully English in English', () => {
    for (const user of mockUsers) {
      const en = everyText(getLocalizedProfile(user.profile, 'en'))
      expect(en.length, user.fullName).toBeGreaterThan(5)
      expect(en.filter(hasArabic), `English texts of ${user.fullName}`).toEqual([])
      const ar = getLocalizedProfile(user.profile, 'ar')
      expect(hasArabic(ar.bio), `Arabic bio of ${user.fullName}`).toBe(true)
      expect(ar.experiences.every((item) => hasArabic(item.role) && hasArabic(item.description)), `Arabic experience of ${user.fullName}`).toBe(true)
      expect(ar.education.every((item) => hasArabic(item.degree) && hasArabic(item.institution))).toBe(true)
      expect(ar.experiences.length).toBe(getLocalizedProfile(user.profile, 'en').experiences.length)
    }
  })

  it('falls back to the base fields when a language has no version', () => {
    const profile = { bio: 'base', skills: ['a'], experiences: [], education: [], certifications: [] }
    expect(getLocalizedProfile(profile, 'en').bio).toBe('base')
    expect(getLocalizedProfile(undefined, 'ar').skills).toEqual([])
  })

  it('saves an edit only into the language being edited', () => {
    const seeded = mockUsers.find((user) => user.id === userIds.ahmedAyman)!.profile
    const edited = withLocalizedFields(seeded, 'en', { bio: 'New English bio', skills: ['Go'] })
    expect(getLocalizedProfile(edited, 'en').bio).toBe('New English bio')
    expect(getLocalizedProfile(edited, 'en').skills).toEqual(['Go'])
    expect(getLocalizedProfile(edited, 'ar').bio).toBe(getLocalizedProfile(seeded, 'ar').bio)
    expect(getLocalizedProfile(edited, 'en').experiences).toEqual(getLocalizedProfile(seeded, 'en').experiences)
  })
})
