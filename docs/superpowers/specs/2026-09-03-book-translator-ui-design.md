# BookTranslator - UI/UX Specification

**Date**: 2026-09-03  
**Status**: Approved for Implementation  
**Stack**: Angular 18+ + TypeScript + Tailwind CSS + RxJS + Angular Signals  
**Target**: Web SPA (PWA-ready)

---

## 1. Product Context & Success Criteria

### 1.1 Core Value Proposition
A professional translation platform for books (PDF/EPUB) that combines AI translation, contextual glossary management, and AI audiobook generation in a single cohesive workflow.

### 1.2 User Personas
| Persona | Goals | Pain Points |
|---------|-------|-------------|
| **Solo Translator** | Translate web novels/light novels efficiently, maintain consistency across 1000+ chapters | Manual glossary tracking, context loss between chapters, no audio output |
| **Publisher/Editor** | Review translations, approve glossary, manage multiple projects | No visibility into translation progress, inconsistent terminology |
| **Author Self-Publishing** | Translate own works, generate audiobooks for distribution | Technical complexity, multiple disjoint tools |

### 1.3 Success Metrics
- Time-to-first-translation < 5 min (upload → first chapter translated)
- Glossary term coverage > 90% for proper nouns in fantasy/sci-fi
- Audiobook generation success rate > 98%
- Zero data loss on browser refresh/close (IndexedDB persistence)

---

## 2. Design System (Source of Truth)

### 2.1 Color Tokens (CSS Variables + Tailwind Config)

```css
/* === PRIMITIVE TOKENS === */
/* Teal Scale (Primary) */
--color-teal-50:  #F0FDFA;
--color-teal-100: #CCFBF1;
--color-teal-200: #99F6E4;
--color-teal-300: #5EEAD4;
--color-teal-400: #2DD4BF;
--color-teal-500: #14B8A6;  /* Secondary */
--color-teal-600: #0D9488;  /* Primary */
--color-teal-700: #0F766E;
--color-teal-800: #115E59;
--color-teal-900: #134E4A;  /* Foreground */
--color-teal-950: #042F2E;

/* Orange Scale (Accent/CTA) */
--color-orange-50:  #FFF7ED;
--color-orange-100: #FFEDD5;
--color-orange-200: #FED7AA;
--color-orange-300: #FDBA74;
--color-orange-400: #FB923C;
--color-orange-500: #F97316;
--color-orange-600: #EA580C;  /* Accent */
--color-orange-700: #C2410C;
--color-orange-800: #9A3412;
--color-orange-900: #7C2D12;

/* Neutral Scale */
--color-neutral-0:    #FFFFFF;
--color-neutral-50:   #F8FAFC;
--color-neutral-100:  #F1F5F9;
--color-neutral-200:  #E2E8F0;
--color-neutral-300:  #CBD5E1;
--color-neutral-400:  #94A3B8;
--color-neutral-500:  #64748B;
--color-neutral-600:  #475569;  /* Muted Foreground */
--color-neutral-700:  #334155;
--color-neutral-800:  #1E293B;
--color-neutral-900:  #0F172A;
--color-neutral-950:  #020617;

/* Semantic Status Colors */
--color-success:      #16A34A;
--color-success-bg:   #F0FDF4;
--color-warning:      #D97706;
--color-warning-bg:   #FFFBEB;
--color-error:        #DC2626;
--color-error-bg:     #FEF2F2;
--color-info:         #2563EB;
--color-info-bg:      #EFF6FF;

/* === SEMANTIC TOKENS === */
--color-primary:           var(--color-teal-600);
--color-primary-hover:     var(--color-teal-700);
--color-primary-active:    var(--color-teal-800);
--color-primary-foreground: var(--color-neutral-0);

--color-secondary:           var(--color-teal-500);
--color-secondary-hover:     var(--color-teal-600);
--color-secondary-foreground: var(--color-neutral-900);

--color-accent:           var(--color-orange-600);
--color-accent-hover:     var(--color-orange-700);
--color-accent-active:    var(--color-orange-800);
--color-accent-foreground: var(--color-neutral-0);

--color-background:       var(--color-neutral-50);
--color-surface:          var(--color-neutral-0);
--color-surface-elevated: var(--color-neutral-0);
--color-foreground:       var(--color-neutral-900);
--color-muted:            var(--color-neutral-100);
--color-muted-foreground: var(--color-neutral-500);
--color-border:           var(--color-neutral-200);
--color-border-focus:     var(--color-teal-600);
--color-ring:             var(--color-teal-600);

--color-destructive:      var(--color-error);
--color-destructive-hover: var(--color-error);
--color-destructive-foreground: var(--color-neutral-0);

/* Dark Mode Overrides */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background:       var(--color-neutral-950);
    --color-surface:          var(--color-neutral-900);
    --color-surface-elevated: var(--color-neutral-800);
    --color-foreground:       var(--color-neutral-50);
    --color-muted:            var(--color-neutral-800);
    --color-muted-foreground: var(--color-neutral-400);
    --color-border:           var(--color-neutral-700);
    --color-primary-hover:    var(--color-teal-500);
    --color-primary-active:   var(--color-teal-400);
    --color-success-bg:       #052E16;
    --color-warning-bg:       #3F2B00;
    --color-error-bg:         #3F0A0A;
    --color-info-bg:          #0C1A3A;
  }
}
```

