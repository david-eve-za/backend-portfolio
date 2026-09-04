import { Component, input, computed } from '@angular/core';

export type ProgressVariant = 'default' | 'success' | 'warning' | 'error';

@Component({
  selector: 'bt-progress-bar',
  standalone: true,
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.scss',
})
export class ProgressBarComponent {
  readonly value = input<number>(0);
  readonly max = input<number>(100);
  readonly variant = input<ProgressVariant>('default');
  readonly showLabel = input(false);
  readonly labelPosition = input<'inside' | 'outside' | 'none'>('inside');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly indeterminate = input(false);
  readonly ariaLabel = input<string>('');

  readonly percentage = computed(() => {
    if (this.indeterminate()) return 0;
    return Math.min(100, Math.max(0, (this.value() / this.max()) * 100));
  });

  readonly progressClasses = computed(() => {
    const base = 'h-full rounded-full transition-all duration-300 ease-out';
    const variants: Record<ProgressVariant, string> = {
      default: 'bg-primary',
      success: 'bg-success',
      warning: 'bg-warning',
      error: 'bg-error',
    };
    return `${base} ${variants[this.variant()]}`;
  });

  readonly containerClasses = computed(() => {
    const sizes: Record<'sm' | 'md' | 'lg', string> = {
      sm: 'h-1.5',
      md: 'h-2.5',
      lg: 'h-4',
    };
    return `relative w-full ${sizes[this.size()]} bg-muted rounded-full overflow-hidden`;
  });
}