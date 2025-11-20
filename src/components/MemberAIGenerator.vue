<script setup lang="ts">
import { computed, ref } from 'vue'
import { type AddMemberForm, type ParsedMemberInfo, useGenerateMember } from '~/composables/useGenMember'
import { useToast } from '~/composables/useToast'

const props = withDefaults(defineProps<{
  disabled?: boolean
  placeholder?: string
  defaultPrompt?: string
}>(), {
  disabled: false,
  placeholder: '例如：创建一个名为张三的成员，工号是001，手机号13800138000，是管理员',
  defaultPrompt: '生成一个随机成员，密码为123456',
})

const emit = defineEmits<{
  (e: 'filled', info: ParsedMemberInfo): void
}>()

const member = defineModel<AddMemberForm>('member', { default: undefined })

const aiPrompt = ref(props.defaultPrompt)
const { showToast } = useToast()
const { isParsing, error: aiError, generate: parseMemberInfo } = useGenerateMember(member)

const isGenerateDisabled = computed(() => props.disabled || isParsing.value || !aiPrompt.value.trim())

async function handleGenerate() {
  if (!aiPrompt.value.trim()) {
    showToast('请输入提示词')
    return
  }

  const parsedInfo = await parseMemberInfo(aiPrompt.value)
  if (parsedInfo) {
    emit('filled', parsedInfo)
    showToast('AI 解析成功，已自动填充表单')
  }
  else if (aiError.value) {
    showToast(aiError.value)
  }
}
</script>

<template>
  <div class="mb-6 p-5 rounded-2xl border border-zinc-200 bg-white/80 shadow-[0_8px_30px_rgba(15,23,42,0.08)] backdrop-blur-sm">
    <label class="block text-xs uppercase tracking-[0.2em] text-zinc-500 mb-3">
      <span class="inline-flex items-center gap-2">
        <span class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-600">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </span>
        <span class="text-zinc-800 font-semibold tracking-[0.1em] text-xs">AI 智能创建</span>
      </span>
    </label>
    <input
      v-model="aiPrompt"
      type="text"
      :placeholder="placeholder"
      class="w-full px-4 py-3 border border-zinc-200 rounded-xl bg-transparent text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-0 transition-colors"
      :disabled="disabled || isParsing"
      @keyup.enter="handleGenerate"
    >
    <button
      type="button"
      class="w-full mt-4 px-4 py-3 bg-zinc-900 text-white rounded-xl text-sm tracking-wide uppercase disabled:bg-zinc-300 disabled:text-zinc-500 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
      :disabled="isGenerateDisabled"
      @click="handleGenerate"
    >
      {{ isParsing ? '生成中...' : '生成' }}
    </button>
    <div v-if="aiError" class="mt-3 text-xs text-rose-500 tracking-wide">
      {{ aiError }}
    </div>
    <div class="mt-3 text-[11px] text-zinc-400 leading-relaxed">
      提示：输入自然语言描述，AI 会自动提取成员信息并填充表单
    </div>
  </div>
</template>
