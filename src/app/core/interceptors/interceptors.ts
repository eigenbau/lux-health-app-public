import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ServerErrorInterceptor } from './server-error.interceptor';

export const interceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: ServerErrorInterceptor, multi: true },
];
