import { Component, input, computed, signal, effect, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { Menu, X, ChevronLeft, Bell, User, Settings, LogOut, LayoutDashboard, FolderOpen, Clock, CheckCircle, AlertCircle, Archive } from 'lucide-angular';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  count?: number;
  badgeColor?: string;
}

@Component({
  selector: 'bt-dashboard-layout',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss',
})
export class DashboardLayoutComponent {
  readonly sidebarOpen = signal(true);
  readonly sidebarCollapsed = signal(false);
  readonly queuePanelOpen = signal(true);
  readonly activeNav = signal('all');

  readonly LayoutDashboardIcon = LayoutDashboard;
  readonly FolderOpenIcon = FolderOpen;
  readonly ClockIcon = Clock;
  readonly CheckCircleIcon = CheckCircle;
  readonly AlertCircleIcon = AlertCircle;
  readonly ArchiveIcon = Archive;
  readonly MenuIcon = Menu;
  readonly XIcon = X;
  readonly ChevronLeftIcon = ChevronLeft;
  readonly BellIcon = Bell;
  readonly UserIcon = User;
  readonly SettingsIcon = Settings;
  readonly LogOutIcon = LogOut;

  readonly navItems = computed(() => [
    { id: 'all', label: 'All Projects', icon: LayoutDashboard, count: 42 },
    { id: 'translating', label: 'Translating', icon: Clock, count: 3, badgeColor: 'bg-primary' },
    { id: 'glossary', label: 'Glossary Review', icon: AlertCircle, count: 5, badgeColor: 'bg-warning' },
    { id: 'audio', label: 'Audio Generating', icon: FolderOpen, count: 2, badgeColor: 'bg-purple-500' },
    { id: 'completed', label: 'Completed', icon: CheckCircle, count: 32, badgeColor: 'bg-success' },
    { id: 'archived', label: 'Archived', icon: Archive, count: 0, badgeColor: 'bg-muted' },
  ]);
}