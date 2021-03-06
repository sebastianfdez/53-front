import { Injectable } from '@angular/core';
import {
    Router, CanActivate,
} from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from '../../auth/auth-form/services/auth.service';

@Injectable()
export class AdminAuthGuardService implements CanActivate {
    constructor(private authService: AuthService, private router: Router) {}

    canActivate(): Observable<boolean> | boolean {
        return this.authService.isAdmin().pipe(
            tap((isAdmin) => {
                if (!isAdmin) {
                    this.router.navigate(['portal/admin']);
                }
            }),
        );
    }
}
