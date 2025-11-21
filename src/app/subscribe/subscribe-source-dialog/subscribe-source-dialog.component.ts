import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { IptvSource } from '../../api';
import { TextareaWithLinesComponent } from '../../common/textarea-with-lines/textarea-with-lines.component';

@Component({
  selector: 'app-subscribe-source-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    TranslateModule,
    TextareaWithLinesComponent
  ],
  templateUrl: './subscribe-source-dialog.component.html',
  styleUrl: './subscribe-source-dialog.component.css'
})
export class SubscribeSourceDialogComponent {
  source: IptvSource;
  isEdit: boolean;

  sourceTypes = [
    { value: 0, label: 'HOME.REMOTE' },
    { value: 1, label: 'HOME.XTREAM' },
    { value: 2, label: 'HOME.FILE' },
    { value: 3, label: 'HOME.CONTENT' }
  ];

  constructor(
    public dialogRef: MatDialogRef<SubscribeSourceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { source?: IptvSource }
  ) {
    this.isEdit = !!data.source;
    this.source = data.source ? { ...data.source } : { 
        name: '', 
        url: '', 
        sourceType: 0,
        format: 'm3u_plus'
    };
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close(this.source);
  }
}
