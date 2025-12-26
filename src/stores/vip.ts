import type { VipInfo, VipSupport } from '~/types/org'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useWeilaFetch } from '~/composables/useWeilaFetch'

export const useVipStore = defineStore('vip', () => {
  const vipInfo = ref<VipInfo | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchVipInfo(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await useWeilaFetch<{ vip: VipInfo }>('/corp/busi/vip/get-my-vip')
        .post()
        .json()

      if (fetchError.value) {
        error.value = fetchError.value.message || '获取 VIP 信息失败'
        return
      }

      if (data.value) {
        vipInfo.value = data.value.vip
      }
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '获取 VIP 信息失败'
    }
    finally {
      loading.value = false
    }
  }

  function getSupport(name: string): VipSupport | undefined {
    return vipInfo.value?.vip_supports?.find(s => s.name === name)
  }

  function hasQuickSupport(name: string): boolean {
    const support = getSupport(name)
    return support?.quick_support === true
  }

  function isFeatureSupported(name: string): boolean {
    const support = getSupport(name)
    return support?.support === true
  }

  return {
    vipInfo,
    loading,
    error,
    fetchVipInfo,
    getSupport,
    hasQuickSupport,
    isFeatureSupported,
  }
})
