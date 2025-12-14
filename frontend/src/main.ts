import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { AppComponent } from './app/app.component';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AuthInterceptor } from './app/interceptors/auth.interceptor';
import { appConfig } from './app/app.config';
import { Router } from '@angular/router';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserModule, FormsModule),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    ...appConfig.providers,
  ],
})
  .then((appRef) => {
    const router = appRef.injector.get(Router);
    console.log('[Router] Subscribing to events for initial navigation diagnostics');
    router.events.subscribe((event) => {
      console.log('[RouterEvent]', event.constructor.name, event);
    });
  })
  .catch((err) => console.error(err));
