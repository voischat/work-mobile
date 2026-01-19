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
const { t } = useI18n()

const items = computed<NavItem[]>(() => [
  {
    title: t('nav.home'),
    icon: 'lucide:home',
    route: '/',
  },
  {
    title: t('directory.title'),
    icon: 'lucide:book',
    route: '/directory',
    children: [
      {
        title: t('directory.department.management'),
        icon: 'lucide:building',
        route: '/directory/departments',
      },
      {
        title: t('directory.group.management'),
        icon: 'lucide:users',
        route: '/directory/groups',
      },
      {
        title: t('directory.member.management'),
        icon: 'lucide:user',
        route: '/directory/members',
      },
    ],
  },
  {
    title: t('nav.workbench'),
    icon: 'lucide:layout-dashboard',
    route: '/workbench',
    children: [
      {
        title: t('nav.track'),
        icon: 'lucide:route',
        route: '/workbench/track',
      },
      {
        title: t('nav.realtimeLocation'),
        icon: 'lucide:map-pin',
        route: '/workbench/realtime-location',
      },
    ],
  },
  {
    title: t('nav.me'),
    icon: 'lucide:user-circle',
    route: '/me',
  },
])

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
    :default-expanded="[t('directory.title'), t('nav.workbench')]"
  >
    <h2 class="font-semibold text-sm text-neutral-400 px-2 pt-1 pb-3">
      {{ t('app.name') }}
    </h2>
    <TransitionGroup name="tree-item" tag="div">
      <TreeItem
        v-for="item in flattenItems"
        v-slot="{ isExpanded, handleToggle }"
        :key="item._id"
        :style="{ 'padding-left': `${item.level - 0.5}rem` }"
        v-bind="item.bind"
        class="tree-item text-neutral-500 flex items-center py-4 px-4 my-0.5 rounded outline-none focus:ring-grass8 focus:ring-2 data-[selected]:bg-grass4 cursor-pointer transition-all duration-200 hover:bg-gray-100"
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
    </TransitionGroup>
  </TreeRoot>
</template>

<style scoped>
.tree-item-enter-active {
  transition: all 0.2s ease-out;
}

.tree-item-leave-active {
  transition: all 0.15s ease-in;
}

.tree-item-enter-from {
  opacity: 0;
  transform: translateX(-8px);
}

.tree-item-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}

.tree-item-move {
  transition: transform 0.2s ease;
}
</style>
