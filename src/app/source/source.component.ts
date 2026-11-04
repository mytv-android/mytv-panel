import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IptvSource, IptvHybridMode } from '../api';
import { SETTINGS_UI, SettingsPageBase, humanizeMs, optionsWith } from '../settings-ui/settings-ui';
import { SubscribeSourceDialogComponent } from '../subscribe/subscribe-source-dialog/subscribe-source-dialog.component';
import { HiddenGroupDialogComponent } from '../subscribe/hidden-group-dialog/hidden-group-dialog.component';
import { EpgManagerComponent } from '../epg/epg-manager/epg-manager.component';
import { TextareaWithLinesComponent } from '../common/textarea-with-lines/textarea-with-lines.component';

const HOUR = 3_600_000;
const DAY = 86_400_000;

/** 订阅源与节目单：订阅源列表、缓存、网页源；节目单；频道整理 */
@Component({
    selector: 'app-source',
    imports: [
        FormsModule,
        MatIconModule,
        MatButtonModule,
        MatInputModule,
        MatFormFieldModule,
        MatSlideToggleModule,
        MatSelectModule,
        MatButtonToggleModule,
        MatChipsModule,
        MatDialogModule,
        MatPaginatorModule,
        MatMenuModule,
        MatSnackBarModule,
        TranslateModule,
        TextareaWithLinesComponent,
        ...SETTINGS_UI,
    ],
    templateUrl: './source.component.html',
    styleUrl: './source.component.css',
    host: {
        'animate.enter': 'enter',
        'animate.leave': 'leave'
    }
})
export class SourceComponent extends SettingsPageBase {
    dialog = inject(MatDialog);
    snackBar = inject(MatSnackBar);
    translate = inject(TranslateService);

    hybridMode = IptvHybridMode;

    channelAliasExample = JSON.stringify({
        __suffix: ['-高码', '-HD'],
        CCTV1: ['CCTV1HD', 'CCTV1 HD'],
    }, null, 2);

    /** 与 App 相同：0~23 小时、1~15 天（App 的「永久」是 Long.MAX_VALUE，网页无法原样回写，只在当前值是它时列出） */
    private cacheTimes = [
        ...Array.from({ length: 24 }, (_, h) => h * HOUR),
        ...Array.from({ length: 15 }, (_, d) => (d + 1) * DAY),
    ];
    epgThresholds = Array.from({ length: 25 }, (_, i) => i - 1);

    pageSize = 10;
    pageIndex = 0;

    get cacheTimeOptions(): number[] {
        return optionsWith(this.cacheTimes, this.c.iptvSourceCacheTime);
    }

    cacheTimeLabel(ms: number): string {
        if (ms === 0) return this.translate.instant('TV.ui_subscription_source_cache_time_none');
        if (ms >= Number.MAX_SAFE_INTEGER) return this.translate.instant('TV.ui_subscription_source_cache_time_forever');
        return humanizeMs(ms);
    }

    get epgThresholdOptions(): number[] {
        return optionsWith(this.epgThresholds, this.c.epgRefreshTimeThreshold);
    }

    epgThresholdLabel(hour: number): string {
        return hour < 0 ? this.translate.instant('TV.epg_loaded_on_Startup') : `${hour}:00`;
    }

    // ---------------------------------------------------------------- 订阅源列表

    get sources(): IptvSource[] {
        return this.c.iptvSourceList?.value || [];
    }

    get paginatedSources(): IptvSource[] {
        const start = this.pageIndex * this.pageSize;
        return this.sources.slice(start, start + this.pageSize);
    }

    get currentSourceName(): string {
        return this.sources[this.c.iptvSourceCurrentIdx ?? 0]?.name ?? '';
    }

    handlePageEvent(e: PageEvent) {
        this.pageSize = e.pageSize;
        this.pageIndex = e.pageIndex;
    }

    getGlobalIndex(localIndex: number): number {
        return this.pageIndex * this.pageSize + localIndex;
    }

    addSource() {
        this.dialog.open(SubscribeSourceDialogComponent, {
            data: { source: null, sources: this.sources },
            width: '500px'
        }).afterClosed().subscribe(async result => {
            if (!result) return;
            this.c.iptvSourceList = { value: [...this.sources, result] };
            try {
                await this.save();
                this.showSuccess('HOME.ADD_SUCCESS');
            } catch { /* update() 已提示失败 */ }
        });
    }

    editSource(index: number, source: IptvSource) {
        this.dialog.open(SubscribeSourceDialogComponent, {
            data: { source, sources: this.sources },
            width: '500px'
        }).afterClosed().subscribe(async result => {
            if (!result) return;
            const list = [...this.sources];
            list[index] = result;
            this.c.iptvSourceList = { value: list };
            try {
                await this.save();
                this.showSuccess('HOME.UPDATE_SUCCESS');
            } catch { /* update() 已提示失败 */ }
        });
    }

