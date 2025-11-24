import { Component, inject, effect } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfigsService, AppConfigs } from '../api';
import { EpgManagerComponent } from './epg-manager/epg-manager.component';
import { EpgThresholdDialogComponent } from './epg-threshold-dialog/epg-threshold-dialog.component';

@Component({
    selector: 'app-epg',
    standalone: true,
    imports: [
    FormsModule,
    MatCardModule,
    MatSlideToggleModule,
    MatIconModule,
    MatDialogModule,
    TranslateModule
],
    templateUrl: './epg.component.html',
    styleUrl: './epg.component.css'
})
export class EpgComponent {
    configsService = inject(ConfigsService);
    dialog = inject(MatDialog);
    translate = inject(TranslateService);
    configs: AppConfigs = {};

    constructor() {
        effect(() => {
            this.configs = this.configsService.data();
        });
    }

    updateConfig() {
        this.configsService.updateData(this.configs);
    }

    get customEpgCount(): number {
        return this.configs.epgSourceList?.value?.length || 0;
    }

    get refreshTimeThreshold(): string {
        const threshold = this.configs.epgRefreshTimeThreshold;
        if (threshold === undefined || threshold === -1) {
            return this.translate.instant('EPG.THRESHOLD_ALWAYS');
        }
        const hours = Math.floor(threshold);
        const minutes = Math.round((threshold - hours) * 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    openEpgManager() {
        const dialogRef = this.dialog.open(EpgManagerComponent, {
            data: { 
                sources: this.configs.epgSourceList?.value || [],
                currentSource: this.configs.epgSourceCurrent
            },
            width: '600px'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.configs.epgSourceList = { value: result.sources };
                this.configs.epgSourceCurrent = result.currentSource;
                this.updateConfig();
            }
        });
    }

    openThresholdSettings() {
        const dialogRef = this.dialog.open(EpgThresholdDialogComponent, {
            data: { threshold: this.configs.epgRefreshTimeThreshold }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result !== undefined) {
                this.configs.epgRefreshTimeThreshold = result;
                this.updateConfig();
            }
        });
    }
}
