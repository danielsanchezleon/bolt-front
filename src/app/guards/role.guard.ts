import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const allowed: string[] = route.data?.['roles'] ?? [];
    if (allowed.length === 0) return true;

    const userRoles = this.auth.getRoles() ?? [];
    const ok = allowed.some(role => userRoles.includes(role));

    if (!ok) {
      this.router.navigate(['']);
    }
    return ok;
  }
}