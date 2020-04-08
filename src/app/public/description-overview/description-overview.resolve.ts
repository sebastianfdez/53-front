import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { of } from 'rxjs';

@Injectable()
export class DescriptionOverviewResolve implements Resolve<string> {
    // eslint-disable-next-line class-methods-use-this
    resolve(route: ActivatedRouteSnapshot) {
        return of(route.params.type);
    }
}
