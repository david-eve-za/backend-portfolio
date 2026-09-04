import { Component, input, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { Menu, X, ChevronLeft, ChevronRight, Save, Undo2, Redo2, Search, FileText, Volume2, Settings, ChevronUp, ChevronDown } from 'lucide-angular';

@Component({
  selector: 'bt-workspace-layout',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './workspace-layout.component.html',
  styleUrl: './workspace-layout.component.scss',
})
export class WorkspaceLayoutComponent {
  readonly leftSidebarOpen = signal(true);
  readonly rightSidebarOpen = signal(true);
  readonly leftSidebarCollapsed = signal(false);
  readonly rightSidebarCollapsed = signal(false);
  readonly splitRatio = signal(0.5);
  readonly syncScroll = signal(true);
  readonly activeRightTab = signal<'glossary' | 'outline'>('glossary');

  readonly MenuIcon = Menu;
  readonly XIcon = X;
  readonly ChevronLeftIcon = ChevronLeft;
  readonly ChevronRightIcon = ChevronRight;
  readonly SaveIcon = Save;
  readonly UndoIcon = Undo2;
  readonly RedoIcon = Redo2;
  readonly SearchIcon = Search;
  readonly FileTextIcon = FileText;
  readonly VolumeIcon = Volume2;
  readonly SettingsIcon = Settings;
  readonly ChevronUpIcon = ChevronUp;
  readonly ChevronDownIcon = ChevronDown;

  readonly leftTabs = ['Chapters', 'Outline'];
  readonly rightTabs = [
    { id: 'glossary', label: 'Glossary', icon: FileText },
    { id: 'outline', label: 'Outline', icon: Search },
  ];

  @HostListener('window:resize')
  onResize(): void {
    // Handle responsive behavior
  }

  toggleLeftSidebar(): void {
    this.leftSidebarOpen.update(v => !v);
  }

  toggleRightSidebar(): void {
    this.rightSidebarOpen.update(v => !v);
  }

  toggleLeftCollapse(): void {
    this.leftSidebarCollapsed.update(v => !v);
  }

  toggleRightCollapse(): void {
    this.rightSidebarCollapsed.update(v => !v);
  }

  setSplitRatio(ratio: number): void {
    this.splitRatio.set(Math.max(0.2, Math.min(0.8, ratio)));
  }

  toggleSyncScroll(): void {
    this.syncScroll.update(v => !v);
  }

  setRightTab(tab: 'glossary' | 'outline'): void {
    this.activeRightTab.set(tab);
  }
}