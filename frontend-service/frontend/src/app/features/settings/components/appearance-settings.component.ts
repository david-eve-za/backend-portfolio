import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ThemeOption {
  value: string;
  label: string;
  bg: string;
  surface: string;
  accent: string;
}

interface DensityOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-appearance-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form class="settings-form">
      <h2>Appearance</h2>
      <p class="muted">Customize how the app looks</p>

      <div class="setting-card card">
        <div class="setting-header">
          <div>
            <h3>Theme</h3>
            <p class="muted">Choose your preferred color scheme</p>
          </div>
          <div class="theme-options" role="radiogroup" aria-label="Theme selection">
            @for (theme of themes; track theme.value) {
              <label class="theme-option" [class.selected]="themePreference() === theme.value">
                <input type="radio" name="theme" [value]="theme.value" [checked]="themePreference() === theme.value" (change)="themePreference.set(theme.value)" />
                <div class="theme-preview" [class]="theme.value">
                  <div class="theme-colors">
                    <span class="theme-color" [style.background]="theme.bg"></span>
                    <span class="theme-color" [style.background]="theme.surface"></span>
                    <span class="theme-color" [style.background]="theme.accent"></span>
                  </div>
                  <span class="theme-name">{{ theme.label }}</span>
                </div>
              </label>
            }
          </div>
        </div>
      </div>

      <div class="setting-card card">
        <div class="setting-header">
          <div>
            <h3>Density</h3>
            <p class="muted">Adjust spacing and compactness</p>
          </div>
          <div class="density-options" role="radiogroup" aria-label="Density selection">
            @for (density of densities; track density.value) {
              <label class="density-option" [class.selected]="densityPreference() === density.value">
                <input type="radio" name="density" [value]="density.value" [checked]="densityPreference() === density.value" (change)="densityPreference.set(density.value)" />
                <span class="density-name">{{ density.label }}</span>
              </label>
            }
          </div>
        </div>
      </div>

      <div class="setting-card card">
        <div class="setting-header">
          <div>
            <h3>Animations</h3>
            <p class="muted">Enable or disable motion effects</p>
          </div>
          <label class="toggle">
            <input type="checkbox" [checked]="animationsEnabled()" (change)="animationsEnabled.set($any($event.target).checked)" name="animations" />
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div class="setting-card card">
        <div class="setting-header">
          <div>
            <h3>Sidebar</h3>
            <p class="muted">Default sidebar state</p>
          </div>
          <label class="toggle">
            <input type="checkbox" [checked]="sidebarCollapsed()" (change)="sidebarCollapsed.set($any($event.target).checked)" name="sidebar" />
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>
    </form>
  `,
  styles: [`
    .settings-form { display: flex; flex-direction: column; gap: var(--space-xl); }

    .setting-card { padding: var(--space-lg); }

    .setting-header { display: flex; align-items: center; justify-content: space-between; gap: var(--space-lg); flex-wrap: wrap; }

    .setting-header h3 { margin: 0; font-size: 1rem; }

    .setting-header p { margin: 0; }

    .theme-options { display: flex; gap: var(--space-md); flex-wrap: wrap; }

    .theme-option { position: relative; cursor: pointer; }

    .theme-option input { position: absolute; opacity: 0; pointer-events: none; }

    .theme-preview { display: flex; flex-direction: column; align-items: center; gap: var(--space-sm); padding: var(--space-md); border: 2px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-card); transition: all var(--transition-fast); min-width: 120px; }

    .theme-option.selected .theme-preview { border-color: var(--color-primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 20%, transparent); }

    .theme-colors { display: flex; gap: 2px; height: 40px; width: 100%; border-radius: var(--radius-sm); overflow: hidden; }

    .theme-color { flex: 1; }

    .theme-name { font-size: 0.875rem; font-weight: 500; color: var(--color-foreground); }

    .density-options { display: flex; gap: var(--space-md); flex-wrap: wrap; }

    .density-option { display: flex; align-items: center; gap: var(--space-sm); padding: var(--space-md) var(--space-lg); border: 2px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-card); cursor: pointer; transition: all var(--transition-fast); }

    .density-option.selected { border-color: var(--color-primary); background: color-mix(in srgb, var(--color-primary) 5%, transparent); }

    .density-option input { position: absolute; opacity: 0; pointer-events: none; }

    .density-name { font-weight: 500; color: var(--color-foreground); }

    .toggle { position: relative; display: inline-flex; align-items: center; width: 56px; height: 32px; }

    .toggle input { position: absolute; opacity: 0; width: 0; height: 0; }

    .toggle-slider { position: relative; display: block; width: 100%; height: 100%; background: var(--color-muted); border-radius: 9999px; transition: background var(--transition-fast); }

    .toggle-slider::before { content: ''; position: absolute; top: 3px; left: 3px; width: 26px; height: 26px; background: white; border-radius: 50%; box-shadow: var(--shadow-sm); transition: transform var(--transition-fast); }

    .toggle input:checked + .toggle-slider { background: var(--color-primary); }

    .toggle input:checked + .toggle-slider::before { transform: translateX(24px); }

    @media (max-width: 480px) { .theme-preview { min-width: 100px; } }
  `]
})
export class AppearanceSettingsComponent {
  themePreference = signal('light');
  densityPreference = signal('comfortable');
  animationsEnabled = signal(true);
  sidebarCollapsed = signal(false);

  themes = [
    { value: 'light', label: 'Light', bg: '#FFFBEB', surface: '#FFFFFF', accent: '#D97706' },
    { value: 'dark', label: 'Dark', bg: '#1C1917', surface: '#292524', accent: '#D97706' },
    { value: 'system', label: 'System', bg: 'linear-gradient(135deg, #FFFBEB 50%, #1C1917 50%)', surface: 'linear-gradient(135deg, #FFFFFF 50%, #292524 50%)', accent: '#D97706' },
  ];

  densities = [
    { value: 'compact', label: 'Compact' },
    { value: 'comfortable', label: 'Comfortable' },
    { value: 'spacious', label: 'Spacious' },
  ];
}