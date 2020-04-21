import { Injectable } from '@angular/core';
import {
    MatSnackBar, MatSnackBarConfig, MatSnackBarRef, SimpleSnackBar,
} from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root',
})
export class SnackBarService {
    constructor(
        private snackBar: MatSnackBar,
    ) { }

    showMessage(
        message: string, action?: string, config?: MatSnackBarConfig<any>,
    ): MatSnackBarRef<SimpleSnackBar> {
        return this.snackBar.open(message, action, config || { panelClass: ['message-snackbar'], duration: 5000 });
    }

    showError(message: string) {
        return this.snackBar.open(message, '', { panelClass: ['error-snackbar'], duration: 5000 });
    }
}
