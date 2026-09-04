import { Component, input, computed } from '@angular/core';

export type ProgressRingSize = 'sm' | 'md' | 'lg' | 'xl';
export type ProgressVariant = 'default' | 'success' | 'warning' | 'error';

@Component({
  selector: 'bt-progress-ring',
  standalone: true,
  templateUrl: './progress-ring.component.html',
  styleUrl: './progress-ring.component.scss',
})
export class ProgressRingComponent {
  readonly value = input<number>(0);
  readonly max = input<number>(100);
  readonly variant = input<ProgressVariant>('default');
  readonly size = input<ProgressRingSize>('md');
  readonly strokeWidth = input<number>(4);
  readonly showValue = input(false);
  readonly ariaLabel = input<string>('');

  readonly percentage = computed(() => Math.min(100, Math.max(0, (this.value() / this.max()) * 100)));
  readonly radius = computed(() => {
    const sizes: Record<ProgressRingSize, number> = { sm: 20, md: 32, lg: 48, xl: 64 };
    return sizes[this.size()];
  });
  readonly circumference = computed(() => 2 * Math.PI * (this.radius() - this.strokeWidth()));
  readonly strokeDashoffset = computed(() => this.circumference() * (1 - this.percentage() / 100));
  readonly svgSize = computed(() => this.radius() * 2);
  readonly viewBox = computed(() => `0 0 ${this.svgSize()} ${this.svgSize()}`);
  readonly center = computed(() => this.svgSize() / 2);

  readonly trackColor = 'currentColor';
  readonly progressColor = computed(() => {
    const variants: Record<ProgressVariant, string> = {
      default: 'currentColor',
      success: 'var(--color-success)',
      warning: 'var(--color-warning)',
      error: 'var(--color-error)',
    };
    return variants[this.variant()];
  });
}