### 2.2 Typography System

```css
/* Font Families */
--font-sans: 'Plus Jakarta Sans', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Type Scale (Rem-based, mobile-first) */
--text-xs:      0.75rem;    /* 12px - Labels, captions */
--text-sm:      0.875rem;   /* 14px - Body small, secondary */
--text-base:    1rem;       /* 16px - Body default */
--text-lg:      1.125rem;   /* 18px - Body large */
--text-xl:      1.25rem;    /* 20px - Subheadings */
--text-2xl:     1.5rem;     /* 24px - Section headings */
--text-3xl:     1.875rem;   /* 30px - Page titles */
--text-4xl:     2.25rem;    /* 36px - Hero titles */

/* Font Weights */
--font-light:    300;
--font-normal:   400;
--font-medium:   500;
--font-semibold: 600;
--font-bold:     700;

/* Line Heights */
--leading-tight:   1.25;  /* Headings */
--leading-snug:    1.375;
--leading-normal:  1.5;   /* Body */
--leading-relaxed: 1.625; /* Long-form reading */

/* Letter Spacing */
--tracking-tight: -0.02em;  /* Headings */
--tracking-normal: 0;       /* Body */
--tracking-wide:  0.02em;   /* Labels, uppercase */
```

### 2.3 Spacing & Layout Tokens

```css
/* Spacing Scale (4px base) */
--space-0:   0;
--space-1:   0.25rem;  /* 4px */
--space-2:   0.5rem;   /* 8px */
--space-3:   0.75rem;  /* 12px */
--space-4:   1rem;     /* 16px */
--space-5:   1.25rem;  /* 20px */
--space-6:   1.5rem;   /* 24px */
--space-8:   2rem;     /* 32px */
--space-10:  2.5rem;   /* 40px */
--space-12:  3rem;     /* 48px */
--space-16:  4rem;     /* 64px */
--space-20:  5rem;     /* 80px */
--space-24:  6rem;     /* 96px */

/* Border Radius */
--radius-none:   0;
--radius-sm:     0.25rem;  /* 4px */
--radius-md:     0.375rem; /* 6px */
--radius-lg:     0.5rem;   /* 8px */
--radius-xl:     0.75rem;  /* 12px */
--radius-2xl:    1rem;     /* 16px */
--radius-full:   9999px;

/* Shadows */
--shadow-sm:  0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md:  0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg:  0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl:  0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

/* Transitions */
--transition-fast:    150ms ease;
--transition-normal:  200ms ease;
--transition-slow:    300ms ease;

/* Z-Index Scale */
--z-dropdown:   100;
--z-sticky:     200;
--z-fixed:      300;
--z-modal-backdrop: 400;
--z-modal:      500;
--z-popover:    600;
--z-tooltip:    700;
--z-toaster:    800;
```

### 2.4 Breakpoints (Mobile-First)

```css
--bp-sm:  640px;   /* Small tablets */
--bp-md:  768px;   /* Tablets */
--bp-lg:  1024px;  /* Laptops */
--bp-xl:  1280px;  /* Desktops */
--bp-2xl: 1536px;  /* Large desktops */
```

---

## 3. Component Library (Atomic Design)

### 3.1 Atoms (20 components)

| Component | Variants | States | Notes |
|-----------|----------|--------|-------|
| `Button` | primary, secondary, outline, ghost, destructive, link | default, hover, active, disabled, loading | Icon-left, icon-right, full-width |
| `Input` | text, email, password, number, search | default, focus, error, disabled, readonly | Label, hint, error message, clear button |
| `Select` | single, multi, searchable | default, focus, open, disabled, error | Grouped options, custom render |
| `Textarea` | auto-resize, fixed | default, focus, error, disabled | Character count, min/max rows |
| `Checkbox` | single, indeterminate | default, hover, focus, checked, disabled | Label position, description |
| `Radio` | group | default, hover, focus, checked, disabled | Card variant for options |
| `Toggle` | switch, checkbox-style | default, focus, checked, disabled | Size variants |
| `Badge` | default, success, warning, error, info, outline | static, removable | Dot indicator variant |
| `Avatar` | image, initials, fallback | default, online, busy, offline | Sizes: xs, sm, md, lg, xl |
| `Icon` | Lucide icons only | default, spin, pulse | Size: 16, 20, 24, 32 |
| `Tooltip` | top, bottom, left, right | show, hide | Delay: 200ms show, 100ms hide |
| `Spinner` | default, dots, bars | animating | Sizes: sm, md, lg |
| `ProgressBar` | determinate, indeterminate | animating | Label position, color variants |
| `ProgressRing` | determinate, indeterminate | animating | Size variants |
| `Divider` | horizontal, vertical | default | With label variant |
| `Card` | default, outlined, elevated | default, hover | Header, content, footer slots |
| `Table` | default, striped, bordered | default, loading, empty | Sortable, selectable, resizable |
| `Tabs` | line, enclosed, soft | default, active, disabled | Keyboard navigation |
| `Dropdown` | menu, combobox | open, closed, loading | Portal, positioning |
| `Dialog` | default, alert, confirm, form | open, closed, closing | Focus trap, ESC close |

