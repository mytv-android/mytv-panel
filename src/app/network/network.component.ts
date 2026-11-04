import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { SETTINGS_UI, SettingsPageBase, humanizeMs, optionsWith } from '../settings-ui/settings-ui';
import { TextareaWithLinesComponent } from '../common/textarea-with-lines/textarea-with-lines.component';

/** 网络与代理：失败重试、代理与代理规则；高级里是 UA、附加请求头、DNS */
@Component({
    selector: 'app-network',
    imports: [
        FormsModule,
        MatSelectModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        TranslateModule,
        TextareaWithLinesComponent,
        ...SETTINGS_UI,
    ],
    templateUrl: './network.component.html',
    host: {
        'animate.enter': 'enter',
        'animate.leave': 'leave'
    }
})
export class NetworkComponent extends SettingsPageBase {
    humanizeMs = humanizeMs;

    /** 与 App 相同：重试次数 1~10、15、20、30、40、50；重试间隔 0~30 秒 */
    get retryCountOptions(): number[] {
        return optionsWith([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 30, 40, 50], this.c.networkRetryCount);
    }

    get retryIntervalOptions(): number[] {
        return optionsWith([0, 1, 2, 3, 5, 10, 15, 20, 30].map(s => s * 1000), this.c.networkRetryInterval);
    }

    get headerCount(): number {
        return (this.c.videoPlayerHeaders ?? '').split('\n').filter(line => line.trim()).length;
    }

    addProxyRule() {
        const list = this.c.videoPlayerProxyRuleList?.list ?? [];
        this.c.videoPlayerProxyRuleList = { list: [...list, { pattern: '', proxy: '' }] };
        this.save();
    }

    removeProxyRule(index: number) {
        const list = [...(this.c.videoPlayerProxyRuleList?.list ?? [])];
        list.splice(index, 1);
        this.c.videoPlayerProxyRuleList = { list };
        this.save();
    }
}
