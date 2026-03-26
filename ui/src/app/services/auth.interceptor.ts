import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem('userId');

    if (username && userId) {
      const authReq = req.clone({
        setHeaders: {
          'X-User-Name': username,
          'X-User-Id': userId
        }
      });
      return next(authReq);
    }
  }
  return next(req);
};
