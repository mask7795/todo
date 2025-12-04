import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (environment.apiKey) {
      const authReq = req.clone({ setHeaders: { 'X-API-Key': environment.apiKey } });
      return next.handle(authReq);
    }
    return next.handle(req);
  }
}
