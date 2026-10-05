import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { AppApi, PythonServiceInfo } from '../../api';

/** 服务日志（脚本 stdout/stderr），打开期间每 3 秒刷新 */
@Component({
    selector: 'app-service-log-dialog',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule, MatDialogModule, TranslateModule],
    templateUrl: './service-log-dialog.component.html',
    styleUrl: './service-log-dialog.component.css',
})
export class ServiceLogDialogComponent implements OnInit, OnDestroy {
    log = '';
    loading = false;

    private timer?: ReturnType<typeof setInterval>;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { service: PythonServiceInfo },
        private ref: MatDialogRef<ServiceLogDialogComponent>,
    ) { }

    ngOnInit() {
        this.refresh();
        this.timer = setInterval(() => this.refresh(), 3000);
    }

    ngOnDestroy() {
        if (this.timer) clearInterval(this.timer);
    }

    async refresh() {
        this.loading = true;
        try {
            this.log = await AppApi.getPythonServiceLog(this.data.service.id);
        } catch (e: any) {
            this.log = e?.error?.message || e?.message || 'Error';
        } finally {
            this.loading = false;
        }
    }

    close() {
        this.ref.close(undefined);
    }
}
