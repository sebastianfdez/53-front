import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, of, from, Subscription } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { AngularFirestore, Action, DocumentSnapshot } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Categorie } from '../models/categorie';
import { User } from '../models/user';
import { AuthService } from '../services/auth.service';
import { Contest } from '../models/contest';
import { combineLatest } from 'rxjs';
import { MatDialog } from '@angular/material';
import { WarningComponent } from 'src/app/shared/warning/warning.component';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {

  items: Observable<any[]>;
  contest: Contest = null;
  categories: Categorie[] = [];
  admin: User = null;
  timeoutHandler: any;
  time = 0;
  deleteCategories: {
    [id: string]: boolean;
  } = {};

  subscriptions: Subscription[] = [];

  public loading = false;

  constructor(
    private db: AngularFirestore,
    private router: Router,
    private authService: AuthService,
    private dialog: MatDialog,
  ) {
    this.loading = true;
  }

  ngOnInit() {
    this.subscriptions.push(
      this.authService.authenticated.pipe(
        switchMap(
            () => this.db.doc<User>(`users/${this.authService.authStateUser.id}`).snapshotChanges()
        ),
        switchMap(
          (user) => {
            this.admin = user.payload.data();
            return this.db.collection<Contest>('contests').doc<Contest>(this.admin.contest).snapshotChanges();
          }
        ),
        switchMap((contest) => {
          this.contest = {id: contest.payload.id, ...contest.payload.data()};
          console.log(this.contest);
          localStorage.setItem('contestId', this.contest.id);
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
        this.categories.forEach(categorie => this.deleteCategories[categorie.id] = false);
        this.loading = false;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  goToNew() {
    this.router.navigate([`/categorie/new`]);
  }

  public mouseup(categorie: Categorie, event: MouseEvent) {
    if (event.toElement.nodeName === 'MAT-ICON') {
      this.deleteCategorie(categorie);
    } else {
      if (this.time > 20) {
        this.deleteCategories[categorie.id] = true;
      } else {
        this.router.navigate([`/categorie/${categorie.id}/false`]);
      }
      clearInterval(this.timeoutHandler);
    }
    this.timeoutHandler = null;
    this.time = 0;
  }

  public mousedown() {
    this.timeoutHandler = setInterval(() => {
      this.time++;
    }, 100);
  }

  deleteCategorie(categorie: Categorie) {
    const dialogRef = this.dialog.open(WarningComponent, {
      width: '600px',
      data: {
        message: 'Vous êtes sûr que vous voulez supprimer cette catégorie?',
      },
    });
    this.subscriptions.push(
      dialogRef.afterClosed().subscribe((result) => {
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
