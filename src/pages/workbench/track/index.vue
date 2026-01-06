<script setup lang="ts">
import type { TrackPoint, TrackResponse } from '~/types/location'
import type { Member, TreeNode } from '~/types/management'
import { Icon } from '@iconify/vue'
import { useQuery } from '@pinia/colada'
import { useRouteQuery } from '@vueuse/router'
import { TabsContent, TabsIndicator, TabsList, TabsRoot, TabsTrigger } from 'reka-ui'
import { computed, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue'
import BackLayout from '~/components/BackLayout.vue'
import Breadcrumb from '~/components/Breadcrumb.vue'
import TargetSelectorPopover from '~/components/TargetSelectorPopover.vue'
import TreeSelector from '~/components/TreeSelector.vue'
import { useAMap } from '~/composables/useAMap'
import { weilaFetch } from '~/shared/instances'

const { loadAMap } = useAMap()

const userId = useRouteQuery('userId', -1, { transform: Number })
const userName = useRouteQuery<string>('userName', '')
const date = useRouteQuery('date', () => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const isPopoverOpen = ref(false)
const selectedNodes = ref<TreeNode[]>([])
const selectedTab = ref('dept')

// Watch #1: URL → State (根据 URL 参数自动构造 selectedNodes)
watch([userId, userName], ([id, name]) => {
  if (id > 0 && name) {
    // 如果已经选中了同一个成员，不重复设置
    if (selectedNodes.value[0]?.id === id) {
      return
    }

    selectedNodes.value = [{
      id,
      label: name,
      type: 'member',
      expandable: false,
      selectable: true,
      raw_data: { user_id: id, name } as unknown as Member,
    }]
  }
  else {
    selectedNodes.value = []
  }
}, { immediate: true })

// Watch #2: State → URL (用户在 selector 中选择后更新 URL)
watch(selectedNodes, (newNodes) => {
  const newId = newNodes[0]?.id ?? -1
  const newName = (newNodes[0]?.raw_data as Member | undefined)?.name || ''

  if (newId !== userId.value) {
    userId.value = newId
  }
  if (newName && newName !== userName.value) {
    userName.value = newName
  }
}, { deep: true })

// Watch #3: Tab 切换 (清空选择)
watch(selectedTab, () => {
  selectedNodes.value = []
  userId.value = -1
  userName.value = ''
})

const member = computed(() => selectedNodes.value[0]?.raw_data as Member | undefined)

async function deptMemberLoader(ctx: TreeNode | null): Promise<TreeNode[]> {
  if (!ctx) {
    const depts = await weilaFetch<{ id: number, name: string, user_count: number }[]>('/corp/address/get-my-manage-all-dept', { method: 'POST' })
    return depts.map(d => ({
      id: d.id,
      label: d.name,
      type: 'dept' as const,
      count: d.user_count,
      expandable: true,
      selectable: false,
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
    selectable: true,
    raw_data: m as Member,
  }))
}

async function groupMemberLoader(ctx: TreeNode | null): Promise<TreeNode[]> {
  if (!ctx) {
    const result = await weilaFetch<{ count: number, groups: { id: number, name: string, user_count: number }[] }>('/corp/group/get-my-manage-group-list?page=0&size=1000', { method: 'POST' })
    return result.groups.map(g => ({
      id: g.id,
      label: g.name,
      type: 'group' as const,
      count: g.user_count,
      expandable: true,
      selectable: false,
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
    selectable: true,
    raw_data: m as Member,
  }))
}

const mapContainerRef = useTemplateRef<HTMLDivElement>('mapContainer')

type AMapInstance = InstanceType<typeof window.AMap.Map>
type Marker = InstanceType<typeof window.AMap.Marker>
type Polyline = InstanceType<typeof window.AMap.Polyline>

let map: AMapInstance | null = null
let markers: Marker[] = []
let polylines: Polyline[] = []

const isValid = computed(() =>
  userId.value > 0
  && date.value.length === 10
  && /^\d{4}-\d{2}-\d{2}$/.test(date.value),
)

const { data: trackData, status, error } = useQuery({
  key: () => ['track', userId.value, date.value],
  query: () => weilaFetch<TrackResponse>('/corp/loc/get-track', {
    method: 'POST',
    body: {
      user_id: userId.value,
      date: date.value,
    },
  }),
  enabled: isValid,
})

onMounted(async () => {
  const AMap = await loadAMap()

  map = new AMap.Map(mapContainerRef.value, {
    zoom: 14,
    center: [116.397428, 39.90923],
    viewMode: '2D',
    resizeEnable: true,
  })

  map.addControl(new AMap.Scale())
  map.addControl(new AMap.ToolBar())

  watch(trackData, (newData) => {
    if (!newData || !map)
      return
    renderTrack(newData.tracks || [])
  }, { immediate: true })
})

onUnmounted(() => {
  clearOverlays()
  map?.destroy()
  map = null
})

function clearOverlays(): void {
  markers.forEach(m => map?.remove(m))
  polylines.forEach(p => map?.remove(p))
  markers = []
  polylines = []
}

function renderTrack(tracks: TrackPoint[]): void {
  clearOverlays()

  if (!tracks.length || !map)
    return

  const AMap = window.AMap

  const path = tracks.map(point => new AMap.LngLat(point.lng, point.lat))

  const polyline = new AMap.Polyline({
    path,
    strokeColor: '#3B82F6',
    strokeWeight: 4,
    strokeOpacity: 0.8,
  })

  map.add(polyline)
  polylines.push(polyline)

  const startMarker = new AMap.Marker({
    position: path[0],
    icon: new AMap.Icon({
      image: 'https://webapi.amap.com/theme/v1.3/markers/n/start.png',
      size: new AMap.Size(25, 34),
    }),
  })
  map.add(startMarker)
  markers.push(startMarker)

  if (tracks.length > 1) {
    const endMarker = new AMap.Marker({
      position: path[path.length - 1],
      icon: new AMap.Icon({
        image: 'https://webapi.amap.com/theme/v1.3/markers/n/end.png',
        size: new AMap.Size(25, 34),
      }),
    })
    map.add(endMarker)
    markers.push(endMarker)
  }

  map.setFitView()
}
</script>

<template>
  <BackLayout title="轨迹">
    <template #breadcrumb>
      <Breadcrumb
        :items="[
          { name: '工作台', steps: 1 },
          { name: '轨迹' },
        ]"
      />
    </template>

    <div class="absolute inset-0">
      <div ref="mapContainer" class="absolute inset-0" />

      <div class="absolute top-4 left-4  bg-white rounded-lg shadow-lg z-10 p-3 ">
        <div class="flex space-x-2">
          <TargetSelectorPopover v-model:open="isPopoverOpen">
            <template #trigger="{ isOpen: isPopoverOpen }">
              <button
                type="button"
                class="flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 transition-colors min-w-[120px]"
              >
                <span class="truncate">
                  {{ member?.name || '选择成员' }}
                </span>
                <Icon
                  icon="lucide:chevron-down"
                  class="w-4 h-4 text-gray-400 flex-shrink-0 ml-2 transition-transform duration-200"
                  :class="{ 'rotate-180': isPopoverOpen }"
                />
              </button>
            </template>
            <template #default="{ close }">
              <TabsRoot v-model="selectedTab">
                <TabsList class="inline-flex h-9 items-center justify-center rounded-lg bg-gray-100 p-0.5 w-full shrink-0">
                  <TabsIndicator
                    class="absolute bottom-0 left-0 h-[2px] w-full bg-transparent transition-all duration-300"
                  />
                  <TabsTrigger
                    value="dept"
                    class="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm flex-1"
                  >
                    部门
                  </TabsTrigger>
                  <TabsTrigger
                    value="group"
                    class="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm flex-1"
                  >
                    群组
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="dept" class="mt-3 flex-1 overflow-y-auto min-h-0">
                  <TreeSelector
                    key="dept" v-model:selected-nodes="selectedNodes" :load-more="deptMemberLoader"
                    :cache-key="['track', 'dept', 'selector']" mode="single" @select="close"
                  />
                </TabsContent>
                <TabsContent value="group" class="mt-3 flex-1 overflow-y-auto min-h-0">
                  <TreeSelector
                    key="group" v-model:selected-nodes="selectedNodes" :load-more="groupMemberLoader"
                    :cache-key="['track', 'group', 'selector']" mode="single" @select="close"
                  />
                </TabsContent>
              </TabsRoot>
            </template>
          </TargetSelectorPopover>
          <input
            id="date" v-model="date" type="date"
            class="px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-28"
          >
        </div>

        <div class="flex items-center text-xs mt-2">
          <span v-if="!isValid" class="text-orange-600 whitespace-nowrap">
            请选择成员和日期
          </span>
          <span v-else-if="status === 'pending'" class="text-gray-500 whitespace-nowrap">
            加载中...
          </span>
          <span v-else-if="error" class="text-red-600 whitespace-nowrap">
            加载失败
          </span>
          <span v-else-if="trackData?.count === 0" class="text-gray-500 whitespace-nowrap">
            暂无数据
          </span>
          <span v-else class="text-gray-600 whitespace-nowrap">
            {{ trackData?.count || 0 }} 点
          </span>
        </div>
      </div>
    </div>
  </BackLayout>
</template>
