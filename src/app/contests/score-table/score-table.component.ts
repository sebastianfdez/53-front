import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { Categorie, Judge, Participant, CategoriePopulated } from '../models/categorie';
import { Sort } from '@angular/material';
import { ExcelExportComponent } from '@progress/kendo-angular-excel-export';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

export interface ScoreElement {
  pool: number;
  name: string;
  licence: string;
  scoreJ1: number;
  scoreJ2: number;
  scoreJ3: number;
  average: number;
  calification: number;
}

@Component({
  selector: 'app-score-table',
  templateUrl: './score-table.component.html',
  styleUrls: ['./score-table.component.scss']
})
export class ScoreTableComponent implements OnInit {

  public categorie: CategoriePopulated = null;
  public judges: Judge[] = [];
  public dataSource: ScoreElement[] = [];
  displayedColumns: string[] = ['pool', 'name', 'licence', 'scoreJ1', 'scoreJ2', 'scoreJ3', 'average', 'calification'];
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private database: AngularFirestore,
  ) {
    this.loading = true;
    this.route.params.subscribe((params) => {
      this.database.collection<Categorie>('categories').doc<CategoriePopulated>(params.id).valueChanges().pipe(
        switchMap((categorie) => {
          // categorie.pools.map((pool) => {
          //   pool.participants.
          // });
          return of(categorie);
        })
      )
      .subscribe((categorie: CategoriePopulated) => {
        this.categorie = categorie;
        console.log(this.categorie);
        this.getTableData();
        this.loading = false;
      });
      this.database.collection('judges').valueChanges().subscribe((judges: Judge[]) => this.judges = judges);
    });
  }

  ngOnInit() {
  }

  getTableData() {
    this.dataSource = [];
    this.categorie.pools.forEach((pool, index) => {
      pool.participants.forEach((participant) => {
        const newScore: ScoreElement = {
          pool: index,
          name: participant.name + ' ' + participant.lastName,
          licence: participant.licence,
          scoreJ1: 0,
          scoreJ2: 0,
          scoreJ3: 0,
          average: 0,
          calification: 1,
        };
        let totalVotes = 0;
        let totalScore = 0;
        participant.votes.forEach((vote) => {
          totalVotes++;
          totalScore += vote.note;
          switch (vote.codeJuge) {
            case('Juge1'):
              return newScore.scoreJ1 = vote.note;
            case('Juge2'):
              return newScore.scoreJ2 = vote.note;
            case('Juge3'):
              return newScore.scoreJ3 = vote.note;
          }
        });
        totalVotes ? newScore.average = Math.round(totalScore / totalVotes) : newScore.average = 0;
        this.dataSource.push(newScore);
      });
    });
    this.dataSource = this.dataSource.sort((a, b) => a.average > b.average ? -1 : 1);
    this.dataSource.forEach((data, index) => data.calification = index + 1);
    this.dataSource = this.dataSource.sort((a, b) => a.pool > b.pool ? 1 : -1);
  }

  sortData(sort: Sort) {
    console.log(sort);
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
    console.log(component);
    component.data.forEach(row => row.pool++);
    const options = component.workbookOptions();

    component.save(options);
    component.data.forEach(row => row.pool--);
  }

  getFileName() {
    return `Classement ${this.categorie.name}`;
  }

}
