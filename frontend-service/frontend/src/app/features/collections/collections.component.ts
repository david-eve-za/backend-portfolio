import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CollectionService } from '../../core/collection.service';
import { AuthService } from '../../core/auth.service';
import { Collection, Volume } from '../../models/collection.model';

@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="collections-page">
      <header class="page-header">
        <div>
          <h1>Collections</h1>
          <p class="muted">Manage and organize your book collections</p>
        </div>
        <div class="page-actions">
          <button type="button" class="btn-secondary" (click)="toggleView()">
            <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" [innerHTML]="viewIcon()"></svg>
            {{ viewMode() === 'grid' ? 'List' : 'Grid' }}
          </button>
          <a routerLink="/collections/new" class="btn-primary">
            <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            New Collection
          </a>
        </div>
      </header>

      <div class="toolbar">
        <div class="search-box">
          <svg class="icon search-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input
            type="search"
            [(ngModel)]="searchTerm"
            (keyup.enter)="search()"
            placeholder="Search collections…"
            class="search-input"
            aria-label="Search collections"
          />
          @if (searchTerm) {
            <button type="button" class="btn-icon btn-ghost" (click)="clearSearch()" aria-label="Clear search">
              <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          }
        </div>

        <div class="toolbar-filters">
          <select [(ngModel)]="sortBy" (change)="sortCollections()" class="select-sm" aria-label="Sort by">
            <option value="name">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="volumes">Volumes (High-Low)</option>
            <option value="volumes-asc">Volumes (Low-High)</option>
            <option value="recent">Recently Updated</option>
            <option value="oldest">Oldest First</option>
          </select>

          <select [(ngModel)]="filterStatus" (change)="filterCollections()" class="select-sm" aria-label="Filter by status">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      @if (error()) {
        <div class="alert alert-error" role="alert">
          <svg class="icon icon-sm" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
          {{ error() }}
          <button type="button" class="btn-ghost btn-sm" (click)="load()">Retry</button>
        </div>
      }

      @if (loading()) {
        <div class="loading-grid" [class.list]="viewMode() === 'list'">
          @for (i of [1,2,3,4,5,6]; track i) {
            <div class="skeleton-collection" [class.list]="viewMode() === 'list'"></div>
          }
        </div>
      } @else if (filteredCollections().length === 0) {
        <div class="empty-state">
          <svg class="icon icon-xl" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          <h3>No collections found</h3>
          <p>{{ searchTerm ? 'Try adjusting your search or filters' : 'Create your first collection to get started' }}</p>
          @if (!searchTerm) {
            <a routerLink="/collections/new" class="btn-primary" style="margin-top: var(--space-md);">
              <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Create Collection
            </a>
          }
        </div>
      } @else {
        @if (viewMode() === 'grid') {
          <div class="collections-grid" role="list">
            @for (collection of filteredCollections(); track collection.id) {
              <article class="collection-card card card-elevated" role="listitem">
                <a [routerLink]="['/collections', collection.id]" class="collection-link">
                  <div class="collection-cover" [style.background-image]="'url(' + (collection.coverImageUrl || getPlaceholderCover(collection)) + ')'"></div>
                  <div class="collection-body">
                    <div class="collection-header">
                      <h3>{{ collection.name }}</h3>
                      <span class="badge" [class.badge-success]="collection.active" [class.badge-muted]="!collection.active">
                        {{ collection.active ? 'Active' : 'Inactive' }}
                      </span>
                    </div>
                    @if (collection.description) {
                      <p class="collection-desc">{{ collection.description }}</p>
                    }
                    <div class="collection-meta">
                      <span>
                        <svg class="icon icon-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
                        {{ collection.totalVolumes || 0 }} volumes
                      </span>
                      @if (collection.language) {
                        <span>
                          <svg class="icon icon-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                          {{ collection.language }}
                        </span>
                      }
                      @if (collection.publisher) {
                        <span>
                          <svg class="icon icon-sm" viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><path d="M8 21h8" /><path d="M12 17v4" /></svg>
                          {{ collection.publisher }}
                        </span>
                      }
                    </div>
                  </div>
                </a>
                <div class="collection-actions">
                  <a [routerLink]="['/collections', collection.id]" class="btn-icon btn-ghost" aria-label="View collection">
                    <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  </a>
                  <button type="button" class="btn-icon btn-ghost" (click)="editCollection(collection); $event.stopPropagation()" aria-label="Edit collection">
                    <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  </button>
                  <button type="button" class="btn-icon btn-ghost btn-destructive" (click)="deleteCollection(collection); $event.stopPropagation()" aria-label="Delete collection">
                    <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                  </button>
                </div>
              </article>
            }
          </div>
        } @else {
          <div class="collections-table-container card">
            <table class="collections-table" role="grid">
              <thead>
                <tr>
                  <th scope="col">Collection</th>
                  <th scope="col">Volumes</th>
                  <th scope="col">Language</th>
                  <th scope="col">Publisher</th>
                  <th scope="col">Status</th>
                  <th scope="col">Updated</th>
                  <th scope="col"><span class="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                @for (collection of filteredCollections(); track collection.id) {
                  <tr [routerLink]="['/collections', collection.id]" class="clickable-row">
                    <td>
                      <div class="collection-cell">
                        <div class="collection-cover-sm" [style.background-image]="'url(' + (collection.coverImageUrl || getPlaceholderCover(collection)) + ')'"></div>
                        <div>
                          <strong>{{ collection.name }}</strong>
                          @if (collection.description) {
                            <p class="collection-desc-sm">{{ collection.description }}</p>
                          }
                        </div>
                      </div>
                    </td>
                    <td>{{ collection.totalVolumes || 0 }}</td>
                    <td>{{ collection.language || '&mdash;' }}</td>
                    <td>{{ collection.publisher || '&mdash;' }}</td>
                    <td>
                      <span class="badge" [class.badge-success]="collection.active" [class.badge-muted]="!collection.active">
                        {{ collection.active ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                    <td>{{ formatDate(collection.updatedAt) }}</td>
                    <td>
                      <div class="table-actions">
                        <a [routerLink]="['/collections', collection.id]" class="btn-icon btn-ghost" aria-label="View">
                          <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        </a>
                        <button type="button" class="btn-icon btn-ghost" (click)="editCollection(collection); $event.stopPropagation()" aria-label="Edit">
                          <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        </button>
                        <button type="button" class="btn-icon btn-ghost btn-destructive" (click)="deleteCollection(collection); $event.stopPropagation()" aria-label="Delete">
                          <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        <nav class="pagination" aria-label="Pagination" *ngIf="totalPages() > 1">
          <button class="btn-icon btn-ghost" (click)="changePage(currentPage() - 1)" [disabled]="currentPage() === 1" aria-label="Previous page">
            <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          @for (page of visiblePages(); track page) {
            <button class="pagination-btn" [class.active]="page === currentPage()" (click)="changePage(page)" [attr.aria-label]="'Page ' + page" [attr.aria-current]="page === currentPage() ? 'page' : null">{{ page }}</button>
          }
          <button class="btn-icon btn-ghost" (click)="changePage(currentPage() + 1)" [disabled]="currentPage() === totalPages()" aria-label="Next page">
            <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </nav>
      }
    </div>
  `,
  styles: [`
    .collections-page { display: flex; flex-direction: column; gap: var(--space-xl); }

    .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-lg); flex-wrap: wrap; }

    .page-header h1 { margin: 0; }

    .page-actions { display: flex; gap: var(--space-md); flex-wrap: wrap; }

    .toolbar { display: flex; align-items: center; justify-content: space-between; gap: var(--space-md); flex-wrap: wrap; padding: var(--space-md); background: var(--color-card); border: 1px solid var(--color-border); border-radius: var(--radius-lg); }

    .search-box { position: relative; flex: 1; max-width: 400px; }

    .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--color-muted-foreground); pointer-events: none; }

    .search-input { width: 100%; padding: var(--space-sm) var(--space-md) var(--space-sm) 3rem; font-size: 0.875rem; border-radius: var(--radius-xl); border: 1px solid var(--color-border); background: var(--color-background); color: var(--color-foreground); transition: all var(--transition-fast); }

    .search-input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 15%, transparent); background: var(--color-card); }

    .toolbar-filters { display: flex; gap: var(--space-md); flex-wrap: wrap; }

    .select-sm { padding: var(--space-sm) var(--space-md); font-size: 0.875rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-card); color: var(--color-foreground); cursor: pointer; min-width: 180px; }

    .alert { display: flex; align-items: center; justify-content: space-between; gap: var(--space-md); padding: var(--space-md); border-radius: var(--radius-md); flex-wrap: wrap; }

    .alert-error { background: color-mix(in srgb, var(--color-destructive) 10%, transparent); border: 1px solid color-mix(in srgb, var(--color-destructive) 30%, transparent); color: var(--color-destructive); }

    .collections-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-lg); }

    .collection-card { display: flex; flex-direction: column; overflow: hidden; transition: all var(--transition-normal); }

    .collection-link { display: block; text-decoration: none; color: inherit; flex: 1; }

    .collection-cover { aspect-ratio: 2/3; background-size: cover; background-position: center; border-radius: var(--radius-lg) var(--radius-lg) 0 0; }

    .collection-body { padding: var(--space-lg); display: flex; flex-direction: column; flex: 1; }

    .collection-header { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-md); margin-bottom: var(--space-md); }

    .collection-body h3 { font-size: 1rem; margin: 0; line-height: 1.4; }

    .collection-desc { font-size: 0.875rem; color: var(--color-muted-foreground); margin: 0 0 var(--space-md); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

    .collection-meta { display: flex; flex-wrap: wrap; gap: var(--space-md); font-size: 0.75rem; color: var(--color-muted-foreground); }

    .collection-meta span { display: flex; align-items: center; gap: var(--space-xs); }

    .collection-meta .icon-sm { flex-shrink: 0; }

    .collection-actions { display: flex; gap: var(--space-xs); padding: var(--space-md) var(--space-lg) 0; border-top: 1px solid var(--color-border); margin-top: auto; justify-content: flex-end; }

    .collections-table-container { overflow-x: auto; }

    .collections-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }

    .collections-table th, .collections-table td { padding: var(--space-md); text-align: left; border-bottom: 1px solid var(--color-border); }

    .collections-table th { font-weight: 600; color: var(--color-muted-foreground); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; background: var(--color-muted); }

    .collections-table tbody tr { transition: background var(--transition-fast); }

    .collections-table tbody tr:hover { background: var(--color-muted); }

    .clickable-row { cursor: pointer; }

    .collection-cell { display: flex; align-items: center; gap: var(--space-md); }

    .collection-cover-sm { width: 48px; height: 72px; border-radius: var(--radius-sm); background-size: cover; background-position: center; flex-shrink: 0; box-shadow: var(--shadow-sm); }

    .collection-cell strong { font-size: 0.875rem; }

    .collection-desc-sm { font-size: 0.75rem; color: var(--color-muted-foreground); margin: var(--space-xs) 0 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 300px; }

    .table-actions { display: flex; gap: var(--space-xs); justify-content: flex-end; }

    .pagination { display: flex; align-items: center; justify-content: center; gap: var(--space-sm); margin-top: var(--space-lg); flex-wrap: wrap; }

    .pagination-btn { min-width: 40px; height: 40px; padding: 0 var(--space-md); border: 1px solid var(--color-border); background: var(--color-card); border-radius: var(--radius-md); font-weight: 500; color: var(--color-foreground); cursor: pointer; transition: all var(--transition-fast); }

    .pagination-btn:hover:not(.active) { background: var(--color-muted); border-color: var(--color-primary); }

    .pagination-btn.active { background: var(--color-primary); border-color: var(--color-primary); color: var(--color-on-primary); }

    .empty-state { text-align: center; padding: var(--space-3xl) var(--space-xl); color: var(--color-muted-foreground); }

    .empty-state svg { margin-bottom: var(--space-lg); opacity: 0.5; }

    .empty-state h3 { font-size: 1.125rem; color: var(--color-foreground); margin-bottom: var(--space-sm); }

    .empty-state p { margin-bottom: var(--space-lg); }

    .loading-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-lg); }

    .loading-grid.list { grid-template-columns: 1fr; }

    .skeleton-collection { background: var(--color-card); border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden; }

    .skeleton-collection.list { display: flex; height: 100px; }

    .skeleton-collection .skeleton { height: 180px; background: linear-gradient(90deg, var(--color-muted) 25%, var(--color-border) 50%, var(--color-muted) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }

    .skeleton-collection.list .skeleton { height: 100%; width: 100%; border-radius: 0; }

    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    @media (max-width: 768px) {
      .collections-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }
      .toolbar { flex-direction: column; align-items: stretch; }
      .search-box { max-width: none; }
      .toolbar-filters { width: 100%; }
      .select-sm { flex: 1; min-width: 0; }
      .collection-actions { justify-content: stretch; }
      .collection-actions .btn-icon { flex: 1; justify-content: center; }
    }

    @media (max-width: 640px) {
      .collections-table th:nth-child(3), .collections-table td:nth-child(3),
      .collections-table th:nth-child(4), .collections-table td:nth-child(4) { display: none; }
    }
  `]
})
export class CollectionsComponent implements OnInit {
  loading = signal(true);
  error = signal('');
  collections = signal<Collection[]>([]);
  searchTerm = '';
  sortBy = 'name';
  filterStatus = 'all';
  viewMode = signal<'grid' | 'list'>('grid');
  currentPage = signal(1);
  pageSize = 12;

  viewIcon = computed(() => this.viewMode() === 'grid'
    ? '<line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />'
    : '<rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />');

  filteredCollections = computed(() => {
    let result = this.collections();

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.description?.toLowerCase().includes(term) ||
        c.publisher?.toLowerCase().includes(term) ||
        c.language?.toLowerCase().includes(term)
      );
    }

    if (this.filterStatus !== 'all') {
      result = result.filter(c => c.active === (this.filterStatus === 'active'));
    }

    switch (this.sortBy) {
      case 'name': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name-desc': result.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'volumes': result.sort((a, b) => (b.totalVolumes || 0) - (a.totalVolumes || 0)); break;
      case 'volumes-asc': result.sort((a, b) => (a.totalVolumes || 0) - (b.totalVolumes || 0)); break;
      case 'recent': result.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()); break;
      case 'oldest': result.sort((a, b) => new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime()); break;
    }

    const start = (this.currentPage() - 1) * this.pageSize;
    return result.slice(start, start + this.pageSize);
  });

  totalPages = computed(() => Math.ceil(this.collections().filter(c => {
    if (this.filterStatus !== 'all') return c.active === (this.filterStatus === 'active');
    return true;
  }).length / this.pageSize) || 1);

  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(total, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) { start = Math.max(1, end - maxVisible + 1); }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  });

  constructor(
    private readonly collectionService: CollectionService,
    private readonly auth: AuthService
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.collectionService.getAll().subscribe({
      next: (c) => { this.collections.set(c); this.loading.set(false); },
      error: () => { this.error.set('Failed to load collections'); this.loading.set(false); }
    });
  }

  search(): void { this.currentPage.set(1); }

  clearSearch(): void { this.searchTerm = ''; this.currentPage.set(1); }

  filterCollections(): void { this.currentPage.set(1); }

  sortCollections(): void { this.currentPage.set(1); }

  toggleView(): void { this.viewMode.update(v => v === 'grid' ? 'list' : 'grid'); }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) this.currentPage.set(page);
  }

  editCollection(collection: Collection): void { console.log('Edit', collection); }

  deleteCollection(collection: Collection): void {
    if (confirm(`Delete "${collection.name}"? This cannot be undone.`)) {
      this.collectionService.delete(collection.id).subscribe({
        next: () => this.collections.update(arr => arr.filter(c => c.id !== collection.id)),
        error: () => this.error.set('Failed to delete collection')
      });
    }
  }

  getPlaceholderCover(collection: Collection): string {
    const colors = ['#78716C', '#92400E', '#D97706', '#475569'];
    const color = colors[collection.id.charCodeAt(0) % colors.length];
    return `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300"><rect width="200" height="300" fill="${color}"/><text x="100" y="150" font-family="Georgia,serif" font-size="14" fill="white" text-anchor="middle" dominant-baseline="middle">${collection.name.slice(0, 20)}</text></svg>`)}`;
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    try { return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); }
    catch { return '—'; }
  }
}