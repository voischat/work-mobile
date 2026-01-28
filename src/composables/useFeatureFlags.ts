import type { FeatureFlagName, FeatureFlags } from '~/config/feature-flags.config'
import { featureFlags } from '~/config/feature-flags.config'
import { overrideFeatures } from '~/shared/states'

export function useFeatureFlags() {
  function isEnabled(flagName: FeatureFlagName): boolean {
    if (import.meta.env.DEV) {
      const override = overrideFeatures.value[flagName]
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
