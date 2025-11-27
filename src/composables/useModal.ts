import type { Awaitable } from '@antfu/utils'

export interface ModalOptions {
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  confirmButtonType?: 'default' | 'danger'
  onConfirm?: () => Awaitable<void>
  onCancel?: () => Awaitable<void>
}

export const globalModalProps = ref<ModalOptions>({
  title: '',
  message: '',
  confirmText: '确定',
  cancelText: '取消',
  confirmButtonType: 'default',
})

export const isGlobalModalVisible = shallowRef(false)

export let globalModalConfirmCallback: (() => Awaitable<void>) | undefined
export let globalModalCancelCallback: (() => Awaitable<void>) | undefined

export function useModal() {
  const showModal = (options: ModalOptions & {
  }) => {
    globalModalProps.value = options
    globalModalConfirmCallback = options.onConfirm
    globalModalCancelCallback = options.onCancel
    isGlobalModalVisible.value = true
  }

  return {
    showModal,
  }
}
