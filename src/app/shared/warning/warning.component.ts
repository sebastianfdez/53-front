import {
    Component, Inject, ViewEncapsulation,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface WarningData {
    message: string;
    cancel: boolean;
    input?: string;
}

export interface WarningReponse {
    accept: boolean;
    input?: number;
}

@Component({
    selector: 'app-warning',
    templateUrl: './warning.component.html',
    styleUrls: ['./warning.component.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class WarningComponent {
    inputResponse = 1;

    constructor(
        public dialogRef: MatDialogRef<WarningComponent>,
        @Inject(MAT_DIALOG_DATA) public data: WarningData,
    ) { }

    onNoClick(): void {
        this.dialogRef.close({ accept: false });
    }

    public accept() {
        const reponse: WarningReponse = { accept: true };
        if (this.data.input && this.inputResponse > 0) {
            reponse.input = this.inputResponse;
        }
        this.dialogRef.close(reponse);
    }

    public cancel() {
        this.dialogRef.close({ accept: false });
    }
}
