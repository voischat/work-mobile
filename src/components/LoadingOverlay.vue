<script setup lang="ts">
import { isGlobalLoading } from '~/composables/useGlobalLoading'
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-200"
    leave-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isGlobalLoading"
      class="fixed top-0 right-0 bottom-0 left-0 z-50 flex flex-col items-center justify-center space-y-6 bg-white"
    >
      <slot>
        <div class="size-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </slot>
    </div>
  </Transition>
</template>
