import { Component, input, output, computed } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { X } from 'lucide-angular';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';
export type BadgeSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'bt-badge',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss',
})
export class BadgeComponent {
  readonly variant = input<BadgeVariant>('default');
  readonly size = input<BadgeSize>('md');
  readonly removable = input(false);
  readonly dot = input(false);
  readonly dotColor = input<string>('');

  readonly removed = output<void>();

  readonly XIcon = X;

  readonly variantClasses = computed(() => {
    const base = 'inline-flex items-center font-semibold border rounded-full transition-colors';
    const variants: Record<BadgeVariant, string> = {
      default: 'bg-muted text-muted-foreground border-transparent',
      success: 'bg-success-bg text-success border-transparent',
      warning: 'bg-warning-bg text-warning border-transparent',
      error: 'bg-error-bg text-error border-transparent',
      info: 'bg-info-bg text-info border-transparent',
      outline: 'bg-transparent border-border text-foreground',
    };
    const sizes: Record<BadgeSize, string> = {
      sm: 'px-2 py-0.5 text-xs gap-1',
      md: 'px-2.5 py-1 text-sm gap-1.5',
      lg: 'px-3 py-1.5 text-base gap-2',
    };
    return `${base} ${variants[this.variant()]} ${sizes[this.size()]}`;
  });

  onRemove(event: MouseEvent): void {
    event.stopPropagation();
    this.removed.emit();
  }
}