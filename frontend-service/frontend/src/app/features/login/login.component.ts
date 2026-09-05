import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page" [class.dark]="prefersDark()">
      <div class="login-container">
        <div class="login-card card card-elevated">
          <div class="login-header">
            <svg class="icon icon-xl login-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <h1>Book Collection Manager</h1>
            <p class="muted">Sign in to manage your collections</p>
          </div>

          <form (ngSubmit)="onSubmit()" class="login-form" #loginForm="ngForm">
            <div class="form-group">
              <label for="username">Username</label>
              <div class="input-wrapper">
                <svg class="icon input-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  id="username"
                  name="username"
                  type="text"
                  [(ngModel)]="username"
                  placeholder="Enter your username"
                  autocomplete="username"
                  required
                  #usernameInput="ngModel"
                  [class.error]="usernameInput.invalid && (usernameInput.dirty || submitted())"
                  autofocus
                />
              </div>
              @if (usernameInput.invalid && (usernameInput.dirty || submitted())) {
                <span class="error-text">Username is required</span>
              }
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <div class="input-wrapper">
                <svg class="icon input-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="password"
                  name="password"
                  type="password"
                  [(ngModel)]="password"
                  placeholder="Enter your password"
                  autocomplete="current-password"
                  required
                  #passwordInput="ngModel"
                  [class.error]="passwordInput.invalid && (passwordInput.dirty || submitted())"
                />
              </div>
              @if (passwordInput.invalid && (passwordInput.dirty || submitted())) {
                <span class="error-text">Password is required</span>
              }
            </div>

            @if (error()) {
              <div class="alert alert-error" role="alert">
                <svg class="icon icon-sm" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                {{ error() }}
              </div>
            }

            <button
              type="submit"
              class="btn-primary btn-full"
              [disabled]="loading() || loginForm.invalid"
            >
              @if (loading()) {
                <svg class="icon spinner" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke-opacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke-opacity="1" />
                </svg>
                Signing in…
              } @else {
                Sign in
                <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
              }
            </button>
          </form>

          <div class="login-footer">
            <p class="muted">Demo credentials:</p>
            <div class="credentials">
              <code>user</code> / <code>password</code>
              <span class="divider" aria-hidden="true">·</span>
              <code>admin</code> / <code>adminpassword</code>
            </div>
          </div>
        </div>

        <footer class="login-footer-note">
          <p>Book Collection Manager &copy; 2024</p>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-xl) var(--space-lg);
      background:
        radial-gradient(ellipse 80% 50% at 50% -20%, color-mix(in srgb, var(--color-accent) 15%, transparent), transparent),
        var(--color-background);
    }

    .login-page.dark {
      background:
        radial-gradient(ellipse 80% 50% at 50% -20%, color-mix(in srgb, var(--color-accent) 10%, transparent), transparent),
        var(--color-background);
    }

    .login-container {
      width: 100%;
      max-width: 420px;
    }

    .login-card {
      padding: var(--space-2xl);
    }

    .login-header {
      text-align: center;
      margin-bottom: var(--space-2xl);
    }

    .login-icon {
      color: var(--color-accent);
      margin-bottom: var(--space-md);
    }

    .login-header h1 {
      font-size: clamp(1.75rem, 4vw, 2.25rem);
      margin-bottom: var(--space-xs);
    }

    .login-header .muted {
      font-size: 1rem;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: var(--space-lg);
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }

    .input-wrapper {
      position: relative;
    }

    .input-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--color-muted-foreground);
      pointer-events: none;
      width: 1.25rem;
      height: 1.25rem;
    }

    .input-wrapper input {
      padding-left: 3rem;
    }

    .input-wrapper input.error {
      border-color: var(--color-destructive);
    }

    .input-wrapper input.error:focus {
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-destructive) 15%, transparent);
    }

    .error-text {
      font-size: 0.75rem;
      color: var(--color-destructive);
      margin-top: var(--space-xs);
    }

    .alert {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      padding: var(--space-md);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
    }

    .alert-error {
      background: color-mix(in srgb, var(--color-destructive) 10%, transparent);
      border: 1px solid color-mix(in srgb, var(--color-destructive) 30%, transparent);
      color: var(--color-destructive);
    }

    .btn-full {
      width: 100%;
      padding: 1rem;
      font-size: 1rem;
    }

    .spinner {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .login-footer {
      margin-top: var(--space-xl);
      padding-top: var(--space-lg);
      border-top: 1px solid var(--color-border);
      text-align: center;
    }

    .credentials {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-sm);
      margin-top: var(--space-sm);
      flex-wrap: wrap;
    }

    .credentials code {
      background: var(--color-muted);
      color: var(--color-primary);
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-sm);
      font-family: var(--font-ui);
      font-size: 0.875rem;
    }

    .divider {
      color: var(--color-muted-foreground);
    }

    .login-footer-note {
      margin-top: var(--space-xl);
      text-align: center;
    }

    .login-footer-note p {
      font-size: 0.75rem;
      color: var(--color-muted-foreground);
    }

    @media (max-width: 480px) {
      .login-card {
        padding: var(--space-xl);
      }
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  error = signal('');
  loading = signal(false);
  submitted = signal(false);

  prefersDark = computed(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  onSubmit(): void {
    this.submitted.set(true);
    this.error.set('');

    if (!this.username.trim() || !this.password.trim()) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.auth.login(this.username, this.password).subscribe({
      next: (res) => {
        this.auth.setToken(res.token);
        this.router.navigate(['/collections']);
      },
      error: () => {
        this.error.set('Invalid username or password');
        this.loading.set(false);
      }
    });
  }
}