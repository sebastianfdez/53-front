import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

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

export class WarningComponent implements OnInit {

  inputResponse = 1;

  constructor(
    public dialogRef: MatDialogRef<WarningComponent>,
    @Inject(MAT_DIALOG_DATA) public data: WarningData
  ) { }

  ngOnInit() {
  }

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
