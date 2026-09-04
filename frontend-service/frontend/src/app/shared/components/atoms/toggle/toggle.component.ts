import { Component, input, computed, output } from '@angular/core';

export type ToggleType = 'switch' | 'checkbox';

@Component({
  selector: 'bt-toggle',
  standalone: true,
  templateUrl: './toggle.component.html',
  styleUrl: './toggle.component.scss',
})
export class ToggleComponent {
  readonly label = input<string>('');
  readonly hint = input<string>('');
  readonly value = input<boolean>(false);
  readonly disabled = input(false);
  readonly required = input(false);
  readonly type = input<ToggleType>('switch');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly id = input<string>(`toggle-${Math.random().toString(36).slice(2, 9)}`);
  readonly name = input<string>('');
  readonly ariaLabel = input<string>('');
  readonly ariaDescribedBy = input<string>('');

  readonly valueChange = output<boolean>();

  readonly switchSizes = computed(() => {
    const sizes = {
      sm: 'w-8 h-5',
      md: 'w-11 h-6',
      lg: 'w-14 h-7',
    };
    return sizes[this.size()];
  });

  readonly thumbSizes = computed(() => {
    const sizes = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };
    return sizes[this.size()];
  });

  readonly thumbTranslate = computed(() => {
    const translates = {
      sm: 'translate-x-5',
      md: 'translate-x-6',
      lg: 'translate-x-7',
    };
    return translates[this.size()];
  });

  onChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (!this.disabled()) {
      this.valueChange.emit(target.checked);
    }
  }
}