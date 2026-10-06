import { Component, inject, effect, Inject, NgZone, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppApi, ConfigsService, AppConfigs, PythonServiceInfo, PythonRuntimeInfo, PythonSelfTest, PhpSelfTest } from '../api';
import { ServiceDialogComponent } from './service-dialog/service-dialog.component';
import { ServiceLogDialogComponent } from './service-log-dialog/service-log-dialog.component';

@Component({
    selector: 'app-services',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatListModule,
        MatIconModule,
        MatButtonModule,
        MatSlideToggleModule,
        MatMenuModule,
        MatDialogModule,
        MatProgressBarModule,
        MatSnackBarModule,
        MatTooltipModule,
        TranslateModule,
    ],
    templateUrl: './services.component.html',
    styleUrl: './services.component.css',
    host: {
        'animate.enter': 'enter',
        'animate.leave': 'leave'
    }
})
export class ServicesComponent implements OnInit, OnDestroy {
    configsService = inject(ConfigsService);
    dialog = inject(MatDialog);
    snackBar = inject(MatSnackBar);
    translate = inject(TranslateService);
    private zone = inject(NgZone);
    configs: AppConfigs = {};

    runtime?: PythonRuntimeInfo;
    phpRuntime?: PythonRuntimeInfo;
    services: PythonServiceInfo[] = [];
    selfTest?: PythonSelfTest;
    showSelfTest = false;
    phpSelfTest?: PhpSelfTest;
    showPhpSelfTest = false;

