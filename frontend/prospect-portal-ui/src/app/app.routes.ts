import { Routes } from '@angular/router';
import { Signup } from './pages/signup/signup';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { AdminProspects } from './pages/admin-prospects/admin-prospects';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: 'signup', component: Signup },
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'admin/prospects', component: AdminProspects, canActivate: [adminGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];