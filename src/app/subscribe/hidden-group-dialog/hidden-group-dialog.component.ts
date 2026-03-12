import { Component, Inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-hidden-group-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    TranslateModule
  ],
  templateUrl: './hidden-group-dialog.component.html',
  styleUrl: './hidden-group-dialog.component.css'
})
export class HiddenGroupDialogComponent {
  groupName: string = '';
  title: string = 'SUBSCRIBE.ADD_HIDDEN_GROUP';
  label: string = 'SUBSCRIBE.GROUP_NAME';

  constructor(
    public dialogRef: MatDialogRef<HiddenGroupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data?: { title: string, label: string, value?: string }
  ) {
    if (data) {
      if (data.title) this.title = data.title;
      if (data.label) this.label = data.label;
      if (data.value) this.groupName = data.value;
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close(this.groupName);
  }
}
