import type { OrgInfo } from '~/types/org'
import { defineQuery, useQuery } from '@pinia/colada'
import { computed } from 'vue'
import { useWeilaFetch } from '~/composables/useWeilaFetch'

async function fetchOrgInfo(): Promise<OrgInfo> {
  const { data, error: fetchError } = await useWeilaFetch<{ org: OrgInfo }>('/corp/org/get-my-org')
    .post()
    .json()

  if (fetchError.value) {
    throw new Error(fetchError.value.message || '获取组织信息失败')
  }

  if (!data.value) {
    throw new Error('获取组织信息失败')
  }

  return data.value.org
}

export const useOrg = defineQuery(() => {
  const { data, error, status, isPending, refetch } = useQuery({
    key: ['org-info'],
    query: fetchOrgInfo,
    staleTime: 60000,
  })

  const orgInfo = computed(() => data.value ?? null)
  const loading = computed(() => isPending.value)
  const errorMessage = computed(() => error.value?.message ?? null)

  return {
    orgInfo,
    loading,
    error: errorMessage,
    status,
    fetchOrgInfo: refetch,
  }
})