### 3.2 Molecules (15 components)

| Component | Composition | Purpose |
|-----------|-------------|---------|
| `FileDropZone` | Input + Button + Icon + ProgressBar + Badge | Drag-drop upload with validation |
| `StatusBadge` | Badge + Icon + Tooltip | Project/chapter status with semantic color |
| `ChapterRow` | Checkbox + Text + Badge + Button(Icon) + ProgressRing | Chapter list row with actions |
| `GlossaryTermCard` | Input + Input + Select + Button(Icon) + Badge | Term: source, translation, category, status |
| `VoicePicker` | Select + Button(Play) + Avatar + Badge | Voice selection with preview |
| `AudioPlayer` | ProgressBar + Button + Icon + TimeDisplay + Volume | Chapter playback with speed control |
| `SettingPanel` | Label + Input/Select/Toggle + Hint + Validation | Form section with consistent layout |
| `ConfirmDialog` | Dialog + Text + Button(2) | Destructive action confirmation |
| `SearchInput` | Input + Icon(Search) + Dropdown(Results) | Debounced search with keyboard nav |
| `Breadcrumb` | Link + Divider + Text | Navigation context |
| `PageHeader` | Heading + Text + ButtonGroup + Breadcrumb | Consistent page headers |
| `EmptyState` | Icon + Heading + Text + Button | Zero-data guidance |
| `ErrorState` | Icon + Heading + Text + Button(Retry) | Error recovery |
| `SkeletonCard` | Skeleton + Skeleton + Skeleton | Loading placeholder |
| `QueueItem` | Badge + Text + ProgressBar + Button(Cancel) | Background job queue entry |

### 3.3 Organisms (8 components)

| Component | Composition | Responsibility |
|-----------|-------------|----------------|
| `ProjectCard` | Card + Avatar + Text + StatusBadge + ButtonGroup + ProgressBar | Dashboard project summary |
| `ProjectTable` | Table + ChapterRow + Toolbar + Pagination + BulkActions | Project list with bulk ops |
| `UploadWizard` | Stepper + FileDropZone + SettingPanel + GlossaryTermCard(Preview) + ButtonGroup | 3-step upload flow |
| `TranslationEditor` | SplitPane(2) + ChapterNavigator + GlossarySidebar + Toolbar + StatusBar | Core translation workspace |
| `GlossarySidebar` | SearchInput + Tabs + GlossaryTermCard(List) + Button(Add) | Term management panel |
| `ChapterNavigator` | Tabs(Chapters/Outline) + VirtualList(ChapterRow) + SearchInput | Chapter navigation |
| `AudioQueuePanel` | Card + QueueItem(List) + Button(Generate All) + ProgressBar | TTS generation queue |
| `AudiobookPlayer` | AudioPlayer + ChapterNavigator + VoicePicker + Button(Export) | Full audiobook playback |

### 3.4 Templates (4 layouts)

| Template | Slots | Used By |
|----------|-------|---------|
| `DashboardLayout` | header, sidebar, main, queue-panel | DashboardPage |
| `WorkspaceLayout` | header, sidebar(left), main, sidebar(right), footer | TranslationPage |
| `WizardLayout` | header, stepper, main, footer(actions) | UploadPage |
| `PlayerLayout` | header, main, footer(controls) | AudiobookPage |

### 3.5 Pages (4 routes)

| Route | Template | Key Organisms |
|-------|----------|---------------|
| `/` | DashboardLayout | ProjectTable, ProjectCard, QueuePanel |
| `/projects/new` | WizardLayout | UploadWizard |
| `/projects/:id/translate` | WorkspaceLayout | TranslationEditor, GlossarySidebar, ChapterNavigator |
| `/projects/:id/audio` | PlayerLayout | AudiobookPlayer, AudioQueuePanel |

---

## 4. Screen Specifications & Wireframes

