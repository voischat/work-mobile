import type { FeatureFlagName, FeatureFlags } from '~/config/feature-flags.config'
import { featureFlags } from '~/config/feature-flags.config'
import { useFeatureFlagsDevToolsStore } from '~/stores/featureFlagsDevTools'

export function useFeatureFlags() {
  const devToolsStore = import.meta.env.DEV ? useFeatureFlagsDevToolsStore() : null

  function isEnabled(flagName: FeatureFlagName): boolean {
    if (devToolsStore) {
      const override = devToolsStore.getOverride(flagName)
      if (override !== undefined) {
        return override
      }
    }

    return featureFlags[flagName] ?? false
  }

  return {
    isEnabled,
    flags: readonly(featureFlags as FeatureFlags),
  }
}
