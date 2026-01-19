<script setup lang="ts">
import { Icon } from '@iconify/vue'
import {
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from 'reka-ui'
import { useI18n } from 'vue-i18n'

const { locale, availableLocales } = useI18n()

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

function handleLocaleChange(value: string) {
  locale.value = value
  localStorage.setItem('locale', value)
}

onMounted(() => {
  const savedLocale = localStorage.getItem('locale')
  if (savedLocale && availableLocales.includes(savedLocale)) {
    locale.value = savedLocale
  }
})
</script>

<template>
  <SelectRoot :model-value="locale" @update:model-value="handleLocaleChange">
    <SelectTrigger
      class="inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm bg-transparent hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
      aria-label="Select language"
    >
      <Icon icon="lucide:languages" class="w-4 h-4" />
      <SelectValue />
    </SelectTrigger>

    <SelectPortal>
      <SelectContent
        class="min-w-[140px] bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden z-50"
        :side-offset="5"
        position="popper"
      >
        <SelectViewport class="p-1">
          <SelectItem
            v-for="option in localeOptions"
            :key="option.value"
            :value="option.value"
            class="relative flex items-center gap-2 rounded-md px-8 py-2 text-sm text-gray-700 cursor-pointer select-none outline-none hover:bg-gray-50 focus:bg-gray-50 data-[highlighted]:bg-gray-50 transition-colors"
          >
            <SelectItemIndicator class="absolute left-2 inline-flex items-center justify-center">
              <Icon icon="lucide:check" class="w-4 h-4" />
            </SelectItemIndicator>
            <SelectItemText>
              {{ option.label }}
            </SelectItemText>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>
