# Task Plan: Realtime Location Tab Switching Refactor

## Goal

Fix the loading state issue when switching tabs in the realtime location page by adopting the pattern used in the track page.

## Phases

- [x] Phase 1: Research current implementations
- [x] Phase 2: Compare and identify the root cause
- [x] Phase 3: Design the solution
- [ ] Phase 4: Implement the fix

## Key Questions

1. ~~How does the track page handle tab switching without loading states?~~ ✓ Answered
2. ~~What data structure is realtime location using that causes loading?~~ ✓ Answered
3. ~~Why does switching tabs trigger a data reload?~~ ✓ Answered

## Decisions Made

- **Solution approach**: Use separate state for dept and group (Option 1)
- **Rationale**: Each tab maintains its own selection, no loading when switching, maintains single TreeSelector component

## Status

**Currently in Phase 3** - Solution designed, ready to implement
