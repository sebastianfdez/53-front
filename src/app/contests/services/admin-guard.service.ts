import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivate } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../../auth/auth-form/services/auth.service';
import { switchMap, tap } from 'rxjs/operators';

@Injectable()
export class AdminAuthGuardService implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | boolean {
        return this.authService.isAdmin().pipe(
            tap((isAdmin) => {
                if (!isAdmin) {
                    this.router.navigate(['portal/admin']);
                }
            })
        );
    }
}

@Injectable()
export class JudgeAuthGuardService implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | boolean {
        return this.authService.isJudge().pipe(
            tap((isJudge) => {
                if (!isJudge) {
                    this.router.navigate(['portal/admin']);
                }
            })
        );
    }
}
