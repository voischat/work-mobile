import { useRoute } from 'vue-router'

/**
 * Pure function to check if a navigation path is active based on current path
 * @param currentPath - Current route path (from useRoute().path)
 * @param targetPath - Navigation path to check
 * @returns Whether the navigation item should be considered active
 */
export function isActive(currentPath: string, targetPath: string): boolean {
  // For root path, require exact match
  if (targetPath === '/') {
    return currentPath === targetPath
  }
  // For other paths, check if current path starts with target path
  return currentPath.startsWith(targetPath)
}

/**
 * Composable that uses current route to check if a navigation path is active
 * @param targetPath - Navigation path to check
 * @returns Whether the navigation item should be considered active
 */
export function isActiveRoute(targetPath: string): boolean {
  const route = useRoute()
  return isActive(route.path, targetPath)
}
