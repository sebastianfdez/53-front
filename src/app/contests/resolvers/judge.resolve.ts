import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { Store } from 'store';
import { take, switchMap } from 'rxjs/operators';
import { FirebaseService } from '../../shared/services/firebase.service';
import { ContestsService } from '../services/contest.service';
import { User } from '../../shared/models/user';

@Injectable()
export class JudgeResolve implements Resolve<User[]> {
    constructor(
        private firebaseService: FirebaseService,
        private contestService: ContestsService,
        private store: Store,
    ) {}

    resolve(): Observable<User[]> {
        return this.store.value.judges ? this.store.select<User[]>('judges').pipe(take(1))
            : this.store.select<User>('user').pipe(
                switchMap(() => this.contestService.getSelectedContest()),
                take(1),
                switchMap((contest) => this.firebaseService.getJudges(contest)),
                switchMap((judges) => {
                    this.store.set('judges', judges);
                    return this.store.select<User[]>('judges');
                }),
                take(1),
            );
    }
}
