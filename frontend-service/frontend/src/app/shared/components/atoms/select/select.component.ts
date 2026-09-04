import { Component, input, output, computed, signal, effect, HostListener } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { ChevronDown, ChevronUp, X, Search, Check } from 'lucide-angular';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

@Component({
  selector: 'bt-select',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
})
export class SelectComponent {
  readonly label = input<string>('');
  readonly hint = input<string>('');
  readonly error = input<string>('');
  readonly placeholder = input<string>('Select...');
  readonly options = input<SelectOption[]>([]);
  readonly groups = input<SelectGroup[]>([]);
  readonly value = input<string>('');
  readonly disabled = input(false);
  readonly required = input(false);
  readonly multiple = input(false);
  readonly searchable = input(false);
  readonly clearable = input(false);
  readonly id = input<string>(`select-${Math.random().toString(36).slice(2, 9)}`);
  readonly name = input<string>('');
  readonly ariaLabel = input<string>('');
  readonly ariaDescribedBy = input<string>('');

  readonly valueChange = output<string | string[]>();
  readonly blur = output<FocusEvent>();
  readonly focus = output<FocusEvent>();
  readonly openChange = output<boolean>();

  readonly ChevronDownIcon = ChevronDown;
  readonly ChevronUpIcon = ChevronUp;
  readonly XIcon = X;
  readonly SearchIcon = Search;
  readonly CheckIcon = Check;

  readonly isOpen = signal(false);
  readonly searchQuery = signal('');
  readonly dropdownId = `${this.id()}-dropdown`;

  readonly showClear = computed(() => this.clearable() && this.value() && !this.disabled());
  readonly hasGroups = computed(() => this.groups().length > 0);
  readonly flatOptions = computed(() => {
    if (this.hasGroups()) {
      return this.groups().flatMap(g => g.options);
    }
    return this.options();
  });
  readonly filteredOptions = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.flatOptions();
    return this.flatOptions().filter(opt =>
      opt.label.toLowerCase().includes(query) ||
      opt.value.toLowerCase().includes(query)
    );
  });
  readonly selectedOptions = computed(() => {
    const val = this.value();
    if (this.multiple()) {
      return (val as string).split(',').filter(Boolean);
    }
    return val ? [val] : [];
  });

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.bt-select')) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
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

  selectOption(option: SelectOption): void {
    if (option.disabled) return;

    if (this.multiple()) {
      const current = this.selectedOptions();
      const index = current.indexOf(option.value);
      if (index > -1) {
        current.splice(index, 1);
      } else {
        current.push(option.value);
      }
      this.valueChange.emit(current.join(','));
    } else {
      this.valueChange.emit(option.value);
      this.close();
    }
  }

  clearValue(): void {
    this.valueChange.emit(this.multiple() ? [] : '');
    this.close();
  }

  onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  onFocus(): void {
    if (!this.disabled() && !this.isOpen()) {
      this.toggle();
    }
    this.focus.emit(new FocusEvent('focus'));
  }

  onBlur(): void {
    this.blur.emit(new FocusEvent('blur'));
  }

  isSelected(option: SelectOption): boolean {
    return this.selectedOptions().includes(option.value);
  }
}