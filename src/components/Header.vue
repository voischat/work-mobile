<script setup lang="ts">
import { Icon } from '@iconify/vue'
import {
  PopoverArrow,
  PopoverClose,
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger,
  RadioGroupIndicator,
  RadioGroupItem,
  RadioGroupRoot,
} from 'reka-ui'
import { useRouter } from 'vue-router'
import { useLocale } from '~/composables/useLocale'
import { bridge } from '~/utils/bridge'

interface Props {
  title?: string
  showBack?: boolean
  showExit?: boolean
}

withDefaults(defineProps<Props>(), {
  showBack: true,
  showExit: false,
})

const { t } = useI18n()
const router = useRouter()
const { locale, availableLocales, setLocale } = useLocale()
const isOpen = ref(false)

const localeOptions = computed(() => {
  const localeMap: Record<string, string> = {
    'en': 'English',
    'zh-CN': '简体中文',
  }
  return availableLocales.map(lang => ({
    value: lang,
    label: localeMap[lang] || lang,
  }))
})

function handleBack() {
  router.back()
}

function handleExit() {
  bridge.exit()
  isOpen.value = false
}

function handleLocaleChange(newLocale: string) {
  setLocale(newLocale)
}
</script>

<template>
  <header class="sticky top-0 z-40 bg-white border-b border-gray-200">
    <div class="relative flex items-center h-14 px-4">
      <!-- 返回按钮 -->
      <button
        v-if="showBack"
        class="bg-transparent p-2 -ml-2 text-gray-600 hover:text-gray-900"
        @click="handleBack"
      >
        <Icon icon="lucide:arrow-left" class="w-6 h-6" />
      </button>
      <h1 class="absolute left-1/2 transform -translate-x-1/2 text-lg font-semibold text-gray-900">
        {{ title ?? t('app.name') }}
      </h1>
      <div class="ml-auto flex items-center">
        <PopoverRoot v-model:open="isOpen">
          <PopoverTrigger
            class="bg-transparent p-2 -mr-2 text-gray-600 hover:text-gray-900"
            aria-label="Menu"
          >
            <Icon icon="lucide:more-vertical" class="w-6 h-6" />
          </PopoverTrigger>

          <PopoverPortal>
            <Transition name="popover">
              <PopoverContent
                v-if="isOpen"
                class="w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50"
                :side-offset="8"
                align="end"
              >
                <PopoverArrow class="fill-white" />

                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-base font-semibold text-gray-900">
                    {{ t('menu.settings') }}
                  </h3>
                  <PopoverClose
                    class="rounded-md p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                    aria-label="Close"
                  >
                    <Icon icon="lucide:x" class="w-5 h-5" />
                  </PopoverClose>
                </div>

                <RadioGroupRoot
                  :model-value="locale"
                  class="space-y-2"
                  @update:model-value="handleLocaleChange"
                >
                  <RadioGroupItem
                    v-for="option in localeOptions"
                    :key="option.value"
                    :value="option.value"
                    class="w-full flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all hover:border-gray-300 hover:bg-gray-50 data-[state=checked]:border-blue-400 data-[state=checked]:bg-blue-50"
                  >
                    <div class="relative flex items-center justify-center w-5 h-5 border-2 rounded-full border-gray-300 data-[state=checked]:border-blue-500">
                      <RadioGroupIndicator class="flex items-center justify-center w-full h-full">
                        <div class="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      </RadioGroupIndicator>
                    </div>

                    <span class="text-sm font-medium text-gray-900 flex-1">
                      {{ option.label }}
                    </span>
                  </RadioGroupItem>
                </RadioGroupRoot>

                <button
                  v-if="showExit"
                  class="w-full mt-2 flex items-center justify-center gap-2 p-3 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-medium text-sm"
                  @click="handleExit"
                >
                  <Icon icon="lucide:log-out" class="w-4 h-4" />
                  <span>{{ t('menu.exit') }}</span>
                </button>
              </PopoverContent>
            </Transition>
          </PopoverPortal>
        </PopoverRoot>
      </div>
    </div>
  </header>
</template>