### 4.1 Dashboard (`/`)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Header: Logo | Search(Projects) | Notifications | UserMenu              │
├──────────────────────────────┬──────────────────────────────────────────┤
│                              │                                          │
│   Sidebar (collapsible)      │   Main: ProjectTable                     │
│   ─────────────────          │   ─────────────────                      │
│   ▸ All Projects (42)        │   ┌──────────────────────────────────┐  │
│   ▸ Translating (3)          │   │  Toolbar: [+ New] [Filters] [View]│  │
│   ▸ Glossary Review (5)      │   ├──────────────────────────────────┤  │
│   ▸ Audio Generating (2)     │   │  ☐ | Title              | Status   │  │
│   ▸ Completed (32)           │   │  ──┼─────────────────────┼────────┤  │
│   ▸ Archived (0)             │   │  ☐ | The Mage's Journey  | 🔄 45%  │  │
│                              │   │  ☐ | Stellar Odyssey     | 📝Review│  │
│   [Create Project]           │   │  ☐ | Cyber Dynasty      | 🎧 78%  │  │
│                              │   │  ☐ | Chronicles of Aether| ✅ Done │  │
│                              │   │  ☐ | Void Walker        | ⏳ Queued│  │
│                              │   └──────────────────────────────────┘  │
│                              │                                          │
├──────────────────────────────┼──────────────────────────────────────────┤
│                              │   Queue Panel (right, collapsible)       │
│                              │   ─────────────────────                  │
│                              │   🔄 Translating Ch.12 (The Mage...)    │
│                              │   ████████░░ 45% [Cancel]                │
│                              │   📝 Glossary Review (Stellar...)       │
│                              │   ██████████ 100% [Open]                 │
│                              │   🎧 Generating Ch.5 (Cyber...)         │
│                              │   ████████░░ 78% [Pause]                │
│                              └──────────────────────────────────────────┘
```

**Key Interactions:**
- Row click → navigate to `/projects/:id/translate`
- Row hover → show quick actions (translate, glossary, audio, delete)
- Bulk select → toolbar shows bulk actions (archive, delete, export)
- Queue panel: persistent, real-time updates via WebSocket/SSE
- Empty state: illustration + "Create your first project" CTA

### 4.2 Upload Wizard (`/projects/new`)

```
Step 1: Upload          Step 2: Configure         Step 3: Glossary Preview
─────────────────      ─────────────────         ──────────────────────
                                                                      
