# Tech stack

## Use:

- Vite
- Tailwind
- Radix
- TanStack Route
- Lucide Icon
- Zustand
- Shadcn

## Avoid

- Redux
- Axios
- SASS

# Architecture

- Use domain-driven folder structure
- API handlers must be in /src/service
- Avoid tailwind arbitary css classname
- Done over styling

# Coding Style

- Use functional programming where possible
- Never generate code without type safety
- Use hook
- Prefer kebab-case for file and folder naming
- Avoid `import * as React from "react"`

# Patterns

- Use repository pattern for DB
- Use event-driven design for background jobs

# Notes

- Project is micro SaaS: focus on simplicity

## Routes

- / -> home main
- /n/:id -> notes

## Folder Structure

- src/routes -> pages
- src/components/ui -> atomic component (e.g, button, input)
- src/components/layout -> layout level UI (e.g, navbar)
- src/adapters -> a bridge between two incompatible interfaces
- src/services/browser -> local fisrt storage
- src/services/firebase -> firebase query declaration
- .docs/ -> technical documentation
