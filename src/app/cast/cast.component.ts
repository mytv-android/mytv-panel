import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslateModule } from '@ngx-translate/core';
import { SETTINGS_UI, SettingsPageBase } from '../settings-ui/settings-ui';
import { ServicesComponent } from '../services/services.component';

/** 投屏与扩展：投屏接收开关；脚本服务（网页面板的服务管理整块嵌入）。设备名称与可下载组件只在 App 里设置 */
@Component({
    selector: 'app-cast',
    imports: [FormsModule, MatSlideToggleModule, TranslateModule, ServicesComponent, ...SETTINGS_UI],
    template: `
        <app-settings-page label="TV.settings_category_cast" summary="TV.settings_category_cast_summary">
            <app-settings-section label="TV.settings_section_cast_cast">
                <app-settings-row label="TV.settings_app_cast_receiver" desc="TV.settings_app_cast_receiver_desc">
                    <mat-slide-toggle [(ngModel)]="c.castReceiverEnabled" (change)="save()"></mat-slide-toggle>
                </app-settings-row>
            </app-settings-section>

            <app-settings-section label="TV.ui_python_service">
                <app-settings-row label="TV.ui_python_service" desc="TV.settings_cast_script_desc"></app-settings-row>
                <div class="s-card-body s-embed">
                    <app-services></app-services>
                </div>
            </app-settings-section>
        </app-settings-page>
    `,
    host: {
        'animate.enter': 'enter',
        'animate.leave': 'leave'
    }
})
export class CastComponent extends SettingsPageBase {}
