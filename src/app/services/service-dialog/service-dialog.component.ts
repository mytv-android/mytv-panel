import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppApi, PythonCheckResult, PythonServiceInfo } from '../../api';
import { TextareaWithLinesComponent } from '../../common/textarea-with-lines/textarea-with-lines.component';

/**
 * 添加/编辑 Python 服务：名称 → 端口/代码来源 → 远程链接 / 本地上传 / 电视本地路径 →
 * 启用/局域网共享 → 高级选项（UA/代理/启动参数/环境变量/自动重启）。
 * 远程链接在保存时拉取一次，之后按更新间隔自动更新；本地文件按内容变化同步；
 * 本地上传/直接填写把文件或粘贴的代码随保存推送，由应用存成电视上的脚本文件。
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
        MatSelectModule,
        MatSlideToggleModule,
        MatIconModule,
        MatProgressBarModule,
        MatExpansionModule,
        MatDialogModule,
        MatSnackBarModule,
        TranslateModule,
        TextareaWithLinesComponent,
    ],
    templateUrl: './service-dialog.component.html',
    styleUrl: './service-dialog.component.css',
})
export class ServiceDialogComponent implements OnInit {
    name = '';
    language = 'python';
    port = 8767;
    lanShare = false;
    enabled = false;
    codeSource = 0; // 0=远程链接 2=本地上传/直接填写 1=本地文件
    codeUrl = '';
    /** 本地上传/直接填写的脚本内容 */
    code = '';
    scriptFileName = '';
    httpUserAgent = '';
    httpProxy = '';
    refreshIntervalHours = 24;
    extraArgs = '';
    envVars = '';
    autoRestart = true;

    checking = false;
    saving = false;
    loadingCode = false;
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
        if (!svc) {
            return;
        }
        this.isEdit = true;
        this.serviceId = svc.id;
        this.name = svc.name;
        this.language = svc.language || 'python';
        this.port = svc.port;
        this.lanShare = svc.lanShare;
        this.enabled = svc.enabled;
        this.codeSource = svc.codeSource ?? 0;
        this.codeUrl = svc.codeUrl || '';
        this.httpUserAgent = svc.httpUserAgent || '';
        this.httpProxy = svc.httpProxy || '';
        this.refreshIntervalHours = svc.refreshIntervalHours ?? 24;
        this.extraArgs = svc.extraArgs || '';
        this.envVars = svc.envVars || '';
        this.autoRestart = svc.autoRestart ?? true;
        // 本地上传/直接填写：回填设备上已保存的脚本，便于在其基础上继续改
        if (this.isUpload) {
            await this.loadCurrentCode();
        }
    }

    /** 读取设备上该服务已保存的脚本 */
    private async loadCurrentCode() {
        if (!this.serviceId) {
            return;
        }
        this.loadingCode = true;
        try {
            this.code = await AppApi.getPythonServiceCode(this.serviceId);
        } catch (e) {
            // 脚本尚未保存（如上次保存失败）时留空即可，不阻塞编辑
            this.code = '';
        } finally {
            this.loadingCode = false;
        }
    }

    get isRemote(): boolean {
        return this.codeSource === 0;
    }

    /** 本地上传/直接填写：挑电脑/手机上的脚本文件，或把代码整段粘贴进去 */
    get isUpload(): boolean {
        return this.codeSource === 2;
    }

    get isPhp(): boolean {
        return this.language === 'php';
    }

    /** 仅新建时可切换语言；切换时把未改动的默认端口同步到对应语言 */
    onLanguageChange() {
        if (this.isEdit) {
            return;
        }
        if (this.language === 'php' && this.port === 8767) {
            this.port = 8768;
        }
        if (this.language === 'python' && this.port === 8768) {
            this.port = 8767;
        }
    }

    /** 切换代码来源时清掉另一种来源的输入，避免串味 */
    async onCodeSourceChange() {
        this.codeUrl = '';
        this.scriptFileName = '';
        this.checkResult = undefined;
        if (this.isUpload) {
            // 切到本地上传：回填设备上已保存的脚本，便于在其基础上继续改
            await this.loadCurrentCode();
        } else {
            this.code = '';
        }
    }

    /** 选择本地脚本文件：读成文本填入代码框（与订阅源「本地上传」一致） */
    onScriptFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input?.files?.length) {
            return;
        }
        const file = input.files[0];
        this.scriptFileName = file.name;
        if (!this.name) {
            this.name = file.name.replace(/\.(py|php)$/i, '');
        }
        const reader = new FileReader();
        reader.onload = () => {
            this.code = (reader.result as string) || '';
        };
        reader.onerror = () => {
            this.showMessage(this.translate.instant('SERVICES.READ_FILE_FAILED'));
        };
        reader.readAsText(file);
        // 允许再次选择同一个文件
        input.value = '';
    }

    /** 检查设备上该服务已保存的脚本（仅编辑时可用） */
    async checkCode() {
        if (!this.serviceId) {
            return;
        }
        this.checking = true;
        try {
            const res = await AppApi.checkPythonCode({ id: this.serviceId });
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
        if (this.isRemote && !this.codeUrl) {
            this.showMessage(this.translate.instant('SERVICES.NEED_URL'));
            return;
        }
        if (this.codeSource === 1 && !this.codeUrl && !this.code) {
            this.showMessage(this.translate.instant('SERVICES.NEED_FILE_PATH'));
            return;
        }
        // 本地上传/直接填写：首次保存必须带上内容，之后可只在改其他选项时不重新推送
        if (this.isUpload && !this.code && !(this.isEdit && this.serviceId)) {
            this.showMessage(this.translate.instant('SERVICES.NEED_CODE'));
            return;
        }
        this.saving = true;
        try {
            const res = await AppApi.savePythonService({
                id: this.serviceId,
                name: this.name,
                language: this.language,
                port: Number(this.port) || (this.language === 'php' ? 8768 : 8767),
                lanShare: this.lanShare,
                enabled: this.enabled,
                codeSource: this.codeSource,
                codeUrl: this.codeUrl,
                code: this.isUpload ? this.code : undefined,
                httpUserAgent: this.httpUserAgent,
                httpProxy: this.httpProxy,
                refreshIntervalHours: Number(this.refreshIntervalHours) || 0,
                extraArgs: this.extraArgs,
                envVars: this.envVars,
                autoRestart: this.autoRestart,
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
