<script setup lang="ts">
import { RadioGroupIndicator, RadioGroupItem, RadioGroupRoot } from 'reka-ui'
import BackLayout from '~/components/BackLayout.vue'
import Breadcrumb from '~/components/Breadcrumb.vue'
import { useLocale } from '~/composables/useLocale'

const { t } = useI18n()
const { locale, availableLocales, setLocale } = useLocale()

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

function handleLocaleChange(newLocale: string) {
  setLocale(newLocale)
}
</script>

<template>
  <BackLayout :title="t('language.select')">
    <template #breadcrumb>
      <Breadcrumb
        :items="[
          { name: t('nav.me'), route: '/me' },
          { name: t('language.select') },
        ]"
      />
    </template>
    <div class="p-4">
      <div class="max-w-md mx-auto">
        <div class="bg-white rounded-lg shadow-md p-6">
          <RadioGroupRoot
            :model-value="locale"
            class="space-y-3"
            @update:model-value="handleLocaleChange"
          >
            <RadioGroupItem
              v-for="option in localeOptions"
              :key="option.value"
              :value="option.value"
              class="w-full flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all hover:border-gray-300 hover:bg-gray-50 data-[state=checked]:border-blue-400 data-[state=checked]:bg-blue-50"
            >
              <div class="relative flex items-center justify-center w-5 h-5 border-2 rounded-full border-gray-300 data-[state=checked]:border-blue-500">
                <RadioGroupIndicator class="flex items-center justify-center w-full h-full">
                  <div class="w-2.5 h-2.5 rounded-full bg-blue-500" />
                </RadioGroupIndicator>
              </div>

              <div class="flex items-center gap-2 flex-1">
                <Icon icon="lucide:languages" class="w-5 h-5 text-gray-500" />
                <span class="text-base font-medium text-gray-900">
                  {{ option.label }}
                </span>
              </div>

              <Icon
                v-if="locale === option.value"
                icon="lucide:check"
                class="w-5 h-5 text-blue-500"
              />
            </RadioGroupItem>
          </RadioGroupRoot>
        </div>
      </div>
    </div>
  </BackLayout>
</template>
