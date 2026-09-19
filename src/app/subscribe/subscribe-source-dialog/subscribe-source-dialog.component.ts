import { Component, Inject, ViewChild, ElementRef } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslateModule } from '@ngx-translate/core';
import { AppApi, IptvSource } from '../../api';
import { TextareaWithLinesComponent } from '../../common/textarea-with-lines/textarea-with-lines.component';

@Component({
  selector: 'app-subscribe-source-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSlideToggleModule,
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
    { value: 3, label: 'HOME.STALKER' },
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
    // 新字段在旧设备数据里可能缺失，补默认值避免表单绑定 undefined
    this.source.epg ??= '';
    this.source.disableChannelPreview ??= false;
    this.source.disableDelayDetection ??= false;
    this.source.autoRefresh ??= 0;
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
    // 归一化：EPG 空串视为未配置；自动刷新仅接受正整数小时，非法输入回落为关闭
    this.source.epg = this.source.epg?.trim() || undefined;
    const autoRefresh = Number(this.source.autoRefresh);
    this.source.autoRefresh = Number.isFinite(autoRefresh) && autoRefresh > 0
      ? Math.floor(autoRefresh)
      : 0;
    this.source.disableChannelPreview = !!this.source.disableChannelPreview;
    this.source.disableDelayDetection = !!this.source.disableDelayDetection;
    this.dialogRef.close(this.source);
  }
}
