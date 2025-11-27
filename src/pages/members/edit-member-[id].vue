<script setup lang="ts">
import type { Member } from '~/types/management'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BackLayout from '~/components/BackLayout.vue'
import Breadcrumb from '~/components/Breadcrumb.vue'
import EditMemberForm from '~/components/EditMemberForm.vue'
import { useWeilaFetch } from '~/composables/useWeilaFetch'

const route = useRoute()
const router = useRouter()

// 从路由参数获取成员 ID
// @ts-expect-error - route.params.id 的类型定义问题
const memberId = computed(() => Number(route.params.id))

// 成员信息（用于判断是成员还是设备）
const memberInfo = ref<Member | null>(null)

// 获取成员信息 - 通过获取成员列表并查找
const {
  data: memberListData,
} = useWeilaFetch<{ members: Member[] }>('/corp/address/get-member-list?page=0&size=1000')
  .post(() => ({
    key: '',
  }))
  .json()

// 监听成员列表数据，找到对应的成员
watch(memberListData, (data) => {
  if (data?.members) {
    const member = data.members.find((m: Member) => m.user_id === memberId.value)
    if (member) {
      memberInfo.value = member
    }
  }
}, { immediate: true })

// 判断是否为设备（type === 1）
const isDevice = computed(() => memberInfo.value?.type === 1)

function handleSuccess() {
  router.back()
}

function handleCancel() {
  router.back()
}
</script>

<template>
  <BackLayout :title="isDevice ? '编辑设备' : '编辑成员'">
    <template #breadcrumb>
      <Breadcrumb
        :items="[
          { name: '成员管理', steps: 2 }, // 回到成员列表
        ]"
      />
    </template>
    <div class="p-4">
      <div class="max-w-md mx-auto">
        <div v-if="!memberInfo" class="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
          加载中...
        </div>
        <div v-else class="bg-white rounded-lg shadow-md p-6">
          <EditMemberForm
            :member="memberInfo"
            @success="handleSuccess"
            @cancel="handleCancel"
          />
        </div>
      </div>
    </div>
  </BackLayout>
</template>