┌─────────────────┐    ┌─────────────────┐     ┌─────────────────┐  
│                 │    │ Genre: [Fantasy ▼]│     │ Detected Terms  │  
│  📄 Drag PDF/   │    │ Tone: [Literary ▼]│     │ ─────────────  │  
│  EPUB here      │    │ Target: [ES ▼]    │     │ ☐ Aether → Éter │  
│                 │    │                   │     │ ☐ Mana → Maná   │  
│  or [Browse]    │    │ [Advanced ▼]      │     │ ☐ Cultivation→  │  
│                 │    │  • Preserve names │     │   Cultivo       │  
│  [File.pdf] ✓   │    │  • Chapter split  │     │ ☐ Sect → Secta  │  
│  2.4 MB • 342 pgs│   │  • Custom prompt  │     │ [+ Add Custom]  │  
│                 │    │                   │     │                 │  
├─────────────────┤    ├─────────────────┤     ├─────────────────┤  
│ [Back] [Next]   │    │ [Back] [Next]   │     │ [Back] [Create] │  
└─────────────────┘    └─────────────────┘     └─────────────────┘
```

**Validation Rules:**
- Accept: `.pdf`, `.epub` (max 500MB)
- Show page/chapter count after parse
- Genre options: Fantasy, Sci-Fi, Action, Romance, Mystery, Historical, Light Novel, Web Novel, Other
- Tone options: Literal, Literary, Conversational, Formal, Poetic, Technical
- Advanced: Custom system prompt (textarea, 2000 char max)

### 4.3 Translation Workspace (`/projects/:id/translate`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Header: Project Title | Status Badge | [Glossary] [Audio] [Export] [⋮]    │
├──────────┬──────────────────────────────────────────────────┬──────────────┤
│          │                                                  │              │
│ Chapter  │           SPLIT PANE (resizable, 50/50 default)  │  Glossary    │
│ Navigator│  ┌─────────────────────┬─────────────────────┐   │  Sidebar     │
│ ──────── │  │    ORIGINAL (EN)    │   TRANSLATED (ES)   │   │  ─────────  │
│ 🔍 Search│  │  ─────────────────  │  ─────────────────  │   │  🔍 Filter  │
│          │  │  Chapter 12         │  Capítulo 12        │   │             │
│ ▸ Ch 1-10│  │  ─────────────────  │  ─────────────────  │   │ 📖 Terms    │
│   ▸ Ch 1 │  │  "The mana surged   │  "El maná brotó     │   │  ☑ Aether   │
│   ▸ Ch 2 │  │   through his veins │   por sus venas     │   │  ☑ Mana     │
│ ▸ Ch 11-20│ │   as he grasped    │   mientras asía     │   │  ☑ Cultiv.  │
│   ✦ Ch 12 │  │   the crystal..."  │   el cristal..."   │   │  ☐ Sect     │
│   ▸ Ch 13 │  │                     │                     │   │             │
│ ▸ Ch 21+ │  │  [Edit] [Approve]   │  [Edit] [Copy]      │   │ 🏷️ Categories│
│          │  └─────────────────────┴─────────────────────┘   │  ☐ Characters│
│          │                                                  │  ☐ Magic Sys │
│          │  Toolbar: [← Prev] [Next →] [Auto-translate]    │  ☐ Locations │
│          │  [Glossary Lookup] [Save Draft] [Mark Done]     │  ☐ Factions  │
│          │                                                  │             │
├──────────┴──────────────────────────────────────────────────┴──────────────┤
│ Status Bar:  Ch 12/342  |  1,247/3,456 words  |  12 glossary refs  |  💾  │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Split Pane Behaviors:**
- Synchronized scrolling (toggleable)
- Click term in original → highlight in glossary sidebar
- Inline edit: double-click translated segment → inline editor with glossary suggestions
- Keyboard shortcuts: `Ctrl+Enter` approve, `Ctrl+Shift+G` open glossary, `←/→` navigate chapters
- Auto-save to IndexedDB every 2s + on blur

**Glossary Sidebar:**
- Tabs: All | Characters | Magic System | Locations | Factions | Custom
- Inline add/edit: click term → inline form (source, translation, category, notes)
- Auto-extract button: runs NER on current chapter, suggests terms
- Conflict detection: warns if same source term has different translations

### 4.4 Audiobook Studio (`/projects/:id/audio`)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Header: Project Title | [← Translate] | Voice: [Emma (EN-US) ▼] [Export]│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    AUDIOBOOK PLAYER                              │   │
│  │  ┌─────┐  Chapter 12: The Awakening        12:34 / 45:21  🔊   │   │
│  │  │ ▶️  │  ████████████████████░░░░░░░░░░░  27%    1.0x ▼       │   │
│  │  └─────┘                                                         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────┬────────────────────────────────────┐  │
│  │     CHAPTER QUEUE           │      GENERATION QUEUE              │  │
│  │  ──────────────────         │  ──────────────────                │  │
│  │  ✅ Ch 1  (45:21)  [Play]   │  🔄 Ch 13  ████████░░  45% [⏸]   │  │
│  │  ✅ Ch 2  (38:12)  [Play]   │  ⏳ Ch 14  ████░░░░░░░░  22%      │  │
│  │  ✅ Ch 3  (52:07)  [Play]   │  ⏳ Ch 15  Queued                  │  │
│  │  🔄 Ch 4  Generating...     │  ⏳ Ch 16  Queued                  │  │
│  │  ⏳ Ch 5  Queued            │  ⏳ Ch 17  Queued                  │  │
│  │  ⏳ Ch 6  Queued            │                                    │  │
│  │  ... (337 more)             │  [Generate All] [Pause Queue]      │  │
│  │                             │                                    │  │
│  │  [Virtual Scroll]           │  [Virtual Scroll]                  │  │
│  └─────────────────────────────┴────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Voice Picker Modal:**
- Grid of voice cards: Name, Language, Gender, Style tags, [Preview] button
- Categories: Narrator, Character Voices, Multilingual
- Favorites starred, recently used at top
- edge-tts voices loaded from backend API

**Generation Queue:**
- Max 2 concurrent generations (configurable)
- Chapter-level retry on failure
- Pause/resume queue persistence
- Export: Single MP3 per chapter + combined MP3 + M3U playlist + JSON manifest

---

## 5. State Management Architecture

### 5.1 State Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                        APP STATE                                │
├─────────────────┬─────────────────┬─────────────────────────────┤
│  SERVER STATE   │   CLIENT STATE  │      EPHEMERAL STATE        │
│  (React Query / │  (Signals +     │  (Component-local signals)  │
│   TanStack Query)│   LocalStorage)│                             │
├─────────────────┼─────────────────┼─────────────────────────────┤
│ • Projects list │ • UI preferences│ • Editor scroll position    │
│ • Project detail│   (theme, lang) │ • Split pane ratio          │
│ • Chapters      │ • Draft content │ • Sidebar open/closed       │
│ • Glossary terms│   (IndexedDB)   │ • Active tab                │
│ • Voices list   │ • Queue progress│ • Modal open state          │
│ • Audio files   │ • Recent files  │ • Tooltip visibility        │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

### 5.2 Angular Signals + Services Pattern

```typescript
// Core stores (singleton services with signals)
@Injectable({ providedIn: 'root' })
export class ProjectStore {
  private _projects = signal<Project[]>([]);
  private _currentProject = signal<Project | null>(null);
  private _loading = signal(false);
  
  readonly projects = this._projects.asReadonly();
  readonly currentProject = this._currentProject.asReadonly();
  readonly loading = this._loading.asReadonly();
  
  // Computed
  readonly activeProjects = computed(() => 
    this._projects().filter(p => !['completed', 'archived'].includes(p.status))
  );
}

// Server state via TanStack Query (Angular Query)
@Injectable({ providedIn: 'root' })
export class TranslationQueryService {
  getChapters(projectId: string) {
    return queryOptions({
      queryKey: ['chapters', projectId],
      queryFn: () => this.api.getChapters(projectId),
      staleTime: 5 * 60 * 1000,
    });
  }
  
  translateChapter(projectId: string, chapterId: string, options: TranslateOptions) {
    return mutationOptions({
      mutationFn: () => this.api.translateChapter(projectId, chapterId, options),
      onSuccess: () => this.queryClient.invalidateQueries({ queryKey: ['chapters', projectId] }),
    });
  }
}

