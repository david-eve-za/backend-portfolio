# BookTranslator Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the BookTranslator SPA frontend (Angular 18 + TypeScript + Tailwind) per the UI/UX specification, delivering in 6 incremental phases with independent deployability.

**Architecture:** Atomic design component library (20 atoms → 15 molecules → 8 organisms → 4 templates → 4 pages) with Angular Signals for client state, TanStack Query for server state, IndexedDB for offline drafts. Feature modules: dashboard, upload, translation, audio.

**Tech Stack:** Angular 18.2+, TypeScript 5.5, Tailwind CSS 3.4, RxJS 7.8, @tanstack/angular-query, idb (IndexedDB), Lucide Angular icons, ngx-virtual-scroller

**Spec:** docs/superpowers/specs/2026-09-03-book-translator-ui-design.md

## Global Constraints

- Angular 18.2+ standalone components only (no NgModules)
- Tailwind CSS via npm (no custom build step)
- Plus Jakarta Sans font self-hosted in assets/fonts/
- Lucide Angular for all icons (no emoji)
- WCAG 2.2 AA compliance mandatory
- All colors via CSS variables from design tokens
- Dark mode via `prefers-color-scheme` media query
- All async via Signals + RxJS interop
- ESLint + Prettier + Husky pre-commit
- Jest for unit tests, Cypress for E2E
- Conventional commits (feat:, fix:, chore:)

---

## Phase 1: Foundation & Design System (Week 1-2)

### Task 1.1: Install Dependencies & Configure Tailwind

**Files:**
- Modify: `frontend-service/frontend/package.json`
- Create: `frontend-service/frontend/tailwind.config.js`
- Create: `frontend-service/frontend/postcss.config.js`
- Modify: `frontend-service/frontend/src/styles.css`

**Interfaces:**
- Produces: Tailwind design tokens matching spec Section 2.1-2.4

```bash
# Step 1: Install dependencies
npm install -D tailwindcss@3.4 postcss@8.4 autoprefixer@10.4 @tailwindcss/forms @tailwindcss/typography
npm install lucide-angular @tanstack/angular-query idb ngx-virtual-scroller

# Step 2: Initialize Tailwind
npx tailwindcss init -p

# Step 3: Configure tailwind.config.js with design tokens
# Step 4: Update styles.css with @tailwind directives + CSS variables
# Step 5: Verify build: npm run build
```

### Task 1.2: Create Design Token CSS Variables

**Files:**
- Create: `frontend-service/frontend/src/assets/design-tokens.css`

**Interfaces:**
- Produces: All CSS custom properties from spec Section 2.1 (colors), 2.2 (typography), 2.3 (spacing), 2.4 (breakpoints)

```css
/* Step 1: Copy all :root variables from spec Section 2.1-2.4 */
/* Step 2: Add @media (prefers-color-scheme: dark) overrides */
/* Step 3: Import in styles.css before @tailwind base */
```

### Task 1.3: Download & Configure Plus Jakarta Sans Font

**Files:**
- Create: `frontend-service/frontend/src/assets/fonts/plus-jakarta-sans/` (woff2 files)
- Modify: `frontend-service/frontend/src/styles.css`

```bash
# Step 1: Download variable font: PlusJakartaSans[wght].woff2 from Google Fonts
# Step 2: Place in assets/fonts/plus-jakarta-sans/
# Step 3: Add @font-face in styles.css
# Step 4: Configure tailwind fontFamily.sans = ['Plus Jakarta Sans', 'system-ui', 'sans-serif']
```

### Task 1.4: Create Atomic Component Library (20 Atoms)

**Files:**
- Create: `frontend-service/frontend/src/app/shared/components/atoms/` (20 component directories)
- Each: `component.ts`, `component.html`, `component.scss`, `component.spec.ts`, `index.ts`

