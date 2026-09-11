# Change History

## [2026-04-20]

### src/constants/SortingOptions.js
- **Old Behavior**: `DisplayOrder` was sorted globally, but `0` was incorrectly treated as "no order" and placed at the end. Metals were not grouped by their available display orders, leading to split groups if display orders were interleaved.
- **New Behavior**: 
    1. `DisplayOrder: 0` is excluded from the normal numeric sort.
    2. Items with `DisplayOrder > 0` are sorted sequentially (1, 2, 3...) and fall back to metal priority.
    3. `DisplayOrder: 0` items are then injected right after the first occurrence of their respective metal group (to keep them with their group). Multiple zero items for the same group are inserted together preserving original sequence.
    4. "Orphan" zero items (where the metal group has no items with DisplayOrder > 0) are pushed to the end of the sorted list, sorted among themselves by metal priority.
- **Reason for change**: User requirement to fix sorting of `0` and ensure metals are grouped based on their earliest display order priority.
