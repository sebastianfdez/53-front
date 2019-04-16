import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { Categorie, Judge, CategoriePopulated, Participant } from '../models/categorie';
import { Sort } from '@angular/material';
import { ExcelExportComponent } from '@progress/kendo-angular-excel-export';
import { switchMap } from 'rxjs/operators';
import { of, combineLatest, Subscription, Observable } from 'rxjs';
import { Contest } from '../models/contest';

export interface ScoreElement {
  pool: number;
  name: string;
  licence: string;
  scores: {[idJudge: string]: number};
  average: number;
  calification: number;
}

@Component({
  selector: 'app-score-table',
  templateUrl: './score-table.component.html',
  styleUrls: ['./score-table.component.scss']
})
export class ScoreTableComponent implements OnInit, OnDestroy {

  public categorie: CategoriePopulated = null;
  public categoriePop: CategoriePopulated = null;
  public judges: Judge[] = [];
  public dataSource: ScoreElement[] = [];
  displayedColumns: string[] = [];
  loading = false;

  subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private database: AngularFirestore,
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      combineLatest(
        this.getPools(),
        this.getJudges(),
      ).subscribe(([categorie, judges]) => {
        this.judges = judges;
        this.categorie = categorie;
        this.getTableData();
        this.loading = false;
        console.log(this.judges);
        this.displayedColumns = ['pool', 'name', 'licence'];
        this.judges.forEach(judge => this.displayedColumns.push(`${judge.name}${judge.lastName}`));
        this.displayedColumns.push('average', 'calification');
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  getJudges(): Observable<Judge[]> {
    const contestId = localStorage.getItem('contestId');
    return this.database.collection('contests').doc<Contest>(contestId).snapshotChanges().pipe(
      switchMap((contest) => {
        return combineLatest(
          contest.payload.data().judges.map((judge) => {
            return this.database.collection('users').doc<Judge>(judge).snapshotChanges();
          })
        );
      }),
      switchMap((judges) => {
        return of(judges.map(judge => {
          return {...judge.payload.data(), id: judge.payload.id};
        }));
      })
    );
  }

  getPools(): Observable<CategoriePopulated> {
    this.loading = true;
    let categorie_: Categorie;
    return this.route.params.pipe(
      switchMap((params) => {
        return this.database.doc<Categorie>(`categories/${params.id}`).snapshotChanges();
      }),
      switchMap((categorie) => {
        categorie_ = {...categorie.payload.data()};
        categorie_.id = categorie.payload.id;
        return combineLatest(
          categorie_.pools.map((pool) => {
            return combineLatest(
              pool.participants.map((participant) => {
                return this.database.collection('players').doc<Participant>(participant).snapshotChanges();
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
      }),
      switchMap((pools) => {
        const categorie: CategoriePopulated = {...categorie_, pools};
        return of(categorie);
      })
    );
  }

  getTableData() {
    this.dataSource = [];
    this.categorie.pools.forEach((pool, index) => {
      pool.participants.forEach((participant) => {
        const newScore: ScoreElement = {
          pool: index,
          name: participant.name + ' ' + participant.lastName,
          licence: participant.licence,
          scores: {},
          average: 0,
          calification: 1,
        };
        participant.votes.forEach(vote => newScore.scores[vote.codeJuge] = vote.note);
        let totalVotes = 0;
        let totalScore = 0;
        participant.votes.forEach((vote) => {
          totalVotes++;
          totalScore += vote.note;
        });
        newScore.average = totalVotes ? Math.round(totalScore / totalVotes) : 0;
        this.dataSource.push(newScore);
      });
    });
    this.dataSource = this.dataSource.sort((a, b) => a.average > b.average ? -1 : 1);
    this.dataSource.forEach((data, index) => data.calification = index + 1);
    this.dataSource = this.dataSource.sort((a, b) => a.pool > b.pool ? 1 : -1);
  }

  sortData(sort: Sort) {
    const data = this.dataSource.slice();
    if (!sort.active || sort.direction === '') {
      this.dataSource = data;
      return;
    }

    this.dataSource = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'pool': return this.compare(a.pool, b.pool, isAsc);
        case 'name': return this.compare(a.name, b.name, isAsc);
        case 'licence': return this.compare(a.licence, b.licence, isAsc);
        case 'average': return this.compare(a.average, b.average, isAsc);
        case 'calification': return this.compare(a.calification, b.calification, isAsc);
        default: return 0;
      }
    });
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  public save(component: ExcelExportComponent): void {
    component.data.forEach(row => row.pool++);
    const options = component.workbookOptions();

    component.save(options);
    component.data.forEach(row => row.pool--);
  }

  getFileName() {
    return `Classement ${this.categorie ? this.categorie.name : ''}`;
  }

  getVote(element: ScoreElement, judge: Judge) {
    return judge.id && element.scores[judge.id] ? element.scores[judge.id] : 0;
  }

}
