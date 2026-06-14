# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Angular 21 web panel for MyTV - an IPTV/streaming application. This is a **configuration interface** that communicates with a backend Android TV app via REST API to manage streaming sources, EPG data, player settings, themes, and more.

## Essential Commands

```bash
# Development
npm install                          # Install dependencies
npm start                           # Start dev server on port 10591
ng serve                            # Alternative to npm start

# Building
npm run build                       # Production build
ng build                           # Alternative
ng build --watch --configuration development  # Watch mode

# Testing
npm test                            # Run unit tests with Karma
ng test                             # Alternative

# SSR (if needed)
npm run serve:ssr:mytv-panel       # Run server-side rendering build
```

## Architecture

### Frontend-Backend Communication Pattern

This Angular app is a **remote control panel** that communicates with an Android TV backend:

- **API Layer**: `src/app/api.ts` defines all API endpoints, TypeScript interfaces, and enums
- **Request Layer**: `src/app/request.ts` provides `RequestUtil` wrapper around Angular HttpClient
- **API Prefix**: Configured in `api.ts` as `const prefix = '/'` (change for remote backend)
- **State Management**: `ConfigsService` uses Angular signals for reactive config state

All backend interactions follow this pattern:
```typescript
// Define endpoint in AppApi object (api.ts)
AppApi.getConfigs() => GET /api/configs
AppApi.changeConfig(config) => POST /api/configs

// Use in components
const configs = await AppApi.getConfigs();
await AppApi.changeConfig(updatedConfig);
```

### Configuration System

The core of this app revolves around `AppConfigs` interface (450+ lines in `api.ts`):

- **Single Source of Truth**: `ConfigsService` maintains app state via signal
- **Persistence**: Changes POST to `/api/configs`, then refresh via GET
- **Pattern**: Components inject `ConfigsService`, read from `configsService.data()` signal, update via `configsService.updateData()`

When modifying settings:
1. Read the current config from `ConfigsService`
2. Modify the relevant fields
3. Call `configsService.updateData()` to persist and refresh

### Key Domain Models

All TypeScript interfaces and enums are in `src/app/api.ts`:

- **IptvSource**: Subscription sources (remote URLs, Xtream, Stalker, local files)
- **EpgSource**: Electronic Program Guide sources
- **VideoPlayerCore**: MEDIA3, IJK, VLC player options
- **AppConfigs**: 100+ configuration fields for the entire TV app
- **KeyDownAction**: Remote control button mappings

## Internationalization (i18n)

- **Library**: `@ngx-translate/core`
- **Supported Languages**: English (`en`), Chinese (`zh`), Arabic (`ar`)
- **Translation Files**: `public/i18n/en.json`, `zh.json`, `ar.json`
- **RTL Support**: Arabic automatically sets `dir="rtl"` on document root
- **Usage**: Inject `TranslateService`, use `translate` pipe in templates or `.instant()` / `.get()` in components

When adding new UI text:
1. Add translation keys to all three JSON files in `public/i18n/`
2. Use dot notation for organization (e.g., `PLAYER.CORE`, `EPG.ENABLE`)
3. Test with all three languages, especially Arabic for RTL layout

## Component Organization

Components are feature-organized with standalone pattern (no NgModules):

```
src/app/
├── home/          - Main dashboard, add sources, device info
├── general/       - Boot settings, startup screen, PIP
├── subscribe/     - Manage IPTV subscription sources
├── epg/           - EPG source management, refresh settings
├── player/        - Video player configuration (core, decoder, display)
├── ui/            - UI preferences (logos, previews, density, fonts)
├── theme/         - Theme customization (backgrounds, textures)
├── control/       - Remote control key mappings
├── network/       - Network retry settings
├── webview/       - WebView core selection
├── update/        - Update channel settings
├── backup/        - Cloud sync (GitHub/Gitee Gist, WebDAV)
├── debug/         - Debug flags (FPS, metadata, grids)
├── log/           - Application log viewer with pagination
└── common/        - Shared components (textarea-with-lines)
```

## SSR Considerations

This app has Angular SSR enabled but is primarily client-side:

- **Platform Checks**: Use `isPlatformBrowser(this.platformId)` before accessing `window`, `localStorage`, `document`
- **Lifecycle**: Most components initialize data in `ngOnInit()` or constructor with platform guards
- **Static Output**: Configured with `"outputMode": "static"` and `"ssr": false` in `angular.json`

When adding browser APIs:
```typescript
constructor(@Inject(PLATFORM_ID) private platformId: Object) {
  if (isPlatformBrowser(this.platformId)) {
    // Safe to use window, localStorage, etc.
  }
}
```

## Development Port

The dev server runs on **port 10591** (configured in `angular.json`). This non-standard port avoids conflicts with typical Angular apps and matches the backend API port expectation.

## Testing

- **Framework**: Jasmine + Karma
- **Browser**: Chrome (via karma-chrome-launcher)
- **Config**: `tsconfig.spec.json`, `karma.conf.js` (if present)
- **Pattern**: `*.spec.ts` files alongside components

## Common Patterns

### Dialog Components

Several features use Material dialogs:
- `epg-source-dialog`, `epg-threshold-dialog`
- `subscribe-source-dialog`, `hidden-group-dialog`

These are opened via `MatDialog.open()` and return data via `MatDialogRef`.

### Form Handling

Forms use Angular Material components + `[(ngModel)]` for two-way binding:
- `MatFormField` + `MatInput` for text inputs
- `MatSelect` for dropdowns (with enum values)
- `MatCheckbox` / `MatRadio` for boolean/choice fields
- `MatSnackBar` for success/error notifications

### Responsive Design

Uses Angular CDK `BreakpointObserver` to detect small screens:
```typescript
breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Small, '(max-width: 600px)'])
```

## Style Conventions

- **Component Styles**: Use `.css` or `.scss` files alongside `.component.ts`
- **Global Styles**: `src/styles.scss`
- **Material Theming**: Dark mode applied via `.dark-mode` class on `<body>`
- **Theme Attribute**: `data-theme="dark"` on `<html>` element
