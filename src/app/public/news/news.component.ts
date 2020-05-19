import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AnimationService } from '../services/animation.service';
import { SnackBarService } from '../../shared/services/snack-bar.service';

@Component({
    selector: 'app-news',
    templateUrl: './news.component.html',
    styleUrls: ['./news.component.scss'],
})
export class NewsComponent {
    constructor(
        private animationService: AnimationService,
        private snackbarService: SnackBarService,
        private router: Router,
    ) {}

    elementInViewport(element: HTMLElement) {
        return this.animationService.elementInViewport(element);
    }

    navigate(url: string) {
        this.router.navigate([`home/${url}`]);
    }

    goToOpenContest() {
        this.snackbarService.showMessage(
            'Le LRO5 #CovidEdition commencera le 1 juin 2020. À partir de cette date vous pourrez vous inscrire au contest et voter pour votre vidéo préférée!',
            null,
            { panelClass: ['message-snackbar'], duration: 10000 },
        );
    }
}
