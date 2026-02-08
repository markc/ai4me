# CLAUDE.md

## Project Overview

ai4me is a Laravel 12 + Inertia 2 + React 19 application featuring:
- Dual sidebar layout (ported from rentanet)
- ChatGPT-style AI chat using the Laravel AI SDK with Anthropic Claude
- Reusable admin datatables via TanStack Table

## Tech Stack

- PHP 8.4+, Laravel 12, Inertia 2
- React 19, TypeScript, Tailwind CSS 4
- Laravel AI SDK (`laravel/ai`) with Anthropic provider
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

- Layout: Dual sidebar with oklch color schemes (crimson/stone/ocean/forest/sunset)
- Chat: SSE streaming via `/chat/stream`, conversations persisted per-user
- Theme: 5 color schemes + dark/light mode, persisted to localStorage

## Environment

- `ANTHROPIC_API_KEY` — required
- Default provider: `anthropic` in `config/ai.php`

## Conventions

- React components in `resources/js/components/`
- Pages in `resources/js/pages/` (Inertia file-based routing)
- CSS custom properties in `resources/css/rentanet.css`
- Theme state managed via React context + localStorage
