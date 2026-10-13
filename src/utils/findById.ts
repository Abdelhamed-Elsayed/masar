import type { Identifiable } from '@/types/common'

export function findById<T extends Identifiable>(
  items: readonly T[],
  id: string,
): T | undefined {
  return items.find((item) => item.id === id)
}
