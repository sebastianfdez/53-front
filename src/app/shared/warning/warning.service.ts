import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { WarningComponent } from './warning.component';

@Injectable({
  providedIn: 'root'
})
export class WarningService {

  constructor(
    private dialog: MatDialog,
  ) { }

  showWarning(message: string, cancel: boolean) {
    return this.dialog.open(WarningComponent, {
      width: '600px',
      data: {
        message,
        cancel,
      },
    });
  }
}
