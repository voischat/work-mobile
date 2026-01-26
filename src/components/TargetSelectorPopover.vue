<script setup lang="ts">
import { PopoverArrow, PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'reka-ui'

defineProps<{
  triggerLabel?: string
  triggerClass?: string
  closeOnSelect?: boolean
}>()

defineSlots<{
  default: (props: { close: () => void }) => any
  trigger: (props: { isOpen: boolean }) => any
}>()

const isOpen = defineModel<boolean>('open', { default: false })

function close() {
  isOpen.value = false
}
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
    <PopoverPortal to="body">
      <Transition name="popover">
        <PopoverContent
          v-if="isOpen"
          class="z-[9999] bg-white rounded-lg shadow-lg border border-gray-200 p-0 w-[calc(min(100vw-2rem,300px))] overflow-hidden"
          align="start"
          :side-offset="4"
        >
          <slot :close="close" />
          <PopoverArrow class="fill-white" />
        </PopoverContent>
      </Transition>
    </PopoverPortal>
  </PopoverRoot>
</template>
