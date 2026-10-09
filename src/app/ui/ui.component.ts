import { Component, inject, effect } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslateModule } from '@ngx-translate/core';
import { ConfigsService, AppConfigs, UiTimeShowMode, UiTimeShowModeLabels, UiScreenOrientation, UiScreenOrientationLabels } from '../api';

@Component({
    selector: 'app-ui',
    standalone: true,
    imports: [
    FormsModule,
    MatCardModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    TranslateModule
],
    templateUrl: './ui.component.html',
    styleUrl: './ui.component.css',
    host: {
        'animate.enter': 'enter',
        'animate.leave': 'leave'
    }
})
export class UiComponent {
    configsService = inject(ConfigsService);
    configs: AppConfigs = {};
    
    uiTimeShowMode = UiTimeShowMode;
    uiTimeShowModeLabels = UiTimeShowModeLabels;
    timeShowModes = Object.values(UiTimeShowMode);
    screenOrientations = Object.values(UiScreenOrientation);
    uiScreenOrientationLabels = UiScreenOrientationLabels;

    constructor() {
        effect(() => {
            this.configs = this.configsService.data();
        });
    }

    updateConfig() {
        this.configsService.updateData(this.configs);
    }
}
