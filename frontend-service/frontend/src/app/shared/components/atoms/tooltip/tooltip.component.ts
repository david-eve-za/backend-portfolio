import { Component, input, computed, effect, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

@Component({
  selector: 'bt-tooltip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tooltip.component.html',
  styleUrl: './tooltip.component.scss',
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'inline-block relative',
  },
})
export class TooltipComponent {
  readonly content = input.required<string>();
  readonly position = input<TooltipPosition>('top');
  readonly delay = input<number>(200);
  readonly hideDelay = input<number>(100);
  readonly disabled = input(false);

  readonly isVisible = signal(false);
  private showTimeout: any;
  private hideTimeout: any;

  readonly tooltipClasses = computed(() => {
    const base = 'absolute z-[700] px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 rounded-md shadow-lg whitespace-nowrap pointer-events-none';
    const positions: Record<TooltipPosition, string> = {
      top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
      bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
      left: 'right-full top-1/2 -translate-y-1/2 mr-2',
      right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };
    return `${base} ${positions[this.position()]}`;
  });

  readonly arrowClasses = computed(() => {
    const positions: Record<TooltipPosition, string> = {
      top: 'top-full left-1/2 -translate-x-1/2 border-t-neutral-900',
      bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-neutral-900',
      left: 'left-full top-1/2 -translate-y-1/2 border-l-neutral-900',
      right: 'right-full top-1/2 -translate-y-1/2 border-r-neutral-900',
    };
    return `absolute w-0 h-0 border-4 border-transparent ${positions[this.position()]}`;
  });

  onMouseEnter(): void {
    if (this.disabled()) return;
    this.clearTimeouts();
    this.showTimeout = setTimeout(() => {
      this.isVisible.set(true);
    }, this.delay());
  }

  onMouseLeave(): void {
    this.clearTimeouts();
    this.hideTimeout = setTimeout(() => {
      this.isVisible.set(false);
    }, this.hideDelay());
  }

  private clearTimeouts(): void {
    if (this.showTimeout) clearTimeout(this.showTimeout);
    if (this.hideTimeout) clearTimeout(this.hideTimeout);
  }

  ngOnDestroy(): void {
    this.clearTimeouts();
  }
}