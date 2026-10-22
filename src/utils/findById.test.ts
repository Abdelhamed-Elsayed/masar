import { describe, expect, it } from 'vitest'
import { findById } from './findById'

interface Item {
  id: string
  label: string
}

const items: Item[] = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Beta' },
  { id: 'c', label: 'Gamma' },
]

describe('findById', () => {
  it('returns the item whose id matches', () => {
    expect(findById(items, 'b')).toEqual({ id: 'b', label: 'Beta' })
  })

  it('returns undefined when no item matches', () => {
    expect(findById(items, 'missing')).toBeUndefined()
  })

  it('returns undefined for an empty list', () => {
    expect(findById([], 'a')).toBeUndefined()
  })

  it('returns the first match when ids are duplicated', () => {
    const duplicated: Item[] = [
      { id: 'x', label: 'First' },
      { id: 'x', label: 'Second' },
    ]
    expect(findById(duplicated, 'x')).toEqual({ id: 'x', label: 'First' })
  })
})
