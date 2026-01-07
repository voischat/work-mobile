<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { TreeItem, TreeRoot } from 'reka-ui'
import { useRouter } from 'vue-router'
import { isActiveRoute } from '~/utils/router'

interface NavItem {
  title: string
  icon: string
  route?: string
  children?: NavItem[]
}

const router = useRouter()

const items: NavItem[] = [
  {
    title: '主页',
    icon: 'lucide:home',
    route: '/',
  },
  {
    title: '通讯录',
    icon: 'lucide:book',
    route: '/directory',
    children: [
      {
        title: '部门管理',
        icon: 'lucide:building',
        route: '/directory/departments',
      },
      {
        title: '群组管理',
        icon: 'lucide:users',
        route: '/directory/groups',
      },
      {
        title: '成员管理',
        icon: 'lucide:user',
        route: '/directory/members',
      },
    ],
  },
  {
    title: '工作台',
    icon: 'lucide:layout-dashboard',
    route: '/workbench',
    children: [
      {
        title: '轨迹',
        icon: 'lucide:route',
        route: '/workbench/track',
      },
      {
        title: '实时位置',
        icon: 'lucide:map-pin',
        route: '/workbench/realtime-location',
      },
    ],
  },
  {
    title: '我的',
    icon: 'lucide:user-circle',
    route: '/me',
  },
]

function handleItemClick(item: NavItem) {
  if (item.route) {
    router.replace(item.route)
  }
}
</script>

<template>
  <TreeRoot
    v-slot="{ flattenItems }"
    class="list-none select-none w-56 bg-white text-stone-700 border-r shadow-sm p-2 text-sm font-medium"
    :items="items"
    :get-key="(item) => item.title"
    :default-expanded="['通讯录', '工作台']"
  >
    <h2 class="font-semibold text-sm text-neutral-400 px-2 pt-1 pb-3">
      微喇企业版
    </h2>
    <TreeItem
      v-for="item in flattenItems"
      v-slot="{ isExpanded, handleToggle }"
      :key="item._id"
      :style="{ 'padding-left': `${item.level - 0.5}rem` }"
      v-bind="item.bind"
      class="text-neutral-500 flex items-center py-4 px-4 my-0.5 rounded outline-none focus:ring-grass8 focus:ring-2 data-[selected]:bg-grass4 cursor-pointer hover:bg-gray-100 transition-colors"
      :class="{
        'text-black bg-neutral-50 text-grass11': item.value.route && isActiveRoute(item.value.route),
      }"
      @click="handleItemClick(item.value)"
    >
      <template v-if="item.hasChildren">
        <Icon
          v-if="!isExpanded"
          :icon="item.value.icon || 'lucide:folder'"
          class="h-4 w-4"
        />
        <Icon
          v-else
          :icon="item.value.icon || 'lucide:folder-open'"
          class="h-4 w-4"
        />
      </template>
      <Icon
        v-else
        :icon="item.value.icon || 'lucide:file'"
        class="h-4 w-4"
      />
      <div class="pl-2 flex-1">
        {{ item.value.title }}
      </div>
      <Icon
        v-if="item.hasChildren"
        icon="lucide:chevron-right"
        class="h-4 w-4 ml-auto transition-transform duration-200"
        :class="{ 'rotate-90': isExpanded }"
        @click.stop="handleToggle"
      />
    </TreeItem>
  </TreeRoot>
</template>
