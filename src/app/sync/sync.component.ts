import { Component, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppApi, AppConfigs, CloudSyncProvider } from '../api';
import { SETTINGS_UI, SettingsPageBase } from '../settings-ui/settings-ui';
import { BackupManagerComponent } from '../backupmanager/backup-manager.component';

type SyncTextField = Extract<keyof AppConfigs,
    'cloudSyncGithubGistId' | 'cloudSyncGithubGistToken' | 'cloudSyncGiteeGistId' | 'cloudSyncGiteeGistToken' |
    'cloudSyncNetworkUrl' | 'cloudSyncLocalFilePath' | 'cloudSyncWebDavUrl' | 'cloudSyncWebDavUsername' | 'cloudSyncWebDavPassword'>;

/**
 * 备份与同步：云同步（服务商与各自的凭据、自动恢复）、网页面板独有的导入 / 导出；
 * 本机备份（网页面板的备份管理整块嵌入）。上传 / 从云端恢复只能在 App 里操作
 */
@Component({
    selector: 'app-sync',
    imports: [
        NgTemplateOutlet,
        FormsModule,
        MatSlideToggleModule,
        MatSelectModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule,
        TranslateModule,
        BackupManagerComponent,
        ...SETTINGS_UI,
    ],
    templateUrl: './sync.component.html',
    host: {
        'animate.enter': 'enter',
        'animate.leave': 'leave'
    }
})
export class SyncComponent extends SettingsPageBase {
    snackBar = inject(MatSnackBar);
    translate = inject(TranslateService);

    provider = CloudSyncProvider;
    providerLabels: [CloudSyncProvider, string][] = [
        [CloudSyncProvider.GITHUB_GIST, 'HOME.GITHUB_GIST'],
        [CloudSyncProvider.GITEE_GIST, 'HOME.GITEE_GIST'],
        [CloudSyncProvider.NETWORK_URL, 'HOME.NETWORK_URL'],
        [CloudSyncProvider.LOCAL_FILE, 'HOME.LOCAL_FILE'],
        [CloudSyncProvider.WEBDAV, 'HOME.WEBDAV'],
    ];

    /** 各服务商凭据行共用一个模板，字段名从模板上下文传进来 */
    setText(field: SyncTextField, value: string) {
        this.c[field] = value;
    }

    async exportData() {
        try {
            const data = await AppApi.getCloudSyncData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${data.syncFrom}-v${data.version}-${data.syncAt}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
            this.toast('SYNC.EXPORT_SUCCESS');
        } catch (error) {
            this.toast('SYNC.EXPORT_FAILED');
            console.error(error);
        }
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = () => {
            const file = input.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async () => {
                try {
                    await AppApi.pushCloudSyncData(JSON.parse(reader.result as string));
                    this.toast('SYNC.IMPORT_SUCCESS');
                } catch {
                    this.toast('SYNC.IMPORT_FAILED');
                }
            };
            reader.onerror = () => this.toast('SYNC.READ_FAILED');
            reader.readAsText(file);
        };
        input.click();
    }

    private toast(key: string) {
        this.snackBar.open(this.translate.instant(key), undefined, { duration: 3000 });
    }
}
