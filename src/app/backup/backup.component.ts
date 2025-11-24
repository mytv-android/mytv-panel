import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppConfigs, ConfigsService, AppApi, CloudSyncProvider } from '../api';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
    selector: 'app-backup',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatSlideToggleModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatListModule,
        MatButtonToggleModule,
        MatDividerModule,
        TranslateModule,
        MatSnackBarModule
    ],
    templateUrl: './backup.component.html',
    styleUrl: './backup.component.css'
})
export class BackupComponent {
    configsService = inject(ConfigsService);
    configs: AppConfigs = {};
    cloudSyncProvider = CloudSyncProvider;
    isSmallScreen = false;
    breakpointObserver = inject(BreakpointObserver);
    snackBar = inject(MatSnackBar);
    translate = inject(TranslateService);

    constructor() {
        this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Small, '(max-width: 600px)']).subscribe(result => {
            this.isSmallScreen = result.matches;
        });
        effect(() => {
            this.configs = this.configsService.data();
        });
    }

    async exportData() {
        try {
            const data = await AppApi.getCloudSyncData()

            const jsonStr = JSON.stringify(data, null, 2)
            const blob = new Blob([jsonStr], { type: 'application/json' })

            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            link.download = `${data.syncFrom}-v${data.version}-${data.syncAt}.json`

            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            this.showSuccessToast(this.translate.instant('SYNC.EXPORT_SUCCESS'));
        } catch (error) {
            this.showFailToast(this.translate.instant('SYNC.EXPORT_FAILED'));
            console.error(error);
        }
    }

    updateConfig() {
        this.configsService.updateData(this.configs);
    }

    async importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (event: any) => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async (e) => {
                if (e.target?.result) {
                    try {
                        await AppApi.pushCloudSyncData(JSON.parse(e.target.result as string));
                        this.showSuccessToast(this.translate.instant('SYNC.IMPORT_SUCCESS'));
                    } catch (error) {
                        this.showFailToast(this.translate.instant('SYNC.IMPORT_FAILED'));
                    }
                }
            };
            reader.onerror = () => {
                this.showFailToast(this.translate.instant('SYNC.READ_FAILED'));
            };
            reader.readAsText(file);
        };
        input.click();
    }

    showSuccessToast(message: string) {
        this.snackBar.open(message, undefined, { duration: 3000 });
    }

    showFailToast(message: string) {
        this.snackBar.open(message, undefined, { duration: 3000 });
    }
}