import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { TranslateModule } from '@ngx-translate/core';
import { SETTINGS_UI, SettingsPageBase } from '../settings-ui/settings-ui';

/** 选台与频道列表：选台界面、频道列表、播放时；高级里是预览抓帧的四项细调 */
@Component({
    selector: 'app-channels',
    imports: [
        FormsModule,
        MatSlideToggleModule,
        MatSelectModule,
        MatFormFieldModule,
        MatButtonToggleModule,
        TranslateModule,
        ...SETTINGS_UI,
    ],
    templateUrl: './channels.component.html',
    host: {
        'animate.enter': 'enter',
        'animate.leave': 'leave'
    }
})
export class ChannelsComponent extends SettingsPageBase {
    counts = Array.from({ length: 10 }, (_, i) => i + 1);
    /** 与 App 相同：关闭 / 50~2000 毫秒 */
    lazyRenderIntervals = [-1, 50, 100, 200, 300, 500, 1000, 2000];

    /**
     * 预览加载速度（与 App 相同）：省流量 = 同时 1 个 + 分批（每批 1 个、间隔 500ms）；
     * 均衡 = 同时 1 个、不分批；快速 = 同时 3 个、不分批；其余组合为 -1（自定义）
     */
    get previewSpeed(): number {
        const parallel = this.c.channelPreviewParallelCount;
        const lazy = this.c.uiLazyRender;
        if (!lazy && parallel === 1) return 1;
        if (!lazy && parallel === 3) return 2;
        if (lazy && parallel === 1 && this.c.uiLazyRenderParallelCount === 1 && this.c.uiLazyRenderInterval === 500) return 0;
        return -1;
    }

    setPreviewSpeed(index: number) {
        this.c.channelPreviewParallelCount = index === 2 ? 3 : 1;
        this.c.uiLazyRender = index === 0;
        if (index === 0) {
            this.c.uiLazyRenderParallelCount = 1;
            this.c.uiLazyRenderInterval = 500;
        }
        this.save();
    }
}
