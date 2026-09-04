import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CollectionService } from '../../core/collection.service';
import { AuthService } from '../../core/auth.service';
import { Collection, Volume } from '../../models/collection.model';

interface StatCard {
  label: string;
  value: string | number;
  icon: string;
  trend?: { value: number; label: string };
  color: 'primary' | 'accent' | 'secondary' | 'success';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard">
      <header class="dashboard-header">
        <div>
          <h1 class="dashboard-title">Dashboard</h1>
          <p class="dashboard-subtitle">Welcome back, {{ currentUser() }}. Here's an overview of your collections.</p>
        </div>
        <div class="dashboard-actions">
          <a routerLink="/collections/new" class="btn-primary">
            <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            New Collection
          </a>
        </div>
      </header>

      <section class="stats-grid" aria-label="Statistics">
        @for (stat of stats(); track stat.label) {
          <article class="stat-card card card-elevated">
            <div class="stat-icon" [class]="'stat-icon-' + stat.color">
              <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" [innerHTML]="stat.icon"></svg>
            </div>
            <div class="stat-content">
              <p class="stat-label">{{ stat.label }}</p>
              <p class="stat-value">{{ stat.value }}</p>
              @if (stat.trend) {
                <p class="stat-trend" [class.positive]="stat.trend.value > 0">
                  <svg class="icon icon-sm" viewBox="0 0 24 24" aria-hidden="true">
                    @if (stat.trend.value > 0) {
                      <path d="M18 15l-6-6-6 6" />
                    } @else {
                      <path d="M6 9l6 6 6-6" />
                    }
                  </svg>
                  {{ stat.trend.value > 0 ? '+' : '' }}{{ stat.trend.value }}% {{ stat.trend.label }}
                </p>
              }
            </div>
          </article>
        }
      </section>

      <div class="dashboard-sections">
        <div class="dashboard-main">
          <article class="card card-elevated">
            <header class="section-header">
              <h2>Recent Collections</h2>
              <a routerLink="/collections" class="btn-ghost btn-sm">View all</a>
            </header>

            @if (loading()) {
              <div class="loading-state">
                <div class="skeleton" style="height: 80px;"></div>
                <div class="skeleton" style="height: 80px;"></div>
                <div class="skeleton" style="height: 80px;"></div>
              </div>
            } @else if (recentCollections().length === 0) {
              <div class="empty-state">
                <svg class="icon icon-xl" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                <h3>No collections yet</h3>
                <p>Start building your library by creating your first collection.</p>
                <a routerLink="/collections/new" class="btn-primary" style="margin-top: var(--space-md);">
                  <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  Create Collection
                </a>
              </div>
            } @else {
              <div class="collection-list">
                @for (collection of recentCollections(); track collection.id) {
                  <a [routerLink]="['/collections', collection.id]" class="collection-item card">
                    <div class="collection-cover" [style.background-image]="'url(' + (collection.coverImageUrl || getPlaceholderCover(collection)) + ')'"></div>
                    <div class="collection-info">
                      <h3>{{ collection.name }}</h3>
                      <p class="collection-meta">
                        {{ collection.totalVolumes || 0 }} volumes
                        @if (collection.language) { · {{ collection.language }} }
                        @if (collection.publisher) { · {{ collection.publisher }} }
                      </p>
                      @if (collection.description) {
                        <p class="collection-desc">{{ collection.description }}</p>
                      }
                    </div>
                    <div class="collection-status">
                      <span class="badge" [class.badge-success]="collection.active" [class.badge-muted]="!collection.active">
                        {{ collection.active ? 'Active' : 'Inactive' }}
                      </span>
                    </div>
                  </a>
                }
              </div>
            }
          </article>
        </div>

        <aside class="dashboard-sidebar">
          <article class="card card-elevated">
            <header class="section-header">
              <h2>Quick Actions</h2>
            </header>
            <div class="action-grid">
              <a routerLink="/collections/new" class="action-btn card">
                <div class="action-icon action-icon-primary">
                  <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                </div>
                <div>
                  <h4>New Collection</h4>
                  <p>Create a new book collection</p>
                </div>
              </a>
              <a routerLink="/collections/import" class="action-btn card">
                <div class="action-icon action-icon-accent">
                  <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                </div>
                <div>
                  <h4>Import Books</h4>
                  <p>Add books from CSV or ISBN</p>
                </div>
              </a>
              <a routerLink="/analytics" class="action-btn card">
                <div class="action-icon action-icon-secondary">
                  <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
                </div>
                <div>
                  <h4>View Analytics</h4>
                  <p>Track reading progress</p>
                </div>
              </a>
              <a routerLink="/settings" class="action-btn card">
                <div class="action-icon action-icon-muted">
                  <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                </div>
                <div>
                  <h4>Settings</h4>
                  <p>Manage preferences</p>
                </div>
              </a>
            </div>
          </article>