// Ephemeral UI state via component signals
@Component({...})
export class TranslationEditorComponent {
  splitRatio = signal(0.5);
  syncScroll = signal(true);
  activeSidebar = signal<'glossary' | 'outline' | null>('glossary');
}
```

### 5.3 Offline-First Persistence (IndexedDB via idb)

```typescript
// Offline draft schema
interface OfflineDraft {
  projectId: string;
  chapterId: string;
  originalText: string;
  translatedText: string;
  cursorPosition: number;
  lastModified: number;
  synced: boolean;
}

// Auto-save strategy
const AUTO_SAVE_DEBOUNCE = 2000;
const SYNC_INTERVAL = 30000;
```

---

## 6. Async UX Patterns & Heavy Process Handling

### 6.1 Job Queue System

```typescript
interface BackgroundJob {
  id: string;
  type: 'parse' | 'translate' | 'glossary-extract' | 'tts';
  projectId: string;
  chapterId?: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  result?: any;
  priority: number;
}
```

**Queue UI Behaviors:**
- Persistent right panel (Dashboard) + bottom bar (Workspace)
- Real-time progress via Server-Sent Events (SSE)
- Per-job: cancel, retry, view logs
- Bulk: pause queue, resume queue, clear completed
- Notification on completion (toast + browser notification API)

### 6.2 Loading & Skeleton Patterns

| Scenario | Pattern | Duration |
|----------|---------|----------|
| Initial project list | SkeletonTable (6 rows) | Until first data |
| Chapter content load | SkeletonText (3 paragraphs) | < 500ms |
| Glossary terms | SkeletonList (8 items) | < 300ms |
| Voice list | SkeletonGrid (6 cards) | < 400ms |
| Audio generation | ProgressRing + % label | Indeterminate → determinate |
| File parse | ProgressBar + stage labels | Multi-stage |

### 6.3 Error Handling Strategy

```typescript
// Error boundary per feature
@Component({...})
export class TranslationEditorComponent {
  // Feature-level error state
  translationError = signal<ApiError | null>(null);
  
  // Recovery actions per error type
  handleError = (error: ApiError) => {
    this.translationError.set(error);
    // Auto-retry for network errors
    if (error.code === 'NETWORK_ERROR') {
      setTimeout(() => this.retryTranslation(), 5000);
    }
  };
}

// Toast notifications (toaster service)
toast.error('Translation failed', { 
  action: { label: 'Retry', onClick: () => retry() },
  duration: 0 // persistent until dismissed
});
```

**Error Types & Recovery:**
| Error Type | User Message | Recovery |
|------------|--------------|----------|
| PARSE_FAILED | "Could not read file. Try a different format." | Re-upload |
| TRANSLATION_FAILED | "Translation service unavailable. Retrying..." | Auto-retry (3x) |
| GLOSSARY_CONFLICT | "Term 'X' has conflicting translations" | Show conflict resolver modal |
| TTS_QUOTA_EXCEEDED | "Daily TTS limit reached. Try tomorrow." | Show quota info, pause queue |
| CHAPTER_TOO_LONG | "Chapter exceeds 10k words. Split recommended." | Show split suggestion |

---

## 7. Accessibility Requirements (WCAG 2.2 AA)

### 7.1 Critical Checklist

- [ ] **Color Contrast**: All text 4.5:1 (3:1 for large text), verified in both themes
- [ ] **Keyboard Navigation**: Full app operable via Tab/Enter/Escape/Arrows
- [ ] **Focus Visible**: 2px solid ring on all interactive elements (`focus-visible:ring-2 focus-visible:ring-primary`)
- [ ] **Focus Order**: Logical, matches visual order
- [ ] **Skip Links**: "Skip to main content" on all pages
- [ ] **ARIA Labels**: All icon-only buttons, status badges, progress indicators
- [ ] **Live Regions**: Queue updates (`role="status" aria-live="polite"`), auto-save confirmation
- [ ] **Reduced Motion**: `prefers-reduced-motion` disables non-essential animations
- [ ] **Screen Reader**: Chapter navigator announced as `nav aria-label="Chapters"`, glossary as `aside aria-label="Glossary"`
- [ ] **Touch Targets**: Minimum 44×44px (mobile)

### 7.2 Component-Specific A11y

| Component | ARIA Pattern |
|-----------|--------------|
| Split Pane | `role="separator" aria-orientation="horizontal" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50"` |
| Chapter Tabs | `role="tablist"`, panels `role="tabpanel" aria-labelledby` |
| Glossary Search | `role="combobox" aria-autocomplete="list" aria-controls="results"` |
| Audio Player | `role="region" aria-label="Audio player"`, controls native `<audio>` |
| Progress Bar | `role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow` |
| Queue Status | `role="status" aria-live="polite" aria-atomic="true"` |

---

## 8. Performance Budgets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Initial Load (LCP) | < 2.5s | 3G throttling |
| TTI | < 3.5s | 3G throttling |
| CLS | < 0.1 | Lab + Field |
| FID/INP | < 200ms | Field |
| Bundle Size (gzipped) | < 200KB | Main chunk |
| Chapter Render (10k words) | < 100ms | Virtualized |
| Glossary Search (1000 terms) | < 50ms | Debounced 300ms |

