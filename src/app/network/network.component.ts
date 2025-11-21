import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { ConfigsService, AppConfigs } from '../api';

@Component({
    selector: 'app-network',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        TranslateModule
    ],
    templateUrl: './network.component.html',
    styleUrl: './network.component.css'
})
export class NetworkComponent {
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
