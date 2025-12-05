# Tech stack

## Use:

- Vite
- Tailwind
- Radix
- TanStack Route
- Lucide Icon
- Zustand

## Avoid

- Redux
- Axios
- SASS

# Architecture

- Use domain-driven folder structure
- API handlers must be in /src/service
- Avoid tailwind arbitary css classname
- Done over styling

# Coding style

- Use functional programming where possible
- Never generate code without type safety
- Use hook
- Prefer kebab-case for file and folder naming

# Patterns

- Use repository pattern for DB
- Use event-driven design for background jobs

# Notes

- Project is micro SaaS: focus on simplicity

## Routes

- / -> home main
- /n/:id -> notes
