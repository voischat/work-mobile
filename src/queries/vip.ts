import type { VipInfo, VipSupport } from '~/types/org'
import { defineQuery, useQuery } from '@pinia/colada'
import { computed } from 'vue'
import { weilaFetch } from '~/shared/instances'

async function fetchVipInfo(): Promise<VipInfo> {
  const response = await weilaFetch<{ vip: VipInfo }>('/corp/org/get-my-vip', {
    method: 'POST',
  })

  return response.vip
}

export const useVip = defineQuery(() => {
  const { data, error, status, isPending, refetch } = useQuery({
    key: ['vip-info'],
    query: fetchVipInfo,
    staleTime: 60000,
  })

  const vipInfo = computed(() => data.value ?? null)
  const loading = computed(() => isPending.value)
  const errorMessage = computed(() => error.value?.message ?? null)

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
    error: errorMessage,
    status,
    fetchVipInfo: refetch,
    getSupport,
    hasQuickSupport,
    isFeatureSupported,
  }
})
