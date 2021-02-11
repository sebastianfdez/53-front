import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, combineLatest } from 'rxjs';
import {
    map, switchMap, tap,
} from 'rxjs/operators';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Meta } from '@angular/platform-browser';
import { Contest } from '../../../shared/models/contest';
import { ParticipantPublic, PublicVote } from '../../../contests/models/categorie';
import { PublicContestsService } from '../../services/public-contest.service';
import { ApiService } from '../../../shared/services/api.service';

interface ParticipantPublicLoading extends ParticipantPublic {
    loading: boolean;
}

@Component({
    selector: 'app-public-contest',
    templateUrl: './public-contest.component.html',
})
export class PublicContestComponent implements OnInit {
    contest$: Observable<Contest> = null;

    participants$: Observable<ParticipantPublicLoading[]> = null;

    votes$: Observable<{ [idParticipant: string]: PublicVote; }> = null;

    userIP: string;

    loading = false;

    constructor(
        private route: ActivatedRoute,
        private publicContestService: PublicContestsService,
        private formBuilder: FormBuilder,
        private apiService: ApiService,
        private meta: Meta,
    ) {}

    ngOnInit(): void {
        this.contest$ = this.route.data.pipe(
            map((data: {contest: Contest;}) => data.contest),
            tap((contest) => {
                this.meta.updateTag({ property: 'og:title', content: contest.name });
            }),
        );
        this.participants$ = this.contest$.pipe(
            switchMap((contest) => combineLatest(
                contest.categories.map((c) => this.publicContestService.getCategorie(c)),
            )),
            map((categories) => categories.reduce(
                (list: ParticipantPublicLoading[], c) => list.concat(c.pools.reduce(
                    (list_: ParticipantPublicLoading[], pool) => list_.concat(
                        // eslint-disable-next-line arrow-body-style
                        pool.participants.map((part: ParticipantPublicLoading) => {
                            return { ...part, category: c.name, loading: false };
                        }),
                    ), [],
                )), [],
            )),
            map((participants) => participants.filter((p) => p.active)
                .sort(() => Math.random() - 0.5)),
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
                return votesMap;
            }),
        );
        this.getClientIP().subscribe();
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

    getClientIP(): Observable<any> {
        // Get the actual client IP to store into the votes
        return this.apiService.jsonp(
            'https://api.ipify.org/?format=jsonp&callback=JSONP_CALLBACK',
        ).pipe(
            map((res: any) => res.ip),
            tap((res) => {
                this.userIP = res;
            }),
        );
    }

    vote(p: ParticipantPublicLoading, vote: PublicVote) {
        // eslint-disable-next-line no-param-reassign
        p.loading = true;
        this.publicContestService.vote(this.userIP, vote, p.likes).then(() => {
            setTimeout(() => {
                // eslint-disable-next-line no-param-reassign
                p.loading = false;
            }, 1000);
        });
    }
}
