import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivate } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service';
import { switchMap } from 'rxjs/operators';

@Injectable()
export class AdminAuthGuardService implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | boolean {
        return this.auth.isAdmin.pipe(
            switchMap((value) => {
                if (value) {
                    return of(true);
                } else {
                    this.router.navigate(['contests']);
                    return of(false);
                }
            })
        );
    }
}

@Injectable()
export class JudgeAuthGuardService implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | boolean {
        return this.auth.isJudge.pipe(
            switchMap((value) => {
                if (value) {
                    return of(true);
                } else {
                    this.router.navigate(['speaker']);
                    return of(false);
                }
            })
        );
    }
}
