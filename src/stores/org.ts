import type { OrgInfo } from '~/types/org'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useWeilaFetch } from '~/composables/useWeilaFetch'

export const useOrgStore = defineStore('org', () => {
  const orgInfo = ref<OrgInfo | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchOrgInfo(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await useWeilaFetch<{ org: OrgInfo }>('/corp/org/get-my-org')
        .post()
        .json()

      if (fetchError.value) {
        error.value = fetchError.value.message || '获取组织信息失败'
        return
      }

      if (data.value) {
        orgInfo.value = data.value.org
      }
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '获取组织信息失败'
    }
    finally {
      loading.value = false
    }
  }

  return {
    orgInfo,
    loading,
    error,
    fetchOrgInfo,
  }
})
