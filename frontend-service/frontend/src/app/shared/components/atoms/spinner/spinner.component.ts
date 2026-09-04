import { Component, input, computed } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { Loader2 } from 'lucide-angular';

export type SpinnerType = 'default' | 'dots' | 'bars';
export type SpinnerSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'bt-spinner',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss',
})
export class SpinnerComponent {
  readonly type = input<SpinnerType>('default');
  readonly size = input<SpinnerSize>('md');
  readonly label = input<string>('');

  readonly LoaderIcon = Loader2;

  readonly sizeClasses = computed(() => {
    const sizes: Record<SpinnerSize, string> = {
      sm: 'h-4 w-4',
      md: 'h-8 w-8',
      lg: 'h-12 w-12',
    };
    return sizes[this.size()];
  });

  readonly containerClasses = computed(() => {
    const base = 'inline-flex items-center justify-center';
    const sizes: Record<SpinnerSize, string> = {
      sm: '',
      md: '',
      lg: '',
    };
    return `${base} ${sizes[this.size()]}`;
  });
}