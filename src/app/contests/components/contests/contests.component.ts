import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription, from, of, combineLatest } from 'rxjs';
import { Categorie, Judge } from '../../models/categorie';
import { AngularFirestore, Action, DocumentSnapshot } from '@angular/fire/firestore';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSelectChange } from '@angular/material';
import { timer } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { switchMap } from 'rxjs/operators';
import { User } from '../../models/user';
import { Contest } from '../../models/contest';
import { WarningService } from 'src/app/shared/warning/warning.service';

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
  public isAdmin = false;

  timeoutHandler: any;
  time = 0;
  deleteCategories: {
    [id: string]: boolean;
  } = {};

  subscriptions: Subscription[] = [];

  constructor(
    private db: AngularFirestore,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private warningService: WarningService,
  ) {
    this.loading = true;
  }

  ngOnInit() {
    this.subscriptions.push(
      this.authService.authenticated.pipe(
        switchMap((value) => {
          this.isJudge = this.authService.authStateUser.role === 'judge';
          this.isAdmin = this.authService.authStateUser.role === 'admin';
          return this.db.collection('users').doc<User>(this.authService.authStateUser.id).snapshotChanges();
        }),
        switchMap(
          (user) => {
            this.judge = user.payload.data();
            return this.db.collection<Contest>('contests').doc<Contest>(this.judge.contest).snapshotChanges();
          }
        ),
        switchMap((contest) => {
          this.contest = {id: contest.payload.id, ...contest.payload.data()};
          if (this.contest.newCategorie !== '') {
            this.contest.categories.push(this.contest.newCategorie);
            this.contest.newCategorie = '';
            return from(this.db.collection('contests').doc<Contest>(this.contest.id).update(this.contest));
          } else {
            return of(null);
          }
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
        this.categories.forEach(categorie => this.deleteCategories[categorie.id] = false);
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  goTo(categorie: Categorie) {
    (this.isJudge || this.isAdmin) ?
    this.router.navigate([`/categorie/${categorie.id}`]) : this.router.navigate([`/categorie/${categorie.id}/speaker`]);
  }

  public mouseup(categorie: Categorie, event: MouseEvent) {
    if (!this.isAdmin) {
      return this.goTo(categorie);
    }
    if (event.toElement.nodeName === 'MAT-ICON') {
      this.deleteCategorie(categorie);
    } else {
      if (this.time > 20) {
        this.deleteCategories[categorie.id] = true;
      } else {
        return this.goTo(categorie);
      }
      clearInterval(this.timeoutHandler);
    }
    this.timeoutHandler = null;
    this.time = 0;
  }

  goToNew() {
    this.router.navigate([`/categorie/new`]);
  }

  public mousedown() {
    this.timeoutHandler = setInterval(() => {
      this.time++;
    }, 100);
  }

  deleteCategorie(categorie: Categorie) {
    this.subscriptions.push(
      this.warningService.showWarning('Vous êtes sûr que vous voulez supprimer cette catégorie?', true)
      .afterClosed().subscribe((result) => {
        if (result) {
          console.log(categorie);
          categorie.pools.forEach((pool) => {
            pool.participants.forEach((participant) => {
              this.db.collection('players').doc(participant).delete();
            });
          });
          this.db.collection('categories').doc(categorie.id).delete();
          this.contest.categories = this.contest.categories.filter(cat => cat !== categorie.id);
          this.db.collection('contests').doc(this.contest.id).update({categories: this.contest.categories});
        }
      })
    );
  }

}
