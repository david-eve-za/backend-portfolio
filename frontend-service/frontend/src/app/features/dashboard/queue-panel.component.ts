import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { X, Loader2, Pause, Play, AlertCircle, CheckCircle, Trash2, Clock, AlertTriangle, RotateCcw } from 'lucide-angular';

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type JobType = 'parse' | 'translate' | 'glossary-extract' | 'tts' | 'export';

export interface BackgroundJob {
  id: string;
  type: JobType;
  projectId: string;
  projectTitle?: string;
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

@Component({
  selector: 'bt-queue-panel',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './queue-panel.component.html',
  styleUrl: './queue-panel.component.scss',
})
export class QueuePanelComponent {
  readonly jobs = input<BackgroundJob[]>([]);
  readonly paused = input(false);
  readonly activeCount = input(0);

  readonly close = output<void>();
  readonly pauseQueue = output<void>();
  readonly resumeQueue = output<void>();
  readonly cancelJob = output<string>();
  readonly retryJob = output<string>();
  readonly viewJob = output<string>();

  readonly XIcon = X;
  readonly LoaderIcon = Loader2;
  readonly PauseIcon = Pause;
  readonly PlayIcon = Play;
  readonly AlertIcon = AlertCircle;
  readonly CheckIcon = CheckCircle;
  readonly TrashIcon = Trash2;
  readonly ClockIcon = Clock;
  readonly AlertTriangleIcon = AlertTriangle;
  readonly RotateIcon = RotateCcw;

  readonly jobTypeIcons = computed(() => ({
    parse: 'FileText',
    translate: 'Languages',
    'glossary-extract': 'BookOpen',
    tts: 'Volume2',
    export: 'Download',
  });

  readonly jobTypeLabels = computed(() => ({
    parse: 'Parsing',
    translate: 'Translating',
    'glossary-extract': 'Glossary Extract',
    tts: 'Audio Generation',
    export: 'Export',
  });

  readonly statusColors = computed(() => ({
    queued: 'bg-muted text-muted-foreground',
    processing: 'bg-primary/10 text-primary',
    completed: 'bg-success/10 text-success',
    failed: 'bg-destructive/10 text-destructive',
    cancelled: 'bg-muted text-muted-foreground',
  });

  readonly processingJobs = computed(() =>
    this.jobs().filter(j => j.status === 'processing')
  );

  readonly queuedJobs = computed(() =>
    this.jobs().filter(j => j.status === 'queued')
  );

  readonly recentJobs = computed(() =>
    [...this.jobs()]
      .sort((a, b) => new Date(b.startedAt || 0).getTime() - new Date(a.startedAt || 0).getTime())
      .slice(0, 10)
  );

  formatTime(date?: Date): string {
    if (!date) return '';
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }

  getStatusIcon(status: string): any {
    const icons: Record<string, any> = {
      queued: 'Clock',
      processing: 'Loader2',
      completed: 'CheckCircle',
      failed: 'AlertTriangle',
      cancelled: 'X',
    };
    return icons[status] || 'Clock';
  }

  getStatusLabel(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      parse: 'Parsing',
      translate: 'Translating',
      'glossary-extract': 'Glossary Extract',
      tts: 'Audio Gen',
      export: 'Export',
    };
    return labels[type] || type;
  }
}