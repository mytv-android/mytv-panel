import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { AppApi } from '../api';
import { SETTINGS_UI, SettingsPageBase } from '../settings-ui/settings-ui';
import { LogComponent } from '../log/log.component';

/** 帮助与诊断：排查播放问题（含网页面板的运行日志查看与 logcat 导出）、流畅度；高级里是布局网格。解码器信息只在 App 里看 */
@Component({
    selector: 'app-debug',
    imports: [FormsModule, MatSlideToggleModule, MatButtonModule, MatIconModule, TranslateModule, LogComponent, ...SETTINGS_UI],
    templateUrl: './debug.component.html',
    host: {
        'animate.enter': 'enter',
        'animate.leave': 'leave'
    }
})
export class DebugComponent extends SettingsPageBase {
    async exportLogcat() {
        try {
            const data = await AppApi.getLogcat();
            const blob = new Blob([data], { type: 'text/plain' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `logcat_${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error('Export failed:', error);
        }
    }
}
