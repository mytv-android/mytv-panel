import { Component, Inject, ViewChild, ElementRef } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppApi, IptvSource, IptvSourceRef } from '../../api';
import { TextareaWithLinesComponent } from '../../common/textarea-with-lines/textarea-with-lines.component';

@Component({
  selector: 'app-subscribe-source-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSnackBarModule,
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
    { value: 4, label: 'HOME.AGGREGATE' },
  ];
  /** 网络协议：auto/http 走普通 HTTP，其余走对应协议客户端 */
  sourceProtocols = [
    { value: 'auto', label: 'SUBSCRIBE.PROTOCOL_AUTO' },
    { value: 'http', label: 'SUBSCRIBE.PROTOCOL_HTTP' },
    { value: 'ftp', label: 'SUBSCRIBE.PROTOCOL_FTP' },
    { value: 'ftps', label: 'SUBSCRIBE.PROTOCOL_FTPS' },
    { value: 'smb', label: 'SUBSCRIBE.PROTOCOL_SMB' },
    { value: 'webdav', label: 'SUBSCRIBE.PROTOCOL_WEBDAV' },
    { value: 'webdavs', label: 'SUBSCRIBE.PROTOCOL_WEBDAVS' },
  ];
  /** 地址 scheme 即为网络协议的订阅源 */
  private static readonly NETWORK_SCHEME = /^(ftp|ftps|smb|smb2|cifs|webdav|webdavs|dav|davs):\/\//i;

  constructor(
    public dialogRef: MatDialogRef<SubscribeSourceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { source?: IptvSource, sources?: IptvSource[] },
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {
    this.isEdit = !!data.source;
    this.source = data.source ? { ...data.source } : {
        name: '',
        url: '',
        sourceType: 0,
        protocol: 'auto',
        format: 'm3u_plus'
    };
    // 新字段在旧设备数据里可能缺失，补默认值避免表单绑定 undefined
    this.source.protocol ??= 'auto';
    this.source.epg ??= '';
    this.source.disableChannelPreview ??= false;
    this.source.disableDelayDetection ??= false;
    this.source.autoRefresh ??= 0;
    this.source.aggregateSources ??= [];
    this.source.aggregateSources = [...this.source.aggregateSources];
    if (this.source.sourceType === 1) {
      AppApi.getFileContent(this.source.url).then(content => {
        this.content = content;
      }).catch(err => {
        console.error('Failed to get file content', err);
        // 文件内容接口仅允许访问电视端 fileDir / cacheDir 内的路径
        this.snackBar.open(
          this.translate.instant('SUBSCRIBE.FILE_CONTENT_OUT_OF_SANDBOX'),
          this.translate.instant('HOME.CLOSE'),
          { duration: 5000 }
        );
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  /** 聚合配置不需要地址，但至少要勾选一个订阅源 */
  get canSave(): boolean {
    if (!this.source.name) return false;
    if (this.source.sourceType === 4) return (this.source.aggregateSources?.length || 0) > 0;
    return !!this.source.url;
  }

  /** 是否需要显示 FTP/SMB/WebDAV 的账号密码与端口（显式选择协议，或地址 scheme 即网络协议） */
  get showNetworkProtocolFields(): boolean {
    if (this.source.sourceType !== 0) return false;
    const protocol = (this.source.protocol || 'auto').toLowerCase();
    if (protocol !== 'auto' && protocol !== 'http') return true;
    return SubscribeSourceDialogComponent.NETWORK_SCHEME.test(this.source.url || '');
  }

  /** 可聚合的订阅源：排除聚合配置自身与被编辑源，按身份去重 */
  get aggregateCandidates(): IptvSource[] {
    const seen = new Set<string>();
    return (this.data.sources || []).filter(candidate => {
      if (candidate.sourceType === 4) return false;
      if (this.isEdit && candidate.name === this.data.source?.name && candidate.url === this.data.source?.url) {
        return false;
      }
      const key = `${candidate.name}\u0000${candidate.url}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /** 已勾选返回 1 起的序号（即线路优先级），未勾选返回 0 */
  aggregateOrder(candidate: IptvSource): number {
    return (this.source.aggregateSources || [])
      .findIndex(ref => ref.name === candidate.name && ref.url === candidate.url) + 1;
  }

  toggleAggregateSource(candidate: IptvSource): void {
    const refs = this.source.aggregateSources || [];
    const order = this.aggregateOrder(candidate);
    if (order > 0) {
      refs.splice(order - 1, 1);
    } else {
      const ref: IptvSourceRef = { name: candidate.name, url: candidate.url };
      refs.push(ref);
    }
    this.source.aggregateSources = [...refs];
  }

  /** 调整已选成员的顺序（顺序即同名频道线路的优先级） */
  moveAggregate(candidate: IptvSource, offset: number): void {
    const refs = this.source.aggregateSources || [];
    const order = this.aggregateOrder(candidate);
    if (order <= 0) return;
    const target = order - 1 + offset;
    if (target < 0 || target >= refs.length) return;

    const moved = refs[order - 1];
    refs.splice(order - 1, 1);
    refs.splice(target, 0, moved);
    this.source.aggregateSources = [...refs];
  }

  onSave(): void {
    if (this.source.sourceType === 4) {
      // 聚合配置自身不含地址：成员按勾选顺序即线路优先级，已被删除的引用不写入
      this.source.url = '';
      this.source.aggregateSources = (this.source.aggregateSources || []).filter(ref =>
        this.aggregateCandidates.some(candidate => candidate.name === ref.name && candidate.url === ref.url));
    } else {
      this.source.aggregateSources = [];
    }

    if (this.source.sourceType === 1) {
      AppApi.writeFileContent(this.source.url, this.content).catch(err => {
        console.error('Failed to write file content', err);
        this.snackBar.open(
          this.translate.instant('SUBSCRIBE.FILE_CONTENT_OUT_OF_SANDBOX'),
          this.translate.instant('HOME.CLOSE'),
          { duration: 5000 }
        );
      });
    }
    // 归一化：协议/端口空值视为未配置；EPG 空串视为未配置；自动刷新仅接受正整数小时，非法输入回落为关闭
    this.source.protocol = this.source.protocol?.trim() || undefined;
    const port = Number(this.source.port);
    this.source.port = Number.isFinite(port) && port >= 1 && port <= 65535
      ? Math.floor(port)
      : undefined;
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
