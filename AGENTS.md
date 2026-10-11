# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project

**KuberZ** — a client-only React 19 + TypeScript + Vite 8 single-page app: a
30-day ₹10,000 budget engine and "what-if" decision simulator. There is no
backend; all state persists to `localStorage`. Deployment is via Vercel's Git
integration (pushing to `main` triggers a production deploy).

## Commands

Run these from the repository root:

| Task           | Command              |
| -------------- | -------------------- |
| Dev server     | `npm run dev`        |
| Production build | `npm run build`    |
| Type-check only | `npm run typecheck` |
| Lint           | `npm run lint`       |
| Unit tests     | `npm test`           |

Always run `npm run lint` and `npm test` after code changes, and
`npm run build` (which runs `tsc -b` first) before committing.

> **Environment note (WSL + OneDrive):** if the repo lives under `/mnt/c` on
> WSL, Vite/TypeScript builds are extremely slow on the OneDrive filesystem.
> Run build/test/lint with Windows-native Node instead, e.g.:
>
> ```powershell
> powershell.exe -NoProfile -Command "Set-Location -LiteralPath 'C:\path\to\Prompt_Run'; npm run build"
> ```

## Conventions

- Components live in `src/components` (UI primitives in `src/components/ui`).
- Pure finance logic lives in `src/utils/engine.ts`; keep it free of React and
  cover changes there with tests in `src/utils/engine.test.ts`.
- Shared types are in `src/types/finance.ts`.
- Styling is Tailwind CSS v4 utility classes plus component classes in
  `src/styles/designTokens.css`. Do not add inline `style` colors; use the
  theme tokens.
- **Theming:** light/dark is driven by mirrored Tailwind CSS variables under
  `html.light` in `src/styles/theme.css`, toggled by `src/theme/ThemeProvider.tsx`
  (persisted under `kuberz_theme`, default `system`). For text that must not
  invert, use the `.text-on-accent` / `.text-on-solid` helper classes.
- Do not add comments unless they explain non-obvious intent.
- Never commit secrets. All data is local and non-sensitive.
