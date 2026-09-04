import { Injectable, signal, computed, effect } from '@angular/core';

export type JobType = 'parse' | 'translate' | 'glossary-extract' | 'tts' | 'export';
export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface BackgroundJob {
  id: string;
  type: JobType;
  projectId: string;
  chapterId?: string;
  chapterNumber?: number;
  status: JobStatus;
  progress: number;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  result?: any;
  priority: number;
  retryCount: number;
  maxRetries: number;
}

@Injectable({ providedIn: 'root' })
export class QueueStore {
  private _jobs = signal<BackgroundJob[]>([]);
  private _maxConcurrent = signal(2);
  private _paused = signal(false);

  readonly jobs = this._jobs.asReadonly();
  readonly maxConcurrent = this._maxConcurrent.asReadonly();
  readonly paused = this._paused.asReadonly();

  readonly queuedJobs = computed(() =>
    this._jobs().filter(j => j.status === 'queued')
  );

  readonly processingJobs = computed(() =>
    this._jobs().filter(j => j.status === 'processing')
  );

  readonly completedJobs = computed(() =>
    this._jobs().filter(j => j.status === 'completed')
  );

  readonly failedJobs = computed(() =>
    this._jobs().filter(j => j.status === 'failed')
  );

  readonly activeJobsCount = computed(() =>
    this._jobs().filter(j => j.status === 'processing').length
  );

  readonly canProcessMore = computed(() =>
    this.activeJobsCount() < this._maxConcurrent() && !this._paused()
  );

  readonly projectJobs = computed(() => {
    const jobsByProject = new Map<string, BackgroundJob[]>();
    this._jobs().forEach(job => {
      const existing = jobsByProject.get(job.projectId) || [];
      existing.push(job);
      jobsByProject.set(job.projectId, existing);
    });
    return jobsByProject;
  });

  addJob(job: BackgroundJob): void {
    this._jobs.update(jobs => [...jobs, job]);
  }

  addJobs(jobs: BackgroundJob[]): void {
    this._jobs.update(current => [...current, ...jobs]);
  }

  updateJob(id: string, updates: Partial<BackgroundJob>): void {
    this._jobs.update(jobs =>
      jobs.map(j => j.id === id ? { ...j, ...updates } : j)
    );
  }

  removeJob(id: string): void {
    this._jobs.update(jobs => jobs.filter(j => j.id !== id));
  }

  clearCompleted(): void {
    this._jobs.update(jobs => jobs.filter(j => j.status !== 'completed'));
  }

  clearAll(): void {
    this._jobs.set([]);
  }

  pauseQueue(): void {
    this._paused.set(true);
  }

  resumeQueue(): void {
    this._paused.set(false);
  }

  setMaxConcurrent(count: number): void {
    this._maxConcurrent.set(Math.max(1, count));
  }

  getJob(id: string): BackgroundJob | undefined {
    return this._jobs().find(j => j.id === id);
  }

  getProjectJobs(projectId: string): BackgroundJob[] {
    return this._jobs().filter(j => j.projectId === projectId);
  }

  getNextQueuedJob(): BackgroundJob | undefined {
    const queued = this.queuedJobs()
      .sort((a, b) => b.priority - a.priority);
    return queued[0];
  }

  retryJob(id: string): void {
    this.updateJob(id, {
      status: 'queued',
      error: undefined,
      retryCount: (this.getJob(id)?.retryCount ?? 0) + 1,
    });
  }

  cancelJob(id: string): void {
    this.updateJob(id, { status: 'cancelled' });
  }
}