# Workspace

Personal user setting

```
{
  "clientId": uuid,
  "theme": string,
  "darkmode": boolean,
  "title": string
  "lastNoteId": null | uuid
}
```

# Notes

Group of notes

```
{
  "id": uuid,
  "title": string,
  "content": string or CRDT payload,
  "folderId": uuid | null,
  "createdAt": timestamp,
  "updatedAt": timestamp,
  "deleted": false,
  "syncStatus": pending | synced | conflicted,
  "icon": string,
  "labelColor": string,
  "isPinned": boolean
}
```

# Collection

Folder to group a notes

```
{
  "id": uuid,
  "name": string,
  "createdAt": timestamp,
  "updatedAt": timestamp,
  "deleted": false,
  "syncStatus": pending | synced | conflicted,
  "icon": string,
  "labelColor": string,
}
```

# Histories

Append-only change log for a note (audit trail / undo / sync help).

```
{
  "id": uuid,
  "noteId": uuid,
  "type": created | updated | moved | deleted | restored,
  "payload": {
    // event-specific data (e.g. { "title": "...", "content": "..." } or { "fromFolderId": uuid|null, "toFolderId": uuid|null })
  },
  "createdAt": timestamp,
  "deleted": false,
  "syncStatus": pending | synced | conflicted,
}
```
