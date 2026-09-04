import { Component, input, computed } from '@angular/core';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';

export type IconSize = 16 | 20 | 24 | 32;

@Component({
  selector: 'bt-icon',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss',
})
export class IconComponent {
  readonly img = input.required<LucideIconData>();
  readonly size = input<IconSize>(24);
  readonly spin = input(false);
  readonly pulse = input(false);
  readonly class = input<string>('');

  readonly sizeClasses = computed(() => {
    const sizes: Record<IconSize, string> = {
      16: 'h-4 w-4',
      20: 'h-5 w-5',
      24: 'h-6 w-6',
      32: 'h-8 w-8',
    };
    return sizes[this.size()];
  });

  readonly animationClasses = computed(() => {
    const classes = [];
    if (this.spin()) classes.push('animate-spin');
    if (this.pulse()) classes.push('animate-pulse');
    return classes.join(' ');
  });
}