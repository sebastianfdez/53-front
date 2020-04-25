import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from '../../auth/auth-form/services/auth.service';

@Injectable()
export class JudgeAuthGuardService implements CanActivate {
    constructor(private authService: AuthService, private router: Router) {}

    canActivate(): Observable<boolean> | boolean {
        return this.authService.isJudge().pipe(
            tap((isJudge) => {
                if (!isJudge) {
                    this.router.navigate(['portal/admin']);
                }
            }),
        );
    }
}
