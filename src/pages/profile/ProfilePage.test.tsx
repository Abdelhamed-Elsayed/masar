import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { mockUsers, userIds } from '@/mock/users'
import { useAuthStore } from '@/store/authStore'
import { useDirectoryStore } from '@/store/directoryStore'
import { useLocaleStore } from '@/store/localeStore'
import { ProfilePage } from './ProfilePage'

describe('ProfilePage public profile consent', () => {
  beforeEach(() => {
    useAuthStore.setState({ currentUser: mockUsers.find((user) => user.id === userIds.ahmedAyman)!, isInitializing: false })
    useDirectoryStore.setState({
      users: mockUsers.map((user) => user.id === userIds.ahmedAyman ? { ...user, publicProfileVisible: false } : user),
    })
    useLocaleStore.setState({ locale: 'en' })
  })

  it('lets employees opt in and revoke visibility of their public company profile', () => {
    render(<ProfilePage />)
    const consent = screen.getByRole('checkbox', {
      name: /show my name, job title, and department on the company website/i,
    })

    expect(consent).not.toBeChecked()
    fireEvent.click(consent)
    expect(useDirectoryStore.getState().users.find((user) => user.id === userIds.ahmedAyman)?.publicProfileVisible).toBe(true)
    expect(consent).toBeChecked()

    fireEvent.click(consent)
    expect(useDirectoryStore.getState().users.find((user) => user.id === userIds.ahmedAyman)?.publicProfileVisible).toBe(false)
    expect(consent).not.toBeChecked()
  })
})
