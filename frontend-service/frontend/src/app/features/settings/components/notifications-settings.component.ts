import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface NotificationItem {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
}

@Component({
  selector: 'app-notifications-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form class="settings-form">
      <h2>Notifications</h2>
      <p class="muted">Control how and when you receive notifications</p>

      <div class="setting-card card">
        <h3>Email Notifications</h3>
        @for (notif of emailNotifications(); track notif.key) {
          <label class="notification-item">
            <div class="notification-info">
              <h4>{{ notif.label }}</h4>
              <p>{{ notif.description }}</p>
            </div>
            <label class="toggle">
              <input type="checkbox" [checked]="notif.enabled" (change)="updateEmailNotif(notif.key, $any($event.target).checked)" [name]="notif.key" />
              <span class="toggle-slider"></span>
            </label>
          </label>
        }
      </div>

      <div class="setting-card card">
        <h3>Push Notifications</h3>
        @for (notif of pushNotifications(); track notif.key) {
          <label class="notification-item">
            <div class="notification-info">
              <h4>{{ notif.label }}</h4>
              <p>{{ notif.description }}</p>
            </div>
            <label class="toggle">
              <input type="checkbox" [checked]="notif.enabled" (change)="updatePushNotif(notif.key, $any($event.target).checked)" [name]="notif.key" />
              <span class="toggle-slider"></span>
            </label>
          </label>
        }
      </div>

      <div class="setting-card card">
        <h3>Frequency</h3>
        <div class="form-group">
          <label for="digestFrequency">Digest Email</label>
          <select id="digestFrequency" [value]="digestFrequency()" (change)="digestFrequency.set($any($event.target).value)" name="digestFrequency" class="input">
            <option value="instant">Instant</option>
            <option value="daily">Daily Digest</option>
            <option value="weekly">Weekly Digest</option>
            <option value="never">Never</option>
          </select>
        </div>
      </div>
    </form>
  `,
  styles: [`
    .notification-item { display: flex; align-items: center; justify-content: space-between; padding: var(--space-md) 0; border-bottom: 1px solid var(--color-border); gap: var(--space-lg); flex-wrap: wrap; }

    .notification-item:last-child { border-bottom: none; }

    .notification-info { flex: 1; min-width: 0; }

    .notification-info h4 { font-size: 0.875rem; margin: 0 0 var(--space-xs); }

    .notification-info p { font-size: 0.875rem; color: var(--color-muted-foreground); margin: 0; }

    @media (max-width: 480px) { .notification-item { flex-direction: column; align-items: flex-start; gap: var(--space-md); } }
  `]
})
export class NotificationsSettingsComponent {
  emailNotifications = signal<NotificationItem[]>([
    { key: 'newRelease', label: 'New Releases', description: 'Get notified when new books are released in your collections', enabled: true },
    { key: 'priceDrop', label: 'Price Drops', description: 'Alert me when books in my wishlist go on sale', enabled: true },
    { key: 'readingReminder', label: 'Reading Reminders', description: 'Daily reminder to continue reading', enabled: false },
    { key: 'weeklyDigest', label: 'Weekly Digest', description: 'Summary of your reading activity', enabled: true },
  ]);

  pushNotifications = signal<NotificationItem[]>([
    { key: 'pushNewRelease', label: 'New Releases', description: 'Push notification for new book releases', enabled: true },
    { key: 'pushReadingGoal', label: 'Reading Goals', description: 'Reminders to meet your daily reading goal', enabled: true },
  ]);

  digestFrequency = signal('weekly');

  updateEmailNotif(key: string, enabled: boolean): void {
    this.emailNotifications.update(arr => arr.map(n => n.key === key ? { ...n, enabled } : n));
  }

  updatePushNotif(key: string, enabled: boolean): void {
    this.pushNotifications.update(arr => arr.map(n => n.key === key ? { ...n, enabled } : n));
  }
}