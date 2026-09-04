import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideTanStackQuery } from '@tanstack/angular-query-experimental';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth.interceptor';
import { queryClient } from './core/api/query-client';
import { ProjectStore } from './core/state/project.store';
import { QueueStore } from './core/state/queue.store';
import { UIPreferencesStore } from './core/state/ui-preferences.store';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideTanStackQuery(queryClient),
    ProjectStore,
    QueueStore,
    UIPreferencesStore,
  ],
};