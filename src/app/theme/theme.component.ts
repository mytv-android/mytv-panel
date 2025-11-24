import { Component, inject, effect } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { TranslateModule } from '@ngx-translate/core';
import { ConfigsService, AppConfigs, AppThemeDef } from '../api';

@Component({
    selector: 'app-theme',
    standalone: true,
    imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSliderModule,
    MatButtonToggleModule,
    TranslateModule
],
    templateUrl: './theme.component.html',
    styleUrl: './theme.component.css'
})
export class ThemeComponent {
    configsService = inject(ConfigsService);
    configs: AppConfigs = {};
    theme: AppThemeDef = {
        name: '',
        background: '',
        texture: '',
        textureAlpha: ''
    };
    themeMode: number = 0
    themeColorProvider: number = 0

    constructor() {
        effect(() => {
            this.configs = this.configsService.data();
            if (this.configs.themeAppCurrent) {
                this.theme = { ...this.configs.themeAppCurrent };
            } else {
                // Initialize with defaults if undefined
                this.theme = {
                    name: '',
                    background: '',
                    texture: '',
                    textureAlpha: ''
                };
            }
            // sync toggles
            this.themeMode = this.configs.themeMode ?? 0
            this.themeColorProvider = this.configs.themeColorProvider ?? 0
        });
    }

    updateConfig() {
        this.configs.themeAppCurrent = this.theme;
        this.configs.themeMode = this.themeMode
        this.configs.themeColorProvider = this.themeColorProvider
        this.configsService.updateData(this.configs);
    }
}
