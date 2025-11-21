import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslateModule } from '@ngx-translate/core';
import { ConfigsService, AppConfigs, UiTimeShowMode, UiTimeShowModeLabels } from '../api';

@Component({
    selector: 'app-ui',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatSlideToggleModule,
        MatSelectModule,
        MatInputModule,
        MatFormFieldModule,
        TranslateModule
    ],
    templateUrl: './ui.component.html',
    styleUrl: './ui.component.css'
})
export class UiComponent {
    configsService = inject(ConfigsService);
    configs: AppConfigs = {};
    
    uiTimeShowMode = UiTimeShowMode;
    uiTimeShowModeLabels = UiTimeShowModeLabels;
    timeShowModes = Object.values(UiTimeShowMode);

    // Helper for auto close delay options
    autoCloseDelayOptions = [
        { value: Number.MAX_SAFE_INTEGER, label: 'UI.SCREEN_AUTO_CLOSE_DELAY_NEVER' }, // Using MAX_SAFE_INTEGER as proxy for Long.MAX_VALUE
        { value: 5000, label: '5s' },
        { value: 10000, label: '10s' },
        { value: 15000, label: '15s' },
        { value: 30000, label: '30s' },
        { value: 60000, label: '1m' },
        { value: 300000, label: '5m' },
        { value: 600000, label: '10m' },
        { value: 1800000, label: '30m' },
    ];

    constructor() {
        effect(() => {
            this.configs = this.configsService.data();
        });
    }

    updateConfig() {
        this.configsService.updateData(this.configs);
    }
}
