<script setup lang="ts">
defineProps<{
  title?: string
}>()

const open = defineModel<boolean>('open', { default: false })

function close() {
  open.value = false
}
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div
        v-if="open"
        class="fixedleft-0 right-0 top-0 bottom-0 z-[9998]"
      >
        <!-- Backdrop -->
        <div
          class="absolute left-0 top-0 right-0 bottom-0 bg-black/40"
          @click="close"
        />

        <!-- Drawer content -->
        <div
          class="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl
                 max-h-[85vh] flex flex-col
                 pb-4"
          @click.stop
        >
          <!-- Handle bar -->
          <div class="flex justify-center pt-3 pb-2">
            <div class="w-10 h-1 bg-gray-300 rounded-full" />
          </div>

          <!-- Header -->
          <div v-if="title || $slots.header" class="px-4 pb-3 border-b border-gray-100">
            <slot name="header">
              <h3 class="text-base font-semibold text-gray-900 text-center">
                {{ title }}
              </h3>
            </slot>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto px-4 py-4">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="px-4 py-3 border-t border-gray-100">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-enter-active > div:last-child,
.drawer-leave-active > div:last-child {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from > div:last-child,
.drawer-leave-to > div:last-child {
  transform: translateY(100%);
}
</style>
