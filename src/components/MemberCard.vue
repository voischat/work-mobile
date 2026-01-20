<script setup lang="ts">
import type { Member } from '~/types/management'
import { Icon } from '@iconify/vue'
import {
  CollapsibleContent,
  CollapsibleRoot,
  CollapsibleTrigger,
} from 'reka-ui'
import { AvatarFallback, AvatarImage, AvatarRoot } from 'reka-ui'

defineProps<{
  member: Member
  deptName?: string
}>()

const { t } = useI18n()

const memberTypeMap = {
  0: { label: t('directory.member.memberType.member') },
  1: { label: t('directory.member.memberType.device') },
  2: { label: t('directory.member.memberType.admin') },
  255: { label: t('directory.member.memberType.owner') },
} as const

const onlineStatusMap = {
  0: { label: t('directory.member.onlineStatus.offline'), icon: 'lucide:circle' },
  1: { label: t('directory.member.onlineStatus.online'), icon: 'lucide:circle' },
} as const

const sexMap = {
  1: { icon: 'ph:gender-female-duotone', color: 'text-gray-500' },
  2: { icon: 'ph:gender-male-duotone', color: 'text-gray-500' },
} as const

const trackTypeMap = {
  0: { label: t('directory.member.trackOptions.off'), speed: '' },
  1: { label: t('directory.member.trackOptions.oneHour'), speed: t('directory.member.trackSpeed.slow') },
  2: { label: t('directory.member.trackOptions.fifteenMinutes'), speed: t('directory.member.trackSpeed.medium') },
  3: { label: t('directory.member.trackOptions.fiveMinutes'), speed: t('directory.member.trackSpeed.fast') },
  4: { label: t('directory.member.trackOptions.oneMinute'), speed: t('directory.member.trackSpeed.veryFast') },
} as const

const locShareMap = {
  0: { label: t('directory.member.locationShareOptions.off') },
  1: { label: t('directory.member.locationShareOptions.on') },
} as const

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('zh-CN')
}
</script>

<template>
  <CollapsibleRoot class="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200">
    <!-- Header Section -->
    <CollapsibleTrigger class="p-5 w-full">
      <div class="flex items-start space-x-3.5">
        <!-- Avatar using Reka UI -->
        <AvatarRoot class="inline-flex h-14 w-14 shrink-0 select-none items-center justify-center overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-200/50">
          <AvatarImage
            class="h-full w-full object-cover"
            :src="member.avatar"
            :alt="member.name"
          />
          <AvatarFallback class="flex h-full w-full items-center justify-center bg-gray-100 text-sm font-semibold text-gray-600">
            {{ member.name?.slice(0, 2) || 'UN' }}
          </AvatarFallback>
        </AvatarRoot>

        <!-- Basic Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-2 mb-2">
            <h3 class="text-base font-semibold text-gray-900 tracking-tight">
              {{ member.name || t('directory.member.fields.unnamed') }}
            </h3>
            <Icon
              v-if="member.sex && sexMap[member.sex as keyof typeof sexMap]"
              :icon="sexMap[member.sex as keyof typeof sexMap].icon"
              class="w-4 h-4"
              :class="sexMap[member.sex as keyof typeof sexMap].color"
            />
          </div>

          <div class="flex items-center flex-wrap space-x-1">
            <!-- Member Type Badge -->
            <span
              v-if="memberTypeMap[member.type as keyof typeof memberTypeMap]"
              class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
            >
              {{ memberTypeMap[member.type as keyof typeof memberTypeMap].label }}
            </span>

            <!-- Online Status -->
            <span
              v-if="member.online_status !== undefined"
              class="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md text-xs font-medium border"
              :class="member.online_status === 1
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-gray-50 text-gray-600 border-gray-200'"
            >
              <span>{{ onlineStatusMap[member.online_status as keyof typeof onlineStatusMap]?.label || t('directory.member.onlineStatus.unknown') }}</span>
            </span>
          </div>
        </div>

        <Icon
          icon="lucide:chevron-down"
          class="size-5 transition-transform duration-200 collapsible-chevron"
        />
      </div>
    </CollapsibleTrigger>

    <!-- Collapsible Content -->
    <CollapsibleContent class="collapsible-content">
      <div class="px-5 pb-5 space-y-4 border-t border-gray-100">
        <!-- Details Table -->
        <div class="space-y-2.5 text-sm pt-4">
          <div v-if="member.job_num" class="flex items-center">
            <span class="w-20 text-gray-500 font-medium">{{ t('directory.member.fields.employeeId') }}</span>
            <span class="text-gray-900 font-medium">{{ member.job_num }}</span>
          </div>
          <div v-if="member.phone" class="flex items-center">
            <span class="w-20 text-gray-500 font-medium">{{ t('directory.member.fields.phone') }}</span>
            <span class="text-gray-900">{{ member.phone }}</span>
          </div>
          <div class="flex items-center">
            <span class="w-20 text-gray-500 font-medium">{{ t('directory.member.fields.weilaId') }}</span>
            <span class="text-gray-900">{{ member.user_num }}</span>
          </div>
          <div v-if="member.grp_cnt !== undefined && member.grp_lmt !== undefined" class="flex items-center">
            <span class="w-20 text-gray-500 font-medium">{{ t('directory.member.fields.groups') }}</span>
            <span
              :class="member.grp_cnt >= member.grp_lmt
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'text-gray-900'"
            >
              {{ member.grp_cnt }} {{ t('common.punctuation.slash') }} {{ member.grp_lmt }}
            </span>
          </div>
          <div class="flex items-center">
            <span class="w-20 text-gray-500 font-medium">{{ t('directory.member.fields.createTime') }}</span>
            <span class="text-gray-600">{{ formatDate(member.created) }}</span>
          </div>
        </div>

        <!-- Feature Status -->
        <div class="flex items-center flex-wrap space-x-2 pt-3 border-t border-gray-100">
          <span class="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
            <Icon icon="lucide:route" class="w-3.5 h-3.5" />
            <span>{{ t('directory.member.fields.track') }}{{ t('common.punctuation.colon') }} {{ trackTypeMap[member.track as keyof typeof trackTypeMap]?.label || t('directory.member.onlineStatus.unknown') }}</span>
          </span>
          <span class="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
            <Icon icon="lucide:map-pin" class="w-3.5 h-3.5" />
            <span>{{ t('directory.member.fields.locationShare') }}{{ t('common.punctuation.colon') }} {{ locShareMap[member.loc_share as keyof typeof locShareMap]?.label || t('directory.member.onlineStatus.unknown') }}</span>
          </span>
        </div>

        <!-- Actions Slot -->
        <div class="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
          <slot name="actions" />
        </div>
      </div>
    </CollapsibleContent>
  </CollapsibleRoot>
</template>

<style scoped>
.collapsible-content {
  overflow: hidden;
}

.collapsible-content[data-state='open'] {
  animation: slideDown 300ms ease-out;
}

.collapsible-content[data-state='closed'] {
  animation: slideUp 300ms ease-out;
}

@keyframes slideDown {
  from {
    height: 0;
  }
  to {
    height: var(--reka-collapsible-content-height);
  }
}

@keyframes slideUp {
  from {
    height: var(--reka-collapsible-content-height);
  }
  to {
    height: 0;
  }
}

.collapsible-chevron {
  transition: transform 200ms ease;
}

button[data-state='open'] .collapsible-chevron {
  transform: rotate(180deg);
}
</style>
