export interface ToastItem {
  id: string
  message: string
  timer?: ReturnType<typeof setTimeout>
}

// 全局共享的 toast 列表
const toasts = ref<ToastItem[]>([])
const DEFAULT_DURATION = 3000 // 3秒

function removeToast(id: string) {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index !== -1) {
    const toast = toasts.value[index]
    if (toast.timer) {
      clearTimeout(toast.timer)
    }
    toasts.value.splice(index, 1)
  }
}

export function useToast() {
  function showToast(message: string, duration = DEFAULT_DURATION) {
    // 查找是否已有相同内容的 toast
    const existingToastIndex = toasts.value.findIndex(t => t.message === message)

    if (existingToastIndex !== -1) {
      // 如果存在相同内容，清除旧的定时器，重新设置关闭时间
      const existingToast = toasts.value[existingToastIndex]
      if (existingToast.timer) {
        clearTimeout(existingToast.timer)
      }

      // 根据最后一次调用时间设置新的关闭时间
      existingToast.timer = setTimeout(() => {
        removeToast(existingToast.id)
      }, duration)

      // 将相同的 toast 移到数组末尾（保持显示顺序）
      toasts.value.splice(existingToastIndex, 1)
      toasts.value.push(existingToast)
    }
    else {
      // 如果内容不同，创建新的 toast，从上到下依次显示
      const id = `${Date.now()}-${Math.random()}`
      const newToast: ToastItem = {
        id,
        message,
      }

      newToast.timer = setTimeout(() => {
        removeToast(id)
      }, duration)

      toasts.value.push(newToast)
    }
  }

  return {
    showToast,
    toasts,
    removeToast,
  }
}
