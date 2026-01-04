import type { VipInfo, VipSupport } from '~/types/org'
import { useQuery } from '@pinia/colada'
import { computed } from 'vue'
import { weilaFetch } from '~/shared/instances'

export function useVip() {
  const {
    data: vipData,
    error: vipError,
    status: vipStatus,
  } = useQuery({
    key: ['vip'],
    query: () => weilaFetch<VipInfo>('/corp/org/get-my-vip', { method: 'POST' }),
  })

  const hasQuickSupport = computed(() => {
    if (!vipData.value?.vip_supports) {
      return false
    }

    return vipData.value.vip_supports.some(
      (support: VipSupport) => support.quick_support === true,
    )
  })

  const isVip = computed(() => {
    return vipData.value?.vip === 1
  })

  const vipName = computed(() => {
    return vipData.value?.vip_name || '普通用户'
  })

  const vipExpired = computed(() => {
    return vipData.value?.vip_expired || 0
  })

  const vipSupports = computed(() => {
    return vipData.value?.vip_supports || []
  })

  const isLoading = computed(() => vipStatus.value === 'pending')

  return {
    vipData,
    vipError,
    hasQuickSupport,
    isVip,
    vipName,
    vipExpired,
    vipSupports,
    isLoading,
  }
}
