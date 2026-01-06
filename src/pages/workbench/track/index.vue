<script setup lang="ts">
import type { TrackPoint, TrackResponse } from '~/types/location'
import type { Member } from '~/types/management'
import { Icon } from '@iconify/vue'
import { useQuery } from '@pinia/colada'
import { useRouteQuery } from '@vueuse/router'
import { TabsContent, TabsIndicator, TabsList, TabsRoot, TabsTrigger } from 'reka-ui'
import { computed, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue'
import BackLayout from '~/components/BackLayout.vue'
import Breadcrumb from '~/components/Breadcrumb.vue'
import DeptMemberTreeSelector from '~/components/DeptMemberTreeSelector.vue'
import GroupMemberTreeSelector from '~/components/GroupMemberTreeSelector.vue'
import TargetSelectorPopover from '~/components/TargetSelectorPopover.vue'
import { useAMap } from '~/composables/useAMap'
import { weilaFetch } from '~/shared/instances'

const { loadAMap } = useAMap()

const userId = useRouteQuery('userId', -1, { transform: Number })
const date = useRouteQuery('date', () => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const isPopoverOpen = ref(false)
const selectedMembers = ref<Member[]>([])
const selectedTab = ref('dept')

watch(userId, (newId, oldId) => {
  if (newId === oldId)
    return

  selectedMembers.value = newId > 0
    ? selectedMembers.value.filter(m => m.user_id === newId)
    : []
})

watch(selectedTab, () => {
  selectedMembers.value = []
  userId.value = -1
})

watch(selectedMembers, (newMembers) => {
  const newId = newMembers[0]?.user_id ?? -1
  if (newId !== userId.value)
    userId.value = newId
}, { deep: true })

const member = computed(() => selectedMembers.value[0])

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

      <div class="absolute top-4 left-4  bg-white rounded-lg shadow-lg z-10">
        <div class="flex flex-col md:flex-row md:items-center p-3 space-x-2">
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
            <template #default>
              <TabsRoot v-model="selectedTab" class="w-full h-[50vh] flex flex-col">
                <TabsList
                  class="inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 p-1 w-full shrink-0"
                >
                  <TabsIndicator
                    class="absolute bottom-0 left-0 h-[2px] w-full bg-transparent transition-all duration-300"
                  />
                  <TabsTrigger
                    value="dept"
                    class="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm flex-1"
                  >
                    部门
                  </TabsTrigger>
                  <TabsTrigger
                    value="group"
                    class="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm flex-1"
                  >
                    群组
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="dept" class="mt-4 flex-1 overflow-y-auto min-h-0">
                  <DeptMemberTreeSelector v-model:selected-members="selectedMembers" mode="single" />
                </TabsContent>
                <TabsContent value="group" class="mt-4 flex-1 overflow-y-auto min-h-0">
                  <GroupMemberTreeSelector v-model:selected-members="selectedMembers" mode="single" />
                </TabsContent>
              </TabsRoot>
            </template>
          </TargetSelectorPopover>

          <input
            id="date" v-model="date" type="date"
            class="px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-28"
          >

          <div class="flex items-center text-xs">
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
    </div>
  </BackLayout>
</template>
