import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { AppStartupScreen, AppThemeDef, UiScreenOrientation, UiTimeShowMode } from '../api';
import { SETTINGS_UI, SettingsPageBase, optionsWith } from '../settings-ui/settings-ui';
import { DeviceFilePickerDialogComponent, DeviceFileSelection, filePathToUri } from '../common/device-file-picker-dialog/device-file-picker-dialog.component';

/** 外观：主题（含自定义主题）、启动与屏幕方向、大小、屏幕时钟。界面语言是 App 本机设置，网页面板用右上角的语言菜单 */
@Component({
    selector: 'app-look',
    imports: [
        FormsModule,
        MatSelectModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatButtonToggleModule,
        MatDialogModule,
        TranslateModule,
        ...SETTINGS_UI,
    ],
    templateUrl: './look.component.html',
    host: {
        'animate.enter': 'enter',
        'animate.leave': 'leave'
    }
})
export class LookComponent extends SettingsPageBase {
    private dialog = inject(MatDialog);

    startupScreens = Object.values(AppStartupScreen);
    startupScreenLabels: Record<AppStartupScreen, string> = {
        Dashboard: 'TV.ui_dashboard_module_dashboard',
        Live: 'TV.ui_dashboard_module_live',
        EpgGuide: 'TV.ui_dashboard_module_epg_guide',
        Channels: 'TV.ui_dashboard_module_all_channels',
        Favorites: 'TV.ui_dashboard_module_favorites',
        Search: 'TV.ui_dashboard_module_search',
        MultiView: 'TV.ui_dashboard_module_multi_view',
    };
    orientation = UiScreenOrientation;
    timeShowMode = UiTimeShowMode;

    /** 与 App 相同：界面整体缩放 自适应（0）/ ×0.5~×2，字体缩放 ×0.5~×2，步长 0.1 */
    private scales = Array.from({ length: 16 }, (_, i) => (i + 5) / 10);

    get densityOptions(): number[] {
        return optionsWith([0, ...this.scales], this.c.uiDensityScaleRatio);
    }

    get fontScaleOptions(): number[] {
        return optionsWith(this.scales, this.c.uiFontScaleRatio);
    }

    scaleLabel(ratio: number): string {
        return `×${Math.round(ratio * 10) / 10}`;
    }

    get theme(): AppThemeDef {
        return this.c.themeAppCurrent ?? { name: '', background: '' };
    }

    /** 自定义主题只在改这几项时写回；贴图透明度留空 = 不设置，App 侧是 0~1 的小数 */
    updateTheme(patch: Partial<AppThemeDef>) {
        const theme: AppThemeDef = { ...this.theme, ...patch };
        if (theme.textureAlpha === undefined || theme.textureAlpha === null || Number.isNaN(theme.textureAlpha)) {
            delete theme.textureAlpha;
        } else {
            theme.textureAlpha = Math.min(1, Math.max(0, theme.textureAlpha));
        }
        this.c.themeAppCurrent = theme;
        this.save();
    }

    pickThemeFile(field: 'background' | 'texture'): void {
        this.dialog.open(DeviceFilePickerDialogComponent, {
            data: { mode: 'file', initialPath: this.theme[field] },
            width: '720px',
            maxWidth: '95vw',
        }).afterClosed().subscribe((selection?: DeviceFileSelection) => {
            if (!selection) return;
            const uri = filePathToUri(selection.path);
            this.updateTheme(field === 'background' ? { background: uri } : { texture: uri });
        });
    }

    textureAlphaChange(value: string) {
        this.updateTheme({ textureAlpha: value.trim() === '' ? undefined : Number(value) });
    }
}
