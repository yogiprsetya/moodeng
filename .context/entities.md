# Editor

User setting

```
{
  "clientId": "uuid",
  "theme": "string",
  "darkMode": "boolean",
  "workspace": "string", -> editor name
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
