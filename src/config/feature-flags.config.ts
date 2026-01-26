/**
 * Feature Flags Configuration
 *
 * Define feature flags using a function that receives context.
 * Flags are evaluated at build time for zero runtime overhead.
 *
 * Example:
 * ```ts
 * export const featureFlags = defineFeatureFlags((context) => ({
 *   // Environment-based (build-time)
 *   emailLogin: context.mode === 'intl',
 *   devTools: context.mode === 'development',
 *
 *   // Static flags
 *   phoneLogin: true,
 * }))
 * ```
 *
 * Usage in components:
 * ```ts
 * const { isEnabled } = useFeatureFlags()
 * if (isEnabled('emailLogin')) { ... }
 * ```
 */

export interface FeatureFlagContext {
  mode: string
}

export function defineFeatureFlags<T extends Record<string, boolean>>(
  config: (context: FeatureFlagContext) => T,
): T {
  const context: FeatureFlagContext = {
    mode: import.meta.env.MODE,
  }
  return config(context)
}

export const featureFlags = defineFeatureFlags(() => ({
  phoneLogin: true,
  emailLogin: import.meta.env.MODE === 'intl',
}))

export type FeatureFlagName = keyof typeof featureFlags
export type FeatureFlags = typeof featureFlags
