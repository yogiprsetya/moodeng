# Browser API Documentation

This module provides a local database system for storing and managing notes, collections, and workspace settings in the browser. It uses IndexedDB, which is a built-in browser database that stores data locally on the user's device.

## Overview

The browser API is organized into several parts:

1. **DBDriver** - Handles the connection to IndexedDB
2. **Repositories** - Handle data operations for different types of data
3. **LocalDB** - Main interface that brings everything together
4. **DBMaintenance** - Tools for maintaining the database

## Files

Location `src/api/browser`.

### db-driver.ts

This file contains the `DBDriver` class. It manages the connection to IndexedDB.

**What it does:**

- Opens a connection to an IndexedDB database named "moodeng-db"
- Creates three storage areas (called "object stores"):
  - `workspace` - Stores workspace settings
  - `notes` - Stores notes with indexes for fast searching
  - `collections` - Stores collections with indexes for fast searching
- Makes sure the database is ready before other code tries to use it

**Key features:**

- The database version is 1
- Notes store has indexes on: folderId, deleted, syncStatus, isPinned, updatedAt
- Collections store has indexes on: deleted, syncStatus, updatedAt
- Workspace store holds a single workspace object

### db.ts

This file contains the `LocalDB` class, which is the main interface you use to interact with the database.

**What it does:**

- Provides a simple way to work with notes, collections, and workspace settings
- Delegates work to specialized repository classes
- Exports a ready-to-use instance called `db` that you can import and use

**Main methods:**

**Workspace operations:**

- `getWorkspace()` - Get workspace settings
- `saveWorkspace(workspace)` - Save workspace settings
- `deleteWorkspace()` - Delete workspace settings

**Note operations:**

- `createNote(note)` - Create a new note
- `getNote(id)` - Get a note by its ID
- `getAllNotes(includeDeleted)` - Get all notes (optionally including deleted ones)
- `getNotesByFolder(folderId)` - Get all notes in a specific folder
- `getPinnedNotes()` - Get all pinned notes
- `updateNote(id, updates)` - Update a note
- `deleteNote(id, hardDelete)` - Delete a note (soft delete by default)
- `restoreNote(id)` - Restore a deleted note

**Collection operations:**

- `createCollection(collection)` - Create a new collection
- `getCollection(id)` - Get a collection by its ID
- `getAllCollections(includeDeleted)` - Get all collections (optionally including deleted ones)
- `updateCollection(id, updates)` - Update a collection
- `deleteCollection(id, hardDelete)` - Delete a collection (soft delete by default)
- `deleteCollectionWithNotes(id, cascadeDelete, hardDelete)` - Delete a collection and handle its notes using CASCADE or SET NULL strategy
- `restoreCollection(id)` - Restore a deleted collection

**Utility methods:**

- `getPendingSyncNotes()` - Get notes that need to be synced
- `getPendingSyncCollections()` - Get collections that need to be synced
- `clearAll()` - Clear all data from the database (deprecated, use `db.maintenance.clearAll()` instead)

### notes-repository.ts

This file contains the `NotesRepository` class. It handles all operations related to notes.

**What it does:**

- Creates, reads, updates, and deletes notes
- Supports soft deletes (marks notes as deleted without removing them)
- Supports hard deletes (permanently removes notes)
- Can find notes by folder, find pinned notes, and find notes that need syncing

**Key features:**

- Uses IndexedDB indexes for fast searching
- Automatically filters out deleted notes unless you ask for them
- Updates the `updatedAt` timestamp when you modify a note

### collections-repository.ts

This file contains the `CollectionsRepository` class. It handles all operations related to collections.

**What it does:**

- Creates, reads, updates, and deletes collections
- Supports soft deletes and hard deletes
- Can find collections that need syncing

**Key features:**

- Uses IndexedDB indexes for fast searching
- Automatically filters out deleted collections unless you ask for them
- Updates the `updatedAt` timestamp when you modify a collection

### Delete Collection Mechanism

When deleting a collection that contains notes, you have two options:

#### 1. Simple Delete (`deleteCollection`)

This method only deletes the collection itself. **It does not handle notes** that belong to the collection. If you use this method, notes will still reference the deleted collection via their `folderId`.

```typescript
// Soft delete a collection (default)
await db.deleteCollection("collection-id");

// Hard delete a collection (permanently remove)
await db.deleteCollection("collection-id", true);
```

#### 2. Delete with Notes Handling (`deleteCollectionWithNotes`)

