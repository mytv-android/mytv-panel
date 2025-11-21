import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { EpgSource } from '../../api';

@Component({
  selector: 'app-epg-source-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    TranslateModule
  ],
  templateUrl: './epg-source-dialog.component.html',
  styleUrl: './epg-source-dialog.component.css'
})
export class EpgSourceDialogComponent {
  source: EpgSource;
  isEdit: boolean;

  constructor(
    public dialogRef: MatDialogRef<EpgSourceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { source?: EpgSource }
  ) {
    this.isEdit = !!data.source;
    this.source = data.source ? { ...data.source } : { name: '', url: '' };
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close(this.source);
  }
}
