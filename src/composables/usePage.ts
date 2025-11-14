import type { Ref } from 'vue'
import { ref } from 'vue'

export interface UsePageOptions {
  /** 每页大小，默认为 10 */
  pageSize?: number
  /** 初始页码，默认为 0 */
  initialPage?: number
}

export interface UsePageReturn {
  /** 当前页码 */
  curPage: Ref<number>
  /** 每页大小 */
  pageSize: number
  /** 重置到初始页码 */
  reset: () => void
  /** 下一页 */
  next: () => void
}

/**
 * 分页状态管理的 Composition API
 *
 * @example
 * ```ts
 * const { curPage, pageSize, reset, next } = usePage({ pageSize: 10 })
 * ```
 */
export function usePage(options: UsePageOptions = {}): UsePageReturn {
  const {
    pageSize = 10,
    initialPage = 0,
  } = options

  const curPage = ref(initialPage)

  function reset() {
    curPage.value = initialPage
  }

  function next() {
    curPage.value++
  }

  return {
    curPage,
    pageSize,
    reset,
    next,
  }
}
