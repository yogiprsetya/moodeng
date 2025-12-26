# Anti-Patterns Report

This document identifies anti-patterns found in the codebase that should be addressed to improve code quality, maintainability, and performance.

## 1. Performance Anti-Patterns

### 1.1 All Theme CSS Files Loaded Unconditionally

**Location:** `src/main.tsx:3-9`

**Issue:** All theme CSS files are imported and loaded regardless of which theme is active. This increases initial bundle size and load time.

```typescript
import "./styles/index.css";
import "./styles/theme-miro.css";
import "./styles/theme-lofi.css";
import "./styles/theme-nord.css";
import "./styles/theme-tokyo-night.css";
import "./styles/theme-valentine.css";
import "./styles/theme-winter.css";
```

**Impact:**

- Larger initial bundle size
- Unnecessary CSS parsing
- Slower initial load time

**Recommendation:**

- Use dynamic imports to load themes conditionally based on user selection
- Or use CSS custom properties with theme switching instead of separate CSS files
- Consider using a single CSS file with CSS variables for theming

---

### 1.2 Unnecessary Full Notes Reload After Updates

**Location:** `src/components/editor/index.tsx:46, 94`

**Issue:** After updating note title or folder, `loadNotes()` is called to reload all notes. This is inefficient and can cause performance issues with large datasets.

```typescript
await updateNote(noteId, {
  title: trimmedTitle,
  updatedAt: Date.now(),
});
// Reload notes to update sidebar
await loadNotes(); // ❌ Unnecessary full reload
```

**Impact:**

- Unnecessary database queries
- Re-rendering of entire sidebar
- Performance degradation with many notes

**Recommendation:**

- Update the Zustand store directly after successful update
- Use optimistic updates
- Only update the specific note in the store without reloading all notes

---

## 2. Error Handling Anti-Patterns

### 2.1 Missing Await on Async Operation

**Location:** `src/components/common/add-folder-dialog.tsx:31`

**Issue:** `createCollection` returns a Promise but is not awaited, leading to unhandled promise rejection if it fails.

```typescript
try {
  createCollection({
    // ❌ Missing await
    name: folderName.trim(),
    deleted: false,
    syncStatus: "pending",
    icon: "",
    labelColor: "",
  });
  setFolderName("");
  onOpenChange(false);
} catch (err) {
  console.error("Error creating folder:", err); // This won't catch async errors
}
```

**Impact:**

- Errors are not caught properly
- Promise rejection warnings in console
- User doesn't see error feedback
- Dialog closes even if creation fails

**Recommendation:**

```typescript
try {
  await createCollection({
    // ✅ Add await
    name: folderName.trim(),
    deleted: false,
    syncStatus: "pending",
    icon: "",
    labelColor: "",
  });
  setFolderName("");
  onOpenChange(false);
} catch (err) {
  // Error handling works correctly now
  toast.error("Failed to create folder");
}
```

---

### 2.2 Non-Null Assertion on getElementById

**Location:** `src/main.tsx:12`

**Issue:** Using non-null assertion operator (`!`) assumes the element exists, which could cause runtime errors.

```typescript
createRoot(document.getElementById("root")!).render(  // ❌ Risky
  <StrictMode>
    <AppRouter />
  </StrictMode>
);
```

**Impact:**

- Runtime error if root element doesn't exist
- Poor error message
- Harder to debug

**Recommendation:**

```typescript
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}
createRoot(rootElement).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>
);
```

---

## 3. Code Duplication Anti-Patterns

### 3.1 Duplicate Logic in Data Store

**Location:** `src/stores/data-store.ts`

