import { Component, input, computed, output, signal, ContentChild, TemplateRef, QueryList, ViewChildren } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { ChevronRight } from 'lucide-angular';

export interface TabItem {
  id: string;
  label: string;
  disabled?: boolean;
  icon?: string;
  badge?: string | number;
}

@Component({
  selector: 'bt-tabs',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss',
})
export class TabsComponent {
  readonly tabs = input<TabItem[]>([]);
  readonly value = input<string>('');
  readonly variant = input<'line' | 'enclosed' | 'soft'>('line');
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly disabled = input(false);

  readonly valueChange = output<string>();

  readonly ChevronRightIcon = ChevronRight;

  readonly activeTab = computed(() => {
    return this.tabs().find(t => t.id === this.value()) || this.tabs()[0];
  });

  selectTab(tab: TabItem): void {
    if (tab.disabled || this.disabled()) return;
    this.valueChange.emit(tab.id);
  }
}