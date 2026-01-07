<script setup lang="ts">
import type { TrackPoint, TrackResponse } from '~/types/location'
import type { Member, TreeNode } from '~/types/management'
import { Icon } from '@iconify/vue'
import { useMutation, useQuery, useQueryCache } from '@pinia/colada'
import { useInfiniteScroll } from '@vueuse/core'
import { useRouteQuery } from '@vueuse/router'
import { TabsContent, TabsIndicator, TabsList, TabsRoot, TabsTrigger, ToggleGroupItem, ToggleGroupRoot } from 'reka-ui'
import { computed, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue'
import BackLayout from '~/components/BackLayout.vue'
import Breadcrumb from '~/components/Breadcrumb.vue'
import Drawer from '~/components/Drawer.vue'
import TargetSelectorPopover from '~/components/TargetSelectorPopover.vue'
import TreeSelector from '~/components/TreeSelector.vue'
import { useAMap } from '~/composables/useAMap'
import { useVip } from '~/composables/useVip'
import { weilaFetch } from '~/shared/instances'

const { loadAMap } = useAMap()
const { hasQuickSupport } = useVip()
const { showToast } = useToast()

const userId = useRouteQuery('userId', -1, { transform: Number })
const userName = useRouteQuery<string>('userName', '')
const date = useRouteQuery('date', () => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const isPopoverOpen = ref(false)
const selectedNodes = ref<TreeNode[]>([])
const selectedTab = ref('dept')
const isSettingsDrawerOpen = ref(false)
const isTrackListDrawerOpen = ref(false)

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

const trackOptions = [
  { value: '0', label: '关闭', icon: 'lucide:x' },
  { value: '1', label: '1小时', icon: 'lucide:clock' },
  { value: '2', label: '15分钟', icon: 'lucide:clock' },
  { value: '3', label: '5分钟', icon: 'lucide:clock' },
  { value: '4', label: '1分钟', icon: 'lucide:zap', vipOnly: true },
]

const currentTrackValue = computed(() => String(member.value?.track ?? 0))

const { mutate: updateTrack, isLoading: isUpdatingTrack } = useMutation({
  mutation: (payload: { user_id: number, track: number }) =>
    weilaFetch<Member>('/corp/address/change-member', {
      method: 'POST',
      body: payload,
    }),
  onMutate(payload) {
    const oldMember = member.value ? { ...member.value } : null

    if (selectedNodes.value[0]?.raw_data) {
      (selectedNodes.value[0].raw_data as Member).track = payload.track
    }

    return { oldMember }
  },
  onSuccess(response) {
    if (selectedNodes.value[0]?.raw_data) {
      Object.assign(selectedNodes.value[0].raw_data, response)
    }

    const queryCache = useQueryCache()
    queryCache.invalidateQueries({ key: ['member', 'list'] })
    queryCache.invalidateQueries({ key: ['dept'] })
    queryCache.invalidateQueries({ key: ['group'] })
  },
  onError(_error, _payload, context) {
    if (context?.oldMember && selectedNodes.value[0]?.raw_data) {
      (selectedNodes.value[0].raw_data as Member).track = context.oldMember.track
    }
  },
})

function handleTrackChange(value: unknown): void {
  const trackStr = Array.isArray(value) ? value[0] : value
  if (typeof trackStr !== 'string' || !member.value)
    return

  const trackValue = Number(trackStr)
  if (trackValue === member.value.track)
    return

  if (trackValue === 4 && !hasQuickSupport.value) {
    showToast('1分钟间隔需要 VIP 支持')
    return
  }

  updateTrack({ user_id: member.value.user_id, track: trackValue })
}

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

const pageSize = 20
const currentPage = ref(1)
const accumulatedTracks = ref<TrackPoint[]>([])
const totalCount = ref(0)

const { data: trackData, status, error } = useQuery({
  key: () => ['track', userId.value, date.value, currentPage.value],
  query: () => weilaFetch<TrackResponse>('/corp/loc/get-track', {
    method: 'POST',
    body: {
      user_id: userId.value,
      date: date.value,
      page: currentPage.value,
      size: pageSize,
    },
  }),
  enabled: isValid,
})

watch(trackData, (newData) => {
  if (newData) {
    totalCount.value = newData.count
    if (currentPage.value === 0) {
      accumulatedTracks.value = newData.tracks || []
    }
    else {
      const newTracks = newData.tracks || []
      accumulatedTracks.value = [...accumulatedTracks.value, ...newTracks]
    }
  }
}, { immediate: true })

watch([userId, date], () => {
  currentPage.value = 0
  accumulatedTracks.value = []
  totalCount.value = 0
})

const hasNextPage = computed(() => accumulatedTracks.value.length < totalCount.value)

function loadNextPage() {
  if (hasNextPage.value && status.value !== 'pending') {
    currentPage.value += 1
  }
}

const trackListRef = useTemplateRef<HTMLDivElement>('trackListRef')
useInfiniteScroll(trackListRef, loadNextPage, { distance: 100 })

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

  watch(accumulatedTracks, (tracks) => {
    if (!map)
      return
    renderTrack(tracks)
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

function navigateToPoint(point: TrackPoint, index: number): void {
  if (!map)
    return

  const AMap = window.AMap
  const position = new AMap.LngLat(point.lng, point.lat)

  map.setZoomAndCenter(16, position)

  const infoWindow = new AMap.InfoWindow({
    content: `
      <div style="padding: 8px; min-width: 120px;">
        <div style="font-weight: bold; margin-bottom: 4px;">轨迹点 #${index + 1}</div>
        <div style="color: #666; font-size: 12px;">${new Date(point.created * 1000).toLocaleString()}</div>
      </div>
    `,
    offset: new AMap.Pixel(0, -10),
  })
  infoWindow.open(map, position)

  isTrackListDrawerOpen.value = false
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

    <div class="absolute left-0 right-0 top-0 bottom-0">
      <div ref="mapContainer" class="absolute left-0 right-0 top-0 bottom-0" />

      <div class="absolute top-2 sm:top-4 left-2 right-2 sm:left-4 sm:right-auto bg-white rounded-lg shadow-lg p-2 sm:p-3">
        <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
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
                <TabsList class="inline-flex items-center justify-center w-full shrink-0 border-b border-gray-200">
                  <TabsIndicator
                    class="absolute bottom-0 left-0 h-[2px] bg-blue-500 transition-all duration-300"
                  />
                  <TabsTrigger
                    value="dept"
                    class="relative inline-flex items-center justify-center whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-500 transition-all duration-200 data-[state=active]:text-blue-500 hover:text-gray-700 flex-1"
                  >
                    部门
                  </TabsTrigger>
                  <TabsTrigger
                    value="group"
                    class="relative inline-flex items-center justify-center whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-500 transition-all duration-200 data-[state=active]:text-blue-500 hover:text-gray-700 flex-1"
                  >
                    群组
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="dept" class="flex-1 overflow-y-auto min-h-0 max-h-[300px]">
                  <TreeSelector
                    key="dept" v-model:selected-nodes="selectedNodes" :load-more="deptMemberLoader"
                    :cache-key="['track', 'dept', 'selector']" mode="single" @select="close"
                  />
                </TabsContent>
                <TabsContent value="group" class="mt-3 flex-1 overflow-y-auto min-h-0 max-h-[300px]">
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
            class="px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-28"
          >
        </div>

        <div class="flex items-center text-xs mt-2">
          <span v-if="!isValid" class="text-orange-600 whitespace-nowrap">
            请选择成员和日期
          </span>
          <span v-else-if="status === 'pending' && accumulatedTracks.length === 0" class="text-gray-500 whitespace-nowrap">
            加载中...
          </span>
          <span v-else-if="error" class="text-red-600 whitespace-nowrap">
            加载失败
          </span>
          <span v-else-if="totalCount === 0" class="text-gray-500 whitespace-nowrap">
            暂无数据
          </span>
        </div>
      </div>

      <!-- FAB for track list -->
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        leave-active-class="transition-all duration-150 ease-in"
        enter-from-class="scale-0 opacity-0"
        enter-to-class="scale-100 opacity-100"
        leave-from-class="scale-100 opacity-100"
        leave-to-class="scale-0 opacity-0"
      >
        <button
          v-if="totalCount > 0"
          type="button"
          class="absolute bottom-20 lg:bottom-4 left-4 w-12 h-12 bg-white text-gray-700 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all border border-gray-200"
          @click="isTrackListDrawerOpen = true"
        >
          <span class="text-sm font-medium">{{ totalCount }}</span>
        </button>
      </Transition>

      <!-- Bottom floating track settings - Desktop only -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        leave-active-class="transition-all duration-200 ease-in"
        enter-from-class="translate-y-full opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="translate-y-full opacity-0"
      >
        <div
          v-if="member"
          class="hidden lg:flex absolute bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-lg px-4 py-3 items-center space-x-3"
        >
          <span class="text-sm text-gray-600 whitespace-nowrap">轨迹间隔</span>
          <ToggleGroupRoot
            type="single"
            :model-value="currentTrackValue"
            class="inline-flex bg-gray-100 rounded-lg p-1 space-x-1"
            @update:model-value="handleTrackChange"
          >
            <ToggleGroupItem
              v-for="option in trackOptions"
              :key="option.value"
              :value="option.value"
              :disabled="option.vipOnly && !hasQuickSupport"
              class="px-3 py-1.5 rounded-md text-xs font-medium transition-all data-[state=on]:bg-blue-500 data-[state=on]:text-white data-[state=on]:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 data-[state=on]:hover:bg-blue-600"
              :title="option.vipOnly && !hasQuickSupport ? '需要 VIP' : option.label"
            >
              {{ option.label }}
            </ToggleGroupItem>
          </ToggleGroupRoot>
          <Icon
            v-if="isUpdatingTrack"
            icon="lucide:loader-2"
            class="w-4 h-4 text-gray-400 animate-spin"
          />
        </div>
      </Transition>

      <!-- Mobile FAB to open settings drawer -->
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        leave-active-class="transition-all duration-150 ease-in"
        enter-from-class="scale-0 opacity-0"
        enter-to-class="scale-100 opacity-100"
        leave-from-class="scale-100 opacity-100"
        leave-to-class="scale-0 opacity-0"
      >
        <button
          v-if="member"
          type="button"
          class="lg:hidden absolute bottom-20 right-4 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-600 active:scale-95 transition-all"
          @click="isSettingsDrawerOpen = true"
        >
          <Icon icon="lucide:settings" class="w-6 h-6" />
        </button>
      </Transition>

      <!-- Mobile drawer for track settings -->
      <Drawer v-model:open="isSettingsDrawerOpen" title="轨迹设置">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">轨迹间隔</label>
          <div class="flex flex-wrap -m-1">
            <div v-for="option in trackOptions" :key="option.value" class="w-1/3 p-1">
              <button
                type="button"
                :disabled="option.vipOnly && !hasQuickSupport"
                class="w-full flex items-center justify-center min-h-[48px] px-2 py-3 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                :class="currentTrackValue === option.value
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-gray-100 hover:bg-gray-200'"
                @click="handleTrackChange(option.value); isSettingsDrawerOpen = false;"
              >
                {{ option.label }}
                <span v-if="option.vipOnly && !hasQuickSupport" class="ml-1 text-xs opacity-60">VIP</span>
              </button>
            </div>
          </div>
          <div v-if="isUpdatingTrack" class="flex items-center justify-center space-x-2 text-gray-500 mt-4">
            <Icon icon="lucide:loader-2" class="w-4 h-4 animate-spin" />
            <span class="text-sm">更新中...</span>
          </div>
        </div>
      </Drawer>

      <!-- Track list drawer -->
      <Drawer v-model:open="isTrackListDrawerOpen" title="轨迹点列表">
        <div ref="trackListRef" class="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
          <button
            v-for="(point, index) in accumulatedTracks"
            :key="index"
            type="button"
            class="w-full flex items-center px-2 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
            @click="navigateToPoint(point, index)"
          >
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium mr-3">
              {{ index + 1 }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm text-gray-900">
                {{ new Date(point.created * 1000).toLocaleTimeString() }}
              </div>
              <div class="text-xs text-gray-500 truncate">
                {{ point.lat.toFixed(6) }}, {{ point.lng.toFixed(6) }}
              </div>
            </div>
            <Icon icon="lucide:chevron-right" class="w-4 h-4 text-gray-400 flex-shrink-0" />
          </button>

          <div v-if="hasNextPage" class="flex items-center justify-center py-4">
            <Icon icon="lucide:loader-2" class="w-4 h-4 text-gray-400 animate-spin mr-2" />
            <span class="text-sm text-gray-500">加载中...</span>
          </div>

          <div v-else-if="accumulatedTracks.length > 0" class="flex items-center justify-center py-4">
            <span class="text-sm text-gray-400">共 {{ totalCount }} 条</span>
          </div>
        </div>
      </Drawer>
    </div>
  </BackLayout>
</template>
