import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher'
import { useThemeStore } from '@/store/themeStore'
import { ThemeDocument } from './ThemeDocument'

describe('theme switching', () => {
  beforeEach(() => {
    localStorage.removeItem('masar-theme')
    useThemeStore.setState({ theme: 'light' })
    document.documentElement.classList.remove('dark')
    document.documentElement.style.colorScheme = 'light'
  })

  afterEach(() => {
    cleanup()
    useThemeStore.setState({ theme: 'light' })
    document.documentElement.classList.remove('dark')
    document.documentElement.style.colorScheme = 'light'
  })

  it('switches the document to dark mode and persists the preference', async () => {
    render(
      <>
        <ThemeDocument />
        <ThemeSwitcher />
      </>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }))

    await waitFor(() => expect(document.documentElement).toHaveClass('dark'))
    expect(document.documentElement.style.colorScheme).toBe('dark')
    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toHaveAttribute('aria-pressed', 'true')
    expect(JSON.parse(localStorage.getItem('masar-theme') ?? '{}')).toMatchObject({ state: { theme: 'dark' } })
  })

  it('restores light mode when the preference is toggled back', async () => {
    useThemeStore.setState({ theme: 'dark' })
    render(
      <>
        <ThemeDocument />
        <ThemeSwitcher />
      </>,
    )

    await waitFor(() => expect(document.documentElement).toHaveClass('dark'))
    fireEvent.click(screen.getByRole('button', { name: 'Switch to light mode' }))

    await waitFor(() => expect(document.documentElement).not.toHaveClass('dark'))
    expect(document.documentElement.style.colorScheme).toBe('light')
  })
})
