import { Component, input, output, computed, HostBinding } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { Loader2 } from 'lucide-angular';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'bt-button',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly fullWidth = input(false);
  readonly icon = input<string>('');
  readonly iconRight = input<string>('');
  readonly ariaLabel = input<string>('');

  readonly clicked = output<MouseEvent>();

  readonly LoaderIcon = Loader2;

  readonly variantClasses = computed(() => {
    const base = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    const variants: Record<ButtonVariant, string> = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active shadow-sm',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary-hover active:bg-secondary-active shadow-sm',
      outline: 'border border-border bg-transparent hover:bg-muted active:bg-muted/50',
      ghost: 'bg-transparent hover:bg-muted active:bg-muted/50',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive-hover active:bg-destructive-hover shadow-sm',
      link: 'bg-transparent text-primary underline-offset-4 hover:underline',
    };
    const sizes: Record<ButtonSize, string> = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2.5',
    };
    return `${base} ${variants[this.variant()]} ${sizes[this.size()]} ${this.fullWidth() ? 'w-full' : ''}`;
  });

  onClick(event: MouseEvent): void {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit(event);
    }
  }
}