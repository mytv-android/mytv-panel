import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { TranslateModule } from '@ngx-translate/core';
import { ConfigsService, AppConfigs, AppThemeDef } from '../api';

@Component({
    selector: 'app-theme',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSliderModule,
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
        });
    }

    updateConfig() {
        this.configs.themeAppCurrent = this.theme;
        this.configsService.updateData(this.configs);
    }
}
