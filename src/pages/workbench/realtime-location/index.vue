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
import Modal from '~/components/Modal.vue'
import TreeSelector from '~/components/TreeSelector.vue'
import { useAMap } from '~/composables/useAMap'
import { weilaFetch } from '~/shared/instances'

const { loadAMap } = useAMap()

const sessionId = useRouteQuery('sessionId', '', { transform: Number })
const selectedType = useRouteQuery<'dept' | 'group'>('type', 'dept')

const isSelectorOpen = ref(false)
const selectedNodes = ref<TreeNode[]>([])
const pendingSelection = ref<TreeNode[]>([])

watch(selectedNodes, (newNodes) => {
  const newId = newNodes[0]?.id || 0
  if (newId !== sessionId.value)
    sessionId.value = newId
}, { deep: true })

watch(selectedType, () => {
  selectedNodes.value = []
  sessionId.value = 0
})

watch(isSelectorOpen, (isOpen) => {
  if (isOpen)
    pendingSelection.value = [...selectedNodes.value]
})

function handleConfirm() {
  selectedNodes.value = pendingSelection.value
  isSelectorOpen.value = false
}

function handleCancel() {
  isSelectorOpen.value = false
}

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
          { name: '工作台', steps: 1 },
          { name: '实时位置' },
        ]"
      />
    </template>

    <div class="absolute inset-0">
      <div ref="mapContainer" class="w-full h-full" />

      <div class="absolute top-4 left-4 right-4 md:left-auto md:right-4 md:w-auto md:min-w-[340px] bg-white rounded-lg shadow-lg z-10">
        <div class="flex flex-col gap-3 p-3">
          <div class="flex items-center gap-3 flex-wrap">
            <!-- 选择按钮 -->
            <button
              type="button"
              class="flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 transition-colors min-w-[120px]"
              @click="isSelectorOpen = true"
            >
              <span class="truncate">
                {{ selectedNode?.label || `选择${selectedType === 'dept' ? '部门' : '群组'}` }}
              </span>
              <Icon icon="lucide:chevron-down" class="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
            </button>
          </div>

          <!-- 状态显示 -->
          <div class="flex items-center text-xs">
            <span v-if="!isValid" class="text-orange-600 whitespace-nowrap">
              选择{{ selectedType === 'dept' ? '部门' : '群组' }}
            </span>
            <span v-else-if="status === 'pending'" class="text-gray-500 whitespace-nowrap">
              加载中...
            </span>
            <span v-else-if="error" class="text-red-600 whitespace-nowrap">
              加载失败
            </span>
            <span v-else-if="(realtimeData?.length ?? 0) === 0" class="text-gray-500 whitespace-nowrap">
              暂无数据
            </span>
            <span v-else class="text-gray-600 whitespace-nowrap">
              {{ realtimeData?.length || 0 }} 人
            </span>
          </div>
        </div>
      </div>

      <!-- 选择 Modal -->
      <Modal
        v-model:open="isSelectorOpen"
        :title="`选择${selectedType === 'dept' ? '部门' : '群组'}`"
        confirm-text="确定"
        cancel-text="取消"
        @confirm="handleConfirm"
        @cancel="handleCancel"
      >
        <TabsRoot v-model="selectedType" class="w-full h-[60vh] flex flex-col">
          <TabsList class="inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 p-1 w-full shrink-0">
            <TabsIndicator class="absolute bottom-0 left-0 h-[2px] w-full bg-transparent transition-all duration-300" />
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
            <TreeSelector
              key="dept"
              v-model:selected-nodes="pendingSelection"
              :load-more="deptLoader"
              mode="single"
            />
          </TabsContent>
          <TabsContent value="group" class="mt-4 flex-1 overflow-y-auto min-h-0">
            <TreeSelector
              key="group"
              v-model:selected-nodes="pendingSelection"
              :load-more="groupLoader"
              mode="single"
            />
          </TabsContent>
        </TabsRoot>
      </Modal>

      <div
        v-if="isValid && (realtimeData?.length ?? 0) > 0"
        class="absolute top-4 right-4 md:right-auto md:left-4 lg:right-4 bg-white rounded-lg shadow-lg p-3 z-10"
      >
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 rounded-full bg-blue-500" />
          <span class="text-xs text-gray-600">在线</span>
        </div>
      </div>
    </div>
  </BackLayout>
</template>
