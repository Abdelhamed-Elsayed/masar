export type ID = string

export type ISODateString = string

export type SortDirection = 'asc' | 'desc'

export interface Identifiable {
  id: ID
}

export type RequestFieldValue = string | number | boolean | null