**Atoms to create (in order):**
1. `ButtonComponent` - variants: primary, secondary, outline, ghost, destructive, link; states: loading, disabled
2. `InputComponent` - types: text, email, password, number, search; with label, hint, error, clear
3. `SelectComponent` - single, multi, searchable; grouped options
4. `TextareaComponent` - auto-resize, char count, min/max rows
5. `CheckboxComponent` - single, indeterminate; label position
6. `RadioComponent` - group, card variant
7. `ToggleComponent` - switch, checkbox-style; sizes
8. `BadgeComponent` - default, success, warning, error, info, outline; removable
9. `AvatarComponent` - image, initials, fallback; status indicators; sizes
10. `IconComponent` - Lucide wrapper; sizes 16/20/24/32; spin/pulse
11. `TooltipComponent` - positions; 200ms show/100ms hide delay
12. `SpinnerComponent` - default, dots, bars; sizes
13. `ProgressBarComponent` - determinate/indeterminate; label position
14. `ProgressRingComponent` - determinate/indeterminate; sizes
15. `DividerComponent` - horizontal/vertical; with label
16. `CardComponent` - default, outlined, elevated; header/content/footer slots
17. `TableComponent` - striped, bordered; sortable, selectable, resizable
18. `TabsComponent` - line, enclosed, soft; keyboard nav
19. `DropdownComponent` - menu, combobox; portal positioning
20. `DialogComponent` - default, alert, confirm, form; focus trap, ESC close

```typescript
// Each atom follows this pattern:
// @Component({ selector: 'bt-<name>', standalone: true, template, style })
// export class <Name>Component { @Input() variant = 'default'; @Input() disabled = false; ... }
// Tests: render variants, states, accessibility (aria, focus)
```

### Task 1.5: Create Core State Services (Signals Stores)

**Files:**
- Create: `frontend-service/frontend/src/app/core/state/project.store.ts`
- Create: `frontend-service/frontend/src/app/core/state/queue.store.ts`
- Create: `frontend-service/frontend/src/app/core/state/ui-preferences.store.ts`

**Interfaces:**
- Produces: `ProjectStore`, `QueueStore`, `UIPreferencesStore` with signals + computed

```typescript
// project.store.ts
@Injectable({ providedIn: 'root' })
export class ProjectStore {
  private _projects = signal<Project[]>([]);
  private _currentProject = signal<Project | null>(null);
  readonly projects = this._projects.asReadonly();
  readonly currentProject = this._currentProject.asReadonly();
  readonly activeProjects = computed(() => this._projects().filter(p => !['completed','archived'].includes(p.status)));
  setProjects(projects: Project[]) { this._projects.set(projects); }
  setCurrentProject(project: Project | null) { this._currentProject.set(project); }
  // add, update, remove methods
}

// queue.store.ts - BackgroundJob[] with status, progress, SSE integration
// ui-preferences.store.ts - theme, language, sidebarOpen, splitRatio persisted to localStorage
```

### Task 1.6: Configure TanStack Query + API Client

**Files:**
- Create: `frontend-service/frontend/src/app/core/api/api-client.ts`
- Create: `frontend-service/frontend/src/app/core/api/query-client.ts`
- Modify: `frontend-service/frontend/src/app/app.config.ts`

```typescript
// api-client.ts - Axios/Fetch wrapper with interceptors, baseURL from environment
// query-client.ts - provideTanStackQuery() with queryClient, defaultOptions (staleTime: 5min)
// app.config.ts - provideHttpClient(withInterceptors), provideTanStackQuery, provideStore (signals)
```

### Task 1.7: Configure IndexedDB for Offline Drafts

**Files:**
- Create: `frontend-service/frontend/src/app/core/offline/db.ts`
- Create: `frontend-service/frontend/src/app/core/offline/draft.service.ts`

```typescript
// db.ts - idb.openDB('booktranslator', 1, { upgrade(db) { createObjectStore('drafts', { keyPath: 'id' }); createIndex('projectId', 'projectId'); createIndex('synced', 'synced'); } })
// draft.service.ts - saveDraft(), getDraft(), getDraftsByProject(), markSynced(), clearSynced()
```

### Task 1.8: Create Layout Templates (4)

