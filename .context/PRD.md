# 1. Product Overview

## Product Name:

- Moodeng: (e.g., “A fast, offline-first note-taking app that syncs only when needed.”)
- Target Users: (e.g., students, researchers, developers, writers)
- Goal: Enable users to capture FAST, organize, and access notes instantly—even without internet—while ensuring reliable background sync across devices.

# 2. Key Principles (Local-First)

- Offline-first: All essential actions—create, edit, delete, search—work without internet
- Local storage as source of truth: Server is backup/sync layer, not primary
- Conflict-free sync: Automatic background sync with deterministic conflict resolution (CRDT or last-writer-wins)
- User ownership of data: Exportable, readable formats (Markdown, JSON)
- Fast interaction: Zero UI lag, instant load

# 3. Core Features

## 3.1 Notes

- Create, edit, delete notes locally
- Rich text format (bold, italic, checklist, headings)
- Markdown-compatible editing
- Auto-save with version history

## 3.2 Organization

- Folders / tags
- Pin note
- Favorite notes
- Search (instant local indexing)
- Filters (by tag, modified date, type)
- Custom notes types

## 3.3 Sync

- Background sync when user trigger
- Conflict resolution rules: text handled with CRDT

## 3.4 Local Storage

- Local database: IndexedDB (Web)
- Downloadable

## 3.5 Cross-Platform

- Web (PWA)
- Mobile friendly

# 4. Non-Functional Requirements

## Performance:

- App loads in < 200ms
- Search returns results in < 50ms
- Local DB durability: No data loss during sudden shutdown.

## Sync reliability:

- Sync must not block user edits
- Retry mechanism with exponential backoff
