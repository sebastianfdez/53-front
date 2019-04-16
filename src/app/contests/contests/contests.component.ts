import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription, from, of, combineLatest } from 'rxjs';
import { Categorie, Judge } from '../models/categorie';
import { AngularFirestore, Action, DocumentSnapshot } from '@angular/fire/firestore';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSelectChange } from '@angular/material';
import { timer } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { switchMap } from 'rxjs/operators';
import { User } from '../models/user';
import { Contest } from '../models/contest';

@Component({
  selector: 'app-contests',
  templateUrl: './contests.component.html',
  styleUrls: ['./contests.component.scss']
})
export class ContestsComponent implements OnInit, OnDestroy {

  items: Observable<any[]>;

  categories: Categorie[] = [];
  judge: User = null;
  contest: Contest = null;

  public loading = false;
  public loading2 = false;
  public isJudge = false;

  subscriptions: Subscription[] = [];

  constructor(
    private db: AngularFirestore,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
  ) {
    this.loading = true;
    if (this.route.snapshot.routeConfig.path === 'contests' || this.route.snapshot.routeConfig.path === 'admin') {
      this.isJudge = true;
    }
  }

  ngOnInit() {
    this.subscriptions.push(
      this.authService.authenticated.pipe(
        switchMap(
            () => this.db.doc<User>(`users/${this.authService.authStateUser.id}`).snapshotChanges()
        ),
        switchMap(
          (user) => {
            this.judge = user.payload.data();
            return this.db.collection<Contest>('contests').doc<Contest>(this.judge.contest).snapshotChanges();
          }
        ),
        switchMap((contest) => {
          this.contest = {id: contest.payload.id, ...contest.payload.data()};
          localStorage.setItem('contestId', this.contest.id);
          return of(null);
        }),
        switchMap(() => {
          return combineLatest(
            this.contest.categories
            .map(categorie => this.db.collection<Categorie>('categories').doc<Categorie>(categorie).snapshotChanges())
          );
        })
      ).subscribe((actions: Action<DocumentSnapshot<Categorie>>[]) => {
        this.categories = actions.map((action) => {
          if (action.payload.data()) {
            const categorie: Categorie = action.payload.data();
            categorie.id = action.payload.id;
            return categorie;
          } else {
            return null;
          }
        }).filter(cat => cat);
        this.loading = false;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  goTo(categorie: Categorie) {
    this.isJudge ? this.router.navigate([`/categorie/${categorie.id}`]) : this.router.navigate([`/categorie/${categorie.id}/speaker`]);
  }

}
