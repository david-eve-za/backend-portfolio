import { Component, input, output, computed, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Check } from 'lucide-angular';

export interface TableColumn<T> {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (row: T) => string;
  align?: 'left' | 'center' | 'right';
}

export interface TableAction<T> {
  label: string;
  icon?: string;
  action: (row: T) => void;
  variant?: 'default' | 'destructive';
}

@Component({
  selector: 'bt-table',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent<T = any> {
  readonly columns = input<TableColumn<T>[]>([]);
  readonly data = input<T[]>([]);
  readonly selectable = input(false);
  readonly striped = input(false);
  readonly bordered = input(false);
  readonly hoverable = input(true);
  readonly actions = input<TableAction<T>[]>([]);
  readonly emptyMessage = input('No data available');
  readonly loading = input(false);
  readonly pageSize = input<number>(10);
  readonly showPagination = input(true);

  readonly rowClick = output<T>();
  readonly selectionChange = output<T[]>();
  readonly sortChange = output<{ key: string; direction: 'asc' | 'desc' }>();
  readonly actionClick = output<{ action: TableAction<T>; row: T }>();

  readonly ChevronUpIcon = ChevronUp;
  readonly ChevronDownIcon = ChevronDown;
  readonly ChevronLeftIcon = ChevronLeft;
  readonly ChevronRightIcon = ChevronRight;
  readonly CheckIcon = Check;

  readonly selectedRows = signal<Set<string>>(new Set());
  readonly sortColumn = signal<string>('');
  readonly sortDirection = signal<'asc' | 'desc'>('asc');
  readonly currentPage = signal(1);

  readonly totalPages = computed(() => Math.ceil(this.data().length / this.pageSize()));
  readonly paginatedData = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.data().slice(start, start + this.pageSize());
  });

  readonly allSelected = computed(() => {
    const ids = this.paginatedData().map(row => this.getRowId(row));
    return ids.length > 0 && ids.every(id => this.selectedRows().has(id));
  });

  readonly someSelected = computed(() => {
    const ids = this.paginatedData().map(row => this.getRowId(row));
    return ids.some(id => this.selectedRows().has(id)) && !this.allSelected();
  });

  getRowId(row: T): string {
    return JSON.stringify(row);
  }

  isSelected(row: T): boolean {
    return this.selectedRows().has(this.getRowId(row));
  }

  toggleRow(row: T): void {
    const id = this.getRowId(row);
    const newSet = new Set(this.selectedRows());
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    this.selectedRows.set(newSet);
    this.emitSelection();
  }

  toggleAll(): void {
    if (this.allSelected()) {
      const ids = this.paginatedData().map(row => this.getRowId(row));
      ids.forEach(id => this.selectedRows().delete(id));
    } else {
      this.paginatedData().forEach(row => this.selectedRows().add(this.getRowId(row)));
    }
    this.selectedRows.set(new Set(this.selectedRows()));
    this.emitSelection();
  }

  sort(key: string): void {
    if (this.sortColumn() === key) {
      this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(key);
      this.sortDirection.set('asc');
    }
    this.sortChange.emit({ key, direction: this.sortDirection() });
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  onRowClick(row: T): void {
    this.rowClick.emit(row);
  }

  onActionClick(action: TableAction<T>, row: T): void {
    this.actionClick.emit({ action, row });
  }

  private emitSelection(): void {
    const selected = Array.from(this.selectedRows())
      .map(id => this.data().find(row => this.getRowId(row) === id))
      .filter((row): row is T => row !== undefined);
    this.selectionChange.emit(selected);
  }
}