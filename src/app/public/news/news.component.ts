import { Component } from '@angular/core';
import { AnimationService } from '../services/animation.service';

@Component({
    selector: 'app-news',
    templateUrl: './news.component.html',
    styleUrls: ['./news.component.scss'],
})
export class NewsComponent {
    constructor(private animationService: AnimationService) {}

    elementInViewport(element: HTMLElement) {
        return this.animationService.elementInViewport(element);
    }
}
