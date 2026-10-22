import { describe, expect, it } from 'vitest'
import { mockRoles, mockUsers } from '@/mock/users'
import { mockDepartments } from '@/mock/departments'
import { translations } from './translations'
import { getContentTranslationKey } from './translations'

const lookup = (locale: 'en' | 'ar', value: string) => {
  const key = getContentTranslationKey(value)
  return key ? (translations[locale] as Record<string, string>)[key] ?? value : value
}

describe('translations', () => {
  it('has the same keys in English and Arabic', () => {
    const en = Object.keys(translations.en)
    const ar = Object.keys(translations.ar)
    expect(en.filter((key) => !ar.includes(key))).toEqual([])
    expect(ar.filter((key) => !en.includes(key))).toEqual([])
  })

  it('translates every role name to a distinct label in both languages', () => {
    for (const locale of ['en', 'ar'] as const) {
      const labels = mockRoles.map((role) => lookup(locale, role.name))
      const duplicates = labels.filter((label, index) => labels.indexOf(label) !== index)
      expect(duplicates, `${locale} role labels`).toEqual([])
    }
    expect(lookup('ar', 'Administrator')).not.toBe(lookup('ar', 'Employee'))
    expect(lookup('en', 'Approver')).toBe('Approver')
  })

  it('shows every user and department name in the language of the interface', () => {
    const hasArabic = (value: string) => /[؀-ۿ]/.test(value)
    for (const user of mockUsers) {
      expect(hasArabic(lookup('en', user.fullName)), `en ${user.fullName}`).toBe(false)
      expect(hasArabic(lookup('ar', user.fullName)), `ar ${user.fullName}`).toBe(true)
    }
    for (const department of mockDepartments) {
      expect(hasArabic(lookup('en', department.name)), `en ${department.name}`).toBe(false)
      expect(hasArabic(lookup('ar', department.name)), `ar ${department.name}`).toBe(true)
    }
  })
})

describe('public team bios', () => {
  it('translates every seeded bio to English and keeps the Arabic original', () => {
    const hasArabic = (value: string) => /[؀-ۿ]/.test(value)
    for (const user of mockUsers) {
      const bio = user.profile!.bio
      expect(hasArabic(lookup('en', bio)), `en bio of ${user.fullName}`).toBe(false)
      expect(lookup('ar', bio)).toBe(bio)
    }
  })
})
