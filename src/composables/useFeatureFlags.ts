import type { FeatureFlagName, FeatureFlags } from '~/config/feature-flags.config'
import { featureFlags } from '~/config/feature-flags.config'

export function useFeatureFlags() {
  function isEnabled(flagName: FeatureFlagName): boolean {
    return featureFlags[flagName] ?? false
  }

  return {
    isEnabled,
    flags: readonly(featureFlags as FeatureFlags),
  }
}
