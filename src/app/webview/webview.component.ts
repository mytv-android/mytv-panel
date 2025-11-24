import { Component, inject, effect } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { ConfigsService, AppConfigs, WebViewCore, WebViewCoreLabels } from '../api';

@Component({
    selector: 'app-webview',
    standalone: true,
    imports: [
    FormsModule,
    MatCardModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    TranslateModule
],
    templateUrl: './webview.component.html',
    styleUrl: './webview.component.css'
})
export class WebviewComponent {
    configsService = inject(ConfigsService);
    configs: AppConfigs = {};
    
    webViewCore = WebViewCore;
    webViewCoreLabels = WebViewCoreLabels;
    webViewCores = Object.values(WebViewCore);

    constructor() {
        effect(() => {
            this.configs = this.configsService.data();
        });
    }

    updateConfig() {
        this.configsService.updateData(this.configs);
    }
}