**Files:**
- Create: `frontend-service/frontend/src/app/shared/components/templates/dashboard-layout.component.ts`
- Create: `frontend-service/frontend/src/app/shared/components/templates/workspace-layout.component.ts`
- Create: `frontend-service/frontend/src/app/shared/components/templates/wizard-layout.component.ts`
- Create: `frontend-service/frontend/src/app/shared/components/templates/player-layout.component.ts`

```typescript
// Each template: @Component with content projection slots
// DashboardLayout: header, sidebar, main, queue-panel (right)
// WorkspaceLayout: header, sidebar-left, main, sidebar-right, footer
// WizardLayout: header, stepper, main, footer-actions
// PlayerLayout: header, main, footer-controls
```

### Task 1.9: Update Routing for BookTranslator Routes

**Files:**
- Modify: `frontend-service/frontend/src/app/app.routes.ts`

```typescript
// Add routes:
// /projects/new -> UploadPage (WizardLayout)
// /projects/:id/translate -> TranslationPage (WorkspaceLayout)
// /projects/:id/audio -> AudiobookPage (PlayerLayout)
// Keep existing dashboard route but update to use new DashboardPage
```

### Task 1.10: Create Dashboard Page (Phase 1 Deliverable)

**Files:**
- Create: `frontend-service/frontend/src/app/features/dashboard/dashboard.page.ts` (replaces existing)
- Create: `frontend-service/frontend/src/app/features/dashboard/project-table.component.ts`
- Create: `frontend-service/frontend/src/app/features/dashboard/project-card.component.ts`
- Create: `frontend-service/frontend/src/app/features/dashboard/queue-panel.component.ts`

**Interfaces:**
- Consumes: `ProjectStore`, `QueueStore`, `ProjectApiService`
- Produces: DashboardPage with project list + queue panel

```typescript
// DashboardPage: uses DashboardLayout template
// ProjectTable: TableComponent + ChapterRow-like rows + Toolbar + Pagination + BulkActions
// ProjectCard: CardComponent + Avatar + Text + StatusBadge + ButtonGroup + ProgressBar
// QueuePanel: persistent right panel, real-time via QueueStore (SSE)
// Status badges: uploaded (gray), translating (teal), glossary-review (orange), audio-generating (purple), completed (green)
// Empty state: illustration + "Create your first project" CTA
```

---

## Phase 2: Upload & Parse (Week 2-3)

### Task 2.1: Create Upload Wizard Organism (3-Step)

**Files:**
- Create: `frontend-service/frontend/src/app/shared/components/organisms/upload-wizard.component.ts`
- Create: `frontend-service/frontend/src/app/shared/components/molecules/file-drop-zone.component.ts`
- Create: `frontend-service/frontend/src/app/shared/components/molecules/setting-panel.component.ts`

**Interfaces:**
- Consumes: `ProjectApiService` (parse endpoint)
- Produces: UploadWizardComponent with stepper state

```typescript
// Steps:
// 1. FileDropZone: drag-drop + browse, accept .pdf/.epub, max 500MB, show file info after parse
// 2. SettingPanel: Genre select, Tone select, Target language select, Advanced (collapsible)
// 3. GlossaryPreview: read-only list of auto-extracted terms with checkboxes
// Navigation: Back/Next buttons, disabled until step valid
// On complete: POST /api/projects → navigate to /projects/:id/translate
```

### Task 2.2: Implement File Parsing (Web Worker)

**Files:**
- Create: `frontend-service/frontend/src/app/core/workers/pdf-parser.worker.ts`
- Create: `frontend-service/frontend/src/app/core/workers/epub-parser.worker.ts`
- Create: `frontend-service/frontend/src/app/core/services/file-parser.service.ts`

```typescript
// pdf-parser.worker.ts - pdfjs-dist, extract text per page, postMessage progress
// epub-parser.worker.ts - epubjs, extract chapters, postMessage progress
// file-parser.service.ts - detect type, spawn worker, return { chapters: Chapter[], metadata }
// Chapter: { number, title, content, wordCount }
```

