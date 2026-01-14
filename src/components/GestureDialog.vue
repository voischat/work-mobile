<script setup lang="ts">
import { animate, AnimatePresence, Motion, useMotionValue, useMotionValueEvent, useTransform } from 'motion-v'
import { DialogContent, DialogOverlay, DialogPortal, DialogRoot } from 'reka-ui'

const props = withDefaults(defineProps<{
  title?: string
  height?: string | number
}>(), {
  height: '50vh',
})

const open = defineModel<boolean>('open', { default: false })

function close() {
  open.value = false
}

const inertiaTransition = {
  type: 'inertia' as const,
  bounceStiffness: 600,
  bounceDamping: 25,
  timeConstant: 150,
}

const staticTransition = {
  duration: 0.2,
  ease: [0.23, 1, 0.32, 1] as const, // easeOutQuart
}

const fastOpenTransition = {
  duration: 0.15,
  ease: [0.23, 1, 0.32, 1] as const, // easeOutQuart
}

const overlayTransition = {
  duration: 0.15,
  ease: [0.23, 1, 0.32, 1] as const, // easeOutQuart
}

const SHEET_MARGIN = 34
const SHEET_RADIUS = 12

let root: HTMLElement

onMounted(() => {
  root = document.body.firstElementChild as HTMLElement
})

const { height, width } = useWindowSize()

// Parse height prop to get vh percentage or pixel value
const dialogHeight = computed(() => {
  if (typeof props.height === 'string' && props.height.includes('vh')) {
    const vhValue = Number.parseFloat(props.height) / 100
    return Math.min(height.value * vhValue, height.value - SHEET_MARGIN)
  }
  else if (typeof props.height === 'number') {
    return Math.min(props.height, height.value - SHEET_MARGIN)
  }
  else if (typeof props.height === 'string' && props.height.includes('px')) {
    return Math.min(Number.parseFloat(props.height), height.value - SHEET_MARGIN)
  }
  // Default fallback to 50vh
  return Math.min(height.value * 0.5, height.value - SHEET_MARGIN)
})
const h = computed(() => dialogHeight.value)
const y = useMotionValue(h.value)

// Scale the body down and adjust the border radius when the sheet is open.
const bodyScale = useTransform(
  y,
  [0, h.value],
  [(width.value - SHEET_MARGIN) / width.value, 1],
)
const bodyTranslate = useTransform(y, [0, h.value], [SHEET_MARGIN - SHEET_RADIUS, 0])
const bodyBorderRadius = useTransform(y, [0, h.value], [SHEET_RADIUS, 0])

useMotionValueEvent(bodyScale, 'change', v => root.style.scale = `${v}`)
useMotionValueEvent(
  bodyTranslate,
  'change',
  v => root.style.translate = `0 ${v}px`,
)
useMotionValueEvent(
  bodyBorderRadius,
  'change',
  v => root.style.borderRadius = `${v}px`,
)
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <AnimatePresence multiple as="div">
        <DialogOverlay as-child>
          <Motion
            class="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-none"
            :initial="{ opacity: 0 }"
            :animate="{ opacity: 1 }"
            :exit="{ opacity: 0 }"
            :transition="overlayTransition"
            @click="close"
          />
        </DialogOverlay>

        <DialogContent as-child>
          <Motion
            class="bg-white rounded-t-2xl shadow-xl fixed inset-0 z-[9999] bottom-0 w-full will-change-transform flex flex-col pb-4 transform-gpu"
            :initial="{ y: h }"
            :animate="{ y: 0 }"
            :exit="{ y: h }"
            :transition="{
              y: open ? fastOpenTransition : staticTransition,
              default: staticTransition,
            }"
            :style="{
              y,
              top: `${height - dialogHeight}px`,
              height: `${dialogHeight}px`,
            }"
            drag="y"
            :drag-constraints="{ top: 0 }"
            @drag-end="(e, { offset, velocity }) => {
              if (offset.y > dialogHeight * 0.6 || velocity.y > 15) {
                open = false;
              }
              else {
                animate(y, 0, { ...inertiaTransition, min: 0, max: 0 });
              }
            }"
            @click.stop
          >
            <!-- Handle bar -->
            <div class="flex justify-center pt-3 pb-2">
              <div class="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            <!-- Header -->
            <div v-if="title || $slots.header" class="px-4 pb-3 border-b border-gray-100">
              <slot name="header">
                <h3 class="text-base font-semibold text-gray-900 text-center">
                  {{ title }}
                </h3>
              </slot>
            </div>

            <!-- Content -->
            <div class="flex-1 overflow-y-auto px-4 py-4 scroll-smooth overscroll-contain">
              <slot />
            </div>

            <!-- Footer -->
            <div v-if="$slots.footer" class="px-4 py-3 border-t border-gray-100">
              <slot name="footer" />
            </div>
          </Motion>
        </DialogContent>
      </AnimatePresence>
    </DialogPortal>
  </DialogRoot>
</template>
