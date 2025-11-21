import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { TranslateModule } from '@ngx-translate/core';
import { ConfigsService, AppConfigs } from '../api';

@Component({
    selector: 'app-update',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatSlideToggleModule,
        MatButtonToggleModule,
        TranslateModule
    ],
    templateUrl: './update.component.html',
    styleUrl: './update.component.css'
})
export class UpdateComponent {
    configsService = inject(ConfigsService);
    configs: AppConfigs = {};

    constructor() {
        effect(() => {
            this.configs = this.configsService.data();
        });
    }

    updateConfig() {
        this.configsService.updateData(this.configs);
    }
}
