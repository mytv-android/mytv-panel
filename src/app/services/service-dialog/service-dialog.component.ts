import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppApi, PythonCheckResult, PythonServiceInfo } from '../../api';

/**
 * 添加/编辑 Python 服务：
 * 名称 → 端口 → 代码来源（远程链接加载 / 直接粘贴）→ 检查代码 → 保存。
 * 保存由设备端完成（写脚本文件 + 更新配置 + 按需重启服务）。
 */
@Component({
    selector: 'app-service-dialog',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatInputModule,
        MatFormFieldModule,
        MatSlideToggleModule,
        MatIconModule,
        MatProgressBarModule,
        MatDialogModule,
        MatSnackBarModule,
        TranslateModule,
    ],
    templateUrl: './service-dialog.component.html',
    styleUrl: './service-dialog.component.css',
})
export class ServiceDialogComponent implements OnInit {
    name = '';
    port = 8767;
    lanShare = false;
    enabled = false;
    codeUrl = '';
    code = '';

    loading = false;
    checking = false;
    saving = false;
    checkResult?: PythonCheckResult;

    isEdit = false;
    private serviceId?: string;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { service: PythonServiceInfo | null },
        private ref: MatDialogRef<ServiceDialogComponent>,
        private snackBar: MatSnackBar,
        private translate: TranslateService,
    ) { }

    async ngOnInit() {
        const svc = this.data?.service;
        if (svc) {
            this.isEdit = true;
            this.serviceId = svc.id;
            this.name = svc.name;
            this.port = svc.port;
            this.lanShare = svc.lanShare;
            this.enabled = svc.enabled;
            this.codeUrl = svc.codeUrl || '';
            try {
                this.code = await AppApi.getPythonServiceCode(svc.id);
            } catch {
                // 脚本文件可能已被删除，保留空代码等待重新加载
            }
        }
    }

    /** 从远程链接拉取代码（由设备端发起请求） */
    async loadCode() {
        if (!this.codeUrl) {
            this.showMessage(this.translate.instant('SERVICES.NEED_URL'));
            return;
        }
        this.loading = true;
        try {
            const res = await AppApi.fetchPythonCode(this.codeUrl);
            this.code = res.data.content;
            this.checkResult = undefined;
            this.showMessage(this.translate.instant('SERVICES.CODE_LOADED'));
        } catch (e) {
            this.showError(e);
        } finally {
            this.loading = false;
        }
    }

    async checkCode() {
        if (!this.code) {
            this.showMessage(this.translate.instant('SERVICES.NEED_CODE'));
            return;
        }
        this.checking = true;
        try {
            const res = await AppApi.checkPythonCode({ id: this.serviceId, code: this.code });
            this.checkResult = res.data;
        } catch (e) {
            this.showError(e);
        } finally {
            this.checking = false;
        }
    }

    async save() {
        if (!this.name) {
            this.showMessage(this.translate.instant('SERVICES.NEED_NAME'));
            return;
        }
        if (!this.code) {
            this.showMessage(this.translate.instant('SERVICES.NEED_CODE'));
            return;
        }
        this.saving = true;
        try {
            const res = await AppApi.savePythonService({
                id: this.serviceId,
                name: this.name,
                port: Number(this.port) || 8767,
                lanShare: this.lanShare,
                enabled: this.enabled,
                codeUrl: this.codeUrl,
                code: this.code,
            });
            this.ref.close(res.data);
        } catch (e) {
            this.showError(e);
        } finally {
            this.saving = false;
        }
    }

    close() {
        this.ref.close(undefined);
    }

    private showMessage(message: string) {
        this.snackBar.open(message, this.translate.instant('HOME.CLOSE'), { duration: 3000 });
    }

    private showError(e: any) {
        const message = e?.error?.message || e?.message || 'Error';
        this.snackBar.open(message, this.translate.instant('HOME.CLOSE'), { duration: 5000 });
    }
}