          <article class="card card-elevated" style="margin-top: var(--space-lg);">
            <header class="section-header">
              <h2>Reading Stats</h2>
            </header>
            <div class="stat-mini-grid">
              <div class="stat-mini">
                <span class="stat-mini-value">{{ totalVolumes() }}</span>
                <span class="stat-mini-label">Total Volumes</span>
              </div>
              <div class="stat-mini">
                <span class="stat-mini-value">{{ completedVolumes() }}</span>
                <span class="stat-mini-label">Completed</span>
              </div>
              <div class="stat-mini">
                <span class="stat-mini-value">{{ readingVolumes() }}</span>
                <span class="stat-mini-label">In Progress</span>
              </div>
              <div class="stat-mini">
                <span class="stat-mini-value">{{ totalPages() }}</span>
                <span class="stat-mini-label">Pages Read</span>
              </div>
            </div>
          </article>
        </aside>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { display: flex; flex-direction: column; gap: var(--space-xl); }

    .dashboard-header { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-lg); flex-wrap: wrap; }

    .dashboard-title { font-size: clamp(1.75rem, 3vw, 2.25rem); margin-bottom: var(--space-xs); }

    .dashboard-subtitle { color: var(--color-muted-foreground); margin: 0; }

    .dashboard-actions { display: flex; gap: var(--space-md); flex-wrap: wrap; }

    .btn-sm { padding: var(--space-sm) var(--space-md); font-size: 0.875rem; }

    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: var(--space-lg); }

    .stat-card { display: flex; align-items: flex-start; gap: var(--space-lg); padding: var(--space-xl); }

    .stat-icon { width: 48px; height: 48px; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

    .stat-icon-primary { background: color-mix(in srgb, var(--color-primary) 15%, transparent); color: var(--color-primary); }
    .stat-icon-accent { background: color-mix(in srgb, var(--color-accent) 15%, transparent); color: var(--color-accent); }
    .stat-icon-secondary { background: color-mix(in srgb, var(--color-secondary) 15%, transparent); color: var(--color-secondary); }
    .stat-icon-success { background: color-mix(in srgb, #16A34A 15%, transparent); color: #16A34A; }

    .stat-content { flex: 1; min-width: 0; }

    .stat-label { font-size: 0.875rem; color: var(--color-muted-foreground); margin: 0 0 var(--space-xs); font-weight: 500; }

    .stat-value { font-family: var(--font-heading); font-size: clamp(1.75rem, 3vw, 2.5rem); font-weight: 600; margin: 0; line-height: 1.2; }

    .stat-trend { display: flex; align-items: center; gap: var(--space-xs); font-size: 0.875rem; margin: var(--space-xs) 0 0; }

    .stat-trend.positive { color: #16A34A; }
    .stat-trend:not(.positive) { color: var(--color-destructive); }

    .dashboard-sections { display: grid; grid-template-columns: 1fr 320px; gap: var(--space-xl); }

    .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-lg); padding-bottom: var(--space-md); border-bottom: 1px solid var(--color-border); }

    .section-header h2 { font-size: 1.125rem; margin: 0; }

    .collection-list { display: flex; flex-direction: column; gap: var(--space-md); }

    .collection-item { display: grid; grid-template-columns: 80px 1fr auto; gap: var(--space-lg); align-items: center; padding: var(--space-md); text-decoration: none; color: inherit; transition: all var(--transition-fast); }

    .collection-item:hover { transform: translateX(4px); }

    .collection-cover { width: 80px; height: 120px; border-radius: var(--radius-md); background-size: cover; background-position: center; box-shadow: var(--shadow-sm); flex-shrink: 0; }

    .collection-info { min-width: 0; }

    .collection-info h3 { font-size: 1rem; margin: 0 0 var(--space-xs); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .collection-meta { font-size: 0.875rem; color: var(--color-muted-foreground); margin: 0; }

    .collection-desc { font-size: 0.875rem; color: var(--color-muted-foreground); margin: var(--space-xs) 0 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

    .collection-status { flex-shrink: 0; }

    .empty-state { text-align: center; padding: var(--space-3xl) var(--space-xl); color: var(--color-muted-foreground); }

    .empty-state svg { margin-bottom: var(--space-lg); opacity: 0.5; }

    .empty-state h3 { font-size: 1.125rem; color: var(--color-foreground); margin-bottom: var(--space-sm); }

    .empty-state p { margin-bottom: var(--space-lg); }

    .loading-state { display: flex; flex-direction: column; gap: var(--space-md); }

    .skeleton { background: linear-gradient(90deg, var(--color-muted) 25%, var(--color-border) 50%, var(--color-muted) 75%); background-size: 200% 100%; border-radius: var(--radius-md); animation: shimmer 1.5s infinite; }

    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    .dashboard-sidebar { display: flex; flex-direction: column; gap: var(--space-lg); }

    .action-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); }

    .action-btn { display: flex; align-items: flex-start; gap: var(--space-md); padding: var(--space-md); text-decoration: none; color: inherit; transition: all var(--transition-fast); }

    .action-btn:hover { transform: translateY(-2px); }

    .action-icon { width: 40px; height: 40px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

    .action-icon-primary { background: color-mix(in srgb, var(--color-primary) 15%, transparent); color: var(--color-primary); }
    .action-icon-accent { background: color-mix(in srgb, var(--color-accent) 15%, transparent); color: var(--color-accent); }
    .action-icon-secondary { background: color-mix(in srgb, var(--color-secondary) 15%, transparent); color: var(--color-secondary); }
    .action-icon-muted { background: var(--color-muted); color: var(--color-muted-foreground); }

    .action-btn h4 { font-size: 0.875rem; margin: 0 0 var(--space-xs); }

    .action-btn p { font-size: 0.75rem; color: var(--color-muted-foreground); margin: 0; }

    .stat-mini-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-md); }

    .stat-mini { text-align: center; padding: var(--space-lg); background: var(--color-muted); border-radius: var(--radius-md); }

    .stat-mini-value { display: block; font-family: var(--font-heading); font-size: 2rem; font-weight: 600; color: var(--color-primary); line-height: 1.2; }

    .stat-mini-label { display: block; font-size: 0.75rem; color: var(--color-muted-foreground); margin-top: var(--space-xs); }

    @media (max-width: 1024px) {
      .dashboard-sections { grid-template-columns: 1fr; }
    }

    @media (max-width: 768px) {
      .action-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  loading = signal(true);
  collections = signal<Collection[]>([]);

  recentCollections = computed(() => this.collections().slice(0, 5));

  totalCollections = computed(() => this.collections().length);
  totalVolumes = signal(0);
  completedVolumes = signal(0);
  readingVolumes = signal(0);
  totalPages = signal(0);

  currentUser = signal('User');

  stats = computed<StatCard[]>(() => [
    { label: 'Total Collections', value: this.totalCollections(), icon: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />', color: 'primary', trend: { value: 12, label: 'vs last month' } },
    { label: 'Total Volumes', value: this.totalVolumes(), icon: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />', color: 'accent', trend: { value: 8, label: 'vs last month' } },
    { label: 'Completed', value: this.completedVolumes(), icon: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />', color: 'success', trend: { value: 5, label: 'this month' } },
    { label: 'In Progress', value: this.readingVolumes(), icon: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />', color: 'secondary', trend: { value: -3, label: 'vs last month' } }
  ]);

  constructor(
    private readonly collectionService: CollectionService,
    private readonly auth: AuthService
  ) {}

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.loading.set(true);
    this.collectionService.getAll().subscribe({
      next: (collections) => {
        this.collections.set(collections);
        this.calculateStats(collections);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); }
    });
  }

  private calculateStats(collections: Collection[]): void {
    let totalVol = 0;
    let completed = 0;
    let reading = 0;
    let pages = 0;

    collections.forEach(c => { totalVol += c.totalVolumes || 0; });

    this.totalVolumes.set(totalVol);
    this.completedVolumes.set(completed);
    this.readingVolumes.set(reading);
    this.totalPages.set(pages);
  }

  getPlaceholderCover(collection: Collection): string {
    const colors = ['#78716C', '#92400E', '#D97706', '#475569'];
    const color = colors[collection.id.charCodeAt(0) % colors.length];
    return `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300"><rect width="200" height="300" fill="${color}"/><text x="100" y="150" font-family="Georgia,serif" font-size="14" fill="white" text-anchor="middle" dominant-baseline="middle">${collection.name.slice(0, 20)}</text></svg>`)}`;
  }
}