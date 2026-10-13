import { beforeEach, describe, expect, it } from 'vitest'
import { useUiStore } from './uiStore'

describe('useUiStore', () => {
  beforeEach(() => {
    useUiStore.setState({ isSidebarOpen: true })
  })

  it('starts with the sidebar open', () => {
    expect(useUiStore.getState().isSidebarOpen).toBe(true)
  })

  it('toggleSidebar flips the current value', () => {
    useUiStore.getState().toggleSidebar()
    expect(useUiStore.getState().isSidebarOpen).toBe(false)
    useUiStore.getState().toggleSidebar()
    expect(useUiStore.getState().isSidebarOpen).toBe(true)
  })

  it('setSidebarOpen sets the value directly regardless of the current state', () => {
    useUiStore.getState().setSidebarOpen(false)
    expect(useUiStore.getState().isSidebarOpen).toBe(false)
    useUiStore.getState().setSidebarOpen(false)
    expect(useUiStore.getState().isSidebarOpen).toBe(false)
  })
})
