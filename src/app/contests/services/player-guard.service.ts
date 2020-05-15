import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth-form/services/auth.service';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable()
export class PlayerGuardService implements CanActivate {
    constructor(private authService: AuthService, private router: Router) {}

    canActivate(): Observable<boolean> | boolean {
        console.log('entro');
        return this.authService.authenticated.pipe(
            switchMap(() => this.authService.getAuthenticatedUser()),
            switchMap((user) => {
                const roles = Object.values(user.role);
                console.log(roles);
                if (roles.length === 1 && roles[0] === 'player') {
                    this.router.navigate(['portal/player']);
                    return of(false);
                }
                return of(true);
            }),
        );
    }
}
