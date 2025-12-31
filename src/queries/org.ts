import type { OrgInfo } from '~/types/org'
import { defineQuery, useQuery } from '@pinia/colada'
import { computed } from 'vue'
import { weilaFetch } from '~/shared/instances'

async function fetchOrgInfo(): Promise<OrgInfo> {
  const response = await weilaFetch<{ org: OrgInfo }>('/corp/org/get-my-org', {
    method: 'POST',
  })

  return response.org
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
