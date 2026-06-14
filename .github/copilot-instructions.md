# MytvPanel Project Guidelines

## Architecture & Tech Stack

- **Framework**: Angular 21 with SSR (`@angular/ssr`, `express`).
- **UI Components**: Angular Material.
- **Internationalization (i18n)**: `@ngx-translate/core` with translation files located in `public/i18n/`.
- **Styling**: SCSS (e.g., `styles.scss`, component-specific `.css` or `.scss`).
- **Structure**: Core application logic and modules are under `src/app/` (e.g., `epg`, `player`, `subscribe`, `theme`, `ui`).

## Build and Test

- **Install Dependencies**: `npm install`
- **Development Server**: `npm start` or `ng serve`
- **Build**: `npm run build` or `ng build`
- **Test**: `npm run test` or `ng test`
- **Run SSR**: `npm run serve:ssr:mytv-panel`

## Code Style & Conventions

- Use Standalone Components (Angular 14+ feature, default in recent versions) or follow the existing module structure if standard `NgModule`s are used.
- Rely on RxJS for reactive programming and state management where applicable.
- For translating UI text, inject `TranslateService` from `@ngx-translate/core` and use the `translate` pipe in templates.
- Ensure any browser-specific APIs (like `window`, `document`) are used conditionally when running via Server-Side Rendering (SSR) to prevent Node.js errors. Use `isPlatformBrowser` from `@angular/common` if necessary.

## Pitfalls & Notes
- Since SSR is enabled (`main.server.ts`, `server.ts`), ensure dependencies and third-party libraries are SSR-compatible.
- Angular CLI generated project. Use `ng generate component <name>` for scaffolding to match the project's setup.
