import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Avatar } from './surfaces'

describe('Avatar', () => {
  it('falls back to initials when the image file is missing', () => {
    const { container } = render(<Avatar name="Abdelhamid Elsayed" src="/avatars/missing.svg" />)
    fireEvent.error(container.querySelector('img')!)
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByRole('img', { name: 'Abdelhamid Elsayed' })).toHaveTextContent('AE')
  })
})
