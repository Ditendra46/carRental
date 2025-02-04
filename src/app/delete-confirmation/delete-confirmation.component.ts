import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-confirmation',
  templateUrl: './delete-confirmation.component.html',
  styleUrls: ['./delete-confirmation.component.scss']
})
export class DeleteConfirmationComponent {
  constructor(public dialogRef: MatDialogRef<DeleteConfirmationComponent>) {}

  onConfirm(): void {
    this.dialogRef.close(true); // Close the dialog and return true
  }

  onCancel(): void {
    this.dialogRef.close(false); // Close the dialog and return false
  }
}
