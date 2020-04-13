import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/pluck';

@Component({
    selector: 'app-description-overview',
    templateUrl: './description-overview.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./description-overview.component.scss'],
})
export class DescriptionOverviewComponent {
    type: Observable<string> = this.route.params.pluck('type');

    constructor(
        private route: ActivatedRoute,
    ) { }
}