### Task 2.3: Create Upload Page

**Files:**
- Create: `frontend-service/frontend/src/app/features/upload/upload.page.ts`

```typescript
// UploadPage: uses WizardLayout template
// Contains UploadWizardComponent
// On success: ProjectStore.setCurrentProject(), navigate to translation
```

---

## Phase 3: Glossary System (Week 3-4)

### Task 3.1: Create Glossary Molecules & Organisms

**Files:**
- Create: `frontend-service/frontend/src/app/shared/components/molecules/glossary-term-card.component.ts`
- Create: `frontend-service/frontend/src/app/shared/components/organisms/glossary-sidebar.component.ts`

**Interfaces:**
- Consumes: `GlossaryApiService`, `GlossaryStore` (new)
- Produces: GlossarySidebar with tabs + term cards

```typescript
// GlossaryTermCard: inline edit (source, translation, category select, notes), conflict badge
// GlossarySidebar: SearchInput + Tabs (All/Characters/Magic/Locations/Factions/Custom) + VirtualList(GlossaryTermCard) + Add Button
// Categories: enum Character, MagicSystem, Location, Faction, Custom
// Conflict detection: same source → different translations → warning icon
```

### Task 3.2: Create Glossary Store & API Service

**Files:**
- Create: `frontend-service/frontend/src/app/core/state/glossary.store.ts`
- Create: `frontend-service/frontend/src/app/core/api/glossary.api.ts`

```typescript
// glossary.store.ts - terms signal, categories filter, conflicts computed
// glossary.api.ts - getTerms, upsertTerm, deleteTerm, extractTerms, detectConflicts
```

### Task 3.3: Auto-Extraction Integration

**Files:**
- Modify: `frontend-service/frontend/src/app/features/translation/translation.page.ts`

```typescript
// Add "Auto-extract" button in GlossarySidebar header
// Calls glossary.api.extractTerms(projectId, chapterId)
// Shows extracted terms in modal with checkboxes to add
```

---

## Phase 4: Translation Workspace (Week 4-6)

### Task 4.1: Create Chapter Navigator Organism

**Files:**
- Create: `frontend-service/frontend/src/app/shared/components/organisms/chapter-navigator.component.ts`

```typescript
// ChapterNavigator: Tabs(Chapters/Outline) + VirtualList(ChapterRow) + SearchInput
// ChapterRow: Checkbox + Title + StatusBadge + ProgressRing + Actions
// Virtual scrolling for 1000+ chapters (ngx-virtual-scroller)
// Keyboard nav: ↑/↓ select, Enter open, Ctrl+Enter approve
```

### Task 4.2: Create Split-Pane Translation Editor

**Files:**
- Create: `frontend-service/frontend/src/app/shared/components/organisms/translation-editor.component.ts`
- Create: `frontend-service/frontend/src/app/shared/components/molecules/split-pane.component.ts`

```typescript
// SplitPane: resizable (drag handle), synced scroll toggle, 50/50 default
// TranslationEditor: SplitPane(OriginalPane | TranslatedPane) + ChapterNavigator + GlossarySidebar + Toolbar + StatusBar
// OriginalPane: read-only, highlight glossary terms on hover
// TranslatedPane: inline edit on double-click, glossary suggestions autocomplete
// Toolbar: Prev/Next, Auto-translate, Glossary Lookup, Save Draft, Mark Done
// StatusBar: Chapter X/Y, Words translated/Total, Glossary refs count, Auto-save indicator
```

### Task 4.3: Implement Inline Editing + Glossary Lookup

**Files:**
- Create: `frontend-service/frontend/src/app/shared/components/molecules/inline-editor.component.ts`
- Create: `frontend-service/frontend/src/app/core/services/glossary-lookup.service.ts`

```typescript
// InlineEditor: appears on double-click segment, shows glossary suggestions dropdown
// GlossaryLookupService: find matching terms in current text, return suggestions
// Auto-save: debounce 2s + on blur → IndexedDB + server sync (PATCH /chapters/:num)
// Keyboard: Ctrl+Enter approve, Escape cancel, Tab next segment
```