    deleteSource(index: number) {
        const list = [...this.sources];
        list.splice(index, 1);
        this.c.iptvSourceList = { value: list };
        const current = this.c.iptvSourceCurrentIdx;
        if (current !== undefined) {
            if (current === index) {
                this.c.iptvSourceCurrentIdx = 0;
            } else if (current > index) {
                this.c.iptvSourceCurrentIdx = current - 1;
            }
        }
        this.save().then(
            () => this.showSuccess('HOME.DELETE_SUCCESS'),
            () => { /* update() 已提示失败 */ }
        );
    }

    moveSource(index: number, direction: 'up' | 'down') {
        const list = [...this.sources];
        const target = direction === 'up' ? index - 1 : index + 1;
        if (target < 0 || target >= list.length) return;
        [list[index], list[target]] = [list[target], list[index]];
        if (this.c.iptvSourceCurrentIdx === index) {
            this.c.iptvSourceCurrentIdx = target;
        } else if (this.c.iptvSourceCurrentIdx === target) {
            this.c.iptvSourceCurrentIdx = index;
        }
        this.c.iptvSourceList = { value: list };
        this.save();
    }

    setCurrentSource(index: number) {
        this.c.iptvSourceCurrentIdx = index;
        this.save();
    }

    getSourceTypeLabel(type: number): string {
        switch (type) {
            case 0: return 'HOME.REMOTE';
            case 1: return 'HOME.FILE';
            case 2: return 'HOME.XTREAM';
            case 3: return 'HOME.STALKER';
            case 4: return 'HOME.AGGREGATE';
            default: return 'Unknown';
        }
    }

    /** 聚合配置的成员名（按线路优先级顺序）；其余类型返回空串 */
    aggregateMemberNames(source: IptvSource): string {
        if (source.sourceType !== 4) return '';
        return (source.aggregateSources || []).map(ref => ref.name).join('、');
    }

    // ---------------------------------------------------------------- 节目单

    get epgCurrentName(): string {
        return this.c.epgSourceCurrent?.name ?? '';
    }

    openEpgManager() {
        this.dialog.open(EpgManagerComponent, {
            data: {
                sources: this.c.epgSourceList?.value || [],
                currentSource: this.c.epgSourceCurrent
            },
            width: '600px'
        }).afterClosed().subscribe(result => {
            if (!result) return;
            this.c.epgSourceList = { value: result.sources };
            this.c.epgSourceCurrent = result.currentSource;
            this.save();
            this.showSuccess('HOME.UPDATE_SUCCESS');
        });
    }

    // ---------------------------------------------------------------- 隐藏分组 / 隐藏频道（必须回写数组：JSON.stringify(Set) 会得到 {}）

    get hiddenGroups(): string[] {
        return this.c.iptvChannelGroupHiddenList || [];
    }

    get hiddenChannels(): string[] {
        return this.c.iptvChannelHiddenList || [];
    }

    editHiddenGroup(group?: string) {
        this.editHidden('iptvChannelGroupHiddenList', group,
            group === undefined ? 'SUBSCRIBE.ADD_HIDDEN_GROUP' : 'SUBSCRIBE.EDIT_HIDDEN_GROUP', 'SUBSCRIBE.GROUP_NAME');
    }

    editHiddenChannel(channel?: string) {
        this.editHidden('iptvChannelHiddenList', channel,
            channel === undefined ? 'SUBSCRIBE.ADD_HIDDEN_CHANNEL' : 'SUBSCRIBE.EDIT_HIDDEN_CHANNEL', 'SUBSCRIBE.CHANNEL_REGEX');
    }

    removeHidden(field: 'iptvChannelGroupHiddenList' | 'iptvChannelHiddenList', value: string) {
        this.c[field] = (this.c[field] || []).filter(it => it !== value);
        this.save();
        this.showSuccess('HOME.DELETE_SUCCESS');
    }

    private editHidden(field: 'iptvChannelGroupHiddenList' | 'iptvChannelHiddenList', old: string | undefined, title: string, label: string) {
        this.dialog.open(HiddenGroupDialogComponent, {
            width: '300px',
            data: { title, label, value: old }
        }).afterClosed().subscribe(result => {
            if (!result || result === old) return;
            const set = new Set(this.c[field] || []);
            if (old !== undefined) set.delete(old);
            set.add(result);
            this.c[field] = Array.from(set);
            this.save();
            this.showSuccess(old === undefined ? 'HOME.ADD_SUCCESS' : 'HOME.UPDATE_SUCCESS');
        });
    }

    private showSuccess(key: string) {
        this.snackBar.open(this.translate.instant(key), this.translate.instant('HOME.CLOSE'), { duration: 3000 });
    }
}
