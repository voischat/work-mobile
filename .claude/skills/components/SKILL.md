---
name: components
description: Create, refactor, and organize Vue components in src/components. Use when building new components, restructuring component architecture, working with component patterns, or handling props/emits/slots. Keywords component, vue, prop, emit, slot, defineProps, defineEmits, defineModel.
---

# Vue Components

`src/components` contains reusable Vue components for the application. Components are the building blocks of the UI and should follow strict conventions for consistency and maintainability.

## Instructions

- ALWAYS use `<script setup lang="ts">` with Composition API
- Name files consistently using PascalCase (`UserProfile.vue`) OR kebab-case (`user-profile.vue`)
- ALWAYS use PascalCase for component names in source code
- Compose names from the most general to the most specific: `SearchButtonClear.vue` not `ClearSearchButton.vue`
- Read the full documentation in `src/components/AGENTS.md` for complete patterns and examples

## Component Structure

### Props
- ALWAYS define props with `defineProps<{ propOne: number }>()` and TypeScript types, WITHOUT `const props =`
- Use `const props =` ONLY if props are used in the script block
- Destructure props to declare default values

### Emits
- ALWAYS define emits with `const emit = defineEmits<{ eventName: [argOne: type]; otherEvent: [] }>()` for type safety
- ALWAYS use camelCase in JS for props and emits, even if they are kebab-case in templates

### Slots
- ALWAYS use the shorthand: `<template #default>` instead of `<template v-slot:default>`
- ALWAYS use explicit `<template>` tags for ALL used slots

### v-model
- ALWAYS use `defineModel<type>({ required, get, set, default })` to define allowed v-model bindings in components
- This avoids defining `modelValue` prop and `update:modelValue` event manually

## Component Organization

```
src/components/
├── ui/          # Base UI components (buttons, inputs, etc.)
├── layout/      # Layout components (header, footer, sidebar)
├── features/    # Feature-specific components
└── forms/       # Form-related components
```

## Examples

### Basic Component with Props and Emits

```vue
<script setup lang="ts">
const props = defineProps<{
  title: string
  count?: number
}>()

const emit = defineEmits<{
  click: [event: MouseEvent]
  change: [value: string]
}>()
</script>

<template>
  <button @click="emit('click', $event)">
    {{ title }} ({{ count ?? 0 }})
  </button>
</template>
```

### Component with v-model

```vue
<script setup lang="ts">
const title = defineModel<string>({ required: true })
</script>

<template>
  <input v-model="title" type="text" />
</template>
```

### Multiple v-model bindings

```vue
<script setup lang="ts">
const firstName = defineModel<string>('firstName')
const age = defineModel<number>('age')
</script>

<template>
  <input v-model="firstName" type="text" />
  <input v-model="age" type="number" />
</template>
```

## Templates

- ALWAYS use kebab-case in templates for props and emits
- ALWAYS use the prop shorthand if possible: `<MyComponent :count />` instead of `<MyComponent :count="count" />`

## Testing

- Keep tests alongside the component: `src/ui/Button.vue` + `src/ui/Button.spec.ts`
- Test component behavior, props, emits, and user interactions
