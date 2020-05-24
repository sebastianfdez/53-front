import { Component, OnInit } from '@angular/core';
import { Contest } from 'src/app/shared/models/contest';
import { ActivatedRoute } from '@angular/router';
import { Observable, combineLatest, from } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';
import { Participant } from 'src/app/contests/models/categorie';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PublicContestsService } from '../../services/public-contest.service';

export interface ParticipantPublic extends Participant {
    category: string;
}

@Component({
    selector: 'app-public-contest',
    templateUrl: './public-contest.component.html',
})
export class PublicContestComponent implements OnInit {
    contest$: Observable<Contest> = null;

    participants$: Observable<ParticipantPublic[]> = null;

    constructor(
        private route: ActivatedRoute,
        private publicContestService: PublicContestsService,
        private formBuilder: FormBuilder,
    ) {}

    ngOnInit(): void {
        this.contest$ = this.route.data.pipe(
            tap((data) => console.log(data)),
            map((data: {contest: Contest;}) => data.contest),
        );
        this.participants$ = this.contest$.pipe(
            switchMap((contest) => combineLatest(
                contest.categories.map((c) => this.publicContestService.getCategorie(c)),
            )),
            map((categories) => categories.reduce(
                (list: ParticipantPublic[], c) => list.concat(c.pools.reduce(
                    (list_: ParticipantPublic[], pool) => list_.concat(
                        // eslint-disable-next-line arrow-body-style
                        pool.participants.map((part) => {
                            return { ...part, category: c.name };
                        }),
                    ), [],
                )), [],
            )),
        );
    }

    getParticipantForm(p: ParticipantPublic): FormGroup {
        const form: FormGroup = this.formBuilder.group({
            name: p.name,
            club: p.club,
            lastName: p.lastName,
            videoLink: p.videoLink,
            category: p.category,
        });
        form.disable();
        return form;
    }
}
