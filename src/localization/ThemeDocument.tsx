import { useEffect } from 'react'
import { useThemeStore } from '@/store/themeStore'

export function ThemeDocument() {
  const theme = useThemeStore((state) => state.theme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme
    const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    if (themeColor) themeColor.content = theme === 'dark' ? '#080b16' : '#f4f7ff'
  }, [theme])

  return null
}
