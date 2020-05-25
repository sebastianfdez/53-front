/* eslint-disable class-methods-use-this */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    constructor(
        private http: HttpClient,
    ) {}

    public get<T>(path: string, params?: {[param: string]: string | string[];}): Observable<T> {
        const headers: HttpHeaders = this.getHeaders();
        return this.http.get<T>(path, { headers, params });
    }

    public jsonp(path: string) {
        return this.http.jsonp(path, 'JSONP_CALLBACK');
    }

    getHeaders(): HttpHeaders {
        return new HttpHeaders().set('Content-Type', 'application/json');
    }
}
