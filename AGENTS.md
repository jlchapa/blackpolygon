The **brain** project contains browser-based mini games built with plain HTML, CSS and JavaScript. Each game lives in its own folder under `brain/`. When adding new features or games, keep the user experience modern and minimal.

## Environment Setup
Use a recent LTS version of Node.js (18 or newer) to develop the project. We rely only on standard web technologies, so no build step is required. To serve files locally during development you can run a simple static server, for example:

```bash
npx serve brain
```

This starts a local server at `http://localhost:3000` so you can open the games and pages from a single origin.

## Recommended Technologies
- Vanilla JavaScript with Web Components for reusable UI.
- CSS custom properties and flexbox/grid for layout.
- Web Audio API for synthesised sounds.
- Use `localStorage` for persisting small pieces of state such as theme and high scores.

These tools keep the code small and easy to maintain while enabling state of the art single page applications without heavy frameworks.

## UX Guidelines
All pages should follow a clean and modern style:
- Spacious layouts using responsive units.
- Clear typography with adequate contrast.
- Support both light and dark themes controlled by the Settings page. Respect the user's saved preference on every page.
- Minimal distractions and centered game components.

Ensure that any new feature or game keeps these principles in mind.
