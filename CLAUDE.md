# CLAUDE.md

Guidance for AI assistants (and humans) working in this repository.

## Project Overview

`nilslutz.de` is the personal portfolio & blog of Nils Lutz (SAP Solution Architect).
It is a statically-generated marketing/content site: case studies and notes are
authored as MDX files ("Content as Code") and rendered through the Next.js App Router.
Deployed on Vercel. Design language is "Nordic Clean".

## Tech Stack

- **Framework**: Next.js 16 (App Router, React 19, React Server Components)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4 (CSS-first config in `app/globals.css`, no `tailwind.config.js`) + `clsx` + `tailwind-merge` (via the `cn()` helper)
- **Content**: MDX via `next-mdx-remote/rsc`, frontmatter parsed with `gray-matter`
- **Syntax highlighting**: `shiki` + `rehype-pretty-code` (incl. custom CAP `cds` / `abapcds` grammars)
- **Animation**: `framer-motion`
- **Theming**: `next-themes` (light/dark/system, class-based)
- **Icons**: `lucide-react`
- **Analytics**: `@vercel/analytics` + `@vercel/speed-insights`
- **Node**: `>=24`

## Commands

```bash
npm install            # install dependencies
npm run dev            # start dev server (http://localhost:3000)
npm run build          # production build (run this to verify before committing)
npm start              # serve the production build
npm run lint           # ESLint (eslint-config-next: core-web-vitals + typescript)
npm test               # Vitest unit tests (run once)
npm run test:watch     # Vitest in watch mode
npm run test:e2e       # Playwright E2E smoke tests (needs: npx playwright install chromium)
npm run format         # Prettier write across the repo
npm run format:check   # Prettier check (CI-style, no writes)
npm run deploy         # vercel --prod
```

### Testing

- **Unit (Vitest)**: co-located `*.test.ts` next to the code under test (e.g. `lib/content.test.ts`,
  `lib/utils.test.ts`). Runs in a Node environment; `@/*` alias is wired in `vitest.config.ts`.
- **E2E (Playwright)**: smoke specs in `e2e/*.spec.ts` (route 200s + chrome, content nav, MDX code
  highlighting, theme toggle). Config in `playwright.config.ts` boots a production build
  (`next build && next start`) on port 3000. Install browsers first with
  `npx playwright install chromium`.
- Always verify changes with `npm run build`, `npm run lint`, and `npm test`. Run `npm run test:e2e`
  for UI-affecting changes.

## Directory Structure

```
app/                       # Next.js App Router routes
  layout.tsx               # Root layout: fonts, ThemeProvider, global metadata, particle bg
  page.tsx                 # Home page
  globals.css              # Tailwind import + @theme tokens + light/dark CSS variables
  robots.ts, sitemap.ts    # SEO route handlers
  about/, contact/, tools/ # Static pages (some with co-located metadata.ts)
  legal-notice/, privacy-policy/
  work/page.tsx            # Case studies index
  work/[slug]/page.tsx     # Case study detail (generateStaticParams + generateMetadata)
  notes/page.tsx           # Notes (blog) index
  notes/[slug]/page.tsx    # Note detail (generateStaticParams + generateMetadata)
components/
  ui/                      # Reusable, generic components (navbar, footer, mdx-content, theme, effects)
  specialized/             # Domain-specific, non-reusable sections (hero, services, tech-stack, case-study-list, featured-work)
content/
  profile.ts               # Site owner profile data (name, role, bio, socials, CTAs)
  case-studies/*.mdx       # Case study content
  notes/*.mdx              # Blog/note content
lib/
  content.ts               # MDX loaders + CaseStudy / Note types (filesystem reads at build time)
  utils.ts                 # cn() class-merge helper
  shiki-config.ts          # Custom language registration (cds, abapcds)
  *.tmLanguage.json        # TextMate grammars for CAP CDS / ABAP CDS
hooks/                     # Client React hooks (e.g. use-konami-code)
public/                    # Static assets (og-image, etc.)
```

## Conventions

### Code style (enforced by Prettier — see `.prettierrc`)

- **No semicolons**, single quotes, `printWidth` 120, 2-space indent, ES5 trailing commas.
- JSX uses double quotes (`jsxSingleQuote: false`), always parenthesize arrow params.
- `prettier-plugin-tailwindcss` auto-sorts Tailwind class lists — let it.

### Imports & paths

- Use the `@/*` path alias (maps to repo root) — e.g. `import { cn } from '@/lib/utils'`.

### Components

- Server Components by default. Add `'use client'` only when you need state/effects/browser APIs (e.g. `case-study-list.tsx`, `theme-toggle.tsx`, hooks).
- Put reusable/generic components in `components/ui/`; one-off page sections in `components/specialized/`.
- Compose Tailwind classes with `cn(...)` (clsx + tailwind-merge), not string concatenation.
- Use theme tokens (`bg-background`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `border-border`, etc.) rather than raw colors, so light/dark mode works. Tokens are defined in `app/globals.css`.

### Routing & data

- Content is read from the filesystem **at build time** via `lib/content.ts`; the site is statically generated.
- Dynamic routes (`work/[slug]`, `notes/[slug]`) must implement `generateStaticParams` and `generateMetadata`.
- `params` is a `Promise` in Next.js 16 — `await` it (e.g. `const { slug } = await params`).

## Content Authoring

Add MDX files to the relevant directory; the slug is the filename (without `.mdx`).

**Case study** — `content/case-studies/<slug>.mdx`:

```yaml
---
title: 'Project Title'
summary: 'Short description...'
tags: ['CAP', 'BTP', 'Architecture'] # used by client-side filter; see filters list in case-study-list.tsx
period: '2024'
role: 'Solution Architect'
stack: ['Node.js', 'HANA']
featured: true # featured items sort first
metrics: ['-30% Costs'] # optional
links: { github: '...', demo: '...' } # optional
---
```

**Note (blog)** — `content/notes/<slug>.mdx`:

```yaml
---
title: 'Article Title'
summary: 'Teaser...'
date: '2024-03-20' # YYYY-MM-DD, used for descending sort
tags: ['Architecture']
---
```

Code blocks support standard languages plus the custom `cds` / `abapcds` (CAP) grammars
registered in `lib/shiki-config.ts` and `components/ui/mdx-content.tsx`. To add another
language, register it in both places.

When editing the `CaseStudy` / `Note` shape, update the types **and** all loaders in `lib/content.ts`.

## Git & Releases

- **Conventional Commits** are required — they drive the changelog and version bumps.
  Allowed types (see `.versionrc.json`): `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`.
- Releases use `standard-version`: `npm run release` (auto), or `release:patch` / `release:minor` / `release:major`. This updates `CHANGELOG.md`, bumps `package.json`, and tags `chore(release): x.y.z`.
- Do **not** hand-edit `CHANGELOG.md` or the version in `package.json` — let `standard-version` manage them.

## Licensing Note

Code is MIT. Content (posts, case studies, notes, images) is **CC BY-NC-SA 4.0**.
Keep content and code distinct, and don't relicense content.