**Optimization Strategies:**
- Route-level code splitting (lazy load Workspace, Audio pages)
- Virtual scrolling for chapter lists (CDK VirtualFor)
- On-demand glossary term loading (infinite scroll)
- Web Worker for PDF/EPUB parsing
- Service Worker for offline drafts + asset caching
- Image optimization (WebP/AVIF, responsive srcset)

---

## 9. Implementation Roadmap (6 Phases)

### Phase 1: Foundation (Week 1-2) ✅ **Deployable**
- Design system setup (Tailwind config, CSS variables, tokens)
- Atomic component library (20 atoms) with Storybook
- DashboardLayout + ProjectTable + ProjectCard
- Project CRUD API integration
- Basic routing + authentication guard
- **Deliverable**: Dashboard with project list, create/delete

### Phase 2: Upload & Parse (Week 2-3) ✅ **Deployable**
- UploadWizard organism (3-step)
- FileDropZone with validation + progress
- PDF/EPUB parsing (Web Worker)
- Genre/Tone/Target language settings
- Project creation API
- **Deliverable**: Complete upload flow → creates project in "uploaded" status

### Phase 3: Glossary System (Week 3-4) ✅ **Deployable**
- GlossarySidebar + GlossaryTermCard
- Auto-extraction (NER via backend)
- Inline CRUD for terms
- Categories + conflict detection
- Per-book storage + IndexedDB sync
- **Deliverable**: Glossary management integrated in workspace

### Phase 4: Translation Workspace (Week 4-6) ✅ **Deployable**
- TranslationEditor with split pane
- ChapterNavigator (virtualized for 1000+)
- Synchronized scrolling + keyboard shortcuts
- Inline editing + glossary lookup
- Auto-save (IndexedDB) + server sync
- Chapter status transitions
- **Deliverable**: Full translation editing environment

### Phase 5: Audiobook Generation (Week 6-7) ✅ **Deployable**
- VoicePicker (edge-tts integration)
- AudioQueuePanel with real-time progress
- AudiobookPlayer with playback controls
- Chapter-level + full-book generation
- Export: MP3 chapters + combined + M3U + manifest
- **Deliverable**: Complete audiobook pipeline

### Phase 6: Polish & PWA (Week 7-8) ✅ **Deployable**
- Dark mode refinement
- PWA manifest + Service Worker
- Offline draft persistence + sync
- Keyboard shortcuts help modal
- Performance optimization
- Accessibility audit + fixes
- E2E tests (Cypress)
- **Deliverable**: Production-ready SPA

---

## 10. Module Independence Guarantees

### 10.1 Separation of Concerns

| Module | Owns | Exposes | Depends On |
|--------|------|---------|------------|
| `project` | Project CRUD, status, metadata | `ProjectStore`, `ProjectApi` | Auth, API |
| `upload` | File parsing, validation, wizard | `UploadWizardComponent`, `FileParserService` | Project, File APIs |
| `glossary` | Terms, categories, extraction | `GlossaryStore`, `GlossarySidebarComponent` | Project |
| `translation` | Chapters, segments, editing | `TranslationEditorComponent`, `ChapterNavigatorComponent` | Project, Glossary |
| `audio` | Voices, TTS jobs, playback | `AudiobookPlayerComponent`, `AudioQueuePanelComponent` | Project, Translation |
| `queue` | Background jobs, progress | `QueueStore`, `QueuePanelComponent` | All modules |

### 10.2 Contract Testing

Each module publishes a **public API surface** tested via contract tests:
```typescript
// Example: Glossary public API (versioned)
interface GlossaryApi {
  getTerms(projectId: string): Promise<GlossaryTerm[]>;
  upsertTerm(projectId: string, term: GlossaryTermInput): Promise<GlossaryTerm>;
  deleteTerm(projectId: string, termId: string): Promise<void>;
  extractTerms(projectId: string, chapterId: string): Promise<ExtractedTerm[]>;
  detectConflicts(projectId: string): Promise<Conflict[]>;
}
```

### 10.3 Feature Flags for Safe Rollout

```typescript
const features = {
  'glossary-auto-extract': false,  // Phase 3
  'translation-split-pane': false,  // Phase 4
  'audio-generation': false,        // Phase 5
  'offline-drafts': false,          // Phase 6
} as const;
```

---

## 11. API Contract (Backend Integration)

### 11.1 Core Endpoints

