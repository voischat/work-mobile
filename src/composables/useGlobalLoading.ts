import { readonly, ref } from 'vue'

export const isGlobalLoading = ref(false)

export function useGlobalLoading() {
  function showLoading() {
    isGlobalLoading.value = true
  }

  function hideLoading() {
    isGlobalLoading.value = false
  }

  return {
    isGlobalLoading: readonly(isGlobalLoading),
    showLoading,
    hideLoading,
  }
}
