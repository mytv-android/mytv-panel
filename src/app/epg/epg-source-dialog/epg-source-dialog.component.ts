import { Component, Inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { EpgSource } from '../../api';

@Component({
  selector: 'app-epg-source-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
    TranslateModule
],
  templateUrl: './epg-source-dialog.component.html',
  styleUrl: './epg-source-dialog.component.css'
})
export class EpgSourceDialogComponent {
  source: EpgSource;
  isEdit: boolean;

  formats = [
    { value: '', label: 'EPG.FORMAT_AUTO' },
    { value: 'XML', label: 'EPG.FORMAT_XML' },
    { value: 'DIYP', label: 'EPG.FORMAT_DIYP' },
    { value: 'SPTV', label: 'EPG.FORMAT_SPTV' },
    { value: 'LOVETV', label: 'EPG.FORMAT_LOVETV' },
  ];

  constructor(
    public dialogRef: MatDialogRef<EpgSourceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { source?: EpgSource }
  ) {
    this.isEdit = !!data.source;
    this.source = data.source ? { ...data.source } : { name: '', url: '' };
    // 新字段在旧设备数据里可能缺失，补默认值避免表单绑定 undefined
    this.source.format ??= '';
    this.source.cacheHour ??= -1;
    this.source.timeZoneOffset ??= 8;
    this.source.externalStorage ??= false;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.source.format = this.source.format?.trim() || undefined;
    this.dialogRef.close(this.source);
  }
}