### Task 4.4: Create Translation Page

**Files:**
- Create: `frontend-service/frontend/src/app/features/translation/translation.page.ts`

```typescript
// TranslationPage: uses WorkspaceLayout template
// Left sidebar: ChapterNavigator
// Main: TranslationEditor
// Right sidebar: GlossarySidebar
// Footer: StatusBar
// Loads project + chapters via ProjectStore + QueryClient
```

---

## Phase 5: Audiobook Generation (Week 6-7)

### Task 5.1: Create Audio Components

**Files:**
- Create: `frontend-service/frontend/src/app/shared/components/molecules/voice-picker.component.ts`
- Create: `frontend-service/frontend/src/app/shared/components/molecules/audio-player.component.ts`
- Create: `frontend-service/frontend/src/app/shared/components/organisms/audio-queue-panel.component.ts`
- Create: `frontend-service/frontend/src/app/shared/components/organisms/audiobook-player.component.ts`

```typescript
// VoicePicker: grid of voice cards (name, lang, gender, style tags, preview button)
// AudioPlayer: native <audio> + custom controls (play/pause, seek, speed, volume, time)
// AudioQueuePanel: list of QueueItem (chapter, progress, cancel/pause)
// AudiobookPlayer: combines AudioPlayer + ChapterNavigator + VoicePicker + Export button
```

### Task 5.2: Create Audio Store & API Service

**Files:**
- Create: `frontend-service/frontend/src/app/core/state/audio.store.ts`
- Create: `frontend-service/frontend/src/app/core/api/audio.api.ts`

```typescript
// audio.store.ts - voices[], queue[], currentChapter, playbackState
// audio.api.ts - getVoices, generateChapter, generateAll, getAudio, export, controlQueue
```

### Task 5.3: Create Audiobook Page

**Files:**
- Create: `frontend-service/frontend/src/app/features/audio/audiobook.page.ts`

```typescript
// AudiobookPage: uses PlayerLayout template
// Main: AudiobookPlayer
// Bottom/Right: AudioQueuePanel (collapsible)
// Header: Project title, VoicePicker trigger, Export button
// Export: single MP3 per chapter + combined MP3 + M3U playlist + JSON manifest
```

---

## Phase 6: Polish & PWA (Week 7-8)

### Task 6.1: Dark Mode Refinement + Theme Toggle

**Files:**
- Modify: `frontend-service/frontend/src/app/core/state/ui-preferences.store.ts`
- Create: `frontend-service/frontend/src/app/shared/components/atoms/theme-toggle.component.ts`

```typescript
// Add theme signal: 'light' | 'dark' | 'system'
// Apply document.documentElement.classList.toggle('dark')
// Persist to localStorage, sync across tabs
```

### Task 6.2: PWA Configuration

**Files:**
- Create: `frontend-service/frontend/public/manifest.webmanifest`
- Create: `frontend-service/frontend/src/app/core/pwa/sw-register.service.ts`
- Modify: `frontend-service/frontend/angular.json`

```json
// angular.json: "serviceWorker": true, "ngswConfigPath": "ngsw-config.json"
// manifest.webmanifest: name, short_name, icons, start_url, display: standalone
// ngsw-config.json: cache static assets, API responses (stale-while-revalidate), offline fallback
```

### Task 6.3: Offline Draft Sync

**Files:**
- Modify: `frontend-service/frontend/src/app/core/offline/draft.service.ts`
- Create: `frontend-service/frontend/src/app/core/offline/sync.service.ts`

```typescript
// SyncService: periodic (30s) + on online event
// Push unsynced drafts to server, pull latest
// Conflict resolution: server wins for translated text, local wins for cursor position
```

### Task 6.4: Keyboard Shortcuts Help Modal

**Files:**
- Create: `frontend-service/frontend/src/app/shared/components/organisms/shortcuts-help.component.ts`

