import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from 'src/app/shared/models/user';
import { Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SnackBarService } from 'src/app/shared/services/snack-bar.service';
import { AuthService } from '../auth-form/services/auth.service';

@Component({
    selector: 'app-user-settings',
    templateUrl: './user-settings.component.html',
})
export class UserSettingsComponent implements OnInit, OnDestroy {
    user: User = null;

    user$: Observable<User> = null;

    subscriptions: Subscription[] = [];

    loading = false;

    constructor(
        private authService: AuthService,
        private snackBarService: SnackBarService,
    ) {}

    ngOnInit() {
        this.user$ = this.authService.getAuthenticatedUser().pipe(
            tap((user) => {
                this.user = user;
            }),
        );
    }

    changePassword() {
        this.loading = true;
        this.subscriptions.push(
            this.authService.changePassword(this.user.mail).subscribe(() => {
                this.loading = false;
                this.snackBarService.showMessage(`Mail pour changer mot de passe envoyé. ${this.user.mail}`);
            }),
        );
    }

    ngOnDestroy() {
        this.subscriptions.forEach((s) => s.unsubscribe());
    }
}
