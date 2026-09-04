import { Component, input, output, computed, signal, effect, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { ChevronDown, ChevronUp, X, Check } from 'lucide-angular';

export interface DropdownItem {
  label: string;
  value: string;
  icon?: string;
  disabled?: boolean;
  divider?: boolean;
  danger?: boolean;
}

export type DropdownTrigger = 'click' | 'hover';

@Component({
  selector: 'bt-dropdown',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.scss',
})
export class DropdownComponent {
  readonly trigger = input<DropdownTrigger>('click');
  readonly items = input<DropdownItem[]>([]);
  readonly placeholder = input<string>('Select...');
  readonly value = input<string>('');
  readonly disabled = input(false);
  readonly searchable = input(false);
  readonly multiple = input(false);
  readonly clearable = input(false);
  readonly maxHeight = input<string>('200px');
  readonly ariaLabel = input<string>('');

  readonly valueChange = output<string | string[]>();
  readonly openChange = output<boolean>();

  readonly ChevronDownIcon = ChevronDown;
  readonly ChevronUpIcon = ChevronUp;
  readonly XIcon = X;
  readonly CheckIcon = Check;

  readonly isOpen = signal(false);
  readonly searchQuery = signal('');
  readonly dropdownId = `dropdown-${Math.random().toString(36).slice(2, 9)}`;

  @ViewChild('trigger') triggerRef!: ElementRef<HTMLButtonElement>;
  @ViewChild('menu') menuRef!: ElementRef<HTMLDivElement>;

  readonly filteredItems = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.items();
    return this.items().filter(item =>
      !item.divider && item.label.toLowerCase().includes(query)
    );
  });

  readonly selectedItems = computed(() => {
    const val = this.value();
    if (this.multiple()) {
      return (val as string).split(',').filter(Boolean);
    }
    return val ? [val] : [];
  });

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen() && !this.isClickInside(event.target as HTMLElement)) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  ngAfterViewInit(): void {
    // Focus trap would go here
  }

  toggle(): void {
    if (this.disabled()) return;
    this.isOpen.update(v => !v);
    this.openChange.emit(!this.isOpen());
  }

  close(): void {
    if (this.isOpen()) {
      this.isOpen.set(false);
      this.searchQuery.set('');
      this.openChange.emit(false);
    }
  }

  selectItem(item: DropdownItem): void {
    if (item.disabled || item.divider) return;

    if (this.multiple()) {
      const current = this.selectedItems();
      const index = current.indexOf(item.value);
      if (index > -1) {
        current.splice(index, 1);
      } else {
        current.push(item.value);
      }
      this.valueChange.emit(current.join(','));
    } else {
      this.valueChange.emit(item.value);
      this.close();
    }
  }

  clearValue(): void {
    this.valueChange.emit(this.multiple() ? [] : '');
  }

  removeItem(value: string): void {
    if (this.multiple()) {
      const current = this.selectedItems().filter(v => v !== value);
      this.valueChange.emit(current.join(','));
    } else {
      this.valueChange.emit('');
    }
  }

  isSelected(item: DropdownItem): boolean {
    return this.selectedItems().includes(item.value);
  }

  onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  private isClickInside(element: HTMLElement): boolean {
    const trigger = this.triggerRef?.nativeElement;
    const menu = this.menuRef?.nativeElement;
    return trigger?.contains(element) || menu?.contains(element);
  }
}