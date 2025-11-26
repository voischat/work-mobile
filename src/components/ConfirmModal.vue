<script setup lang="ts">
import { type ConfirmModalOptions, useConfirmModal } from '~/composables/useConfirmModal'

interface Props {
  modal?: {
    id: string
    config: ConfirmModalOptions
  } | null
}

defineProps<Props>()

const emits = defineEmits(['confirm', 'cancel'])

const { closeConfirmModal } = useConfirmModal()

function handleConfirm() {
  closeConfirmModal(true)
  emits('confirm')
}

function handleCancel() {
  closeConfirmModal(false)
  emits('cancel')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modal"
        class="fixed top-0 right-0 bottom-0 left-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4"
        @click="handleCancel"
      >
        <div
          class="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto flex flex-col max-h-[80vh]"
          @click.stop
        >
          <!-- Header: 固定在顶部 -->
          <div class="flex-shrink-0 px-6 pt-6 pb-4 border-b border-gray-200">
            <h3 v-if="modal.config.title" class="text-lg font-semibold text-gray-900">
              {{ modal.config.title }}
            </h3>
          </div>

          <!-- Content: 可滚动区域 -->
          <div class="flex-1 overflow-y-auto px-6 py-4">
            <p v-if="modal.config.message" class="text-gray-600">
              {{ modal.config.message }}
            </p>
            <slot name="content" />
          </div>

          <!-- Footer: 固定在底部 -->
          <div class="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-white rounded-b-lg">
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                @click="handleCancel"
              >
                {{ modal.config.cancelText || '取消' }}
              </button>
              <button
                type="button"
                class="px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors" :class="[
                  modal.config.confirmButtonType === 'danger'
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
                ]"
                @click="handleConfirm"
              >
                {{ modal.config.confirmText || '确认' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
