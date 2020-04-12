/* eslint-disable no-undef */
import { Component, OnInit } from '@angular/core';
import { from, of } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from 'store';
import {
    tap, take, switchMap, filter, catchError,
} from 'rxjs/operators';
import { AuthService } from '../auth-form/services/auth.service';
import { User } from '../../shared/models/user';
import { FirebaseService } from '../../shared/services/firebase.service';

@Component({
    selector: 'app-password-less-auth',
    templateUrl: './password-less-auth.component.html',
    styleUrls: ['./password-less-auth.component.scss'],
})
export class PasswordLessAuthComponent implements OnInit {
    user: User = null;

    email: string;

    emailUrl: string;

    speaker = false;

    errorMessage: string;

    contestId = '';

    emailSent = false;

    constructor(
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute,
        private store: Store,
        private firebaseService: FirebaseService,
    ) {}

    ngOnInit() {
        this.store.select<User>('user').pipe(
            tap((user) => {
                this.user = user;
            }),
        ).subscribe();
        const { url } = this.router;
        this.route.queryParams.subscribe((params) => {
            this.contestId = params.contestId;
            this.emailUrl = params.email;
            if (params.speaker === 'true' || params.speaker === true) {
                window.localStorage.setItem('speaker', 'true');
                this.speaker = true;
            }
        });
        this.confirmSignIn(url);
    }

    async confirmSignIn(url: string) {
        try {
            if (this.authService.confirmSignIn(url)) {
                this.emailSent = true;
                this.emailUrl = window.localStorage.getItem('emailForSignIn');
                this.contestId = window.localStorage.getItem('contestId');
                this.speaker = window.localStorage.getItem('speaker') === 'true';

                const result = await this.authService.signInWithLink(this.emailUrl, url);
                const judge: User = {
                    contest: [this.contestId],
                    id: result.user.uid,
                    lastName: '',
                    name: '',
                    mail: this.emailUrl,
                    role: {},
                    autenticated: false,
                };
                judge.role[this.contestId] = this.speaker ? 'speaker' : 'judge';
                this.authService.getAuthenticatedUser().pipe(
                    filter((user) => user !== null),
                    tap((user) => {
                        judge.name = user.name;
                        judge.lastName = user.lastName;
                    }),
                    take(1),
                    switchMap(() => this.firebaseService.createJudge(result.user.uid, judge)),
                    switchMap(() => from(this.firebaseService.deleteJudge(this.emailUrl))),
                    catchError((error) => {
                        console.log(error);
                        return of(null);
                    }),
                    take(1),
                    switchMap(() => this.firebaseService.getContest(this.contestId).pipe(
                        take(1),
                    )),
                )
                    .subscribe((contest) => {
                        window.localStorage.removeItem('emailForSignIn');
                        window.localStorage.removeItem('contestId');
                        if (this.speaker) {
                            this.firebaseService
                                .updateContest(this.contestId, { speaker: judge.id });
                        } else {
                            let judges: string[] = contest.judges
                                .filter((judge_) => judge_ !== judge.mail);
                            judges.push(judge.id);
                            judges = Array.from(new Set(judges));
                            this.firebaseService.updateContest(this.contestId, { judges });
                        }
                    });
            }
        } catch (err) {
            this.errorMessage = err.message;
        }
    }

    async sendEmailLink() {
        try {
            await this.authService.sendLogInLink(
                this.emailUrl,
            );
            window.localStorage.setItem('emailForSignIn', this.emailUrl);
            window.localStorage.setItem('contestId', this.contestId);
            if (this.speaker) {
                window.localStorage.setItem('speaker', 'true');
            }
            this.emailSent = true;
        } catch (err) {
            this.errorMessage = err.message;
            console.log(err);
        }
    }

    goToHome() {
        this.router.navigate(['portal/admin']);
    }
}
