import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const token = localStorage.getItem('auth_token');

    if (token) {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next(authReq);
    }

    // Fallback: send legacy headers for backward compatibility
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
