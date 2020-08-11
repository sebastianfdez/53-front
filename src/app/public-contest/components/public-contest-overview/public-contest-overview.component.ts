import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Contest } from '../../../shared/models/contest';

@Component({
    selector: 'app-public-contest-overview',
    templateUrl: './public-contest-overview.component.html',
    styleUrls: ['./public-contest-overview.component.scss'],
})
export class PublicContestOverviewComponent {
    contest$: Observable<Contest> = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
    ) {}

    ngOnInit(): void {
        this.contest$ = this.route.data.pipe(
            map((data: {contest: Contest;}) => data.contest),
        );
    }

    goToVote(id: string) {
        this.router.navigate([`public-contest/${id}`]);
    }

    goToParticipate(id: string) {
        this.router.navigate(['inscription'], { queryParams: { contest: id } });
    }
}
