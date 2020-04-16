/* eslint-disable class-methods-use-this */
/* eslint-disable no-undef */
import { Component } from '@angular/core';

@Component({
    selector: 'app-news',
    templateUrl: './news.component.html',
    styleUrls: ['./news.component.scss'],
})
export class NewsComponent {
    elementInViewport(el: HTMLElement): boolean {
        const top = el.offsetTop;
        const height = el.offsetHeight;
        let screenInit = 0;
        let screenEnd = 0;
        let element: HTMLElement = el;
        while (element.parentElement && screenInit === 0) {
            if (element.id === 'scrollable') {
                screenInit = element.scrollTop;
                screenEnd = screenInit + element.offsetHeight;
            }
            element = element.parentElement;
        }
        const appear = (top < screenEnd && screenInit < top)
            || (top + height > screenInit && top + height < screenEnd);
        return appear;
    }
}
