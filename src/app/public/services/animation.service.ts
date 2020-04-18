/* eslint-disable class-methods-use-this */
import { Injectable } from '@angular/core';

@Injectable()
export class AnimationService {
    appear: Map<string, boolean> = new Map<string, boolean>();

    public elementInViewport(el: HTMLElement): boolean {
        if (this.appear.get(el.id)) {
            return true;
        }
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
        this.appear.set(el.id, appear);
        return appear;
    }
}
