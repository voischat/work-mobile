/**
 * Feature Flags DevTools Store
 *
 * Runtime store for overriding feature flags in development mode.
 * This allows developers to test different environment modes without rebuilding.
 */

import type { FeatureFlagName } from '~/config/feature-flags.config'
import { defineStore } from 'pinia'

interface FeatureFlagOverride {
  [key: string]: boolean | undefined
}

export const useFeatureFlagsDevToolsStore = defineStore('featureFlagsDevTools', () => {
  const overrides = ref<FeatureFlagOverride>({})
  const mockMode = ref<'development' | 'intl' | 'production' | null>(null)

  function setOverride(flagName: FeatureFlagName, value: boolean): void {
    overrides.value[flagName] = value
  }

  function clearOverride(flagName: FeatureFlagName): void {
    delete overrides.value[flagName]
  }

  function clearAllOverrides(): void {
    overrides.value = {}
  }

  function getOverride(flagName: FeatureFlagName): boolean | undefined {
    return overrides.value[flagName]
  }

  function setMockMode(mode: 'development' | 'intl' | 'production' | null): void {
    mockMode.value = mode
  }

  function getMockMode(): string {
    return mockMode.value ?? import.meta.env.MODE
  }

  return {
    overrides: readonly(overrides),
    mockMode: readonly(mockMode),
    setOverride,
    clearOverride,
    clearAllOverrides,
    getOverride,
    setMockMode,
    getMockMode,
  }
})
