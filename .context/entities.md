# Workspace

Personal user setting

```
{
  "clientId": "uuid",
  "theme": "string",
  "darkmode": "boolean",
  "title": "string", -> editor name
}
```

# Notes

Group of notes

```
{
  "id": "uuid",
  "title": "string",
  "content": "string or CRDT payload",
  "folderId": "uuid | null",
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "deleted": false,
  "syncStatus": "pending | synced | conflicted",
  "icon": "string",
  "labelColor": string,
}
```

# Collection

Folder to group a notes

```
{
  "id": "uuid",
  "name": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "deleted": false,
  "syncStatus": "pending | synced | conflicted",
  "icon": "string",
  "labelColor": string,
}
```
