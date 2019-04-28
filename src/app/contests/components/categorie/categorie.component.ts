import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Categorie, Pool, Votes, Participant, emptyParticipant, emptyCategorie } from '../../models/categorie';
import { AngularFirestore, Action, DocumentSnapshot } from '@angular/fire/firestore';
import { map, switchMap } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { combineLatest, of, from, Subscription } from 'rxjs';

@Component({
  selector: 'app-categorie',
  templateUrl: './categorie.component.html',
  styleUrls: ['./categorie.component.scss']
})
export class CategorieComponent implements OnInit, OnDestroy {

  public createNew = false;
  public categorie: Categorie = JSON.parse(JSON.stringify(emptyCategorie));
  public contestId = '';
  public pools: Pool[] = [];

  public loading = false;

  public votesRecord: { [codeParticipant: string]: number } = {};

  public isAdmin = false;
  public isJudge = false;
  public isSpeaker = false;
  public judgeCode = '';
  public judgeName = '';

  deletedPlayers: string[] = [];

  subscription: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private database: AngularFirestore,
    private authService: AuthService,
    private router: Router,
  ) {
    this.isAdmin = this.authService.authStateUser ? this.authService.authStateUser.role === 'admin' : false;
    this.isJudge = this.authService.authStateUser ? this.authService.authStateUser.role === 'judge' : false;
    this.judgeCode = this.authService.authStateUser.id;
    this.judgeName = `${this.authService.authStateUser.name} ${this.authService.authStateUser.lastName}`;
    if (this.route.snapshot.routeConfig.path === 'categorie/:id/speaker') {
      this.isSpeaker = true;
    }
  }

  ngOnInit() {
    this.contestId = localStorage.getItem('contestId');
    this.subscription.push(
      this.route.params.pipe(
        switchMap((params) => {
          this.categorie.contest = this.authService.authStateUser.contest;
          console.log(this.categorie.contest);
          if (!params.id) {
            this.createNew = true;
            return of(null);
          } else {
            this.loading = true;
            return this.database.collection('categories').doc<Categorie>(params.id).snapshotChanges();
          }
        }),
        switchMap((action: Action<DocumentSnapshot<Categorie>>) => {
          if (!action) {
            const poolListEmpty: Pool[] = [];
            return of(poolListEmpty);
          }
          this.categorie = {
            ...action.payload.data(),
            id: action.payload.id,
          };
          console.log(this.categorie);
          return combineLatest(
            this.categorie.pools.map((pool) => {
              return combineLatest(
                pool.participants.map((participant) => {
                  return this.database.doc<Participant>(`players/${participant}`).snapshotChanges();
                })
              ).pipe(
                switchMap((participants) => {
                  return of({ participants: participants
                    .map((participant) => {
                      const participant_: Participant = {...participant.payload.data()};
                      participant_.id = participant.payload.id;
                      return participant_;
                    })
                    .filter(participant => participant.name)
                  });
                })
              );
            })
          );
        })
      ).subscribe((pools) => {
        console.log({pools});
        this.pools = pools;
        this.pools = this.pools.filter(pool => pool.participants.length);
        this.pools.forEach((pool) => {
          pool.participants.forEach((participant) => {
            const vote: Votes = participant.votes.find(vote_ => vote_.codeJuge === this.judgeCode);
            this.votesRecord[`${participant.id}`] = vote ? vote.note : null;
          });
        });
        this.loading = false;
      })
    );
  }

  ngOnDestroy() {
    this.subscription.forEach(s => s.unsubscribe());
  }

  addParticipant(pool: Pool) {
    if (pool.participants.length === 0 || pool.participants[pool.participants.length - 1].name !== '') {
      pool.participants.push(JSON.parse(JSON.stringify(emptyParticipant)));
    }
  }

  addPool() {
    console.log(this.categorie);
    if (!this.categorie.pools.length || this.categorie.pools[this.categorie.pools.length - 1].participants.length > 0 &&
      this.pools[this.pools.length - 1].participants[0].name !== '') {
      this.pools.push({ participants: [JSON.parse(JSON.stringify(emptyParticipant))]});
    }
  }

  deleteParticipant(pool: Pool, i: number) {
    if (pool.participants[i].id !== '') {
      this.deletedPlayers.push(pool.participants[i].id);
    }
    pool.participants.splice(i, 1);
  }

  deletePool(j: number) {
    this.pools[j].participants.forEach((participant) => {
      if (participant.id) {
        this.deletedPlayers.push(participant.id);
      }
    });
    this.pools.splice(j, 1);
  }

  save() {
    if (this.createNew) {
      const playersPoolId: {participants: string[]}[] = [];
      this.subscription.push(
        combineLatest(
          this.pools.map((pool) => {
            return combineLatest(
              pool.participants.map((participant) => {
                return this.database.collection('players').add(participant);
              })
            ).pipe(
              switchMap((values) => {
                playersPoolId.push({participants: values.map(value => value.id)});
                return of(null);
              })
            );
          })
        ).pipe(
          switchMap(() => {
            this.categorie.pools = playersPoolId;
            return from(this.database.collection('categories').add(this.categorie));
          }),
          switchMap((doc) => {
            return from(this.database.collection('contests').doc(this.contestId).update({ newCategorie: doc.id }));
          })
        ).subscribe(() => {
          this.authService.isAdmin ?
          this.router.navigate(['admin']) :
          this.router.navigate(['contests']);
        })
      );
    } else {
      this.subscription.push(
        combineLatest(
          this.pools.map((pool) => {
            return combineLatest(
              pool.participants.map((participant) => {
                if (participant.id === '') {
                  return from(this.database.collection('players').add(participant)).pipe(
                    switchMap((value) => {
                      return of(value.id);
                    })
                  );
                } else {
                  return of(participant.id);
                }
              })
            ).pipe(
              switchMap((participants) => {
                return of({participants});
              })
            );
          })
        ).subscribe((pools: {participants: string[]}[]) => {
          this.categorie.pools = pools;
          this.database.collection('categories').doc(this.categorie.id).update(this.categorie);
          this.authService.isAdmin ? this.router.navigate(['admin']) : this.router.navigate(['contests']);
        })
      );
      this.deletedPlayers.forEach((player) => {
        this.database.collection('players').doc(player).delete();
      });
    }
  }

  valueChange(event: Event, id: string) {
    const value: number = (event.target as HTMLInputElement).value as any as number;
    console.log(value);
    console.log(value % 1);
    console.log(typeof value);

    if (value > 100) {
      this.votesRecord[id] = 100;
    } else if (value < 0) {
      this.votesRecord[id] = 0;
    } else if ((value * 100) % 1 !== 0) {
      this.votesRecord[id] = Math.floor(value * 100) / 100;
    }
    console.log(this.votesRecord[id]);
  }

  saveVotes() {
    this.subscription.push(
      combineLatest(
        Object.keys(this.votesRecord).filter(vote => this.votesRecord[vote]).map((playerID) => {
          return this.database.collection<Participant>('players').doc<Participant>(playerID).snapshotChanges();
        })
      ).pipe(
        switchMap((actions) => {
          return combineLatest(
            actions.map((action) => {
              const participant: Participant = action.payload.data();
              participant.id = action.payload.id;
              let vote: Votes = participant.votes.find(vote_ => vote_.codeJuge === this.judgeCode);
              if (!vote) {
                vote = {
                  codeJuge: this.judgeCode,
                  codeParticipant: participant.licence,
                  nameJuge: this.judgeName,
                  note: 1,
                };
                participant.votes.push(vote);
              }
              vote.note = this.votesRecord[`${participant.id}`];
              return from(this.database.collection('players').doc(participant.id).update(participant));
            })
          );
        })
      ).subscribe(() => {
        this.router.navigate(['contests']);
      })
    );
  }

  goToScores() {
    console.log(this.route);
    console.log(this.categorie.id);
    this.router.navigate([`/categorie/${this.categorie.id}/scores`]);
  }

  getVote(pool: Pool, i: number) {
    return this.votesRecord[`${pool.participants[i].id}`];
  }

}
