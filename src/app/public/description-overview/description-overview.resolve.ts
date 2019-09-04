import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { of } from 'rxjs';

@Injectable()
export class DescriptionOverviewResolve implements Resolve<string> {
  constructor() {}
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return of(route.params.type);
  }
}
