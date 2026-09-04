import { Injectable, signal, computed, effect } from '@angular/core';

export interface Project {
  id: string;
  title: string;
  author?: string;
  genre: string;
  sourceLanguage: string;
  targetLanguage: string;
  tone: string;
  status: 'uploaded' | 'translating' | 'glossary-review' | 'audio-generating' | 'completed' | 'archived';
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

export interface CreateProjectInput {
  title: string;
  author?: string;
  genre: string;
  sourceLanguage: string;
  targetLanguage: string;
  tone: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
}

@Injectable({ providedIn: 'root' })
export class ProjectStore {
  private _projects = signal<Project[]>([]);
  private _currentProject = signal<Project | null>(null);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  readonly projects = this._projects.asReadonly();
  readonly currentProject = this._currentProject.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly activeProjects = computed(() =>
    this._projects().filter(p => !['completed', 'archived'].includes(p.status))
  );

  readonly completedProjects = computed(() =>
    this._projects().filter(p => p.status === 'completed')
  );

  readonly archivedProjects = computed(() =>
    this._projects().filter(p => p.status === 'archived')
  );

  readonly projectsByStatus = computed(() => {
    const statuses = ['uploaded', 'translating', 'glossary-review', 'audio-generating', 'completed', 'archived'] as const;
    return statuses.reduce((acc, status) => {
      acc[status] = this._projects().filter(p => p.status === status);
      return acc;
    }, {} as Record<string, Project[]>);
  });

  setProjects(projects: Project[]): void {
    this._projects.set(projects);
    this._error.set(null);
  }

  setCurrentProject(project: Project | null): void {
    this._currentProject.set(project);
  }

  setLoading(loading: boolean): void {
    this._loading.set(loading);
  }

  setError(error: string | null): void {
    this._error.set(error);
  }

  addProject(project: Project): void {
    this._projects.update(projects => [...projects, project]);
  }

  updateProject(id: string, updates: Partial<Project>): void {
    this._projects.update(projects =>
      projects.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p)
    );
    if (this._currentProject()?.id === id) {
      this._currentProject.update(p => p ? { ...p, ...updates, updatedAt: new Date() } : null);
    }
  }

  removeProject(id: string): void {
    this._projects.update(projects => projects.filter(p => p.id !== id));
    if (this._currentProject()?.id === id) {
      this._currentProject.set(null);
    }
  }

  updateProjectStatus(id: string, status: Project['status'], progress?: number): void {
    this.updateProject(id, {
      status,
      progress: progress ?? this._projects().find(p => p.id === id)?.progress ?? 0,
    });
  }

  updateProjectProgress(id: string, progress: number): void {
    this.updateProject(id, { progress });
  }

  getProject(id: string): Project | undefined {
    return this._projects().find(p => p.id === id);
  }

  clearError(): void {
    this._error.set(null);
  }
}