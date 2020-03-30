import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription, of, combineLatest } from 'rxjs';
import { Categorie } from '../../models/categorie';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth-form/services/auth.service';
import { switchMap, take, filter, distinctUntilChanged } from 'rxjs/operators';
import { User } from '../../../shared/models/user';
import { Contest } from '../../../shared/models/contest';
import { ContestsService } from '../../services/contest.service';
import { SnackBarService } from '../../../shared/services/snack-bar.service';

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
    private snackBarService: SnackBarService,
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

  public mouseup(categorie: Categorie, event: any) {
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
    }
    this.timeoutHandler = null;
    this.time = 0;
    clearInterval(this.timeoutHandler);
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
      this.snackBarService.showMessage('Êtes-vous sûr de vouloir supprimer cette catégorie?', 'Oui')
      .onAction().subscribe(() => {
        this.contest.categories = this.contest.categories.filter(cat => cat !== categorie.id);
        this.categories = this.categories.filter(cat => cat.id !== categorie.id);
        this.contestService.deleteCategorie(this.contest.id, categorie.id);
        this.timeoutHandler = null;
        this.time = 0;
        clearInterval(this.timeoutHandler);
      })
    );
    this.deleteCategories[categorie.id] = false;
  }

  get categoriesNotFinal() {
    return this.categories.filter(c => !c.final);
  }

  get categoriesFinal(): Categorie[] {
    return this.categories.filter(c => c.final);
  }

}
