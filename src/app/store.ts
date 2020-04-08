import { BehaviorSubject, Observable } from 'rxjs';
import { pluck, distinctUntilChanged } from 'rxjs/operators';
import { State } from './state';

const state: State = {
    user: undefined,
    selectedContest: undefined,
    contests: {},
    judges: undefined,
    speaker: undefined,
};

export class Store {
    private subject = new BehaviorSubject<State>(state);

    private store = this.subject.asObservable().pipe(distinctUntilChanged());

    get value() {
        return this.subject.value;
    }

    select<T>(name: string): Observable<T> {
        return this.store.pipe(pluck(name));
    }

    set(name: string, newState: any) {
        this.subject.next({
            ...this.value, [name]: newState,
        });
    }
}
