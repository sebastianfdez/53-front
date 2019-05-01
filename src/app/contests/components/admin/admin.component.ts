import { Component, OnInit, OnDestroy } from '@angular/core';
import { of, from, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AngularFirestore} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { User } from '../../models/user';
import { AuthService } from '../../services/auth.service';
import { Contest } from '../../models/contest';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {

  contest: Contest = null;
  admin: User = null;

  subscriptions: Subscription[] = [];
  isAdmin = false;
  isJudge = false;

  public loading = false;

  constructor(
    private db: AngularFirestore,
    private router: Router,
    private authService: AuthService,
  ) {
  }

  ngOnInit() {
    this.loading = true;
    this.subscriptions.push(
      this.authService.authenticated.pipe(
        switchMap(
            () => this.db.doc<User>(`users/${this.authService.authStateUser.id}`).snapshotChanges()
        ),
        switchMap(
          (user) => {
            this.isAdmin = this.authService.authStateUser ? this.authService.authStateUser.role === 'admin' : false;
            this.isJudge = this.authService.authStateUser ? this.authService.authStateUser.role === 'judge' : false;
            this.admin = user.payload.data();
            return this.db.collection<Contest>('contests').doc<Contest>(this.admin.contest).snapshotChanges();
          }
        ),
        switchMap((contest) => {
          this.contest = {id: contest.payload.id, ...contest.payload.data()};
          localStorage.setItem('contestId', this.contest.id);
          return of(null);
        }),
      ).subscribe(() => {
        this.loading = false;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  goToJudges() {
    this.router.navigate([`/judges`]);
  }

  goToContest() {
    this.isAdmin || this.isJudge ? this.router.navigate([`/contests`]) : this.router.navigate(['/speaker']);
  }

}
