import { Component, input, computed } from '@angular/core';

export type DividerOrientation = 'horizontal' | 'vertical';

@Component({
  selector: 'bt-divider',
  standalone: true,
  templateUrl: './divider.component.html',
  styleUrl: './divider.component.scss',
})
export class DividerComponent {
  readonly orientation = input<DividerOrientation>('horizontal');
  readonly label = input<string>('');
  readonly labelPosition = input<'start' | 'center' | 'end'>('center');
  readonly class = input<string>('');

  readonly containerClasses = computed(() => {
    const base = 'flex items-center w-full';
    const orientations: Record<'horizontal' | 'vertical', string> = {
      horizontal: 'flex-col',
      vertical: 'flex-row',
    };
    return `${base} ${orientations[this.orientation()]}`;
  });

  readonly lineClasses = computed(() => {
    const base = 'flex-1 border-t border-border';
    const orientations: Record<'horizontal' | 'vertical', string> = {
      horizontal: '',
      vertical: 'border-t-0 border-l h-16',
    };
    return `${base} ${orientations[this.orientation()]}`;
  });

  readonly labelClasses = computed(() => {
    const base = 'px-3 text-sm text-muted-foreground font-medium whitespace-nowrap';
    return base;
  });
}