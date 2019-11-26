import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription, from, of, combineLatest } from 'rxjs';
import { Categorie } from '../../models/categorie';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth-form/services/auth.service';
import { switchMap, take, filter, distinctUntilChanged } from 'rxjs/operators';
import { User } from '../../../shared/models/user';
import { Contest } from '../../../shared/models/contest';
import { WarningService } from 'src/app/shared/warning/warning.service';
import { WarningReponse } from 'src/app/shared/warning/warning.component';
import { ContestsService } from '../../services/contest.service';
import { FirebaseService } from '../../../shared/services/firebase.service';

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
    private router: Router,
    private contestService: ContestsService,
    private authService: AuthService,
    private warningService: WarningService,
    private firebaseService: FirebaseService,
  ) {
    this.loading = true;
  }

  ngOnInit() {
    this.subscriptions.push(
      this.authService.getAuthenticatedUser().pipe(
        filter(user => user !== null && user !== undefined),
        take(1),
        switchMap(
          (user) => {
            this.isJudge = user.role === 'judge';
            this.isAdmin = user.role === 'admin';
            this.judge = user;
            return this.contestService.getContest(this.judge.contest);
          }
        ),
        distinctUntilChanged(),
        switchMap((contest) => {
          this.contest = contest;
          return this.contest.categories.length ? combineLatest(
            this.contest.categories
            .map((categorie) => {
              return this.contestService.getCategorie(categorie);
            })
          ) : of([]);
        }),
      ).subscribe((categories: Categorie[]) => {
        this.categories = categories.filter(cat => cat);
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
    this.router.navigate([`/portal/categorie/${categorie.id}`]) : this.router.navigate([`/portal/categorie/${categorie.id}/speaker`]);
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
    this.router.navigate([`/portal/categorie/new`]);
  }

  public mousedown() {
    this.timeoutHandler = setInterval(() => {
      this.time++;
    }, 100);
  }

  deleteCategorie(categorie: Categorie) {
    this.subscriptions.push(
      this.warningService.showWarning('Vous êtes sûr que vous voulez supprimer cette catégorie?', true)
      .afterClosed().subscribe((result: WarningReponse) => {
        if (result.accept) {
          this.firebaseService.deleteCategorie(categorie.id);
          this.contest.categories = this.contest.categories.filter(cat => cat !== categorie.id);
          this.contestService.deleteCategorie(this.contest.id, categorie.id);
        }
      })
    );
  }

}
