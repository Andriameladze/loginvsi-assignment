import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { NbThemeModule, NbSidebarModule } from '@nebular/theme';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    importProvidersFrom(
      NbThemeModule.forRoot({ name: 'default' }),
      NbSidebarModule.forRoot()
    ),
  ],
};
