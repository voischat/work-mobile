<script setup lang="ts">
import { PopoverArrow, PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'reka-ui'

defineProps<{
  triggerLabel?: string
  triggerClass?: string
}>()

defineSlots<{
  default: (props: object) => any
  trigger: (props: { isOpen: boolean }) => any
}>()

const isOpen = defineModel<boolean>('open', { default: false })
</script>

<template>
  <PopoverRoot v-model:open="isOpen">
    <PopoverTrigger as-child>
      <slot name="trigger" :is-open="isOpen">
        <button
          type="button"
          class="flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 transition-colors min-w-[120px]" :class="[
            triggerClass,
          ]"
        >
          <span class="truncate">
            {{ triggerLabel || '选择' }}
          </span>
          <Icon icon="lucide:chevron-down" class="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
        </button>
      </slot>
    </PopoverTrigger>
    <PopoverPortal>
      <PopoverContent
        class="z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-0 w-[400px] max-h-[min(var(--reka-popover-content-available-height),60vh)] overflow-hidden"
        align="start"
        :side-offset="4"
      >
        <slot />
        <PopoverArrow class="fill-white" />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
