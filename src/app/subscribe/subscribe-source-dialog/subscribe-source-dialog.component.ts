import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { AppApi, IptvSource } from '../../api';
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
  content = '';
  sourceTypes = [
    { value: 0, label: 'HOME.REMOTE' },
    { value: 2, label: 'HOME.XTREAM' },
    { value: 1, label: 'HOME.FILE' },
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
    if (this.source.sourceType === 1) {
      AppApi.getFileContent(this.source.url).then(content => {
        this.content = content;
      }).catch(err => {
        console.error('Failed to get file content', err);
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.source.sourceType === 1) {
      AppApi.writeFileContent(this.source.url, this.content);
    }
    this.dialogRef.close(this.source);
  }
}
