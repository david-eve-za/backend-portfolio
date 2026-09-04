import { Component, input, computed, output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { Circle } from 'lucide-angular';

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'bt-radio',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './radio.component.html',
  styleUrl: './radio.component.scss',
})
export class RadioComponent {
  readonly label = input<string>('');
  readonly hint = input<string>('');
  readonly options = input<RadioOption[]>([]);
  readonly value = input<string>('');
  readonly disabled = input(false);
  readonly required = input(false);
  readonly card = input(false);
  readonly name = input<string>(`radio-${Math.random().toString(36).slice(2, 9)}`);
  readonly ariaLabel = input<string>('');
  readonly ariaDescribedBy = input<string>('');

  readonly valueChange = output<string>();

  readonly CircleIcon = Circle;

  readonly describedBy = computed(() => {
    const ids = [];
    if (this.hint()) ids.push(`${this.name()}-hint`);
    if (this.ariaDescribedBy()) ids.push(this.ariaDescribedBy());
    return ids.length ? ids.join(' ') : undefined;
  });
  readonly hintId = `${this.name()}-hint`;

  onChange(option: RadioOption): void {
    if (!option.disabled && !this.disabled()) {
      this.valueChange.emit(option.value);
    }
  }

  isSelected(option: RadioOption): boolean {
    return this.value() === option.value;
  }
}