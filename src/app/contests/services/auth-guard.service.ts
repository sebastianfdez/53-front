import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivate } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable, Subscription, of, ObservableInput } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

@Injectable()
export class AuthGuardService implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | boolean {
        return this.auth.authenticated.pipe(
            switchMap((value) => {
                if (value) {
                    return of(true);
                } else {
                    this.router.navigate(['']);
                    return of(false);
                }
            })
        );
    }
}
