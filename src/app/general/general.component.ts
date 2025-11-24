import { Component, inject, effect } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslateModule } from '@ngx-translate/core';
import { ConfigsService, AppConfigs, AppStartupScreen, AppStartupScreenLabels } from '../api';

@Component({
    selector: 'app-general',
    standalone: true,
    imports: [
    FormsModule,
    MatCardModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatFormFieldModule,
    TranslateModule
],
    templateUrl: './general.component.html',
    styleUrl: './general.component.css'
})
export class GeneralComponent {
    configsService = inject(ConfigsService);
    configs: AppConfigs = {};
    
    appStartupScreen = AppStartupScreen;
    appStartupScreenLabels = AppStartupScreenLabels;
    startupScreens = Object.values(AppStartupScreen);

    constructor() {
        effect(() => {
            this.configs = this.configsService.data();
        });
    }

    updateConfig() {
        this.configsService.updateData(this.configs);
    }
}
