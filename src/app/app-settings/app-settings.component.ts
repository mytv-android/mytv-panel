import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { TranslateModule } from '@ngx-translate/core';
import { SETTINGS_UI, SettingsPageBase } from '../settings-ui/settings-ui';

/** 应用与系统：开机、更新、存储。清除缓存、权限、恢复初始化只能在 App 里操作 */
@Component({
    selector: 'app-app-settings',
    imports: [FormsModule, MatSlideToggleModule, MatButtonToggleModule, TranslateModule, ...SETTINGS_UI],
    template: `
        <app-settings-page label="TV.settings_category_app" summary="TV.settings_category_app_summary">
            <app-settings-section label="TV.settings_section_app_boot">
                <app-settings-row label="TV.ui_channel_view_boot_start" desc="TV.ui_channel_view_boot_start_support">
                    <mat-slide-toggle [(ngModel)]="c.appBootLaunch" (change)="onBootLaunchChange()"></mat-slide-toggle>
                </app-settings-row>
                <app-settings-row label="TV.ui_channel_view_boot_silent_service" desc="TV.ui_channel_view_boot_silent_service_support">
                    <mat-slide-toggle [(ngModel)]="c.appBootSilentService" (change)="onBootSilentServiceChange()"></mat-slide-toggle>
                </app-settings-row>
            </app-settings-section>

            <app-settings-section label="TV.settings_section_app_update">
                <app-settings-row label="TV.ui_channel_view_update_channel" desc="TV.settings_app_update_channel_desc">
                    <mat-button-toggle-group [(ngModel)]="c.updateChannel" (change)="save()">
                        <mat-button-toggle value="stable">{{ 'TV.settings_choice_update_stable' | translate }}</mat-button-toggle>
                        <mat-button-toggle value="beta">{{ 'TV.settings_choice_update_beta' | translate }}</mat-button-toggle>
                        <mat-button-toggle value="dev">{{ 'TV.settings_choice_update_dev' | translate }}</mat-button-toggle>
                    </mat-button-toggle-group>
                </app-settings-row>
                <app-settings-row label="TV.ui_channel_view_force_remind">
                    <mat-slide-toggle [(ngModel)]="c.updateForceRemind" (change)="save()"></mat-slide-toggle>
                </app-settings-row>
            </app-settings-section>

            <app-settings-section label="TV.settings_section_app_storage">
                <app-settings-row label="TV.ui_app_cache_path_external" desc="TV.ui_app_cache_path_external_desc">
                    <mat-slide-toggle [(ngModel)]="c.cachePathExternal" (change)="save()"></mat-slide-toggle>
                </app-settings-row>
            </app-settings-section>
        </app-settings-page>
    `,
    host: {
        'animate.enter': 'enter',
        'animate.leave': 'leave'
    }
})
export class AppSettingsComponent extends SettingsPageBase {
    /** 开机自启与开机静默自启互斥（与 App 相同） */
    onBootLaunchChange() {
        if (this.c.appBootLaunch) this.c.appBootSilentService = false;
        this.save();
    }

    onBootSilentServiceChange() {
        if (this.c.appBootSilentService) this.c.appBootLaunch = false;
        this.save();
    }
}
