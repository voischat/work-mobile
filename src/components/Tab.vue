<script setup lang="ts">
interface Tab {
  key: string
  label: string
}

interface Props {
  tabs: Tab[]
  modelValue: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const activeTab = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const activeIndex = computed(() => props.tabs.findIndex(t => t.key === activeTab.value))
const tabWidth = computed(() => 100 / props.tabs.length)

function selectTab(key: string) {
  activeTab.value = key
}
</script>

<template>
  <div class="tab-container">
    <div class="tab-list">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="tab-button outline-none "
        :class="{ 'tab-button-active': activeTab === tab.key }"
        @click="selectTab(tab.key)"
      >
        {{ tab.label }}
      </button>
    </div>
    <div
      class="tab-indicator"
      :style="{
        width: `calc(${tabWidth}% - 0.25rem)`,
        transform: `translateX(calc(${activeIndex} * 100% + 0.125rem))`,
      }"
    />
  </div>
</template>

<style scoped>
.tab-container {
  position: relative;
  background: #f3f4f6;
  border-radius: 0.5rem;
  padding: 0.25rem;
  display: inline-flex;
  width: 100%;
}

.tab-list {
  display: flex;
  position: relative;
  width: 100%;
  z-index: 1;
}

.tab-button {
  flex: 1;
  position: relative;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  background: transparent;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  z-index: 2;
}

.tab-button:hover {
  color: #374151;
}

.tab-button-active {
  color: #1f2937;
  font-weight: 600;
}

.tab-indicator {
  position: absolute;
  top: 0.25rem;
  left: 0.125rem;
  bottom: 0.25rem;
  background: white;
  border-radius: 0.375rem;
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.1),
    0 1px 2px 0 rgba(0, 0, 0, 0.06);
  transition:
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
}
</style>
