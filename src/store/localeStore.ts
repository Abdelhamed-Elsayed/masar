import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Locale } from '@/localization/translations'

interface LocaleState {
  locale: Locale
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: 'en',
      setLocale: (locale) => set({ locale }),
      toggleLocale: () => set((state) => ({ locale: state.locale === 'en' ? 'ar' : 'en' })),
    }),
    { name: 'masar-locale' },
  ),
)