**Issue:** Notes and Collections have nearly identical CRUD operations with only slight variations. This violates DRY (Don't Repeat Yourself) principle.

**Examples:**

- `loadNotes` and `loadCollections` (lines 83-93, 204-214)
- `initNotesLoad` and `initCollectionLoad` (lines 95-105, 216-226)
- `createNote` and `createCollection` (lines 107-119, 228-240)
- `updateNote` and `updateCollection` (lines 138-152, 246-260)
- `deleteNote` and `deleteCollection` (lines 154-169, 262-280)
- `restoreNote` and `restoreCollection` (lines 171-185, 294-308)

**Impact:**

- Code maintenance burden
- Bug fixes need to be applied in multiple places
- Inconsistencies between similar operations
- Larger bundle size

**Recommendation:**

- Extract common patterns into generic helper functions
- Consider using a generic repository pattern
- Use TypeScript generics to create reusable store actions

---

### 3.2 Similar Repository Patterns

**Location:** `src/api/browser/notes-repository.ts` and `src/api/browser/collections-repository.ts`

**Issue:** NotesRepository and CollectionsRepository have nearly identical code structures with only entity types differing.

**Impact:**

- Code duplication
- Maintenance overhead
- Risk of inconsistencies

**Recommendation:**

- Create a base `Repository<T>` class with common operations
- Use generics to handle different entity types
- Only implement entity-specific logic in subclasses

---

### 3.3 Duplicate Array Update Pattern

**Location:** `src/stores/data-store.ts` (multiple locations)

**Issue:** The pattern for updating an item in an array is repeated throughout the store:

```typescript
const { notes } = get();
const index = notes.findIndex((n) => n.id === id);
if (index !== -1) {
  const updatedNotes = [...notes];
  updatedNotes[index] = updated;
  set({ notes: updatedNotes });
} else {
  set({ notes: [...notes, updated] });
}
```

This pattern appears in:

- `getNote` (lines 121-135)
- `updateNote` (lines 138-152)
- `restoreNote` (lines 171-185)
- `getCollection` (lines 242-244) - different pattern
- `updateCollection` (lines 246-260)
- `restoreCollection` (lines 294-308)

**Recommendation:**

- Extract to helper functions: `updateItemInArray`, `addItemToArray`, `removeItemFromArray`
- Or use Immer for immutable updates
- Consider using Zustand's built-in patterns for array updates

---

## 4. React Anti-Patterns

### 4.1 Missing Dependencies in useEffect

**Location:** `src/components/editor/markdown-editor.tsx:30`

**Issue:** ESLint disable comment for exhaustive deps suggests missing dependencies.

```typescript
useEffect(() => {
  if (value !== localValue) {
    setLocalValue(value);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [value]);
```

**Impact:**

- Potential stale closure issues
- Unpredictable behavior
- Hides potential bugs

**Recommendation:**

- Include all dependencies or refactor to avoid the need for the disable
- Use a ref if `localValue` comparison is intentional

---

### 4.2 Missing Await in useEffect

**Location:** `src/routes/index.tsx:24` and `src/components/editor/index.tsx:31`

**Issue:** Async functions called in useEffect without proper handling.

```typescript
useEffect(() => {
  if (noteId && !note) {
    getNote(noteId); // ❌ Not awaited, no error handling
  }
}, [noteId, note, getNote]);
```

**Impact:**

- Unhandled promise rejections
- No error feedback to user
- Potential race conditions

**Recommendation:**

```typescript
useEffect(() => {
  let cancelled = false;

  const loadNote = async () => {
    if (noteId && !note) {
      try {
        await getNote(noteId);
      } catch (err) {
        if (!cancelled) {
          toast.error("Failed to load note");
        }
      }
    }
  };

  loadNote();

  return () => {
    cancelled = true;
  };
}, [noteId, note, getNote]);
```

---

### 4.3 Potential Infinite Loop in useEffect

**Location:** `src/components/editor/markdown-editor.tsx:26-31`

**Issue:** The useEffect compares `value` with `localValue` but doesn't include `localValue` in dependencies, which could lead to issues.

```typescript
useEffect(() => {
  if (value !== localValue) {
    setLocalValue(value);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [value]);
```

**Recommendation:**

- Use a ref to track previous value if comparison is needed
- Or simplify to just sync when value prop changes
- Consider using `useMemo` or `useRef` for controlled input patterns

---

## 5. State Management Anti-Patterns

### 5.1 Inefficient Array Updates

**Location:** `src/stores/data-store.ts` (multiple locations)

**Issue:** Creating new arrays with spread operator even when item doesn't exist:

```typescript
if (index !== -1) {
  const updatedNotes = [...notes];
  updatedNotes[index] = updated;
  set({ notes: updatedNotes });
} else {
  set({ notes: [...notes, updated] }); // ❌ Spreads entire array unnecessarily
}
```

**Recommendation:**

- Use array methods more efficiently
- Consider using Immer for cleaner immutable updates
- Or use Zustand's immer middleware

---

### 5.2 Redundant State Updates

**Location:** `src/stores/data-store.ts`

**Issue:** Some operations update the store even when they don't need to (e.g., `getNote` updates store even if note is already there).

**Recommendation:**

- Only update store when necessary
- Check if update is actually needed before setting state

---

## 6. Type Safety Anti-Patterns

### 6.1 Missing Type Assertions

**Location:** Various repository files

**Issue:** IndexedDB results cast as types without proper validation:

```typescript
const notes = request.result as Note[]; // ❌ Unsafe cast
```

**Recommendation:**

- Add runtime validation/type guards
- Use zod or similar for runtime type checking
- Or create type-safe wrappers

---

## 7. Architectural Anti-Patterns

### 7.1 Repository Pattern Mixed with Facade

**Location:** `src/api/browser/db.ts`

**Issue:** LocalDB acts as both a facade and adds additional logic (history logging), which violates single responsibility.

**Recommendation:**

- Separate concerns: facade vs. cross-cutting concerns (history)
- Use decorator pattern or middleware for history logging
- Or move history logging to a service layer

---

## Summary

### High Priority

1. **Missing await on createCollection** - Causes unhandled promise rejections
2. **Unnecessary full notes reload** - Performance impact
3. **All themes loaded unconditionally** - Bundle size impact

### Medium Priority

4. **Code duplication in data-store** - Maintenance burden
5. **Duplicate repository patterns** - Maintenance burden
6. **Non-null assertion on getElementById** - Runtime safety

### Low Priority

7. **Missing useEffect dependencies** - Potential bugs
8. **Inefficient array updates** - Minor performance impact
9. **Mixed responsibilities in LocalDB** - Code organization

---

## Recommendations for Improvement

1. **Create utility functions** for common patterns (array updates, async error handling)
2. **Use generics** to reduce code duplication
3. **Implement proper error boundaries** for React error handling
4. **Add runtime type validation** for IndexedDB data
5. **Consider using Immer** for cleaner immutable state updates
6. **Implement code splitting** for themes
7. **Add comprehensive error handling** with user feedback
8. **Use TypeScript strict mode** features more effectively
9. **Consider refactoring** store structure to be more DRY
10. **Add unit tests** to catch regressions during refactoring
