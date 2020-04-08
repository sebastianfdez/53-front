/* eslint-disable max-classes-per-file */
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
    Observable, Subscription, of, combineLatest,
} from 'rxjs';
import { Router } from '@angular/router';
import { switchMap, tap, distinctUntilChanged } from 'rxjs/operators';
import { Categorie } from '../../models/categorie';
import { AuthService } from '../../../auth/auth-form/services/auth.service';
import { User } from '../../../shared/models/user';
import { Contest } from '../../../shared/models/contest';
import { ContestsService } from '../../services/contest.service';
import { SnackBarService } from '../../../shared/services/snack-bar.service';

export abstract class ContestViewService {
    getSelectedContest: () => Observable<Contest>;

    getCategorie: (categorieId: string) => Observable<Categorie>;

    deleteCategorie: (contestId: string, categorieId: string) => void
}

@Component({
    selector: 'app-contests',
    providers: [
        { provide: ContestViewService, useExisting: ContestsService },
    ],
    templateUrl: './contests.component.html',
})
export class ContestsComponent implements OnInit, OnDestroy {
    items: Observable<any[]>;

    categories$: Observable<Categorie[]> = null;

    judge$: Observable<User> = null;

    contest$: Observable<Contest> = null;

    public loading = false;

    public isJudge: Observable<boolean> = null;

    public isAdmin: Observable<boolean> = null;

    timeoutHandler: any;

    time = 0;

    deleteCategories: {
        [id: string]: boolean;
    } = {};

    subscriptions: Subscription[] = [];

    constructor(
        private router: Router,
        private contestService: ContestViewService,
        private authService: AuthService,
        private snackBarService: SnackBarService,
    ) {
        this.loading = true;
    }

    ngOnInit() {
        this.isAdmin = this.authService.isAdmin();
        this.isJudge = this.authService.isJudge();
        this.judge$ = this.authService.getAuthenticatedUser();
        this.contest$ = this.contestService.getSelectedContest();
        this.categories$ = this.contestService.getSelectedContest().pipe(
            tap(() => {
                this.loading = true;
            }),
            switchMap((contest) => (contest.categories.length ? combineLatest(
                contest.categories
                    .map((categorie) => this.contestService.getCategorie(categorie)),
            ) : of([]))),
            tap((categories: Categorie[]) => {
                this.loading = false;
                return categories
                    .filter((cat) => cat)
                    .forEach((categorie) => {
                        this.deleteCategories[categorie.id] = false;
                    });
            }),
        );
    }

    ngOnDestroy() {
        this.subscriptions.forEach((s) => s.unsubscribe());
    }

    goTo(categorie: Categorie) {
        // eslint-disable-next-line no-unused-expressions
        (this.isJudge || this.isAdmin)
            ? this.router.navigate([`/portal/categorie/${categorie.id}`])
            : this.router.navigate([`/portal/categorie/${categorie.id}/speaker`]);
    }

    public mouseup(categorie: Categorie, event: any) {
        if (!this.isAdmin) {
            return this.goTo(categorie);
        }
        if (event.toElement.nodeName === 'MAT-ICON') {
            this.deleteCategorie(categorie);
        } else if (this.time > 20) {
            this.deleteCategories[categorie.id] = true;
        } else {
            return this.goTo(categorie);
        }
        this.timeoutHandler = null;
        this.time = 0;
        clearInterval(this.timeoutHandler);
        return null;
    }

    goToNew() {
        this.router.navigate(['/portal/categorie/new']);
    }

    public mousedown() {
        this.timeoutHandler = setInterval(() => {
            this.time++;
        }, 100);
    }

    deleteCategorie(categorie: Categorie) {
        this.subscriptions.push(
            this.snackBarService.showMessage('Êtes-vous sûr de vouloir supprimer cette catégorie?', 'Oui')
                .onAction().pipe(
                    switchMap(() => this.contest$),
                    distinctUntilChanged(),
                ).subscribe((contest) => {
                    // eslint-disable-next-line no-param-reassign
                    contest.categories = contest.categories.filter((cat) => cat !== categorie.id);
                    this.contestService.deleteCategorie(contest.id, categorie.id);
                    this.timeoutHandler = null;
                    this.time = 0;
                    clearInterval(this.timeoutHandler);
                }),
        );
        this.deleteCategories[categorie.id] = false;
    }

    // eslint-disable-next-line class-methods-use-this
    categoriesFinal(categories: Categorie[], final: boolean): Categorie[] {
        return categories.filter((c) => (final ? c.final : !c.final));
    }
}
