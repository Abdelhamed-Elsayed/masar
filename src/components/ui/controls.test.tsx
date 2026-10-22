import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './controls'

describe('Button', () => {
  it('renders its children as accessible text', () => {
    render(<Button>Submit request</Button>)
    expect(screen.getByRole('button', { name: 'Submit request' })).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Approve</Button>)

    await user.click(screen.getByRole('button', { name: 'Approve' }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled and does not fire onClick when the disabled prop is set', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Reject
      </Button>,
    )

    const button = screen.getByRole('button', { name: 'Reject' })
    expect(button).toBeDisabled()
    await user.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('is disabled and marked aria-busy while loading, even without an explicit disabled prop', () => {
    render(<Button loading>Saving</Button>)
    const button = screen.getByRole('button', { busy: true })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).toHaveTextContent('Saving')
  })
})