    private timer?: ReturnType<typeof setInterval>;

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
        effect(() => {
            this.configs = this.configsService.data();
        });
    }

    ngOnInit() {
        // 仅浏览器环境：SSR 预渲染时不能发起请求
        if (!isPlatformBrowser(this.platformId)) return;
        this.zone.run(() => this.refreshStatus());
        // 定时器放在 Angular zone 之外：持续轮询会让应用永远不“稳定”，阻断 hydration；
        // 每次刷新再进回 zone 内以触发变更检测。
        this.zone.runOutsideAngular(() => {
            this.timer = setInterval(() => this.zone.run(() => this.refreshStatus()), 3000);
        });
    }

    ngOnDestroy() {
        if (this.timer) clearInterval(this.timer);
    }

    async refreshStatus() {
        try {
            const res = await AppApi.getPythonStatus();
            this.runtime = res.data.runtime;
            this.phpRuntime = res.data.phpRuntime;
            this.services = res.data.services;
        } catch {
            // 设备离线/服务未启动时保持上一次状态
        }
    }

    get runtimeStateText(): string {
        return this.runtimeStateTextFor(this.runtime);
    }

    get phpRuntimeStateText(): string {
        return this.runtimeStateTextFor(this.phpRuntime);
    }

    private runtimeStateTextFor(rt?: PythonRuntimeInfo): string {
        if (!rt) return '';
        switch (rt.state) {
            case 'ready':
                return this.translate.instant('SERVICES.RUNTIME_READY', { version: rt.version, abi: rt.abi });
            case 'notDownloaded':
                return this.translate.instant('SERVICES.RUNTIME_NOT_DOWNLOADED');
            case 'downloading':
                return this.translate.instant('SERVICES.RUNTIME_DOWNLOADING', { progress: Math.round((rt.progress || 0) * 100) });
            case 'verifying':
                return this.translate.instant('SERVICES.RUNTIME_VERIFYING');
            case 'extracting':
                return this.translate.instant('SERVICES.RUNTIME_EXTRACTING');
            case 'unsupported':
                return this.translate.instant('SERVICES.RUNTIME_UNSUPPORTED');
            case 'error':
                return this.translate.instant('SERVICES.RUNTIME_ERROR', { message: rt.error || '' });
            default:
                return rt.state;
        }
    }

    get runtimeProgress(): number {
        return Math.round((this.runtime?.progress || 0) * 100);
    }

    get phpRuntimeProgress(): number {
        return Math.round((this.phpRuntime?.progress || 0) * 100);
    }

    get canDownloadRuntime(): boolean {
        return this.runtime?.state === 'notDownloaded' || this.runtime?.state === 'error';
    }

    get canDownloadPhpRuntime(): boolean {
        return this.phpRuntime?.state === 'notDownloaded' || this.phpRuntime?.state === 'error';
    }

    get runtimeReady(): boolean {
        return this.runtime?.state === 'ready';
    }

    get phpRuntimeReady(): boolean {
        return this.phpRuntime?.state === 'ready';
    }

    async downloadRuntime() {
        try {
            await AppApi.downloadPythonRuntime();
            this.showSuccess(this.translate.instant('SERVICES.RUNTIME_DOWNLOAD_STARTED'));
            await this.refreshStatus();
        } catch (e) {
            this.showError(e);
        }
    }

    async deleteRuntime() {
        try {
            await AppApi.deletePythonRuntime();
            this.selfTest = undefined;
            await this.refreshStatus();
        } catch (e) {
            this.showError(e);
        }
    }

    async selfTestRuntime() {
        try {
            const res = await AppApi.selfTestPython();
            this.selfTest = res.data;
            this.showSelfTest = true;
        } catch (e) {
            this.showError(e);
        }
    }

    async downloadPhpRuntime() {
        try {
            await AppApi.downloadPhpRuntime();
            this.showSuccess(this.translate.instant('SERVICES.RUNTIME_DOWNLOAD_STARTED'));
            await this.refreshStatus();
        } catch (e) {
            this.showError(e);
        }
    }

    async deletePhpRuntime() {
        try {
            await AppApi.deletePhpRuntime();
            this.phpSelfTest = undefined;
            await this.refreshStatus();
        } catch (e) {
            this.showError(e);
        }
    }

    async selfTestPhpRuntime() {
        try {
            const res = await AppApi.selfTestPhp();
            this.phpSelfTest = res.data;
            this.showPhpSelfTest = true;
        } catch (e) {
            this.showError(e);
        }
    }

    addService() {
        const ref = this.dialog.open(ServiceDialogComponent, {
            data: { service: null },
            width: '640px'
        });
        ref.afterClosed().subscribe(async (result) => {
            if (result) {
                this.showSuccess(this.translate.instant('HOME.ADD_SUCCESS'));
                await this.refreshStatus();
            }
        });
    }

    editService(svc: PythonServiceInfo) {
        const ref = this.dialog.open(ServiceDialogComponent, {
            data: { service: svc },
            width: '640px'
        });
        ref.afterClosed().subscribe(async (result) => {
            if (result) {
                this.showSuccess(this.translate.instant('HOME.UPDATE_SUCCESS'));
                await this.refreshStatus();
            }
        });
    }

    async toggleEnabled(svc: PythonServiceInfo) {
        try {
            await AppApi.savePythonService({
                id: svc.id,
                name: svc.name,
                language: svc.language,
                port: svc.port,
                lanShare: svc.lanShare,
                enabled: !svc.enabled,
                codeSource: svc.codeSource,
                codeUrl: svc.codeUrl,
                httpUserAgent: svc.httpUserAgent,
                httpProxy: svc.httpProxy,
                refreshIntervalHours: svc.refreshIntervalHours,
                extraArgs: svc.extraArgs,
                envVars: svc.envVars,
                autoRestart: svc.autoRestart,
            });
            const ready = svc.language === 'php' ? this.phpRuntimeReady : this.runtimeReady;
            if (!svc.enabled && !ready) {
                this.showSuccess(this.translate.instant('SERVICES.NEED_RUNTIME'));
            }
            await this.refreshStatus();
        } catch (e) {
            this.showError(e);
        }
    }

    async toggleLanShare(svc: PythonServiceInfo) {
        try {
            await AppApi.savePythonService({
                id: svc.id,
                name: svc.name,
                language: svc.language,
                port: svc.port,
                lanShare: !svc.lanShare,
                enabled: svc.enabled,
                codeSource: svc.codeSource,
                codeUrl: svc.codeUrl,
                httpUserAgent: svc.httpUserAgent,
                httpProxy: svc.httpProxy,
                refreshIntervalHours: svc.refreshIntervalHours,
                extraArgs: svc.extraArgs,
                envVars: svc.envVars,
                autoRestart: svc.autoRestart,
            });
            await this.refreshStatus();
        } catch (e) {
            this.showError(e);
        }
    }

    async startService(svc: PythonServiceInfo) {
        try {
            await AppApi.startPythonService(svc.id);
            await this.refreshStatus();
        } catch (e) {
            this.showError(e);
        }
    }

    async stopService(svc: PythonServiceInfo) {
        try {
            await AppApi.stopPythonService(svc.id);
            await this.refreshStatus();
        } catch (e) {
            this.showError(e);
        }
    }

    /** 立即拉取/同步脚本（不受更新间隔限制） */
    async refreshService(svc: PythonServiceInfo) {
        try {
            await AppApi.refreshPythonService(svc.id);
            this.showSuccess(this.translate.instant('SERVICES.REFRESH_DONE'));
            await this.refreshStatus();
        } catch (e) {
            this.showError(e);
        }
    }

    /** 代码来源展示文本 */
    sourceText(svc: PythonServiceInfo): string {
        const labelKey = svc.codeSource === 2
            ? 'SERVICES.CODE_SOURCE_UPLOAD'
            : svc.codeSource === 1
                ? 'SERVICES.CODE_SOURCE_FILE'
                : 'SERVICES.CODE_SOURCE_URL';
        return `${this.translate.instant(labelKey)}: ${svc.codeUrl || '-'}`;
    }

    /** 脚本最后更新时间（仅远程来源） */
    lastFetchText(svc: PythonServiceInfo): string {
        if (svc.codeSource !== 0 || !svc.lastFetchedAt) return '';
        return this.translate.instant('SERVICES.LAST_FETCHED', {
            time: new Date(svc.lastFetchedAt).toLocaleString(),
        });
    }

    async deleteService(svc: PythonServiceInfo) {
        try {
            await AppApi.deletePythonService(svc.id);
            this.showSuccess(this.translate.instant('HOME.DELETE_SUCCESS'));
            await this.refreshStatus();
        } catch (e) {
            this.showError(e);
        }
    }

    showLog(svc: PythonServiceInfo) {
        this.dialog.open(ServiceLogDialogComponent, {
            data: { service: svc },
            width: '720px'
        });
    }

    stateLabel(svc: PythonServiceInfo): string {
        switch (svc.state) {
            case 'running':
                return svc.ready
                    ? this.translate.instant('SERVICES.STATE_RUNNING')
                    : this.translate.instant('SERVICES.STATE_STARTING');
            case 'starting':
                return this.translate.instant('SERVICES.STATE_STARTING');
            case 'stopping':
                return this.translate.instant('SERVICES.STATE_STOPPING');
            case 'error':
                return this.translate.instant('SERVICES.STATE_ERROR');
            default:
                return this.translate.instant('SERVICES.STATE_STOPPED');
        }
    }

    stateBadgeClass(svc: PythonServiceInfo): string {
        if (svc.state === 'running' && svc.ready) return 'badge-running';
        if (svc.state === 'error') return 'badge-error';
        return 'badge-default';
    }

    /** 本机（电视自身播放器）使用的订阅地址 */
    subscriptionUrl(svc: PythonServiceInfo): string {
        return `${svc.localUrl}/all.m3u`;
    }

    /** 其他设备（如 APTV）使用的订阅地址 */
    lanSubscriptionUrl(svc: PythonServiceInfo): string {
        return `${svc.lanUrl}/all.m3u`;
    }

    async copyAddress(text: string) {
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            this.copyFallback(text);
        }
        this.showSuccess(this.translate.instant('SERVICES.COPIED'));
    }

    private copyFallback(text: string) {
        const el = document.createElement('textarea');
        el.value = text;
        el.style.position = 'fixed';
        el.style.opacity = '0';
        document.body.appendChild(el);
        el.select();
        try {
            document.execCommand('copy');
        } finally {
            document.body.removeChild(el);
        }
    }

    /** 一键把服务地址添加为 IPTV 订阅源 */
    async addAsSubscription(svc: PythonServiceInfo) {
        const url = this.subscriptionUrl(svc);
        const list = this.configs.iptvSourceList?.value || [];
        if (list.some(s => s.url === url)) {
            this.showSuccess(this.translate.instant('SERVICES.SUBSCRIPTION_EXISTS'));
            return;
        }
        this.configs.iptvSourceList = {
            value: [...list, { name: svc.name, url, sourceType: 0 }]
        };
        try {
            await this.configsService.updateData(this.configs);
            this.showSuccess(this.translate.instant('SERVICES.SUBSCRIPTION_ADDED'));
        } catch (e) {
            this.showError(e);
        }
    }

    showSuccess(message: string) {
        this.snackBar.open(message, this.translate.instant('HOME.CLOSE'), { duration: 3000 });
    }

    private showError(e: any) {
        const message = e?.error?.message || e?.message || 'Error';
        this.snackBar.open(message, this.translate.instant('HOME.CLOSE'), { duration: 5000 });
    }
}
