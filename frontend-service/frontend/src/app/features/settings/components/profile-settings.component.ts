import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Profile {
  name: string;
  email: string;
  bio: string;
  language: string;
  timezone: string;
}

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form class="settings-form" (ngSubmit)="saveProfile()">
      <h2>Profile</h2>
      <p class="muted">Update your personal information</p>

      <div class="form-row">
        <div class="form-group">
          <label for="displayName">Display Name</label>
          <input id="displayName" type="text" [(ngModel)]="profileData.name" name="name" class="input" />
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" type="email" [(ngModel)]="profileData.email" name="email" class="input" />
        </div>
      </div>

      <div class="form-group">
        <label for="bio">Bio</label>
        <textarea id="bio" [(ngModel)]="profileData.bio" name="bio" rows="4" class="input" placeholder="Tell us about yourself..."></textarea>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="language">Preferred Language</label>
          <select id="language" [(ngModel)]="profileData.language" name="language" class="input">
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>
        <div class="form-group">
          <label for="timezone">Timezone</label>
          <select id="timezone" [(ngModel)]="profileData.timezone" name="timezone" class="input">
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Europe/London">London</option>
            <option value="Europe/Paris">Paris</option>
            <option value="Asia/Tokyo">Tokyo</option>
          </select>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-primary" [disabled]="saving()">Saving…</button>
        <button type="button" class="btn-secondary" (click)="resetProfile()">Cancel</button>
      </div>
    </form>
  `,
  styles: [`
    .settings-form { display: flex; flex-direction: column; gap: var(--space-xl); max-width: 600px; }

    .settings-form h2 { margin-bottom: var(--space-xs); }

    .form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-lg); }

    .form-group { display: flex; flex-direction: column; gap: var(--space-xs); }

    .form-group label { font-size: 0.875rem; font-weight: 500; color: var(--color-foreground); }

    .form-group .input { padding: var(--space-md); font-size: 1rem; }

    .form-group textarea.input { resize: vertical; min-height: 100px; }

    .form-actions { display: flex; gap: var(--space-md); padding-top: var(--space-lg); border-top: 1px solid var(--color-border); }

    @media (max-width: 480px) { .form-row { grid-template-columns: 1fr; } }
  `]
})
export class ProfileSettingsComponent {
  profileData: Profile = { name: 'John Reader', email: 'john@example.com', bio: 'Avid reader and book collector.', language: 'en', timezone: 'America/New_York' };
  saving = signal(false);

  saveProfile(): void { this.saving.set(true); setTimeout(() => this.saving.set(false), 1000); }

  resetProfile(): void { this.profileData = { name: 'John Reader', email: 'john@example.com', bio: 'Avid reader and book collector.', language: 'en', timezone: 'America/New_York' }; }
}