import { Component, inject, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { Plus, Search, Filter, LayoutDashboard, FolderOpen, Clock, AlertCircle, CheckCircle, Archive, Loader2, ChevronDown } from 'lucide-angular';
import { DashboardLayoutComponent } from '../../../shared/components/templates';
import { ProjectTableComponent } from './project-table.component';
import { QueuePanelComponent } from './queue-panel.component';
import { ProjectStore } from '../../../core/state/project.store';
import { QueueStore } from '../../../core/state/queue.store';

export type ProjectStatus = 'uploaded' | 'translating' | 'glossary-review' | 'audio-generating' | 'completed' | 'archived';

export interface Project {
  id: string;
  title: string;
  author?: string;
  genre: string;
  sourceLanguage: string;
  targetLanguage: string;
  tone: string;
  status: ProjectStatus;
  progress: number;
  totalChapters: number;
  completedChapters: number;
  totalWords: number;
  translatedWords: number;
  createdAt: Date;
  updatedAt: Date;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

@Component({
  selector: 'bt-dashboard-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, DashboardLayoutComponent, ProjectTableComponent, QueuePanelComponent],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPageComponent implements OnInit {
  private projectStore = inject(ProjectStore);
  private queueStore = inject(QueueStore);

  readonly LayoutDashboardIcon = LayoutDashboard;
  readonly FolderOpenIcon = FolderOpen;
  readonly ClockIcon = Clock;
  readonly AlertCircleIcon = AlertCircle;
  readonly CheckCircleIcon = CheckCircle;
  readonly ArchiveIcon = Archive;
  readonly PlusIcon = Plus;
  readonly SearchIcon = Search;
  readonly FilterIcon = Filter;
  readonly LoaderIcon = Loader2;
  readonly ChevronDownIcon = ChevronDown;

  readonly projects = this.projectStore.projects;
  readonly currentProject = this.projectStore.currentProject;
  readonly loading = this.projectStore.loading;
  readonly error = this.projectStore.error;
  readonly activeProjects = this.projectStore.activeProjects;
  readonly projectsByStatus = this.projectStore.projectsByStatus;

  readonly queueJobs = this.queueStore.jobs;
  readonly queuePaused = this.queueStore.paused;
  readonly activeJobsCount = this.queueStore.activeJobsCount;

  readonly filter = signal<'all' | ProjectStatus>('all');
  readonly searchQuery = signal('');
  readonly showQueuePanel = signal(true);
  readonly sortBy = signal<'updated' | 'created' | 'title' | 'progress'>('updated');
  readonly sortDirection = signal<'asc' | 'desc'>('desc');

  readonly filteredProjects = computed(() => {
    let projects = this.projects();
    const filter = this.filter();
    const query = this.searchQuery().toLowerCase();

    if (filter !== 'all') {
      projects = projects.filter(p => p.status === filter);
    }

    if (query) {
      projects = projects.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.author?.toLowerCase().includes(query)
      );
    }

    // Sort
    projects = [...projects].sort((a, b) => {
      let aVal: any, bVal: any;
      switch (this.sortBy()) {
        case 'updated': aVal = a.updatedAt; bVal = b.updatedAt; break;
        case 'created': aVal = a.createdAt; bVal = b.createdAt; break;
        case 'title': aVal = a.title; bVal = b.title; break;
        case 'progress': aVal = a.progress; bVal = b.progress; break;
      }
      if (this.sortDirection() === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    return projects;
  });

  readonly statusCounts = computed(() => {
    const projects = this.projects();
    return {
      all: projects.length,
      uploaded: projects.filter(p => p.status === 'uploaded').length,
      translating: projects.filter(p => p.status === 'translating').length,
      'glossary-review': projects.filter(p => p.status === 'glossary-review').length,
      'audio-generating': projects.filter(p => p.status === 'audio-generating').length,
      completed: projects.filter(p => p.status === 'completed').length,
      archived: projects.filter(p => p.status === 'archived').length,
    };
  });

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.projectStore.setLoading(true);
    // TODO: Replace with actual API call
    // this.projectApi.getProjects().subscribe({
    //   next: (projects) => this.projectStore.setProjects(projects),
    //   error: (err) => this.projectStore.setError(err.message)
    // });

    // Mock data for development
    setTimeout(() => {
      const mockProjects: any[] = [
        {
          id: '1',
          title: "The Mage's Journey",
          author: 'John Doe',
          genre: 'Fantasy',
          sourceLanguage: 'EN',
          targetLanguage: 'ES',
          tone: 'Literary',
          status: 'translating',
          progress: 45,
          totalChapters: 50,
          completedChapters: 22,
          totalWords: 125000,
          translatedWords: 56250,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-20'),
        },
        {
          id: '2',
          title: 'Stellar Odyssey',
          author: 'Jane Smith',
          genre: 'Sci-Fi',
          sourceLanguage: 'EN',
          targetLanguage: 'FR',
          tone: 'Technical',
          status: 'glossary-review',
          progress: 100,
          totalChapters: 30,
          completedChapters: 30,
          totalWords: 89000,
          translatedWords: 89000,
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-18'),
        },
        {
          id: '3',
          title: 'Cyber Dynasty',
          genre: 'Cyberpunk',
          sourceLanguage: 'EN',
          targetLanguage: 'DE',
          tone: 'Conversational',
          status: 'audio-generating',
          progress: 78,
          totalChapters: 40,
          completedChapters: 31,
          totalWords: 110000,
          translatedWords: 85800,
          createdAt: new Date('2024-01-05'),
          updatedAt: new Date('2024-01-19'),
        },
        {
          id: '4',
          title: 'Chronicles of Aether',
          author: 'Alice Brown',
          genre: 'Fantasy',
          sourceLanguage: 'EN',
          targetLanguage: 'IT',
          tone: 'Poetic',
          status: 'completed',
          progress: 100,
          totalChapters: 25,
          completedChapters: 25,
          totalWords: 75000,
          translatedWords: 75000,
          createdAt: new Date('2023-12-20'),
          updatedAt: new Date('2024-01-15'),
        },
        {
          id: '5',
          title: 'Void Walker',
          genre: 'Action',
          sourceLanguage: 'EN',
          targetLanguage: 'PT',
          tone: 'Literal',
          status: 'uploaded',
          progress: 0,
          totalChapters: 60,
          completedChapters: 0,
          totalWords: 150000,
          translatedWords: 0,
          createdAt: new Date('2024-01-22'),
          updatedAt: new Date('2024-01-22'),
        },
      ];
      this.projectStore.setProjects(mockProjects);
      this.projectStore.setLoading(false);
    }, 500);
  }

  onFilterChange(status: 'all' | ProjectStatus): void {
    this.filter.set(status);
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
  }

  onSortChange(sortBy: typeof this.sortBy._value): void {
    if (this.sortBy() === sortBy) {
      this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(sortBy);
      this.sortDirection.set('desc');
    }
  }

  toggleQueuePanel(): void {
    this.showQueuePanel.update(v => !v);
  }

  getStatusIcon(status: ProjectStatus): any {
    const icons: Record<ProjectStatus, any> = {
      uploaded: LayoutDashboard,
      translating: Clock,
      'glossary-review': AlertCircle,
      'audio-generating': FolderOpen,
      completed: CheckCircle,
      archived: Archive,
    };
    return icons[status];
  }

  getStatusBadgeClass(status: ProjectStatus): string {
    const classes: Record<ProjectStatus, string> = {
      uploaded: 'bg-muted text-muted-foreground',
      translating: 'bg-primary/10 text-primary',
      'glossary-review': 'bg-warning/10 text-warning',
      'audio-generating': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      completed: 'bg-success/10 text-success',
      archived: 'bg-muted text-muted-foreground',
    };
    return classes[status];
  }

  getStatusLabel(status: ProjectStatus): string {
    const labels: Record<ProjectStatus, string> = {
      uploaded: 'Uploaded',
      translating: 'Translating',
      'glossary-review': 'Glossary Review',
      'audio-generating': 'Audio Generating',
      completed: 'Completed',
      archived: 'Archived',
    };
    return labels[status];
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat().format(num);
  }
}