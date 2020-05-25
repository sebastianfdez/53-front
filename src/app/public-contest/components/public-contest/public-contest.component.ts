import { Component, OnInit } from '@angular/core';
import { Contest } from 'src/app/shared/models/contest';
import { ActivatedRoute } from '@angular/router';
import { Observable, combineLatest } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ParticipantPublic, PublicVote } from '../../../contests/models/categorie';
import { PublicContestsService } from '../../services/public-contest.service';
import { ApiService } from '../../../shared/services/api.service';

@Component({
    selector: 'app-public-contest',
    templateUrl: './public-contest.component.html',
})
export class PublicContestComponent implements OnInit {
    contest$: Observable<Contest> = null;

    participants$: Observable<ParticipantPublic[]> = null;

    votes$: Observable<{ [idParticipant: string]: PublicVote; }> = null;

    userIP: string;

    loading = false;

    constructor(
        private route: ActivatedRoute,
        private publicContestService: PublicContestsService,
        private formBuilder: FormBuilder,
        private apiService: ApiService,
    ) {}

    ngOnInit(): void {
        this.loading = true;
        this.contest$ = this.route.data.pipe(
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
                        pool.participants.map((part: ParticipantPublic) => {
                            return { ...part, category: c.name };
                        }),
                    ), [],
                )), [],
            )),
        );
        this.votes$ = this.participants$.pipe(
            switchMap((participants) => combineLatest(
                participants.map((p) => this.publicContestService.getVote(p.likes).pipe(
                    // eslint-disable-next-line arrow-body-style
                    map((vote) => {
                        return { vote, id: p.likes };
                    }),
                )),
            )),
            map((votes: { vote: PublicVote; id: string; }[]) => {
                const votesMap: { [idParticipant: string]: PublicVote; } = {};
                votes.forEach((vote) => {
                    votesMap[vote.id] = vote.vote;
                }, votesMap);
                this.loading = false;
                return votesMap;
            }),
        );
        this.getIpCliente().subscribe();
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

    getIpCliente(): Observable<any> {
        return this.apiService.jsonp(
            'http://api.ipify.org/?format=jsonp&callback=JSONP_CALLBACK',
        ).pipe(
            map((res: any) => res.ip),
            tap((res) => {
                console.log(res);
                this.userIP = res;
            }),
        );
    }

    vote(p: ParticipantPublic, vote: PublicVote) {
        this.loading = true;
        this.publicContestService.vote(this.userIP, vote, p.likes).then(() => {
            this.loading = false;
        });
    }
}
