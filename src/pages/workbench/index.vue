<script setup lang="ts">
import { Icon } from '@iconify/vue'

import HomeLayout from '~/components/HomeLayout.vue'

const router = useRouter()

// 处理菜单点击
function handleMenuClick(path: string) {
  router.push(path)
}
</script>

<template>
  <HomeLayout>
    <div class="p-4">
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-900">
            工作台
          </h1>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <button
            class="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-200 flex flex-col items-center justify-center space-y-3 min-h-[140px] p-6"
            @click="handleMenuClick('/workbench/track')"
          >
            <div class="p-3 rounded-lg">
              <Icon icon="lucide:route" class="w-12 h-12 text-blue-600" />
            </div>
            <span class="text-lg font-bold text-gray-900">轨迹</span>
          </button>

          <button
            class="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-200 flex flex-col items-center justify-center space-y-3 min-h-[140px] p-6"
            @click="handleMenuClick('/workbench/realtime-location')"
          >
            <div class="p-3 rounded-lg">
              <Icon icon="lucide:map-pin" class="w-12 h-12 text-green-600" />
            </div>
            <span class="text-lg font-bold text-gray-900">实时位置</span>
          </button>
        </div>
      </div>
    </div>
  </HomeLayout>
</template>
