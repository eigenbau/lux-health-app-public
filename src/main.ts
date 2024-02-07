import { enableProdMode, importProvidersFrom } from '@angular/core';

import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { bootstrapApplication } from '@angular/platform-browser';
import { IonicRouteStrategy, IonicModule } from '@ionic/angular';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicConfig } from '@ionic/core';
import { routes } from './app/app.routes';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { CoreModule } from '@core/core.module';

const setConfig = (): IonicConfig => ({
  animated: true,
  swipeBackEnabled: false,
  //swipeGesture: false,
  //replaceUrl: true, // attempt to disable safari back swipe function,
  scrollAssist: false,
});

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    importProvidersFrom(IonicModule.forRoot(setConfig())),
    importProvidersFrom(
      ServiceWorkerModule.register('ngsw-worker.js', {
        enabled: environment.production,
        // Register the ServiceWorker as soon as the app is stable
        // or after 30 seconds (whichever comes first).
        registrationStrategy: 'registerWhenStable:30000',
      })
    ),
    // FIXME: Consider to refactor 'CoreModules' to eliminate NgModule
    importProvidersFrom(CoreModule),
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(routes),
  ],
});
