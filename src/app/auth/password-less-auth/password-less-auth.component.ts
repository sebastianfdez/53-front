import { Component, OnInit } from '@angular/core';
import { from, combineLatest } from 'rxjs';
import { User } from '../../shared/models/user';
import { AuthService } from '../auth-form/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '../../store';
import { SnackBarService } from '../../shared/services/snack-bar.service';
import { tap, take, switchMap } from 'rxjs/operators';
import { FirebaseService } from '../../shared/services/firebase.service';
import { Judge } from '../../contests/models/categorie';

@Component({
    selector: 'app-password-less-auth',
    templateUrl: './password-less-auth.component.html',
    styleUrls: ['./password-less-auth.component.scss']
})
export class PasswordLessAuthComponent implements OnInit {

    user: User = null;
    email: string;
    emailUrl: string;

    errorMessage: string;
    contestId = '';
    emailSent = false;

    constructor(
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute,
        private store: Store,
        private snackBarService: SnackBarService,
        private firebaseService: FirebaseService,
    ) {}

    ngOnInit() {
        this.store.select<User>('user').pipe(
            tap(user => {
                console.log('userr: ', user);
                this.user = user;
            })
        ).subscribe();
        const url = this.router.url;
        this.route.queryParams.subscribe((params) => {
            console.log(params);
            this.contestId = params.contestId;
            this.emailUrl = params.email;
        });
        this.confirmSignIn(url);
    }

    async confirmSignIn(url: string) {
        try {
            if (this.authService.confirmSignIn(url)) {
                this.emailSent = true;
                this.emailUrl = window.localStorage.getItem('emailForSignIn');
                this.contestId = window.localStorage.getItem('contestId');

                const result = await this.authService.signInWithLink(this.emailUrl, url);
                combineLatest(
                    this.firebaseService.getJudgeWithMailAndDelete(this.emailUrl).pipe(
                    tap((judge_) => {
                        const judge: Judge = {
                            contest: this.contestId,
                            id: result.user.uid,
                            lastName: judge_.lastName,
                            name: judge_.name,
                            mail: this.emailUrl,
                            role: 'judge',
                        };
                        return from(this.firebaseService.createJudge(result.user.uid, judge));
                    }),
                    take(1),
                ), this.firebaseService.getContest(this.contestId).pipe(
                    take(1),
                )
                ).subscribe(([judge, contest]) => {
                    const judges: string[] = contest.judges.filter(judge_ => judge_ !== judge.mail);
                    judges.push(judge.id);
                    this.firebaseService.updateContest(this.contestId, {judges});
                });
            }
        } catch (err) {
            this.errorMessage = err.message;
            console.log(err);
        }
    }

    async sendEmailLink() {
        try {
          await this.authService.sendLogInLink(
            this.emailUrl,
          );
          window.localStorage.setItem('emailForSignIn', this.emailUrl);
          window.localStorage.setItem('contestId', this.contestId);
          this.emailSent = true;
        } catch (err) {
          this.errorMessage = err.message;
        }
    }

    goToHome() {
        this.router.navigate(['portal/admin']);
    }

}
