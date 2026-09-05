import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProfileSettingsComponent } from './components/profile-settings.component';
import { AppearanceSettingsComponent } from './components/appearance-settings.component';
import { NotificationsSettingsComponent } from './components/notifications-settings.component';
import { SecuritySettingsComponent } from './components/security-settings.component';
import { DataSettingsComponent } from './components/data-settings.component';

interface SettingsTab {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterModule, ProfileSettingsComponent, AppearanceSettingsComponent, NotificationsSettingsComponent, SecuritySettingsComponent, DataSettingsComponent],
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1>Settings</h1>
        <p class="muted">Manage your preferences and account settings</p>
      </header>

      <div class="settings-layout">
        <nav class="settings-nav" aria-label="Settings navigation">
          <ul class="settings-tabs" role="tablist">
            @for (tab of tabs; track tab.id) {
              <li role="presentation">
                <button
                  role="tab"
                  [attr.aria-selected]="activeTab() === tab.id"
                  [attr.aria-controls]="'panel-' + tab.id"
                  [class.active]="activeTab() === tab.id"
                  (click)="activeTab.set(tab.id)"
                  class="settings-tab"
                >
                  <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" [innerHTML]="tab.icon"></svg>
                  {{ tab.label }}
                </button>
              </li>
            }
          </ul>
        </nav>

        <div class="settings-content" role="tabpanel" [attr.aria-labelledby]="'tab-' + activeTab()">
          @switch (activeTab()) {
            @case ('profile') { <app-profile-settings /> }
            @case ('appearance') { <app-appearance-settings /> }
            @case ('notifications') { <app-notifications-settings /> }
            @case ('security') { <app-security-settings /> }
            @case ('data') { <app-data-settings /> }
            @default { <app-profile-settings /> }
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { display: flex; flex-direction: column; gap: var(--space-xl); }

    .settings-layout { display: grid; grid-template-columns: 240px 1fr; gap: var(--space-xl); align-items: start; }

    .settings-nav { position: sticky; top: var(--space-xl); }

    .settings-tabs { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--space-xs); background: var(--color-card); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-md); }

    .settings-tab { display: flex; align-items: center; gap: var(--space-md); width: 100%; padding: var(--space-md); border: none; background: transparent; color: var(--color-muted-foreground); font-family: var(--font-body); font-size: 0.875rem; font-weight: 500; text-align: left; border-radius: var(--radius-md); cursor: pointer; transition: all var(--transition-fast); }

    .settings-tab:hover { background: var(--color-muted); color: var(--color-foreground); }

    .settings-tab.active { background: color-mix(in srgb, var(--color-primary) 10%, transparent); color: var(--color-primary); }

    .settings-content { min-width: 0; }

    @media (max-width: 768px) { .settings-layout { grid-template-columns: 1fr; } .settings-nav { position: static; } .settings-tabs { flex-direction: row; overflow-x: auto; padding-bottom: var(--space-md); } .settings-tab { white-space: nowrap; flex-shrink: 0; } }
  `]
})
export class SettingsComponent {
  activeTab = signal('profile');

  tabs = [
    { id: 'profile', label: 'Profile', icon: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />' },
    { id: 'appearance', label: 'Appearance', icon: '<circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />' },
    { id: 'notifications', label: 'Notifications', icon: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />' },
    { id: 'security', label: 'Security', icon: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />' },
    { id: 'data', label: 'Data & Privacy', icon: '<polyline points="22 12 16 12 14 15 10 9 18 9" />' },
  ];
}