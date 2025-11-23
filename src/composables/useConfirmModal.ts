import { ref } from 'vue'

export interface ConfirmModalOptions {
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  confirmButtonType?: 'default' | 'danger'
}

export interface ConfirmModalItem {
  id: string
  config: ConfirmModalOptions
  resolver: ((value: boolean) => void) | null
}

// 全局共享的 modal 状态
const confirmModal = ref<ConfirmModalItem | null>(null)

/**
 * 确认对话框组合式函数
 */
export function useConfirmModal() {
  const showConfirmModal = (options: string | ConfirmModalOptions): Promise<boolean> => {
    return new Promise((resolve) => {
    // 处理字符串参数
      const config: ConfirmModalOptions = typeof options === 'string'
        ? { message: options }
        : options

      // 创建 modal 实例
      const modalId = `${Date.now()}-${Math.random()}`
      confirmModal.value = {
        id: modalId,
        config,
        resolver: resolve,
      }
    })
  }

  const closeConfirmModal = (result: boolean) => {
    if (confirmModal.value?.resolver) {
      confirmModal.value.resolver(result)
    }
    confirmModal.value = null
  }

  return {
    showConfirmModal,
    confirmModal,
    closeConfirmModal,
  }
}
