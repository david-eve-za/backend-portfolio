import { Component, input, computed } from '@angular/core';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarStatus = 'online' | 'busy' | 'offline' | 'none';

@Component({
  selector: 'bt-avatar',
  standalone: true,
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss',
})
export class AvatarComponent {
  readonly src = input<string>('');
  readonly alt = input<string>('');
  readonly name = input<string>('');
  readonly size = input<AvatarSize>('md');
  readonly status = input<AvatarStatus>('none');
  readonly shape = input<'circle' | 'square'>('circle');

  readonly sizeClasses = computed(() => {
    const sizes: Record<AvatarSize, string> = {
      xs: 'w-6 h-6 text-xs',
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-base',
      lg: 'w-12 h-12 text-lg',
      xl: 'w-16 h-16 text-xl',
    };
    return sizes[this.size()];
  });

  readonly statusClasses = computed(() => {
    const base = 'absolute bottom-0 right-0 rounded-full border-2 border-surface';
    const sizes: Record<AvatarSize, string> = {
      xs: 'w-1.5 h-1.5',
      sm: 'w-2 h-2',
      md: 'w-2.5 h-2.5',
      lg: 'w-3 h-3',
      xl: 'w-4 h-4',
    };
    const colors: Record<Exclude<AvatarStatus, 'none'>, string> = {
      online: 'bg-success',
      busy: 'bg-warning',
      offline: 'bg-muted-foreground',
    };
    const status = this.status();
    if (status === 'none') return 'hidden';
    return `${base} ${sizes[this.size()]} ${colors[status]}`;
  });

  readonly initials = computed(() => {
    if (!this.name()) return '?';
    return this.name()
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  });

  readonly bgColor = computed(() => {
    if (!this.name()) return 'bg-muted';
    let hash = 0;
    for (let i = 0; i < this.name().length; i++) {
      hash = this.name().charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 60%, 45%)`;
  });

  readonly textColor = computed(() => {
    // Simple contrast check - use white for darker backgrounds
    return 'text-white';
  });
}