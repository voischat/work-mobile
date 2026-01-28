<script setup lang="ts">
import { Icon } from '@iconify/vue'
import {
  PopoverArrow,
  PopoverClose,
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger,
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectViewport,
  SwitchRoot,
  SwitchThumb,
} from 'reka-ui'
import { featureFlags } from '~/config/feature-flags.config'
import { overrideEnvMode, overrideFeatures } from '~/shared/states'

const modes = [
  { value: 'current', label: 'Current Mode' },
  { value: 'development', label: 'Development' },
  { value: 'intl', label: 'International' },
  { value: 'production', label: 'Production' },
] as const

function writableFlag(flagName: keyof typeof featureFlags) {
  return computed({
    get: () => overrideFeatures.value[flagName] ?? featureFlags[flagName],
    set: (checked: boolean) => {
      if (checked === featureFlags[flagName]) {
        delete overrideFeatures.value[flagName]
      }
      else {
        overrideFeatures.value[flagName] = checked
      }
    },
  })
}

const phoneLogin = writableFlag('phoneLogin')
const emailLogin = writableFlag('emailLogin')
const languageSwitching = writableFlag('languageSwitching')

const selectedMode = computed({
  get: () => overrideEnvMode.value ?? 'current',
  set: (value: string) => {
    overrideEnvMode.value = value === 'current' ? null : value as 'development' | 'intl' | 'production'
    overrideFeatures.value = {}
  },
})

function resetAll() {
  overrideFeatures.value = {}
  overrideEnvMode.value = null
}
</script>

<template>
  <PopoverRoot>
    <PopoverTrigger
      class="fixed bottom-4 right-4 z-[9999] flex h-12 w-12 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg transition-all hover:bg-purple-700 active:scale-95"
    >
      <Icon icon="lucide:settings" class="h-6 w-6" />
    </PopoverTrigger>

    <PopoverPortal>
      <PopoverContent
        side="top"
        :side-offset="8"
        align="end"
        class="z-[9999] w-80 rounded-lg bg-white p-4 shadow-2xl"
      >
        <div class="flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-800">
              Feature Flags DevTools
            </h3>
            <PopoverClose
              class="flex h-8 w-8 items-center justify-center rounded transition-colors hover:bg-gray-100 active:scale-95"
            >
              <Icon icon="lucide:x" class="h-5 w-5" />
            </PopoverClose>
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-700">Mock Environment</label>
            <SelectRoot v-model="selectedMode">
              <SelectTrigger
                class="flex items-center justify-between rounded border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-purple-500 focus:outline-none"
              >
                <SelectValue placeholder="Current Mode" />
                <Icon icon="lucide:chevron-down" class="h-4 w-4" />
              </SelectTrigger>

              <SelectPortal>
                <SelectContent
                  class="z-[10000] overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg"
                  :side-offset="4"
                >
                  <SelectViewport class="p-1">
                    <SelectItem
                      v-for="mode in modes"
                      :key="mode.value"
                      :value="mode.value"
                      class="relative flex cursor-pointer items-center rounded px-8 py-2 text-sm outline-none data-[highlighted]:bg-purple-50"
                    >
                      <SelectItemText>{{ mode.label }}</SelectItemText>
                    </SelectItem>
                  </SelectViewport>
                </SelectContent>
              </SelectPortal>
            </SelectRoot>
          </div>

          <div class="border-t border-gray-200 pt-3">
            <div class="mb-2 text-sm font-medium text-gray-700">
              Feature Flags
            </div>
            <div class="flex max-h-64 flex-col gap-2 overflow-y-auto">
              <div
                class="flex items-center justify-between rounded px-2 py-1.5 transition-colors hover:bg-gray-50"
                :class="{ 'bg-purple-50': 'phoneLogin' in overrideFeatures }"
              >
                <label
                  for="flag-phoneLogin"
                  class="flex-1 cursor-pointer text-sm text-gray-700"
                >
                  phoneLogin
                </label>
                <SwitchRoot
                  id="flag-phoneLogin"
                  v-model="phoneLogin"
                  class="relative h-6 w-11 cursor-pointer rounded-full transition-colors data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300"
                  :class="{ 'ring-2 ring-purple-400 ring-offset-2': 'phoneLogin' in overrideFeatures }"
                >
                  <SwitchThumb
                    class="block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-[22px]"
                  />
                </SwitchRoot>
              </div>

              <div
                class="flex items-center justify-between rounded px-2 py-1.5 transition-colors hover:bg-gray-50"
                :class="{ 'bg-purple-50': 'emailLogin' in overrideFeatures }"
              >
                <label
                  for="flag-emailLogin"
                  class="flex-1 cursor-pointer text-sm text-gray-700"
                >
                  emailLogin
                </label>
                <SwitchRoot
                  id="flag-emailLogin"
                  v-model="emailLogin"
                  class="relative h-6 w-11 cursor-pointer rounded-full transition-colors data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300"
                  :class="{ 'ring-2 ring-purple-400 ring-offset-2': 'emailLogin' in overrideFeatures }"
                >
                  <SwitchThumb
                    class="block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-[22px]"
                  />
                </SwitchRoot>
              </div>

              <div
                class="flex items-center justify-between rounded px-2 py-1.5 transition-colors hover:bg-gray-50"
                :class="{ 'bg-purple-50': 'languageSwitching' in overrideFeatures }"
              >
                <label
                  for="flag-languageSwitching"
                  class="flex-1 cursor-pointer text-sm text-gray-700"
                >
                  languageSwitching
                </label>
                <SwitchRoot
                  id="flag-languageSwitching"
                  v-model="languageSwitching"
                  class="relative h-6 w-11 cursor-pointer rounded-full transition-colors data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300"
                  :class="{ 'ring-2 ring-purple-400 ring-offset-2': 'languageSwitching' in overrideFeatures }"
                >
                  <SwitchThumb
                    class="block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-[22px]"
                  />
                </SwitchRoot>
              </div>
            </div>
          </div>

          <button
            class="mt-2 rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 active:scale-95"
            @click="resetAll"
          >
            Reset All
          </button>
        </div>

        <PopoverArrow class="fill-white" />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
