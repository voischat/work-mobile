# Task Plan: Refactor Realtime Location and Track Pages with Popover

## Goal

Unify the config panels for realtime-location and track pages by replacing Modal with Reka UI Popover for target selection.

## Current State Analysis

### Realtime Location Page

- Uses Modal for selecting dept/group
- Contains TreeSelector with custom loadMore function
- Tabs for switching between dept/group
- Single selection mode (select one dept or group)

### Track Page

- Uses Modal for selecting members
- Contains DeptMemberTreeSelector and GroupMemberTreeSelector
- Tabs for switching between dept/group
- Single selection mode (select one member)

## Phases

- [x] Phase 1: Research Reka UI Popover API
- [x] Phase 2: Create shared TargetSelectorPopover component
- [x] Phase 3: Refactor realtime-location page
- [x] Phase 4: Refactor track page
- [x] Phase 5: Type check and verify

## Key Questions

1. How to handle the close behavior - should selection apply immediately or on explicit confirm?
2. How to constrain popover size properly?
3. Should we create separate popover components or one unified?

## Decisions Made

- **Selection behavior**: Apply selection immediately when user clicks (no confirm button needed)
- **Close behavior**: Click outside or select to close
- **Component structure**: Create TargetSelectorPopover that accepts tabs content as slot
- **Size constraints**: Use Reka UI's CSS custom properties for proper sizing

## Status

**Completed** - All phases finished successfully

## Summary

Refactored both realtime-location and track pages to use Reka UI Popover instead of Modal:

- Created shared `TargetSelectorPopover` component with 400px width and 60vh max-height
- Selection applies immediately (no confirm button needed)
- Added chevron icon rotation when popover is open
- Type check passes

## Reka UI Popover API Reference

```vue
<PopoverRoot>
  <PopoverTrigger>Trigger button</PopoverTrigger>
  <PopoverPortal>
    <PopoverContent
      class="PopoverContent"
      :side-offset="5"
    >
      Content here
      <PopoverArrow />
    </PopoverContent>
  </PopoverPortal>
</PopoverRoot>
```

CSS for sizing:

```css
.PopoverContent {
  width: var(--reka-popover-trigger-width);
  max-height: var(--reka-popover-content-available-height);
}
```
