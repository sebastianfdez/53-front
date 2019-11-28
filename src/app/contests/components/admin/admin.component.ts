import { Component, OnInit, OnDestroy } from '@angular/core';
import { of, Subscription, Observable } from 'rxjs';
import { switchMap, map, filter } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User } from '../../../shared/models/user';
import { AuthService } from '../../../auth/auth-form/services/auth.service';
import { Contest } from '../../../shared/models/contest';
import { ContestsService } from '../../services/contest.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {

  contest: Contest = null;
  admin$: Observable<User> = null;

  subscriptions: Subscription[] = [];
  isAdmin = false;
  isJudge = false;

  public loading = false;

  constructor(
    private contestService: ContestsService,
    private router: Router,
    private authService: AuthService,
  ) {
  }

  ngOnInit() {
    this.loading = true;
    this.admin$ = this.authService.getAuthenticatedUser();
    this.subscriptions.push(
      this.admin$.pipe(
        filter(user => user !== null),
        switchMap((user) => {
          this.isJudge = user.role === 'judge';
          this.isAdmin = user.role === 'admin';
          return this.contestService.getContest(user.contest);
        }),
        map((contest) => {
          this.contest = contest;
          localStorage.setItem('contestId', this.contest.id);
          this.loading = false;
        }),
      ).subscribe()
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  goToJudges() {
    this.router.navigate([`portal/judges`]);
  }

  goToContest() {
    this.isAdmin || this.isJudge ? this.router.navigate([`portal/contests`]) : this.router.navigate(['portal/speaker']);
  }

  async logOut() {
    await this.authService.logOut();
    this.router.navigate(['home']);
  }

}
