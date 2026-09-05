import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  icon: string;
}

interface Token {
  id: string;
  prefix: string;
  suffix: string;
  name: string;
  lastUsed: string;
}

@Component({
  selector: 'app-security-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form class="settings-form">
      <h2>Security</h2>
      <p class="muted">Manage your account security settings</p>

      <div class="setting-card card">
        <h3>Change Password</h3>
        <div class="form-group">
          <label for="currentPassword">Current Password</label>
          <input id="currentPassword" type="password" [(ngModel)]="passwords.current" name="currentPassword" class="input" placeholder="Enter current password" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="newPassword">New Password</label>
            <input id="newPassword" type="password" [(ngModel)]="passwords.new" name="newPassword" class="input" placeholder="Enter new password" />
          </div>
          <div class="form-group">
            <label for="confirmPassword">Confirm New Password</label>
            <input id="confirmPassword" type="password" [(ngModel)]="passwords.confirm" name="confirmPassword" class="input" placeholder="Confirm new password" />
          </div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn-primary" (click)="changePassword()" [disabled]="changingPassword()">Update Password</button>
        </div>
      </div>

      <div class="setting-card card">
        <h3>Two-Factor Authentication</h3>
        <p class="muted">Add an extra layer of security to your account</p>
        <div class="two-factor-status" [class.enabled]="twoFactorEnabled()">
          <div>
            <h4>Authenticator App</h4>
            <p>{{ twoFactorEnabled() ? 'Enabled' : 'Disabled' }}</p>
          </div>
          <button type="button" class="btn-primary" (click)="toggle2FA()" [disabled]="toggling2FA()">
            {{ twoFactorEnabled() ? 'Disable' : 'Enable' }} 2FA
          </button>
        </div>
      </div>

      <div class="setting-card card">
        <h3>Active Sessions</h3>
        <p class="muted">Manage devices logged into your account</p>
        <div class="session-list">
          @for (session of sessions; track session.id) {
            <div class="session-item">
              <div class="session-info">
                <div class="session-device">
                  <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" [innerHTML]="session.icon"></svg>
                  <span>{{ session.device }}</span>
                </div>
                <div class="session-meta">
                  <span>{{ session.location }}</span>
                  <span>{{ session.lastActive }}</span>
                </div>
              </div>
              <button type="button" class="btn-ghost btn-sm" (click)="revokeSession(session.id)">Revoke</button>
            </div>
          }
        </div>
      </div>

      <div class="setting-card card">
        <h3>API Tokens</h3>
        <p class="muted">Manage personal access tokens for API access</p>
        <div class="token-list">
          @for (token of tokens; track token.id) {
            <div class="token-item">
              <div class="token-info">
                <code>{{ token.prefix }}••••••••{{ token.suffix }}</code>
                <span class="token-meta">{{ token.name }} • Last used: {{ token.lastUsed }}</span>
              </div>
              <button type="button" class="btn-ghost btn-sm btn-destructive" (click)="revokeToken(token.id)">Revoke</button>
            </div>
          }
        </div>
        <button type="button" class="btn-secondary" style="margin-top: var(--space-md);" (click)="createToken()">Generate New Token</button>
      </div>
    </form>
  `,
  styles: [`
    .two-factor-status { display: flex; align-items: center; justify-content: space-between; gap: var(--space-lg); flex-wrap: wrap; }

    .session-list { display: flex; flex-direction: column; gap: var(--space-md); }

    .session-item { display: flex; align-items: center; justify-content: space-between; padding: var(--space-md); background: var(--color-muted); border-radius: var(--radius-md); gap: var(--space-lg); flex-wrap: wrap; }

    .session-device { display: flex; align-items: center; gap: var(--space-md); }

    .session-device .icon { color: var(--color-primary); }

    .session-meta { display: flex; flex-direction: column; font-size: 0.875rem; color: var(--color-muted-foreground); gap: var(--space-xs); }

    .token-list { display: flex; flex-direction: column; gap: var(--space-md); }

    .token-item { display: flex; align-items: center; justify-content: space-between; padding: var(--space-md); background: var(--color-muted); border-radius: var(--radius-md); gap: var(--space-lg); flex-wrap: wrap; }

    .token-info { display: flex; flex-direction: column; gap: var(--space-xs); }

    .token-info code { font-family: var(--font-ui); font-size: 0.875rem; background: var(--color-card); padding: var(--space-xs) var(--space-sm); border-radius: var(--radius-sm); }

    .token-meta { font-size: 0.75rem; color: var(--color-muted-foreground); }

    .btn-destructive { color: var(--color-destructive); border-color: var(--color-destructive); }

    .btn-destructive:hover { background: var(--color-destructive); color: var(--color-on-destructive); }

    @media (max-width: 480px) { .two-factor-status, .session-item, .token-item { flex-direction: column; align-items: flex-start; } }
  `]
})
export class SecuritySettingsComponent {
  passwords = { current: '', new: '', confirm: '' };
  twoFactorEnabled = signal(false);
  toggling2FA = signal(false);
  changingPassword = signal(false);

  sessions = [
    { id: '1', device: 'MacBook Pro - Chrome', location: 'San Francisco, CA', lastActive: 'Active now', icon: '<rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />' },
    { id: '2', device: 'iPhone 15 - Safari', location: 'San Francisco, CA', lastActive: '2 hours ago', icon: '<rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />' },
    { id: '3', device: 'Windows PC - Edge', location: 'New York, NY', lastActive: '3 days ago', icon: '<rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />' },
  ];

  tokens = [
    { id: '1', prefix: 'bcm_', suffix: 'a1b2', name: 'CLI Tool', lastUsed: '2 hours ago' },
    { id: '2', prefix: 'bcm_', suffix: 'c3d4', name: 'VS Code Extension', lastUsed: '1 day ago' },
  ];

  changePassword(): void { this.changingPassword.set(true); setTimeout(() => this.changingPassword.set(false), 1000); }
  toggle2FA(): void { this.toggling2FA.set(true); setTimeout(() => { this.twoFactorEnabled.update(v => !v); this.toggling2FA.set(false); }, 1000); }
  revokeSession(id: string): void { this.sessions = this.sessions.filter(s => s.id !== id); }
  revokeToken(id: string): void { this.tokens = this.tokens.filter(t => t.id !== id); }
  createToken(): void { this.tokens = [...this.tokens, { id: Date.now().toString(), prefix: 'bcm_', suffix: Math.random().toString(36).slice(2, 6), name: 'New Token', lastUsed: 'Just now' }]; }
}