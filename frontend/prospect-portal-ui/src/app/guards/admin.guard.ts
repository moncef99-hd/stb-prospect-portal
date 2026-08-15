import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(Auth);
  const token = localStorage.getItem('token');

  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  return new Promise<boolean>((resolve) => {
    auth.me().subscribe({
      next: (user: any) => {
        if (user.role === 'Admin') {
          resolve(true);
        } else {
          router.navigate(['/dashboard']);
          resolve(false);
        }
      },
      error: () => {
        router.navigate(['/login']);
        resolve(false);
      }
    });
  });
};