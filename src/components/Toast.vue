<script setup lang="ts">
import type { ToastItem } from '~/composables/useToast'
import { computed } from 'vue'

const props = defineProps<{
  toasts: ToastItem[]
}>()

const toastList = computed(() => props.toasts)
</script>

<template>
  <Teleport to="body">
    <div class="fixed top-10 left-0 right-0 z-[9999] pointer-events-none flex flex-col items-center space-y-2 p-4">
      <TransitionGroup name="toast" tag="div" class="flex flex-col items-center space-y-2">
        <div
          v-for="toast in toastList"
          :key="toast.id"
          class="pointer-events-auto bg-black/65 text-white px-4 py-2 rounded-lg text-sm shadow-lg backdrop-blur-sm min-w-[120px] text-center"
        >
          {{ toast.message }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
