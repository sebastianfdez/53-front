import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AnimationService } from '../services/animation.service';

@Component({
    selector: 'app-news',
    templateUrl: './news.component.html',
    styleUrls: ['./news.component.scss'],
})
export class NewsComponent {
    constructor(
        private animationService: AnimationService,
        private router: Router,
    ) {}

    elementInViewport(element: HTMLElement) {
        return this.animationService.elementInViewport(element);
    }

    navigate(url: string) {
        this.router.navigate([`home/${url}`]);
    }

    goToOpenContest() {
        this.router.navigate(['/public-contest/lyon-roller-open/overview']);
    }
}
