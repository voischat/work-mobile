<script setup lang="ts">
import type { RealtimeLocationsResponse } from '~/types/location'
import type { Member, TreeNode } from '~/types/management'
import { Icon } from '@iconify/vue'
import { useQuery } from '@pinia/colada'
import { useIntervalFn } from '@vueuse/core'
import { useRouteQuery } from '@vueuse/router'
import { TabsContent, TabsIndicator, TabsList, TabsRoot, TabsTrigger } from 'reka-ui'
import { computed, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue'
import BackLayout from '~/components/BackLayout.vue'
import Breadcrumb from '~/components/Breadcrumb.vue'
import TargetSelectorPopover from '~/components/TargetSelectorPopover.vue'
import TreeSelector from '~/components/TreeSelector.vue'
import { useAMap } from '~/composables/useAMap'
import { weilaFetch } from '~/shared/instances'

const { loadAMap, isLoaded: isMapLoaded } = useAMap()

const { t } = useI18n()

const selectedType = useRouteQuery<'dept' | 'group'>('type', 'dept')
const selectedDeptId = useRouteQuery('deptId', -1, { transform: Number })
const selectedGroupId = useRouteQuery('groupId', -1, { transform: Number })

const selectedNodes = ref<TreeNode[]>([])
const isPopoverOpen = ref(false)

// 当前选中的 ID，基于 tab 类型
const sessionId = computed(() => selectedType.value === 'dept' ? selectedDeptId.value : selectedGroupId.value)

// 辅助函数：加载部门节点
async function loadDeptNode(deptId: number): Promise<TreeNode | null> {
  try {
    const depts = await weilaFetch<{ id: number, name: string, user_count: number }[]>('/corp/address/get-my-manage-all-dept', { method: 'POST' })
    const dept = depts.find(d => d.id === deptId)

    if (dept) {
      return {
        id: dept.id,
        label: dept.name,
        type: 'dept',
        count: dept.user_count,
        expandable: true,
        selectable: true,
        raw_data: dept,
      }
    }
  }
  catch (error) {
    console.error('Failed to load dept:', error)
  }

  return null
}

// 辅助函数：加载群组节点
async function loadGroupNode(groupId: number): Promise<TreeNode | null> {
  try {
    const result = await weilaFetch<{ count: number, groups: { id: number, name: string, user_count: number }[] }>('/corp/group/get-my-manage-group-list?page=0&size=1000', { method: 'POST' })
    const group = result.groups.find(g => g.id === groupId)

    if (group) {
      return {
        id: group.id,
        label: group.name,
        type: 'group',
        count: group.user_count,
        expandable: true,
        selectable: true,
        raw_data: group,
      }
    }
  }
  catch (error) {
    console.error('Failed to load group:', error)
  }

  return null
}

// Watch #1: URL → State (加载数据并更新 selectedNodes)
watch([sessionId, selectedType], async ([newId, type]) => {
  if (newId < 0) {
    selectedNodes.value = []
    return
  }

  // 防止重复加载
  if (selectedNodes.value[0]?.id === newId) {
    return
  }

  // 根据类型加载对应的节点
  const node = type === 'dept'
    ? await loadDeptNode(newId)
    : await loadGroupNode(newId)

  selectedNodes.value = node ? [node] : []
}, { immediate: true })

// Watch #2: State → URL (用户在 selector 中选择后更新 URL)
watch(selectedNodes, (newNodes) => {
  const newId = newNodes[0]?.id ?? -1

  if (selectedType.value === 'dept') {
    if (newId !== selectedDeptId.value) {
      selectedDeptId.value = newId
    }
  }
  else {
    if (newId !== selectedGroupId.value) {
      selectedGroupId.value = newId
    }
  }
}, { deep: true })

const selectedNode = computed(() => selectedNodes.value[0])

const sessionType = computed(() => selectedType.value === 'dept' ? 20 : 18)

const isValid = computed(() => sessionId.value >= 0)

const { data: realtimeData, status, error, refetch } = useQuery({
  key: () => ['realtime-location', sessionId.value, sessionType.value],
  query: () => weilaFetch<RealtimeLocationsResponse>('/corp/loc/get-realtime-location', {
    method: 'POST',
    body: {
      session_id: sessionId.value,
      session_type: sessionType.value,
    },
  }),
  enabled: isValid,
})

const hasData = computed(() => (realtimeData.value?.length ?? 0) > 0)

useIntervalFn(
  () => {
    console.log('tic')
    if (
      !hasData.value
      || status.value !== 'success'
    ) {
      return
    }

    refetch()
  },
  5000,
)

async function deptLoader(ctx: TreeNode | null): Promise<TreeNode[]> {
  if (!ctx) {
    const depts = await weilaFetch<{ id: number, name: string, user_count: number }[]>('/corp/address/get-my-manage-all-dept', { method: 'POST' })
    return depts.map(d => ({
      id: d.id,
      label: d.name,
      type: 'dept' as const,
      count: d.user_count,
      expandable: true,
      selectable: true, // 部门可以被选中
      raw_data: d,
    }))
  }
  const members = await weilaFetch<{ user_id: number, name: string, avatar: string, user_num: string, dept_id: number }[]>('/corp/address/get-dept-all-member', {
    method: 'POST',
    body: { dept_id: ctx.id },
  })
  return members.map(m => ({
    id: m.user_id,
    label: m.name,
    type: 'member' as const,
    expandable: false,
    selectable: false, // 成员不可选中（只用于查看）
    raw_data: m as Member,
  }))
}

async function groupLoader(ctx: TreeNode | null): Promise<TreeNode[]> {
  if (!ctx) {
    const result = await weilaFetch<{ count: number, groups: { id: number, name: string, user_count: number }[] }>('/corp/group/get-my-manage-group-list?page=0&size=1000', { method: 'POST' })
    return result.groups.map(g => ({
      id: g.id,
      label: g.name,
      type: 'group' as const,
      count: g.user_count,
      expandable: true,
      selectable: true, // 群组可以被选中
      raw_data: g,
    }))
  }
  const members = await weilaFetch<{ user_id: number, name: string, avatar: string, user_num: string }[]>('/corp/group/get-group-all-member', {
    method: 'POST',
    body: { group_id: ctx.id },
  })
  return members.map(m => ({
    id: m.user_id,
    label: m.name,
    type: 'member' as const,
    expandable: false,
    selectable: false, // 成员不可选中（只用于查看）
    raw_data: m as Member,
  }))
}

const mapContainerRef = useTemplateRef<HTMLDivElement>('mapContainer')

type AMapInstance = InstanceType<typeof window.AMap.Map>
type Marker = InstanceType<typeof window.AMap.Marker>

let map: AMapInstance | null = null
let markers: Marker[] = []

onMounted(async () => {
  const AMap = await loadAMap()

  map = new AMap.Map(mapContainerRef.value, {
    zoom: 13,
    center: [116.397428, 39.90923],
    viewMode: '2D',
    resizeEnable: true,
  })

  map.addControl(new AMap.Scale())
  map.addControl(new AMap.ToolBar())

  watch(realtimeData, (data) => {
    if (data && map) {
      renderMarkers(data || [])
    }
  }, { immediate: true })
})

onUnmounted(() => {
  clearMarkers()
  map?.destroy()
  map = null
})

function clearMarkers(): void {
  markers.forEach(m => map?.remove(m))
  markers = []
}

function renderMarkers(locations: RealtimeLocationsResponse): void {
  clearMarkers()

  if (!locations.length || !map)
    return

  const AMap = window.AMap

  locations.forEach((location) => {
    const marker = new AMap.Marker({
      position: new AMap.LngLat(location.lng, location.lat),
      title: `用户 ${location.uid}`,
    })

    marker.on('click', () => {
      const infoWindow = new AMap.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <div style="font-weight: bold;">用户 ID: ${location.uid}</div>
            <div>速度: ${location.spd} m/s</div>
            <div>方向: ${location.dir}°</div>
            <div>时间: ${new Date(location.ts * 1000).toLocaleString()}</div>
          </div>
        `,
      })
      infoWindow.open(map, marker.getPosition())
    })

    map.add(marker)
    markers.push(marker)
  })

  if (markers.length > 0) {
    map.setFitView()
  }
}
</script>

<template>
  <BackLayout title="实时位置">
    <template #breadcrumb>
      <Breadcrumb
        :items="[
          { name: t('nav.workbench'), route: '/workbench' },
          { name: t('nav.realtimeLocation') },
        ]"
      />
    </template>

    <div class="absolute left-0 right-0 top-0 bottom-0">
      <div ref="mapContainer" class="w-full h-full" />

      <!-- Map loading placeholder -->
      <Transition
        leave-active-class="transition-opacity duration-300"
        leave-to-class="opacity-0"
      >
        <div v-if="!isMapLoaded" class="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div class="flex flex-col items-center space-y-3">
            <Icon icon="lucide:loader-2" class="w-8 h-8 text-blue-500 animate-spin" />
            <span class="text-sm text-gray-500">{{ t('directory.department.loading') }}</span>
          </div>
        </div>
      </Transition>

      <div class="absolute top-2 sm:top-4 left-2 right-2 sm:left-4 sm:right-auto bg-white rounded-lg shadow-lg p-2 sm:p-3">
        <div class="flex space-x-2">
          <TargetSelectorPopover v-model:open="isPopoverOpen">
            <template #trigger="{ isOpen: isOpen }">
              <button
                type="button"
                class="flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 transition-colors min-w-[120px]"
              >
                <span class="truncate">
                  {{ selectedNode?.label || `${t('common.placeholders.select')}${selectedType === 'dept' ? t('directory.department.title') : t('directory.group.title')}` }}
                </span>
                <Icon icon="lucide:chevron-down" class="w-4 h-4 text-gray-400 flex-shrink-0 ml-2 transition-transform duration-200" :class="{ 'rotate-180': isOpen }" />
              </button>
            </template>
            <template #default="{ close }">
              <TabsRoot v-model="selectedType">
                <TabsList class="inline-flex h-9 items-center justify-center w-full shrink-0 border-b border-gray-200">
                  <TabsIndicator class="absolute bottom-0 left-0 h-[2px] bg-blue-500 transition-all duration-300" />
                  <TabsTrigger
                    value="dept"
                    class="relative inline-flex items-center justify-center whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-500 transition-all duration-200 data-[state=active]:text-blue-500 hover:text-gray-700 flex-1"
                  >
                    {{ t('directory.department.title') }}
                  </TabsTrigger>
                  <TabsTrigger
                    value="group"
                    class="relative inline-flex items-center justify-center whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-500 transition-all duration-200 data-[state=active]:text-blue-500 hover:text-gray-700 flex-1"
                  >
                    {{ t('directory.group.title') }}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="dept" class="mt-3 flex-1 overflow-y-auto min-h-0 max-h-[300px]">
                  <TreeSelector
                    key="dept"
                    v-model:selected-nodes="selectedNodes"
                    :load-more="deptLoader"
                    :cache-key="['realtime-location', 'dept', 'selector']"
                    mode="single"
                    @select="close"
                  />
                </TabsContent>
                <TabsContent value="group" class="mt-3 flex-1 overflow-y-auto min-h-0 max-h-[300px]">
                  <TreeSelector
                    key="group"
                    v-model:selected-nodes="selectedNodes"
                    :load-more="groupLoader"
                    :cache-key="['realtime-location', 'group', 'selector']"
                    mode="single"
                    @select="close"
                  />
                </TabsContent>
              </TabsRoot>
            </template>
          </TargetSelectorPopover>
        </div>
        <div class="flex items-center text-xs mt-2">
          <span v-if="!isValid" class="text-orange-600 whitespace-nowrap">
            {{ t('common.placeholders.select') }}{{ selectedType === 'dept' ? t('directory.department.title') : t('directory.group.title') }}
          </span>
          <span v-else-if="status === 'pending'" class="text-gray-500 whitespace-nowrap">
            {{ t('common.status.loading') }}
          </span>
          <span v-else-if="error" class="text-red-600 whitespace-nowrap">
            {{ t('common.status.loadFailed') }}
          </span>
          <span v-else-if="(realtimeData?.length ?? 0) === 0" class="text-gray-500 whitespace-nowrap">
            {{ t('common.status.noData') }}
          </span>
          <span v-else class="text-gray-600 whitespace-nowrap">
            {{ realtimeData?.length || 0 }} {{ t('me.fields.person') }}
          </span>
        </div>
      </div>
    </div>
  </BackLayout>
</template>
