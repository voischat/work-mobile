export interface BreadcrumbItem {
  name: string
  route?: string
}

const breadcrumbItems = ref<BreadcrumbItem[]>([])

export function useBreadcrumb() {
  function setBreadcrumb(items: BreadcrumbItem[]) {
    breadcrumbItems.value = items
  }

  const currentTitle = computed(() => {
    const lastItem = breadcrumbItems.value[breadcrumbItems.value.length - 1]
    return lastItem?.name ?? ''
  })

  return {
    breadcrumbItems: readonly(breadcrumbItems),
    currentTitle,
    setBreadcrumb,
  }
}
