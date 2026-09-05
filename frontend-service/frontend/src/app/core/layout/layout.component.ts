import { Component, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles?: string[];
}

const ICONS = {
  'layout-dashboard': '<rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />',
  'book-open': '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />',
  'chart-bar': '<line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />',
  'cog': '<circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />',
  'menu': '<line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />',
  'search': '<circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />',
  'bell': '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />',
  'settings': '<circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />',
  'user': '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />',
  'log-out': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />',
  'chevron-left': '<polyline points="15 18 9 12 15 6" />',
  'chevron-right': '<polyline points="9 18 15 12 9 6" />',
  'x': '<line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />',
  'plus': '<line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />',
  'edit': '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />',
  'trash': '<polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />',
  'eye': '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />',
  'layout-grid': '<rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />',
  'list': '<line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />',
  'book': '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />',
  'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />',
  'laptop': '<rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />',
  'phone': '<rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />',
  'monitor': '<rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />',
};

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="layout" [class.sidebar-collapsed]="sidebarCollapsed()" [class.mobile-open]="mobileMenuOpen()">
      <aside
        class="sidebar"
        [class.open]="mobileMenuOpen()"
        [attr.aria-hidden]="!mobileMenuOpen()"
        role="navigation"
        aria-label="Main navigation"
      >
        <div class="sidebar-header">
          <a routerLink="/dashboard" class="brand" aria-label="Book Collection Manager - Home">
            <svg class="icon icon-lg" viewBox="0 0 24 24" aria-hidden="true" [innerHTML]="ICONS['book']"></svg>
            <span class="brand-text">Book Collection</span>
          </a>
          <button
            class="btn-icon sidebar-toggle"
            (click)="toggleSidebar()"
            [attr.aria-expanded]="!sidebarCollapsed()"
            aria-label="Toggle sidebar"
            type="button"
          >
            <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" [innerHTML]="ICONS['menu']"></svg>
          </button>
        </div>

        <nav class="sidebar-nav">
          <ul class="nav-list" role="list">
            @for (item of filteredNavItems(); track item.path) {
              <li>
                <a
                  [routerLink]="item.path"
                  routerLinkActive="active"
                  [routerLinkActiveOptions]="{ exact: true }"
                  class="nav-link"
                  [class.collapsed]="sidebarCollapsed()"
                >
                  <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" [innerHTML]="item.icon"></svg>
                  <span class="nav-label">{{ item.label }}</span>
                </a>
              </li>
            }
          </ul>
        </nav>

        <div class="sidebar-footer">
          <div class="user-info" *ngIf="!sidebarCollapsed()">
            <div class="user-avatar">
              <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" [innerHTML]="ICONS['user']"></svg>
            </div>
            <div class="user-details">
              <span class="user-name">{{ currentUser() }}</span>
              <span class="user-role">{{ currentRole() }}</span>
            </div>
          </div>
          <button
            class="btn-ghost btn-full"
            (click)="logout()"
            type="button"
          >
            <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" [innerHTML]="ICONS['log-out']"></svg>
            <span class="nav-label">Sign out</span>
          </button>
        </div>
      </aside>

      <div class="sidebar-overlay" (click)="closeMobileMenu()" *ngIf="mobileMenuOpen()"></div>

      <div class="main-wrapper">
        <header class="topbar" role="banner">
          <button
            class="btn-icon mobile-menu-btn"
            (click)="openMobileMenu()"
            type="button"
            aria-label="Open menu"
            aria-expanded="false"
          >
            <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" [innerHTML]="ICONS['menu']"></svg>
          </button>

          <div class="topbar-search">
            <svg class="icon search-icon" viewBox="0 0 24 24" aria-hidden="true" [innerHTML]="ICONS['search']"></svg>
            <input
              type="search"
              placeholder="Search collections, volumes…"
              class="search-input"
              aria-label="Search"
            />
          </div>

          <div class="topbar-actions">
            <button
              class="btn-icon btn-ghost"
              type="button"
              aria-label="Notifications"
            >
              <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" [innerHTML]="ICONS['bell']"></svg>
              <span class="notification-badge" aria-label="3 notifications">3</span>
            </button>

            <button
              class="btn-icon btn-ghost"
              type="button"
              aria-label="Settings"
            >
              <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" [innerHTML]="ICONS['settings']"></svg>
            </button>

            <div class="user-menu-btn" *ngIf="sidebarCollapsed()">
              <button
                class="btn-ghost"
                type="button"
                aria-label="User menu"
              >
                <div class="user-avatar-sm">
                  <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" [innerHTML]="ICONS['user']"></svg>
                </div>
              </button>
            </div>
          </div>
        </header>

        <main class="main-content" role="main">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .layout {
      display: grid;
      grid-template-columns: var(--sidebar-width) 1fr;
      grid-template-rows: auto 1fr;
      min-height: 100vh;
      --sidebar-width: 280px;
      --topbar-height: 64px;
    }

    .layout.sidebar-collapsed {
      --sidebar-width: 72px;
    }

    .sidebar {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      width: var(--sidebar-width);
      background: var(--color-card);
      border-right: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      transition: width var(--transition-normal), transform var(--transition-normal);
      z-index: 100;
      overflow: hidden;
    }

    .sidebar.open {
      transform: translateX(0);
      box-shadow: var(--shadow-xl);
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-lg);
      border-bottom: 1px solid var(--color-border);
      min-height: var(--topbar-height);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      color: var(--color-foreground);
      text-decoration: none;
      border-radius: var(--radius-md);
      padding: var(--space-sm);
      transition: background var(--transition-fast);
    }

    .brand:hover {
      background: var(--color-muted);
    }

    .brand-text {
      font-family: var(--font-heading);
      font-size: 1.125rem;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
    }

    .sidebar-collapsed .brand-text {
      display: none;
    }

    .sidebar-toggle {
      display: none;
    }

    .sidebar-nav {
      flex: 1;
      padding: var(--space-md);
      overflow-y: auto;
    }

    .nav-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-md);
      border-radius: var(--radius-md);
      color: var(--color-muted-foreground);
      text-decoration: none;
      transition: all var(--transition-fast);
      white-space: nowrap;
    }

    .nav-link:hover {
      background: var(--color-muted);
      color: var(--color-foreground);
    }

    .nav-link.active {
      background: color-mix(in srgb, var(--color-primary) 10%, transparent);
      color: var(--color-primary);
      font-weight: 500;
    }

    .nav-link.collapsed {
      justify-content: center;
      padding: var(--space-md);
    }

    .nav-link.collapsed .nav-label {
      display: none;
    }

    .sidebar-footer {
      padding: var(--space-md);
      border-top: 1px solid var(--color-border);
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-sm);
      margin-bottom: var(--space-sm);
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: color-mix(in srgb, var(--color-primary) 15%, transparent);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-primary);
      flex-shrink: 0;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .user-name {
      font-weight: 600;
      font-size: 0.875rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role {
      font-size: 0.75rem;
      color: var(--color-muted-foreground);
      text-transform: capitalize;
    }

    .btn-full {
      width: 100%;
      justify-content: flex-start;
    }

    .sidebar-collapsed .user-info,
    .sidebar-collapsed .btn-full .nav-label {
      display: none;
    }

    .sidebar-collapsed .btn-full {
      justify-content: center;
      padding: var(--space-md);
    }

    .sidebar-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 99;
    }

    .main-wrapper {
      grid-column: 2;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .topbar {
      position: sticky;
      top: 0;
      height: var(--topbar-height);
      background: var(--color-background);
      border-bottom: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--space-xl);
      gap: var(--space-lg);
      z-index: 50;
    }

    .mobile-menu-btn {
      display: none;
    }

    .topbar-search {
      flex: 1;
      max-width: 480px;
      position: relative;
    }

    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--color-muted-foreground);
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      padding: var(--space-sm) var(--space-md) var(--space-sm) 3rem;
      font-size: 0.875rem;
      border-radius: var(--radius-xl);
      border: 1px solid var(--color-border);
      background: var(--color-card);
      color: var(--color-foreground);
      transition: all var(--transition-fast);
    }

    .search-input:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 15%, transparent);
      background: var(--color-background);
    }

    .topbar-actions {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }

    .notification-badge {
      position: absolute;
      top: 2px;
      right: 2px;
      min-width: 16px;
      height: 16px;
      background: var(--color-destructive);
      color: white;
      font-size: 0.625rem;
      font-weight: 700;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
    }

    .user-menu-btn {
      display: none;
    }

    .main-content {
      flex: 1;
      padding: var(--space-xl);
      background: var(--color-background);
    }

    @media (max-width: 1024px) {
      .layout {
        grid-template-columns: 1fr;
      }

      .sidebar {
        transform: translateX(-100%);
        width: var(--sidebar-width);
      }

      .sidebar.open {
        transform: translateX(0);
      }

      .sidebar-toggle {
        display: flex;
      }

      .sidebar-overlay {
        display: block;
      }

      .main-wrapper {
        grid-column: 1;
      }

      .mobile-menu-btn {
        display: flex;
      }

      .topbar-search {
        display: none;
      }
    }

    @media (max-width: 768px) {
      .main-content {
        padding: var(--space-lg);
      }

      .topbar {
        padding: 0 var(--space-md);
      }
    }
  `]
})
export class LayoutComponent {
  sidebarCollapsed = signal(false);
  mobileMenuOpen = signal(false);

  protected readonly ICONS = ICONS;

  navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: ICONS['layout-dashboard'] },
    { label: 'Collections', path: '/collections', icon: ICONS['book-open'] },
    { label: 'Analytics', path: '/analytics', icon: ICONS['chart-bar'] },
    { label: 'Settings', path: '/settings', icon: ICONS['cog'] },
  ];

  currentUser = signal('User');
  currentRole = signal('Reader');

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  filteredNavItems = computed(() => this.navItems);

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  openMobileMenu(): void {
    this.mobileMenuOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
    document.body.style.overflow = '';
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.mobileMenuOpen()) {
      this.closeMobileMenu();
    }
  }
}