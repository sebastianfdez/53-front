/* eslint-disable no-undef */
import {
    Component, OnInit, LOCALE_ID, Inject,
} from '@angular/core';
import { Store } from 'store';
import { MatSelectChange } from '@angular/material/select';
import { Router } from '@angular/router';
import { LANGUAGES_53 } from '../../../shared/models/languages';

@Component({
    selector: 'app-language-selector',
    templateUrl: './language-selector.component.html',
    styleUrls: ['./language-selector.component.scss'],
})
export class LanguageSelectorComponent implements OnInit {
    languages = null;

    languages53 = LANGUAGES_53;

    selected = null;

    constructor(
        private store: Store,
        private router: Router,
        @Inject(LOCALE_ID) protected localeId: string,
    ) {}

    ngOnInit() {
        this.languages = Object.keys(LANGUAGES_53);
        this.selected = localStorage.getItem('language') ? localStorage.getItem('language') : null;
        this.store.set('language', this.selected ? this.selected : null);
    }

    changeLanguage(event: MatSelectChange) {
        this.store.set('language', event.value);
        localStorage.setItem('language', event.value);
        this.router.navigate([event.value]);
    }
}
