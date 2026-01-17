# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo for presentation slides built with Slidev. It contains multiple presentation decks, custom Slidev themes, and an Astro-based landing page.

## Repository Structure

- `/decks/` - Individual presentation decks (each is a separate pnpm package)
- `/themes/` - Custom Slidev themes (triangle, alpha, curve)
- `/packages/index/` - Astro landing page deployed to Vercel
- `/scripts/build.sh` - Build orchestration script for Vercel deployment

## Commands

### Root Level
```bash
pnpm install          # Install all dependencies
pnpm lint             # Run ESLint across the monorepo
```

### Individual Deck Development
```bash
cd decks/<deck-name>
pnpm dev              # Start Slidev dev server (port 3030)
pnpm build            # Build for production
pnpm export           # Export to PDF/PNG
```

### Full Build (Vercel)
```bash
./scripts/build.sh    # Builds all decks and index page to /dist/
```

## Technology Stack

- **Slidev**: Markdown-based presentation framework
- **Vue 3**: Component framework for custom slide components
- **Astro**: Landing page generator
- **Tailwind CSS v4**: Styling
- **pnpm workspaces**: Monorepo management

## Key Slidev Addons Used

- `slidev-addon-anipres` - Animation widget for creating animated shapes synchronized with slides
- `slidev-addon-qrcode` - QR code generation
- `slidev-addon-fancy-arrow` - Decorative arrows
- `slidev-addon-window-mockup` - Window frame mockups

## Code Style

ESLint is configured with TypeScript and Vue support. Multi-word component names are allowed in `layouts/*.vue` files.
