import { Component, input, output, signal, computed, HostListener } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { X, Search, Eye, EyeOff } from 'lucide-angular';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'search';

@Component({
  selector: 'bt-input',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
})
export class InputComponent {
  readonly label = input<string>('');
  readonly hint = input<string>('');
  readonly error = input<string>('');
  readonly placeholder = input<string>('');
  readonly type = input<InputType>('text');
  readonly value = input<string>('');
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly required = input(false);
  readonly clearable = input(false);
  readonly showPassword = input(false);
  readonly id = input<string>(`input-${Math.random().toString(36).slice(2, 9)}`);
  readonly name = input<string>('');
  readonly autocomplete = input<string>('off');
  readonly ariaLabel = input<string>('');
  readonly ariaDescribedBy = input<string>('');

  readonly valueChange = output<string>();
  readonly blur = output<FocusEvent>();
  readonly focus = output<FocusEvent>();
  readonly keydown = output<KeyboardEvent>();

  readonly XIcon = X;
  readonly SearchIcon = Search;
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;

  readonly showClear = computed(() => this.clearable() && this.value() && !this.disabled() && !this.readonly());
  readonly showPasswordToggle = computed(() => this.type() === 'password' && this.showPassword());
  readonly inputType = computed(() => this.type() === 'password' && this.showPassword() ? 'text' : this.type());
  readonly describedBy = computed(() => {
    const ids = [];
    if (this.hint()) ids.push(`${this.id()}-hint`);
    if (this.error()) ids.push(`${this.id()}-error`);
    if (this.ariaDescribedBy()) ids.push(this.ariaDescribedBy());
    return ids.length ? ids.join(' ') : undefined;
  });
  readonly errorId = `${this.id()}-error`;
  readonly hintId = `${this.id()}-hint`;

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.valueChange.emit(target.value);
  }

  onBlur(event: FocusEvent): void {
    this.blur.emit(event);
  }

  onFocus(event: FocusEvent): void {
    this.focus.emit(event);
  }

  onKeydown(event: KeyboardEvent): void {
    this.keydown.emit(event);
  }

  clearValue(): void {
    this.valueChange.emit('');
  }

  togglePasswordVisibility(): void {
    // This would need a signal for internal state if we want to toggle
    // For now, the parent should control showPassword input
  }
}