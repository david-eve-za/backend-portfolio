import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { Check, ChevronUp, ChevronDown, MoreVertical, Play, Pause, FileText, Trash2, Edit, Eye } from 'lucide-angular';
import { BtTableComponent, TableColumn, TableAction } from '../../../shared/components/atoms';
import { Project, ProjectStatus } from './dashboard.page';

@Component({
  selector: 'bt-project-table',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, BtTableComponent],
  templateUrl: './project-table.component.html',
  styleUrl: './project-table.component.scss',
})
export class ProjectTableComponent {
  readonly projects = input.required<any[]>();
  readonly loading = input(false);
  readonly getStatusIcon = input.required<Function>();
  readonly getStatusBadgeClass = input.required<Function>();
  readonly getStatusLabel = input.required<Function>();
  readonly formatDate = input.required<Function>();
  readonly formatNumber = input.required<Function>();

  readonly rowClick = output<any>();

  readonly CheckIcon = Check;
  readonly ChevronUpIcon = ChevronUp;
  readonly ChevronDownIcon = ChevronDown;
  readonly MoreVerticalIcon = MoreVertical;
  readonly PlayIcon = Play;
  readonly PauseIcon = Pause;
  readonly FileTextIcon = FileText;
  readonly TrashIcon = Trash2;
  readonly EditIcon = Edit;
  readonly EyeIcon = Eye;

  readonly columns = computed<TableColumn<any>[]>(() => [
    {
      key: 'select',
      header: '',
      width: '50px',
      render: (row: any) => '',
      align: 'center',
    },
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      render: (row: any) => `
        <div>
          <p class="font-medium text-foreground truncate max-w-[300px]">${row.title}</p>
          @if (row.author) {
            <p class="text-xs text-muted-foreground truncate max-w-[300px]">by ${row.author}</p>
          }
        </div>
      `,
    },
    {
      key: 'genre',
      header: 'Genre',
      sortable: true,
      width: '120px',
    },
    {
      key: 'languages',
      header: 'Languages',
      sortable: true,
      width: '140px',
      render: (row: any) => `${row.sourceLanguage} → ${row.targetLanguage}`,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      width: '160px',
      render: (row: any) => {
        const status = row.status as any;
        const badgeClass = this.getStatusBadgeClass(status);
        const icon = this.getStatusIcon(status);
        const label = this.getStatusLabel(status);
        return `
          <div class="flex items-center gap-2">
            <lucide-icon [img]="getStatusIcon('${status}')" class="h-4 w-4" aria-hidden="true"></lucide-icon>
            <span class="px-2 py-0.5 text-xs font-medium rounded-full ${badgeClass}">${this.getStatusLabel(status)}</span>
          </div>
        `;
      },
    },
    {
      key: 'progress',
      header: 'Progress',
      sortable: true,
      width: '180px',
      render: (row: any) => `
        <div class="w-full max-w-[150px]">
          <div class="h-2 bg-muted rounded-full overflow-hidden">
            <div class="h-full bg-primary transition-all duration-300" style="width: ${row.progress}%"></div>
          </div>
          <div class="flex justify-between text-xs text-muted-foreground mt-1">
            <span>${row.progress}%</span>
            <span>${row.completedChapters}/${row.totalChapters} chapters</span>
          </div>
        </div>
      `,
    },
    {
      key: 'words',
      header: 'Words',
      sortable: true,
      width: '140px',
      render: (row: any) => `
        <div class="text-right">
          <p class="font-medium text-foreground">${this.formatNumber(row.translatedWords)} / ${this.formatNumber(row.totalWords)}</p>
          <p class="text-xs text-muted-foreground">${Math.round((row.translatedWords / row.totalWords) * 100)}% translated</p>
        </div>
      `,
    },
    {
      key: 'updated',
      header: 'Updated',
      sortable: true,
      width: '120px',
      render: (row: any) => this.formatDate(row.updatedAt),
    },
    {
      key: 'actions',
      header: '',
      width: '60px',
      render: (row: any) => `
        <div class="flex items-center justify-end gap-1">
          <button class="p-1.5 rounded hover:bg-muted transition-colors" aria-label="View" (click)="onRowClick($event, row)">
            <lucide-icon [img]="EyeIcon" class="h-4 w-4" aria-hidden="true" />
          </button>
          <button class="p-1.5 rounded hover:bg-muted transition-colors" aria-label="Edit" (click)="onEditClick($event, row)">
            <lucide-icon [img]="EditIcon" class="h-4 w-4" aria-hidden="true" />
          </button>
          <button class="p-1.5 rounded hover:bg-muted transition-colors text-destructive" aria-label="Delete" (click)="onDeleteClick($event, row)">
            <lucide-icon [img]="TrashIcon" class="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      `,
    },
  ]);

  readonly actions: TableAction<any>[] = [
    {
      label: 'Translate',
      icon: 'Play',
      action: (row) => this.onActionClick('translate', row),
      condition: (row) => row.status === 'uploaded' || row.status === 'glossary-review',
    },
    {
      label: 'Glossary',
      icon: 'FileText',
      action: (row) => this.onActionClick('glossary', row),
    },
    {
      label: 'Audio',
      icon: 'Volume2',
      action: (row) => this.onActionClick('audio', row),
      condition: (row) => row.status === 'completed' || row.status === 'translating',
    },
    {
      label: 'Edit',
      icon: 'Edit',
      action: (row) => this.onActionClick('edit', row),
    },
    {
      label: 'Delete',
      icon: 'Trash2',
      action: (row) => this.onActionClick('delete', row),
      variant: 'destructive',
    },
  ];

  onRowClick(event: MouseEvent, row: any): void {
    event.stopPropagation();
    this.rowClicked.emit(row);
  }

  onEditClick(event: MouseEvent, row: any): void {
    event.stopPropagation();
    this.actionClick.emit({ action: 'edit', row });
  }

  onDeleteClick(event: MouseEvent, row: any): void {
    event.stopPropagation();
    if (confirm(`Delete "${row.title}"?`)) {
      this.actionClick.emit({ action: 'delete', row });
    }
  }

  onActionClick(action: string, row: any): void {
    this.actionClick.emit({ action, row });
  }
}