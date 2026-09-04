import { Component, input, output, computed, signal, HostListener } from '@angular/core';

@Component({
  selector: 'bt-textarea',
  standalone: true,
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.scss',
})
export class TextareaComponent {
  readonly label = input<string>('');
  readonly hint = input<string>('');
  readonly error = input<string>('');
  readonly placeholder = input<string>('');
  readonly value = input<string>('');
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly required = input(false);
  readonly rows = input<number>(4);
  readonly minRows = input<number>(2);
  readonly maxRows = input<number>(10);
  readonly autoResize = input(true);
  readonly showCharCount = input(false);
  readonly maxLength = input<number | null>(null);
  readonly id = input<string>(`textarea-${Math.random().toString(36).slice(2, 9)}`);
  readonly name = input<string>('');
  readonly ariaLabel = input<string>('');
  readonly ariaDescribedBy = input<string>('');

  readonly valueChange = output<string>();
  readonly blur = output<FocusEvent>();
  readonly focus = output<FocusEvent>();

  readonly charCount = computed(() => this.value().length);
  readonly isAtMax = computed(() => this.maxLength() !== null && this.charCount() >= this.maxLength()!);
  readonly describedBy = computed(() => {
    const ids = [];
    if (this.hint()) ids.push(`${this.id()}-hint`);
    if (this.error()) ids.push(`${this.id()}-error`);
    if (this.showCharCount()) ids.push(`${this.id()}-count`);
    if (this.ariaDescribedBy()) ids.push(this.ariaDescribedBy());
    return ids.length ? ids.join(' ') : undefined;
  });
  readonly errorId = `${this.id()}-error`;
  readonly hintId = `${this.id()}-hint`;
  readonly countId = `${this.id()}-count`;

  @HostListener('window:resize')
  onResize(): void {
    if (this.autoResize()) {
      this.adjustHeight();
    }
  }

  ngAfterViewInit(): void {
    if (this.autoResize()) {
      setTimeout(() => this.adjustHeight(), 0);
    }
  }

  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.valueChange.emit(target.value);
    if (this.autoResize()) {
      this.adjustHeight();
    }
  }

  onBlur(event: FocusEvent): void {
    this.blur.emit(event);
  }

  onFocus(event: FocusEvent): void {
    this.focus.emit(event);
  }

  private adjustHeight(): void {
    const textarea = document.getElementById(this.id()) as HTMLTextAreaElement;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const newHeight = Math.min(
      Math.max(textarea.scrollHeight, this.minRows() * 24),
      this.maxRows() * 24
    );
    textarea.style.height = `${newHeight}px`;
  }
}