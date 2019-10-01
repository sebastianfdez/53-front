import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, of, combineLatest } from 'rxjs';
import { Categorie, Judge } from '../models/categorie';
import { take, switchMap } from 'rxjs/operators';
import { Contest } from '../models/contest';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(
    private database: AngularFirestore
  ) { }

  getCategorie(id: string): Observable<Categorie> {
    const snapshot: Observable<Categorie> =
            this.database.doc<Categorie>(`categories/${id}`).valueChanges().pipe(take(1));
    return snapshot;
  }

  getJudges(): Observable<Judge[]> {
    const contestId = localStorage.getItem('contestId');
    return this.database.collection('contests').doc<Contest>(contestId).snapshotChanges().pipe(
      take(1),
      switchMap((contest) => {
        return combineLatest(
          contest.payload.data().judges.map((judge) => {
            return this.database.collection('users').doc<Judge>(judge).snapshotChanges().pipe(take(1));
          })
        );
      }),
      switchMap((judges) => {
        return of(judges.map(judge => {
          return {...judge.payload.data(), id: judge.payload.id};
        }));
      }),
    );
  }
}