This method deletes the collection and handles all notes in the collection using one of two strategies:

**CASCADE Strategy** (`cascadeDelete = true`):

- Deletes all notes that belong to the collection
- Notes are permanently removed (soft deleted)
- Use this when you want to completely remove the collection and all its contents

**SET NULL Strategy** (`cascadeDelete = false`):

- Moves all notes to the root folder by setting their `folderId` to `null`
- Notes are preserved but no longer belong to any collection
- Use this when you want to keep the notes but remove the collection

```typescript
// CASCADE: Delete collection and all its notes
await db.deleteCollectionWithNotes("collection-id", true);

// SET NULL: Delete collection but move notes to root
await db.deleteCollectionWithNotes("collection-id", false);

// Hard delete with CASCADE (permanently remove collection and notes)
await db.deleteCollectionWithNotes("collection-id", true, true);
```

**Parameters:**

- `id` (string) - The collection ID to delete
- `cascadeDelete` (boolean) - If `true`, CASCADE delete all notes. If `false`, SET NULL (move notes to root)
- `hardDelete` (boolean, optional) - If `true`, hard delete the collection. Defaults to `false` (soft delete)

**Important Notes:**

- The CASCADE strategy soft-deletes notes (they can be restored)
- The SET NULL strategy preserves all notes and only changes their `folderId` to `null`
- Both strategies handle notes before deleting the collection
- Use `deleteCollectionWithNotes` when you want to ensure notes are properly handled

### workspace-repository.ts

This file contains the `WorkspaceRepository` class. It handles workspace settings.

**What it does:**

- Gets workspace settings (creates default settings if none exist)
- Saves workspace settings
- Deletes workspace settings

**Key features:**

- Automatically creates a default workspace if one doesn't exist
- The default workspace includes:
  - A unique client ID
  - Default theme settings
  - A default title
  - No last note ID

### db-maintenance.ts

This file contains the `DBMaintenance` class. It provides tools for maintaining the database.

**What it does:**

- `clearAll()` - Removes all data from all stores (workspace, notes, and collections)

## How to Use

### Basic Usage

```typescript
import { db } from "~/api/browser/db";

// Get workspace settings
const workspace = await db.getWorkspace();

// Create a note
const newNote = await db.createNote({
  id: "note-1",
  title: "My Note",
  content: "Note content",
  // ... other note properties
});

// Get all notes
const allNotes = await db.getAllNotes();

// Update a note
await db.updateNote("note-1", { title: "Updated Title" });

// Delete a note (soft delete)
await db.deleteNote("note-1");

// Restore a deleted note
await db.restoreNote("note-1");
```

### Advanced Usage

```typescript
// Get notes in a specific folder
const folderNotes = await db.getNotesByFolder("folder-id");

// Get pinned notes
const pinnedNotes = await db.getPinnedNotes();

// Get notes that need syncing
const pendingNotes = await db.getPendingSyncNotes();

// Hard delete a note (permanently remove)
await db.deleteNote("note-1", true);

// Delete a collection with CASCADE (deletes all notes in collection)
await db.deleteCollectionWithNotes("collection-id", true);

// Delete a collection with SET NULL (moves notes to root)
await db.deleteCollectionWithNotes("collection-id", false);

// Clear all data
await db.maintenance.clearAll();
```

## Important Concepts

### Soft Delete vs Hard Delete

- **Soft delete**: Marks an item as deleted but keeps it in the database. You can restore it later. This is the default behavior.
- **Hard delete**: Permanently removes an item from the database. It cannot be restored.

### Indexes

Indexes make searching faster. The database uses indexes on:

- `folderId` - To quickly find notes in a folder
- `deleted` - To quickly filter out deleted items
- `syncStatus` - To quickly find items that need syncing
- `isPinned` - To quickly find pinned notes
- `updatedAt` - To quickly sort by update time

### Database Initialization

The database initializes automatically when you create a `DBDriver` instance. The `LocalDB` class creates a `DBDriver` for you, so you don't need to worry about initialization. The database will be ready when you call any method.

## Error Handling

All methods return Promises. If something goes wrong, they will reject with an error. Make sure to handle errors:

```typescript
try {
  const note = await db.getNote("note-id");
} catch (error) {
  console.error("Failed to get note:", error);
}
```

## Notes

- The database is stored locally in the user's browser
- Data persists even after the browser is closed
- The database is specific to the domain where the app is running
- If you need to clear all data, use `db.maintenance.clearAll()`
