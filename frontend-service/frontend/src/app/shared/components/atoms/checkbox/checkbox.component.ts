import { Component, input, computed } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { Check } from 'lucide-angular';

@Component({
  selector: 'bt-checkbox',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
})
export class CheckboxComponent {
  readonly label = input<string>('');
  readonly hint = input<string>('');
  readonly value = input<boolean>(false);
  readonly disabled = input(false);
  readonly required = input(false);
  readonly indeterminate = input(false);
  readonly labelPosition = input<'left' | 'right'>('right');
  readonly id = input<string>(`checkbox-${Math.random().toString(36).slice(2, 9)}`);
  readonly name = input<string>('');
  readonly ariaLabel = input<string>('');
  readonly ariaDescribedBy = input<string>('');

  readonly valueChange = output<boolean>();

  readonly CheckIcon = Check;

  readonly describedBy = computed(() => {
    const ids = [];
    if (this.hint()) ids.push(`${this.id()}-hint`);
    if (this.ariaDescribedBy()) ids.push(this.ariaDescribedBy());
    return ids.length ? ids.join(' ') : undefined;
  });
  readonly hintId = `${this.id()}-hint`;

  onChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (!this.disabled()) {
      this.valueChange.emit(target.checked);
    }
  }
}