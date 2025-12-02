import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useRoute } from 'vue-router'
import { isActive, isActiveRoute } from './router'

// Mock vue-router
vi.mock('vue-router', () => ({
  useRoute: vi.fn(),
}))

const mockedUseRoute = vi.mocked(useRoute)

describe('router utilities', () => {
  describe('isActive', () => {
    it('should return true for exact match with root path', () => {
      expect(isActive('/', '/')).toBe(true)
    })

    it('should return false for non-root path when current path is root', () => {
      expect(isActive('/', '/directory')).toBe(false)
    })

    it('should return true when current path starts with target path', () => {
      expect(isActive('/directory/departments', '/directory')).toBe(true)
      expect(isActive('/directory/departments/123', '/directory')).toBe(true)
      expect(isActive('/directory/groups', '/directory')).toBe(true)
    })

    it('should return false when current path does not start with target path', () => {
      expect(isActive('/me', '/directory')).toBe(false)
      expect(isActive('/other', '/directory')).toBe(false)
    })

    it('should handle exact matches for non-root paths', () => {
      expect(isActive('/directory', '/directory')).toBe(true)
      expect(isActive('/directory/', '/directory')).toBe(true) // trailing slash
      expect(isActive('/directory', '/directory/')).toBe(false) // current path doesn't have trailing slash
    })

    it('should handle nested paths correctly', () => {
      expect(isActive('/directory/departments/123/members', '/directory/departments')).toBe(true)
      expect(isActive('/directory/departments/123/members', '/directory/departments/123')).toBe(true)
      expect(isActive('/directory/departments/123/members', '/directory/groups')).toBe(false)
    })
  })

  describe('isActiveRoute', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should use current route path to check activation', () => {
      mockedUseRoute.mockReturnValue({ path: '/directory/departments' } as any)
      expect(isActiveRoute('/directory')).toBe(true)
      expect(mockedUseRoute).toHaveBeenCalled()
    })

    it('should return true for exact root match', () => {
      mockedUseRoute.mockReturnValue({ path: '/' } as any)
      expect(isActiveRoute('/')).toBe(true)
    })

    it('should return false for non-root when at root', () => {
      mockedUseRoute.mockReturnValue({ path: '/' } as any)
      expect(isActiveRoute('/directory')).toBe(false)
    })

    it('should handle nested paths', () => {
      mockedUseRoute.mockReturnValue({ path: '/directory/departments/123' } as any)
      expect(isActiveRoute('/directory')).toBe(true)
      expect(isActiveRoute('/directory/departments')).toBe(true)
      expect(isActiveRoute('/directory/groups')).toBe(false)
    })
  })
})
