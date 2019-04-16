import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-warning',
  templateUrl: './warning.component.html',
  styleUrls: ['./warning.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class WarningComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<WarningComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  public accept() {
    this.dialogRef.close(true);
  }

  public cancel() {
    this.dialogRef.close(false);
  }

}
