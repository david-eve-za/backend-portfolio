import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface PrivacyOption {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
}

@Component({
  selector: 'app-data-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-form">
      <h2>Data & Privacy</h2>
      <p class="muted">Manage your data and privacy preferences</p>

      <div class="setting-card card">
        <h3>Export Data</h3>
        <p class="muted">Download a copy of all your data</p>
        <button type="button" class="btn-primary" (click)="exportData()">Export My Data</button>
      </div>

      <div class="setting-card card">
        <h3>Delete Account</h3>
        <p class="muted">Permanently delete your account and all associated data. This action cannot be undone.</p>
        <button type="button" class="btn-secondary btn-destructive" (click)="confirmDelete()">Delete Account</button>
      </div>

      <div class="setting-card card">
        <h3>Privacy Settings</h3>
        <div class="privacy-options">
          @for (option of privacyOptions(); track option.key) {
            <label class="privacy-item">
              <div class="privacy-info">
                <h4>{{ option.label }}</h4>
                <p>{{ option.description }}</p>
              </div>
              <label class="toggle">
                <input type="checkbox" [checked]="option.enabled" (change)="option.enabled = $any($event.target).checked" [name]="option.key" />
                <span class="toggle-slider"></span>
              </label>
            </label>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .privacy-options { display: flex; flex-direction: column; gap: var(--space-md); }

    .privacy-item { display: flex; align-items: center; justify-content: space-between; padding: var(--space-md); background: var(--color-muted); border-radius: var(--radius-md); gap: var(--space-lg); flex-wrap: wrap; }

    .privacy-info { flex: 1; min-width: 0; }

    .privacy-info h4 { font-size: 0.875rem; margin: 0 0 var(--space-xs); }

    .privacy-info p { font-size: 0.875rem; color: var(--color-muted-foreground); margin: 0; }
  `]
})
export class DataSettingsComponent {
  privacyOptions = signal<{ key: string; label: string; description: string; enabled: boolean }[]>([
    { key: 'profileVisible', label: 'Public Profile', description: 'Allow others to see your profile and collections', enabled: true },
    { key: 'readingActivity', label: 'Reading Activity', description: 'Share your reading progress and stats', enabled: true },
    { key: 'analytics', label: 'Usage Analytics', description: 'Help improve the app by sharing anonymous usage data', enabled: true },
    { key: 'marketing', label: 'Marketing Emails', description: 'Receive updates about new features and promotions', enabled: false },
  ]);

  exportData(): void { alert('Data export initiated. You will receive an email with a download link.'); }
  confirmDelete(): void { if (confirm('Are you sure you want to permanently delete your account? This cannot be undone.')) { alert('Account deletion initiated.'); } }
}