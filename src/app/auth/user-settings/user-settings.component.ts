import {
    Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef,
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { User } from '../../shared/models/user';
import { SnackBarService } from '../../shared/services/snack-bar.service';
import { AuthService } from '../auth-form/services/auth.service';

@Component({
    selector: 'app-user-settings',
    templateUrl: './user-settings.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserSettingsComponent implements OnInit, OnDestroy {
    user: User = null;

    user$: Observable<User> = null;

    subscriptions: Subscription[] = [];

    loading = false;

    constructor(
        private authService: AuthService,
        private snackBarService: SnackBarService,
        private cdr: ChangeDetectorRef,
    ) {}

    ngOnInit() {
        this.user$ = this.authService.getAuthenticatedUser().pipe(
            tap((user) => {
                this.user = user;
                this.cdr.detectChanges();
            }),
        );
    }

    changePassword() {
        this.loading = true;
        const snackbar = this.snackBarService
            .showMessage('Êtes-vous sûr de bien vouloir changer votre mot de passe?', 'Oui');
        this.subscriptions.push(
            snackbar.onAction().pipe(
                switchMap(() => this.authService.changePassword(this.user.mail)),
                tap(() => {
                    this.loading = true;
                }),
                switchMap(() => this.snackBarService
                    .showMessage(`Mail pour changer mot de passe envoyé. ${this.user.mail}`).afterDismissed()),
            ).subscribe(() => {
                this.loading = false;
                this.cdr.detectChanges();
            }),
            snackbar.afterDismissed().subscribe(() => {
                this.loading = false;
                this.cdr.detectChanges();
            }),
        );
    }

    ngOnDestroy() {
        this.subscriptions.forEach((s) => s.unsubscribe());
    }
}
