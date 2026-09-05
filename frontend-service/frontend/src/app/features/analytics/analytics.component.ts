import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1>Analytics</h1>
        <p class="muted">Track your reading progress and collection insights</p>
      </header>

      <div class="stats-grid">
        <article class="stat-card card card-elevated">
          <div class="stat-icon stat-icon-primary">
            <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 15l-6-6-6 6" /></svg>
          </div>
          <div class="stat-content">
            <p class="stat-label">Reading Streak</p>
            <p class="stat-value">14 days</p>
            <p class="stat-trend positive">
              <svg class="icon icon-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 15l-6-6-6 6" /></svg>
              +3 days this week
            </p>
          </div>
        </article>

        <article class="stat-card card card-elevated">
          <div class="stat-icon stat-icon-accent">
            <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
          </div>
          <div class="stat-content">
            <p class="stat-label">Avg. Reading Time</p>
            <p class="stat-value">42 min/day</p>
            <p class="stat-trend positive">
              <svg class="icon icon-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 15l-6-6-6 6" /></svg>
              +12% vs last month
            </p>
          </div>
        </article>

        <article class="stat-card card card-elevated">
          <div class="stat-icon stat-icon-success">
            <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          </div>
          <div class="stat-content">
            <p class="stat-label">Books Completed</p>
            <p class="stat-value">8</p>
            <p class="stat-trend positive">
              <svg class="icon icon-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 15l-6-6-6 6" /></svg>
              +2 this month
            </p>
          </div>
        </article>

        <article class="stat-card card card-elevated">
          <div class="stat-icon stat-icon-secondary">
            <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
          </div>
          <div class="stat-content">
            <p class="stat-label">Pages Read</p>
            <p class="stat-value">2,847</p>
            <p class="stat-trend positive">
              <svg class="icon icon-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 15l-6-6-6 6" /></svg>
              +427 this month
            </p>
          </div>
        </article>
      </div>

      <div class="charts-grid">
        <article class="card card-elevated chart-card">
          <header class="section-header">
            <h2>Reading Activity</h2>
            <select class="select-sm" aria-label="Time period">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>Last year</option>
            </select>
          </header>
          <div class="chart-placeholder" aria-label="Reading activity chart">
            <svg viewBox="0 0 100 100" class="chart-svg" aria-hidden="true">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="var(--color-accent)" stop-opacity="0.4" />
                  <stop offset="100%" stop-color="var(--color-accent)" stop-opacity="0" />
                </linearGradient>
              </defs>
              <path d="M10,90 L20,70 L30,80 L40,50 L50,60 L60,30 L70,40 L80,20 L90,10" fill="none" stroke="var(--color-accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M10,90 L20,70 L30,80 L40,50 L50,60 L60,30 L70,40 L80,20 L90,10 L90,90 L10,90 Z" fill="url(#chartGradient)" />
            </svg>
            <p class="chart-empty">Chart visualization coming soon</p>
          </div>
        </article>

        <article class="card card-elevated chart-card">
          <header class="section-header">
            <h2>Genres Distribution</h2>
          </header>
          <div class="chart-placeholder" aria-label="Genres distribution chart">
            <div class="donut-chart" aria-hidden="true">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-border)" stroke-width="8" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-primary)" stroke-width="8" stroke-dasharray="100" stroke-dashoffset="25" transform="rotate(-90 50 50)" stroke-linecap="round" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-accent)" stroke-width="8" stroke-dasharray="100" stroke-dashoffset="75" transform="rotate(-90 50 50)" stroke-linecap="round" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-secondary)" stroke-width="8" stroke-dasharray="100" stroke-dashoffset="90" transform="rotate(-90 50 50)" stroke-linecap="round" />
              </svg>
              <div class="donut-center">
                <span class="donut-value">12</span>
                <span class="donut-label">Genres</span>
              </div>
            </div>
            <ul class="legend">
              <li><span class="legend-color" style="background: var(--color-primary)"></span> Fiction (35%)</li>
              <li><span class="legend-color" style="background: var(--color-accent)"></span> Non-Fiction (28%)</li>
              <li><span class="legend-color" style="background: var(--color-secondary)"></span> Sci-Fi (22%)</li>
              <li><span class="legend-color" style="background: var(--color-muted-foreground)"></span> Other (15%)</li>
            </ul>
          </div>
        </article>
      </div>

      <article class="card card-elevated">
        <header class="section-header">
          <h2>Top Authors</h2>
        </header>
        <div class="author-list">
          @for (author of topAuthors; track author.name) {
            <div class="author-item">
              <div class="author-avatar">
                {{ author.name.charAt(0) }}
              </div>
              <div class="author-info">
                <h4>{{ author.name }}</h4>
                <p>{{ author.books }} books · {{ author.pages }} pages</p>
              </div>
              <span class="badge badge-primary">{{ author.percentage }}%</span>
            </div>
          }
        </div>
      </article>
    </div>
  `,
  styles: [`
    .page-container { display: flex; flex-direction: column; gap: var(--space-xl); }

    .page-header { display: flex; flex-direction: column; gap: var(--space-xs); }

    .page-header h1 { margin: 0; }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: var(--space-lg);
    }

    .stat-card {
      display: flex;
      align-items: flex-start;
      gap: var(--space-lg);
      padding: var(--space-xl);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .stat-icon-primary { background: color-mix(in srgb, var(--color-primary) 15%, transparent); color: var(--color-primary); }
    .stat-icon-accent { background: color-mix(in srgb, var(--color-accent) 15%, transparent); color: var(--color-accent); }
    .stat-icon-success { background: color-mix(in srgb, #16A34A 15%, transparent); color: #16A34A; }
    .stat-icon-secondary { background: color-mix(in srgb, var(--color-secondary) 15%, transparent); color: var(--color-secondary); }

    .stat-content { flex: 1; min-width: 0; }

    .stat-label { font-size: 0.875rem; color: var(--color-muted-foreground); margin: 0 0 var(--space-xs); font-weight: 500; }

    .stat-value { font-family: var(--font-heading); font-size: clamp(1.75rem, 3vw, 2.5rem); font-weight: 600; margin: 0; line-height: 1.2; }

    .stat-trend { display: flex; align-items: center; gap: var(--space-xs); font-size: 0.875rem; margin: var(--space-xs) 0 0; }

    .stat-trend.positive { color: #16A34A; }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: var(--space-lg);
    }

    .chart-card { min-height: 300px; }

    .chart-placeholder { height: 250px; display: flex; align-items: center; justify-content: center; color: var(--color-muted-foreground); }

    .chart-svg { width: 100%; height: 100%; }

    .chart-empty { position: absolute; text-align: center; width: 100%; }

    .donut-chart { position: relative; width: 200px; height: 200px; margin: 0 auto; display: flex; align-items: center; justify-content: center; }

    .donut-chart svg { width: 100%; height: 100%; }

    .donut-center { position: absolute; text-align: center; pointer-events: none; }

    .donut-value { display: block; font-family: var(--font-heading); font-size: 2rem; font-weight: 600; color: var(--color-foreground); }

    .donut-label { display: block; font-size: 0.875rem; color: var(--color-muted-foreground); }

    .legend { display: flex; flex-wrap: wrap; justify-content: center; gap: var(--space-lg); margin-top: var(--space-lg); padding: 0; list-style: none; }

    .legend li { display: flex; align-items: center; gap: var(--space-sm); font-size: 0.875rem; color: var(--color-foreground); }

    .legend-color { width: 12px; height: 12px; border-radius: 2px; flex-shrink: 0; }

    .author-list { display: flex; flex-direction: column; gap: var(--space-md); }

    .author-item { display: flex; align-items: center; gap: var(--space-md); padding: var(--space-md); border-radius: var(--radius-md); transition: background var(--transition-fast); }

    .author-item:hover { background: var(--color-muted); }

    .author-avatar { width: 48px; height: 48px; border-radius: 50%; background: color-mix(in srgb, var(--color-primary) 15%, transparent); color: var(--color-primary); display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 1.25rem; flex-shrink: 0; }

    .author-info { min-width: 0; }

    .author-info h4 { font-size: 0.875rem; margin: 0 0 var(--space-xs); }

    .author-info p { font-size: 0.75rem; color: var(--color-muted-foreground); margin: 0; }

    .select-sm { padding: var(--space-sm) var(--space-md); font-size: 0.875rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-card); color: var(--color-foreground); cursor: pointer; }

    @media (max-width: 768px) {
      .charts-grid { grid-template-columns: 1fr; }
      .stat-value { font-size: 1.75rem; }
    }
  `]
})
export class AnalyticsComponent {
  topAuthors = [
    { name: 'Brandon Sanderson', books: 5, pages: 4200, percentage: '28%' },
    { name: 'Isaac Asimov', books: 4, pages: 2800, percentage: '19%' },
    { name: 'Ursula K. Le Guin', books: 3, pages: 1800, percentage: '12%' },
    { name: 'Frank Herbert', books: 2, pages: 1500, percentage: '10%' },
    { name: 'N.K. Jemisin', books: 2, pages: 1200, percentage: '8%' },
  ];
}