```
Projects
POST   /api/projects                    Create project
GET    /api/projects                    List projects (paginated, filterable)
GET    /api/projects/:id                Get project detail
PATCH  /api/projects/:id                Update project
DELETE /api/projects/:id                Delete project
POST   /api/projects/:id/parse          Trigger file parse
GET    /api/projects/:id/status         Get aggregate status

Chapters
GET    /api/projects/:id/chapters       List chapters (paginated)
GET    /api/projects/:id/chapters/:num  Get chapter content (original + translated)
PATCH  /api/projects/:id/chapters/:num  Update translation
POST   /api/projects/:id/chapters/:num/translate  Trigger translation
POST   /api/projects/:id/chapters/:num/approve    Approve translation

Glossary
GET    /api/projects/:id/glossary       List terms (filterable by category)
POST   /api/projects/:id/glossary       Create term
PATCH  /api/projects/:id/glossary/:termId  Update term
DELETE /api/projects/:id/glossary/:termId  Delete term
POST   /api/projects/:id/glossary/extract  Auto-extract from chapter
GET    /api/projects/:id/glossary/conflicts  Get conflicts

Audio
GET    /api/voices                      List available voices
POST   /api/projects/:id/audio/chapters/:num/generate  Generate TTS
GET    /api/projects/:id/audio/chapters/:num           Get audio file
POST   /api/projects/:id/audio/generate-all            Generate full audiobook
GET    /api/projects/:id/audio/export                  Export combined MP3
GET    /api/projects/:id/audio/queue                   Get generation queue
PATCH  /api/projects/:id/audio/queue/:jobId            Control job (pause/resume/cancel)

Queue (SSE)
GET    /api/queue/stream                Server-Sent Events for real-time updates
```

---

## 12. Acceptance Criteria (Definition of Done)

### Per Phase
- [ ] All components have Storybook stories (interactive)
- [ ] Unit tests > 80% coverage (Vitest)
- [ ] Integration tests for critical paths (Cypress)
- [ ] Accessibility audit (axe-core) passes
- [ ] Performance budget met (Lighthouse CI)
- [ ] Visual regression tests (Chromatic)
- [ ] Documentation updated (README, component props)
- [ ] Deployed to staging environment

### Final Release
- [ ] All 6 phases deployed and verified
- [ ] Cross-browser: Chrome, Firefox, Safari, Edge (latest 2)
- [ ] Mobile responsive: 375px, 768px breakpoints tested
- [ ] PWA installable + offline functional
- [ ] Load tested: 100 concurrent projects, 1000 chapters
- [ ] Security audit: CSP, XSS, CSRF, dependency scan
- [ ] User acceptance testing with 3+ translators

---

## 13. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| 1000+ chapter performance | High | High | Virtual scrolling, pagination, lazy loading from Phase 4 |
| edge-tts API limits | Medium | High | Queue throttling, local fallback (Coqui), quota display |
| Glossary conflicts at scale | Medium | Medium | Conflict detection UI, bulk resolution, import/export |
| Browser memory (large books) | Medium | High | IndexedDB streaming, cleanup policies, web workers |
| Translation quality variance | High | Medium | Glossary enforcement, tone presets, review workflow |

---

## 14. Appendix

### 14.1 Keyboard Shortcuts Reference

| Shortcut | Action | Context |
|----------|--------|---------|
| `Ctrl+N` | New project | Dashboard |
| `Ctrl+Enter` | Approve segment | Translation Editor |
| `Ctrl+Shift+G` | Open glossary | Translation Editor |
| `← / →` | Prev/Next chapter | Translation Editor |
| `Ctrl+S` | Save draft | Translation Editor |
| `Space` | Play/Pause audio | Audiobook Player |
| `Shift+→ / ←` | Seek ±10s | Audiobook Player |
| `Escape` | Close modal/sidebar | Global |

### 14.2 File Structure (Angular)

```
src/
├── app/
│   ├── core/
│   │   ├── design-system/           # Tokens, theme, global styles
│   │   ├── state/                   # Signals stores (ProjectStore, QueueStore)
│   │   ├── api/                     # TanStack Query setup, API client
│   │   ├── offline/                 # IndexedDB (idb) setup
│   │   └── guards/                  # Auth, project access
│   ├── shared/
│   │   ├── components/
│   │   │   ├── atoms/               # 20 atomic components
│   │   │   ├── molecules/           # 15 molecular components
│   │   │   ├── organisms/           # 8 organism components
│   │   │   └── templates/           # 4 layout templates
│   │   ├── directives/              # ClickOutside, FocusTrap, VirtualScroll
│   │   ├── pipes/                   # FormatTime, Truncate, StatusLabel
│   │   └── utils/                   # Helpers, constants
│   ├── features/
│   │   ├── dashboard/               # DashboardPage, ProjectTable, QueuePanel
│   │   ├── upload/                  # UploadPage, UploadWizard
│   │   ├── translation/             # TranslationPage, Editor, GlossarySidebar, Navigator
│   │   └── audio/                   # AudiobookPage, Player, QueuePanel, VoicePicker
│   ├── app.routes.ts
│   └── app.config.ts
├── assets/
│   ├── fonts/                       # Plus Jakarta Sans (self-hosted)
│   ├── icons/                       # Lucide SVG icons
│   └── design-tokens.css            # Generated from tokens
└── styles.scss                      # Global styles, Tailwind imports
```

### 14.3 Design Token Persistence

Generated files (via design-system skill):
- `design-system/booktranslator/MASTER.md` - Global source of truth
- `design-system/booktranslator/pages/dashboard.md` - Dashboard overrides
- `design-system/booktranslator/pages/translation.md` - Workspace overrides
- `design-system/booktranslator/pages/audio.md` - Audiobook overrides

---

**End of Specification**

*This document is the single source of truth for BookTranslator UI/UX. All implementation must reference these tokens, components, and patterns. Changes require design review.*