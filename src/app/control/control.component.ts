import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslateModule } from '@ngx-translate/core';
import { ConfigsService, AppConfigs, KeyDownAction, KeyDownActionLabels } from '../api';

@Component({
    selector: 'app-control',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatSlideToggleModule,
        MatSelectModule,
        MatFormFieldModule,
        TranslateModule
    ],
    templateUrl: './control.component.html',
    styleUrl: './control.component.css'
})
export class ControlComponent {
    configsService = inject(ConfigsService);
    configs: AppConfigs = {};

    keyDownActions = Object.values(KeyDownAction);
    keyDownActionLabels = KeyDownActionLabels;

    constructor() {
        effect(() => {
            this.configs = this.configsService.data();
        });
    }

    updateConfig() {
        this.configsService.updateData(this.configs);
    }
}
