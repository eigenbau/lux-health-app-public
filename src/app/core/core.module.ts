import { GlobalErrorHandler } from './errors/global-error-handler'; // Source: https://github.com/melcor76/global-error-handling
import { ErrorHandler, NgModule, Optional, SkipSelf } from '@angular/core';

import { interceptorProviders } from './interceptors/interceptors';
import { FirebaseModule } from './firebase/firebase.module';

import { environment } from '../../environments/environment';

const errorHandler = environment.production
  ? { provide: ErrorHandler, useClass: GlobalErrorHandler }
  : { provide: ErrorHandler };

@NgModule({
  declarations: [],
  imports: [FirebaseModule],
  providers: [errorHandler, interceptorProviders],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() core: CoreModule) {
    if (core) {
      throw new Error(
        'You should import the core module only in the root module',
      );
    }
  }
}
