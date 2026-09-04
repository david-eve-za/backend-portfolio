import { Injectable, signal, computed, effect } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'system';
export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja';

interface StoredPreferences {
  theme: ThemeMode;
  language: LanguageCode;
  sidebarOpen: boolean;
  splitRatio: number;
  autoSave: boolean;
  showLineNumbers: boolean;
  wordWrap: boolean;
  fontSize: number;
  compactMode: boolean;
}

const DEFAULT_PREFERENCES: StoredPreferences = {
  theme: 'system',
  language: 'en',
  sidebarOpen: true,
  splitRatio: 0.5,
  autoSave: true,
  showLineNumbers: true,
  wordWrap: true,
  fontSize: 14,
  compactMode: false,
};

const STORAGE_KEY = 'booktranslator-ui-prefs';

@Injectable({ providedIn: 'root' })
export class UIPreferencesStore {
  private _prefs = signal<StoredPreferences>(DEFAULT_PREFERENCES);
  private _initialized = signal(false);

  readonly prefs = this._prefs.asReadonly();
  readonly initialized = this._initialized.asReadonly();

  readonly theme = computed(() => this._prefs().theme);
  readonly language = computed(() => this._prefs().language);
  readonly sidebarOpen = computed(() => this._prefs().sidebarOpen);
  readonly splitRatio = computed(() => this._prefs().splitRatio);
  readonly autoSave = computed(() => this._prefs().autoSave);
  readonly showLineNumbers = computed(() => this._prefs().showLineNumbers);
  readonly wordWrap = computed(() => this._prefs().wordWrap);
  readonly fontSize = computed(() => this._prefs().fontSize);
  readonly compactMode = computed(() => this._prefs().compactMode);

  readonly effectiveTheme = computed(() => {
    const theme = this._prefs().theme;
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  });

  constructor() {
    effect(() => {
      if (this._initialized()) {
        this.applyTheme(this.effectiveTheme());
      }
    });

    effect(() => {
      if (this._initialized()) {
        this.saveToStorage();
      }
    });
  }

  initialize(): void {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          this._prefs.set({ ...DEFAULT_PREFERENCES, ...parsed });
        } catch {
          // Ignore parse errors, use defaults
        }
      }
      this._initialized.set(true);

      // Listen for system theme changes
      if (this._prefs().theme === 'system') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', () => {
          this._prefs.update(p => ({ ...p }));
        });
      }
    }
  }

  setTheme(theme: ThemeMode): void {
    this._prefs.update(p => ({ ...p, theme }));
  }

  setLanguage(language: LanguageCode): void {
    this._prefs.update(p => ({ ...p, language }));
  }

  setSidebarOpen(open: boolean): void {
    this._prefs.update(p => ({ ...p, sidebarOpen: open }));
  }

  toggleSidebar(): void {
    this._prefs.update(p => ({ ...p, sidebarOpen: !p.sidebarOpen }));
  }

  setSplitRatio(ratio: number): void {
    this._prefs.update(p => ({ ...p, splitRatio: Math.max(0.1, Math.min(0.9, ratio)) }));
  }

  setAutoSave(enabled: boolean): void {
    this._prefs.update(p => ({ ...p, autoSave: enabled }));
  }

  setShowLineNumbers(enabled: boolean): void {
    this._prefs.update(p => ({ ...p, showLineNumbers: enabled }));
  }

  setWordWrap(enabled: boolean): void {
    this._prefs.update(p => ({ ...p, wordWrap: enabled }));
  }

  setFontSize(size: number): void {
    this._prefs.update(p => ({ ...p, fontSize: Math.max(10, Math.min(24, size)) }));
  }

  setCompactMode(enabled: boolean): void {
    this._prefs.update(p => ({ ...p, compactMode: enabled }));
  }

  resetToDefaults(): void {
    this._prefs.set(DEFAULT_PREFERENCES);
  }

  private applyTheme(theme: 'light' | 'dark'): void {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }

  private saveToStorage(): void {
    if (typeof window !== 'undefined' && this._initialized()) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._prefs()));
    }
  }
}