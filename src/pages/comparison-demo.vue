<script setup lang="ts">
import Drawer from '~/components/Drawer.vue'
import GestureDialog from '~/components/GestureDialog.vue'

const isDrawerOpen = ref(false)
const isGestureDialogOpen = ref(false)

function openDrawer() {
  isDrawerOpen.value = true
}

function openGestureDialog() {
  isGestureDialogOpen.value = true
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-md mx-auto">
      <h1 class="text-2xl font-bold text-gray-900 mb-6 text-center">
        Drawer vs GestureDialog Comparison
      </h1>

      <div class="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div class="space-y-4">
          <h2 class="text-lg font-semibold text-gray-900">
            Traditional Drawer (Before)
          </h2>
          <button
            type="button"
            class="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            @click="openDrawer"
          >
            Open Traditional Drawer
          </button>
          <div class="text-sm text-gray-600 space-y-1">
            <p><strong>Features:</strong></p>
            <ul class="list-disc list-inside space-y-0.5">
              <li>Simple slide up animation</li>
              <li>Backdrop click to close</li>
              <li>CSS transitions only</li>
              <li>Handle bar (visual only)</li>
            </ul>
          </div>
        </div>

        <hr class="border-gray-200">

        <div class="space-y-4">
          <h2 class="text-lg font-semibold text-gray-900">
            Gesture Dialog (After)
          </h2>
          <button
            type="button"
            class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            @click="openGestureDialog"
          >
            Open Gesture Dialog
          </button>
          <div class="text-sm text-gray-600 space-y-1">
            <p><strong>Enhanced Features:</strong></p>
            <ul class="list-disc list-inside space-y-0.5">
              <li>🚀 Drag-to-dismiss gestures</li>
              <li>✨ Motion-v powered animations</li>
              <li>🎨 Body scaling background effect</li>
              <li>⚡ Inertia-based interactions</li>
              <li>🎯 Same API as Drawer</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <h3 class="font-medium text-blue-900 mb-2">
          How to Replace
        </h3>
        <div class="text-sm text-blue-800 space-y-2">
          <p>Simply replace the import and component name:</p>
          <pre class="bg-blue-100 p-2 rounded text-xs overflow-x-auto"><code>// Before
import Drawer from '~/components/Drawer.vue'
&lt;Drawer v-model:open="isOpen" title="My Drawer"&gt;

// After
import GestureDialog from '~/components/GestureDialog.vue'
&lt;GestureDialog v-model:open="isOpen" title="My Drawer"&gt;</code></pre>
        </div>
      </div>

      <!-- Traditional Drawer -->
      <Drawer v-model:open="isDrawerOpen" title="Traditional Drawer">
        <div class="space-y-4">
          <p class="text-gray-700">
            This is the original Drawer component with basic functionality.
          </p>

          <div class="bg-gray-100 rounded-lg p-4">
            <h4 class="font-medium text-gray-900 mb-2">
              Limitations:
            </h4>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• No gesture support</li>
              <li>• Basic CSS animations</li>
              <li>• Handle bar is decorative only</li>
              <li>• No interactive dismissal</li>
            </ul>
          </div>

          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p class="text-yellow-800 text-sm">
              💡 Try clicking the backdrop or pressing ESC to close
            </p>
          </div>
        </div>

        <template #footer>
          <button
            type="button"
            class="w-full bg-gray-600 text-white py-2 px-4 rounded-md font-medium hover:bg-gray-700 transition-colors"
            @click="isDrawerOpen = false"
          >
            Close Drawer
          </button>
        </template>
      </Drawer>

      <!-- Gesture Dialog -->
      <GestureDialog v-model:open="isGestureDialogOpen" title="Gesture Dialog">
        <div class="space-y-4">
          <p class="text-gray-700">
            This is the new GestureDialog with enhanced interactive capabilities.
          </p>

          <div class="bg-blue-50 rounded-lg p-4">
            <h4 class="font-medium text-blue-900 mb-2">
              Enhanced Features:
            </h4>
            <ul class="text-sm text-blue-700 space-y-1">
              <li>🚀 Drag the dialog down to dismiss</li>
              <li>✨ Smooth motion-v animations</li>
              <li>🎨 Background scaling effects</li>
              <li>⚡ Velocity-based dismissal</li>
              <li>🎯 100% API compatible</li>
            </ul>
          </div>

          <div class="bg-green-50 border border-green-200 rounded-lg p-4">
            <p class="text-green-800 text-sm">
              🎮 Try dragging this dialog down to close it!
            </p>
          </div>

          <div class="space-y-3">
            <div class="bg-gray-100 rounded-lg p-3">
              <h4 class="font-medium text-gray-900">
                Drop-in Replacement
              </h4>
              <p class="text-gray-600 text-sm mt-1">
                Same props, same events, same slots - enhanced interactions.
              </p>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex space-x-3">
            <button
              type="button"
              class="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-300 transition-colors"
              @click="isGestureDialogOpen = false"
            >
              Cancel
            </button>
            <button
              type="button"
              class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors"
              @click="isGestureDialogOpen = false"
            >
              Confirm
            </button>
          </div>
        </template>
      </GestureDialog>
    </div>
  </div>
</template>
