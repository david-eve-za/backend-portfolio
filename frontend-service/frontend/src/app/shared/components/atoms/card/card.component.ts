import { Component, input, computed } from '@angular/core';

export type CardVariant = 'default' | 'outlined' | 'elevated';

@Component({
  selector: 'bt-card',
  standalone: true,
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {
  readonly variant = input<CardVariant>('default');
  readonly padding = input<'none' | 'sm' | 'md' | 'lg'>('md');
  readonly hoverable = input(false);
  readonly class = input<string>('');

  readonly variantClasses = computed(() => {
    const base = 'rounded-lg transition-all duration-200';
    const variants: Record<CardVariant, string> = {
      default: 'bg-surface border border-border shadow-sm',
      outlined: 'bg-transparent border-2 border-border',
      elevated: 'bg-surface border border-border shadow-lg',
    };
    const padding: Record<'none' | 'sm' | 'md' | 'lg', string> = {
      none: 'p-0',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };
    const hover = this.hoverable() ? 'hover:shadow-md hover:border-primary' : '';
    return `${base} ${variants[this.variant()]} ${padding[this.padding()]} ${hover}`;
  });
}