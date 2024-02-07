import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpRequest,
  HttpHandler,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError, tap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class ServerErrorInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      retry(1),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return throwError(
            () => new Error(`${error.status} - You are not authorized.`)
          );
        }
        if (error.status === 403) {
          return throwError(
            () =>
              new Error(
                `${error.status} - You do not have sufficient permissions.`
              )
          );
        }

        return throwError(
          () => new Error('An unknown error occured in interceptor.')
        );
      })
    );
  }
}
