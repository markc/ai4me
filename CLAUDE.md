# CLAUDE.md

## Project Overview

ai4me is a Laravel 12 + Inertia 2 + React 19 application featuring:
- **Dual Carousel Sidebars (DCS)** — Multi-panel sliding sidebars with glassmorphism
- ChatGPT-style AI chat with multi-provider LLM support (Anthropic, OpenAI, Gemini)
- Reusable admin datatables via TanStack Table

## Tech Stack

- PHP 8.4+, Laravel 12, Inertia 2
- React 19, TypeScript, Tailwind CSS 4
- Prism PHP (`prism-php/prism`) for LLM integration
- `@laravel/stream-react` for SSE streaming
- `streamdown` + `@streamdown/code` for markdown rendering
- `@tanstack/react-table` for datatables
- SQLite (dev), Vite 7

## Commands

```bash
composer dev                # Start server + queue + logs + Vite
npm run build               # Rebuild frontend assets
php artisan migrate         # Run migrations
php artisan migrate:fresh   # Reset database
```

## Architecture

### DCS Layout

Each sidebar has 2+ panels navigable via `< [dot·dot] >` carousel controls:
- **Left:** Navigation (panel 0), Conversations (panel 1)
- **Right:** Theme (panel 0), Usage Stats (panel 1)

Key files: `panel-carousel.tsx`, `components/panels/`, `theme-context.tsx`

### Shared Data

`HandleInertiaRequests` middleware shares `sidebarConversations` (eager) and `sidebarStats` (eager) globally. Chat page no longer passes its own conversations prop.

### Theme System

5 OKLCH color schemes (crimson/stone/ocean/forest/sunset) + dark/light mode, persisted to `base-state` localStorage key. Panel indices also persisted.

## Environment

- `ANTHROPIC_API_KEY` — required
- `OPENAI_API_KEY`, `GEMINI_API_KEY` — optional providers

## Conventions

- React components in `resources/js/components/`
- Panel components in `resources/js/components/panels/`
- Pages in `resources/js/pages/` (Inertia file-based routing)
- CSS custom properties in `resources/css/rentanet.css`
- Theme state managed via ThemeContext + localStorage
- Docs in `docs/` (standalone SPA, GitHub Pages compatible)

## TODO

### Quick wins
- [ ] Conversation search/filter in sidebar panel (currently shows latest 50, no way to find older ones)
- [ ] Message editing/deletion (no way to edit or remove individual messages)
- [ ] Conversation renaming (edit title inline from sidebar)

### Medium effort
- [ ] Usage charts on dashboard (trend lines for tokens/cost over time)
- [ ] Conversation folders/tags (organize beyond a flat list)
- [ ] User roles (admin vs regular user permissions)

### Bigger features
- [ ] Conversation branching (fork from an earlier message)
- [ ] Message pagination (currently loads all messages; will slow down for long conversations)
- [ ] API key management (per-user provider keys instead of env-only)

## Documentation

See `docs/` for full DCS pattern documentation. Viewable at `/ai4me/docs/` via the unified dev server or GitHub Pages.