```typescript
// Trigger: F1 or Ctrl+Shift+?
// Shows: all shortcuts from spec Appendix 14.1
// Categories: Global, Translation Editor, Audio Player
```

### Task 6.5: Accessibility Audit & Fixes

**Files:**
- Modify: all components

```bash
# Run: npm run test:a11y (axe-core)
# Fix: contrast, focus visible, ARIA labels, live regions, skip links, reduced motion
# Verify: screen reader (NVDA/VoiceOver), keyboard-only navigation
```

### Task 6.6: Performance Optimization

**Files:**
- Modify: `frontend-service/frontend/src/app/app.config.ts`
- Modify: component change detection strategies

```typescript
// OnPush change detection everywhere
// Lazy load feature routes (already done)
// Virtual scroll for all long lists
// Web Worker for parsing
// Bundle analysis: npm run build -- --stats-json
```

### Task 6.7: E2E Tests (Cypress)

**Files:**
- Create: `frontend-service/frontend/cypress/e2e/` (multiple specs)

```typescript
// e2e/dashboard.cy.ts - create project, verify list, queue panel
// e2e/upload.cy.ts - upload PDF/EPUB, configure, complete wizard
// e2e/translation.cy.ts - navigate chapters, edit, glossary, approve
// e2e/audio.cy.ts - select voice, generate, play, export
// e2e/offline.cy.ts - edit offline, reconnect, sync
```

---

## Acceptance Checklist Per Phase

- [ ] All new components have Storybook stories
- [ ] Unit tests > 80% (Jest)
- [ ] Integration tests for critical paths
- [ ] Accessibility audit passes (axe-core)
- [ ] Performance budget met (Lighthouse CI)
- [ ] Visual regression tests (Chromatic)
- [ ] Deployed to staging environment

---

## File Structure Summary (New Files)

```
src/app/
├── core/
│   ├── api/
│   │   ├── api-client.ts
│   │   ├── query-client.ts
│   │   ├── project.api.ts
│   │   ├── glossary.api.ts
│   │   └── audio.api.ts
│   ├── state/
│   │   ├── project.store.ts
│   │   ├── queue.store.ts
│   │   ├── glossary.store.ts
│   │   ├── audio.store.ts
│   │   └── ui-preferences.store.ts
│   ├── offline/
│   │   ├── db.ts
│   │   ├── draft.service.ts
│   │   └── sync.service.ts
│   ├── workers/
│   │   ├── pdf-parser.worker.ts
│   │   └── epub-parser.worker.ts
│   ├── pwa/
│   │   └── sw-register.service.ts
│   └── layout/
│       └── layout.component.ts (existing)
├── shared/
│   ├── components/
│   │   ├── atoms/ (20)
│   │   ├── molecules/ (15)
│   │   ├── organisms/ (8)
│   │   └── templates/ (4)
│   ├── directives/
│   │   ├── click-outside.directive.ts
│   │   ├── focus-trap.directive.ts
│   │   └── virtual-scroll.directive.ts
│   └── pipes/
│       ├── format-time.pipe.ts
│       ├── truncate.pipe.ts
│       └── status-label.pipe.ts
├── features/
│   ├── dashboard/
│   │   ├── dashboard.page.ts
│   │   ├── project-table.component.ts
│   │   ├── project-card.component.ts
│   │   └── queue-panel.component.ts
│   ├── upload/
│   │   ├── upload.page.ts
│   │   └── upload-wizard.component.ts
│   ├── translation/
│   │   ├── translation.page.ts
│   │   ├── translation-editor.component.ts
│   │   ├── chapter-navigator.component.ts
│   │   └── glossary-sidebar.component.ts
│   └── audio/
│       ├── audiobook.page.ts
│       ├── audiobook-player.component.ts
│       ├── audio-queue-panel.component.ts
│       └── voice-picker.component.ts
├── app.routes.ts (modified)
├── app.config.ts (modified)
└── styles.css (modified)
```

---

## Execution Options

**Plan complete and saved to `docs/superpowers/plans/2026-09-04-book-translator-frontend.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**