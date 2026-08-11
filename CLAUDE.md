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

## Slide Text Style

Slides carry keywords, not prose: words, phrases, and taglines the audience can grasp at a glance, with the key information bolded. Full-sentence explanations go in the presenter notes (HTML comments), to be spoken aloud — never embedded in the slide body. `layout: statement` slides are the exception (their single line is the tagline). See "Slide text density" in `.claude/skills/slidev-deck/SKILL.md` for details.

Size on-slide text with the numeric scale (`text-4` = 16px, `text-5` = 20px, `text-6` = 24px), not the named one. The slide body is already 24px, so every named class from `text-xs` (12px) through `text-xl` (20px) *shrinks* text; `text-4` is the floor for anything the audience reads, including floating annotation boxes. When content overflows, make room (reflow the code across more lines, scope `--slidev-code-font-size` to the pane that needs it, drop cosmetic `<br>`, trim padding) rather than shrinking the text. See "Slide text sizing" in the skill.
