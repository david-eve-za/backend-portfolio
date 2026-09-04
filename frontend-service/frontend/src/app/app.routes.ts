import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { LayoutComponent } from './core/layout/layout.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent) },
      { path: 'collections', loadComponent: () => import('./features/collections/collections.component').then((m) => m.CollectionsComponent) },
      { path: 'analytics', loadComponent: () => import('./features/analytics/analytics.component').then((m) => m.AnalyticsComponent) },
      { path: 'settings', loadComponent: () => import('./features/settings/settings.component').then((m) => m.SettingsComponent) },

      // BookTranslator Routes (to be implemented in later phases)
      // {
      //   path: 'projects',
      //   children: [
      //     { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      //     { path: 'new', loadComponent: () => import('./features/projects/upload/upload.page').then((m) => m.UploadPage) },
      //     { path: ':id/translate', loadComponent: () => import('./features/projects/translation/translation.page').then((m) => m.TranslationPage) },
      //     { path: ':id/audio', loadComponent: () => import('./features/projects/audio/audiobook.page').then((m) => m.AudiobookPage) },
      //   ]
      // },
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];