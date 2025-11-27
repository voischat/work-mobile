<script setup lang="ts">
import type { ModalOptions } from '~/composables/useModal'
import { isWeilaRes } from '@wl/network'

const props = withDefaults(defineProps<ModalOptions>(), {
  title: undefined,
  message: undefined,
  confirmText: '确认',
  cancelText: '取消',
  confirmButtonType: 'default',
  onConfirm: () => void 0,
  onCancel: () => void 0,
})

const open = defineModel('open', { type: Boolean, default: false })

const { showToast } = useToast()

const isConfirming = ref(false)

async function handleConfirm() {
  isConfirming.value = true
  try {
    await props.onConfirm()
    open.value = false
  }
  catch (error: any) {
    console.error(error)
    if (error?.message) {
      const errorString = parseMaybeWeilaErrorString(error.message)
      showToast(errorString)
    }
    else {
      showToast('Unkown error')
    }
  }
  finally {
    isConfirming.value = false
  }
}

async function handleCancel() {
  try {
    await props.onCancel()
    open.value = false
  }
  catch (error: any) {
    console.error(error)

    if (error?.message)
      showToast(error.message)
    else
      showToast('Unkown error')
  }
}

function parseMaybeWeilaErrorString(str: string): string {
  try {
    if (str.startsWith('{') && str.endsWith('}')) {
      const maybeWeilaRes = JSON.parse(str)
      if (isWeilaRes(maybeWeilaRes)) {
        return maybeWeilaRes.errmsg
      }
    }
  }
  catch (error) {
    console.error('parseMaybeWeilaErrorString error:', error)
  }
  return str
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed top-0 right-0 bottom-0 left-0 z-[9998] flex items-center justify-center bg-black bg-opacity-50 p-4"
        @click="handleCancel"
      >
        <div
          class="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto flex flex-col max-h-[80vh]"
          @click.stop
        >
          <!-- Header: 固定在顶部 -->
          <div class="flex-shrink-0 px-6 pt-6 pb-4 border-b border-gray-200">
            <slot name="header">
              <h3 v-if="title" class="text-lg font-semibold text-gray-900">
                {{ title }}
              </h3>
            </slot>
          </div>

          <div class="flex-1 overflow-y-auto px-6 py-4">
            <slot>
              <p v-if="message" class="text-gray-600">
                {{ message }}
              </p>
            </slot>
          </div>

          <!-- Footer: 固定在底部 -->
          <div class="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-white rounded-b-lg">
            <slot name="footer">
              <div class="flex justify-end space-x-3">
                <button
                  type="button"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                  @click="handleCancel"
                >
                  {{ cancelText }}
                </button>
                <button
                  type="button"
                  class="flex items-center justify-center space-x-1 px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-30" :class="[
                    confirmButtonType === 'danger'
                      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                      : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
                  ]"
                  :disabled="isConfirming"
                  @click="handleConfirm"
                >
                  <span v-if="isConfirming">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><!-- Icon from SVG Spinners by Utkarsh Verma - https://github.com/n3r4zzurr0/svg-spinners/blob/main/LICENSE --><path fill="currentColor" d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25" /><path fill="currentColor" d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z"><animateTransform attributeName="transform" dur="0.75s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12" /></path></svg>
                  </span>

                  <span>
                    {{ confirmText }}
                  </span>
                </button>
              </div>
            </slot>
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
