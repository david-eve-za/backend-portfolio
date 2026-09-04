import { Component, input, output, computed, signal, effect, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { X } from 'lucide-angular';

export type DialogVariant = 'default' | 'alert' | 'confirm' | 'form';

@Component({
  selector: 'bt-dialog',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
})
export class DialogComponent {
  readonly open = input(false);
  readonly title = input<string>('');
  readonly description = input<string>('');
  readonly variant = input<DialogVariant>('default');
  readonly size = input<'sm' | 'md' | 'lg' | 'xl' | 'full'>('md');
  readonly showClose = input(true);
  readonly closeOnOverlayClick = input(true);
  readonly closeOnEscape = input(true);
  readonly ariaLabel = input<string>('');
  readonly ariaDescribedBy = input<string>('');

  readonly openChange = output<boolean>();
  readonly confirm = output<void>();
  readonly cancel = output<void>();

  readonly XIcon = X;

  @ViewChild('dialog') dialogRef!: ElementRef<HTMLDivElement>;

  private previousActiveElement: HTMLElement | null = null;

  readonly sizeClasses = computed(() => {
    const sizes: Record<string, string> = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      full: 'max-w-4xl',
    };
    return sizes[this.size()] || 'max-w-md';
  });

  readonly variantClasses = computed(() => {
    const base = 'bg-surface rounded-lg shadow-xl';
    const variants: Record<DialogVariant, string> = {
      default: '',
      alert: 'border-l-4 border-destructive',
      confirm: 'border-l-4 border-primary',
      form: '',
    };
    return `${base} ${variants[this.variant()]}`;
  });

  ngOnChanges(): void {
    if (this.open()) {
      this.trapFocus();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open() && this.closeOnEscape()) {
      this.onCancel();
    }
  }

  @HostListener('document:click', ['$event'])
  onOverlayClick(event: MouseEvent): void {
    if (this.open() && this.closeOnOverlayClick()) {
      const dialog = this.dialogRef?.nativeElement;
      if (dialog && !dialog.contains(event.target as Node)) {
        this.onCancel();
      }
    }
  }

  @HostListener('document:keydown.tab', ['$event'])
  onTab(event: KeyboardEvent): void {
    if (!this.open()) return;

    const dialog = this.dialogRef?.nativeElement;
    if (!dialog) return;

    const focusableElements = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement?.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement?.focus();
    }
  }

  private trapFocus(): void {
    this.previousActiveElement = document.activeElement as HTMLElement;
    setTimeout(() => {
      const dialog = this.dialogRef?.nativeElement;
      const firstFocusable = dialog?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    }, 0);
  }

  private restoreFocus(): void {
    this.previousActiveElement?.focus();
  }

  onConfirm(): void {
    this.confirm.emit();
    this.openChange.emit(false);
    this.restoreFocus();
  }

  onCancel(): void {
    this.cancel.emit();
    this.openChange.emit(false);
    this.restoreFocus();
  }
}