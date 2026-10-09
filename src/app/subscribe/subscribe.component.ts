import { Component, inject, effect, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatRadioModule } from '@angular/material/radio';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfigsService, AppConfigs, IptvSource, IptvHybridMode, IptvHybridModeLabels } from '../api';
import { SubscribeSourceDialogComponent } from './subscribe-source-dialog/subscribe-source-dialog.component';
import { HiddenGroupDialogComponent } from './hidden-group-dialog/hidden-group-dialog.component';
import { TextareaWithLinesComponent } from '../common/textarea-with-lines/textarea-with-lines.component';

@Component({
    selector: 'app-subscribe',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatListModule,
        MatIconModule,
        MatButtonModule,
        MatInputModule,
        MatFormFieldModule,
        MatSlideToggleModule,
        MatSelectModule,
        MatChipsModule,
        MatRadioModule,
        MatDialogModule,
        MatPaginatorModule,
        MatMenuModule,
        TranslateModule,
        MatSnackBarModule,
        TextareaWithLinesComponent
    ],
    templateUrl: './subscribe.component.html',
    styleUrl: './subscribe.component.css',
    host: {
        'animate.enter': 'enter',
        'animate.leave': 'leave'
    }
})
export class SubscribeComponent {
    configsService = inject(ConfigsService);
    dialog = inject(MatDialog);
    snackBar = inject(MatSnackBar);
    translate = inject(TranslateService);
    configs: AppConfigs = {};

    channelAliasExample = JSON.stringify({
        __suffix: ['-高码', '-HD'],
        CCTV1: ['CCTV1HD', 'CCTV1 HD'],
    }, null, 2);

    iptvHybridMode = IptvHybridMode;
    iptvHybridModeLabels = IptvHybridModeLabels;
    hybridModes = Object.values(IptvHybridMode);

    // Pagination
    pageSize = 10;
    pageIndex = 0;

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
        effect(() => {
            this.configs = this.configsService.data();
        });
    }

    handlePageEvent(e: PageEvent) {
        this.pageSize = e.pageSize;
        this.pageIndex = e.pageIndex;
    }

    get paginatedSources(): IptvSource[] {
        const list = this.configs.iptvSourceList?.value || [];
        const start = this.pageIndex * this.pageSize;
        const end = start + this.pageSize;
        return list.slice(start, end);
    }

    get totalSources(): number {
        return this.configs.iptvSourceList?.value?.length || 0;
    }

    getGlobalIndex(localIndex: number): number {
        return this.pageIndex * this.pageSize + localIndex;
    }

    updateConfig() {
        return this.configsService.updateData(this.configs);
    }

    // Subscription Source Management
    addSource() {
        const dialogRef = this.dialog.open(SubscribeSourceDialogComponent, {
            data: { source: null, sources: this.configs.iptvSourceList?.value || [] },
            width: '500px'
        });

        dialogRef.afterClosed().subscribe(async result => {
            if (result) {
                const list = this.configs.iptvSourceList?.value || [];
                this.configs.iptvSourceList = { value: [...list, result] };
                try {
                    await this.updateConfig();
                    this.showSuccess(this.translate.instant('HOME.ADD_SUCCESS'));
                } catch { /* update() 已提示失败 */ }
            }
        });
    }

    editSource(index: number, source: IptvSource) {
        const dialogRef = this.dialog.open(SubscribeSourceDialogComponent, {
            data: { source: source, sources: this.configs.iptvSourceList?.value || [] },
            width: '500px'
        });

        dialogRef.afterClosed().subscribe(async result => {
            if (result) {
                const list = [...(this.configs.iptvSourceList?.value || [])];
                list[index] = result;
                this.configs.iptvSourceList = { value: list };
                try {
                    await this.updateConfig();
                    this.showSuccess(this.translate.instant('HOME.UPDATE_SUCCESS'));
                } catch { /* update() 已提示失败 */ }
            }
        });
    }

    deleteSource(index: number) {
        const list = [...(this.configs.iptvSourceList?.value || [])];
        list.splice(index, 1);
        this.configs.iptvSourceList = { value: list };

        // Adjust current index if needed
        if (this.configs.iptvSourceCurrentIdx !== undefined) {
            if (this.configs.iptvSourceCurrentIdx === index) {
                this.configs.iptvSourceCurrentIdx = 0; // Reset to 0 or handle as needed
            } else if (this.configs.iptvSourceCurrentIdx > index) {
                this.configs.iptvSourceCurrentIdx--;
            }
        }

        this.updateConfig().then(
            () => this.showSuccess(this.translate.instant('HOME.DELETE_SUCCESS')),
            () => { /* update() 已提示失败 */ }
        );
    }

    moveSource(index: number, direction: 'up' | 'down') {
        const list = [...(this.configs.iptvSourceList?.value || [])];
        if (direction === 'up' && index > 0) {
            [list[index], list[index - 1]] = [list[index - 1], list[index]];
            // Adjust current index
            if (this.configs.iptvSourceCurrentIdx === index) {
                this.configs.iptvSourceCurrentIdx = index - 1;
            } else if (this.configs.iptvSourceCurrentIdx === index - 1) {
                this.configs.iptvSourceCurrentIdx = index;
            }
        } else if (direction === 'down' && index < list.length - 1) {
            [list[index], list[index + 1]] = [list[index + 1], list[index]];
            // Adjust current index
            if (this.configs.iptvSourceCurrentIdx === index) {
                this.configs.iptvSourceCurrentIdx = index + 1;
            } else if (this.configs.iptvSourceCurrentIdx === index + 1) {
                this.configs.iptvSourceCurrentIdx = index;
            }
        }
        this.configs.iptvSourceList = { value: list };
        this.updateConfig();
    }

    setCurrentSource(index: number) {
        this.configs.iptvSourceCurrentIdx = index;
        this.updateConfig();
    }

    // Hidden Group Management
    addHiddenGroup() {
        const dialogRef = this.dialog.open(HiddenGroupDialogComponent, {
            width: '300px',
            data: { title: 'SUBSCRIBE.ADD_HIDDEN_GROUP', label: 'SUBSCRIBE.GROUP_NAME' }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                const set = new Set(this.configs.iptvChannelGroupHiddenList || []);
                set.add(result);
                // 必须回写数组：JSON.stringify(Set) 会得到 {}，导致应用端解析失败、整包配置保存不生效
                this.configs.iptvChannelGroupHiddenList = Array.from(set);
                this.updateConfig();
                this.showSuccess(this.translate.instant('HOME.ADD_SUCCESS'));
            }
        });
    }

    editHiddenGroup(group: string) {
        const dialogRef = this.dialog.open(HiddenGroupDialogComponent, {
            width: '300px',
            data: { title: 'SUBSCRIBE.EDIT_HIDDEN_GROUP', label: 'SUBSCRIBE.GROUP_NAME', value: group }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && result !== group) {
                const set = new Set(this.configs.iptvChannelGroupHiddenList || []);
                set.delete(group);
                set.add(result);
                this.configs.iptvChannelGroupHiddenList = Array.from(set);
                this.updateConfig();
                this.showSuccess(this.translate.instant('HOME.UPDATE_SUCCESS'));
            }
        });
    }

    removeHiddenGroup(group: string) {
        const set = new Set(this.configs.iptvChannelGroupHiddenList || []);
        set.delete(group);
        this.configs.iptvChannelGroupHiddenList = Array.from(set);
        this.updateConfig();
        this.showSuccess(this.translate.instant('HOME.DELETE_SUCCESS'));
    }

    get hiddenGroups(): string[] {
        return Array.from(this.configs.iptvChannelGroupHiddenList || []);
    }

    // Hidden Channel Management
    addHiddenChannel() {
        const dialogRef = this.dialog.open(HiddenGroupDialogComponent, {
            width: '300px',
            data: { title: 'SUBSCRIBE.ADD_HIDDEN_CHANNEL', label: 'SUBSCRIBE.CHANNEL_REGEX' }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                const set = new Set(this.configs.iptvChannelHiddenList || []);
                set.add(result);
                this.configs.iptvChannelHiddenList = Array.from(set);
                this.updateConfig();
                this.showSuccess(this.translate.instant('HOME.ADD_SUCCESS'));
            }
        });
    }

    editHiddenChannel(channel: string) {
        const dialogRef = this.dialog.open(HiddenGroupDialogComponent, {
            width: '300px',
            data: { title: 'SUBSCRIBE.EDIT_HIDDEN_CHANNEL', label: 'SUBSCRIBE.CHANNEL_REGEX', value: channel }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && result !== channel) {
                const set = new Set(this.configs.iptvChannelHiddenList || []);
                set.delete(channel);
                set.add(result);
                this.configs.iptvChannelHiddenList = Array.from(set);
                this.updateConfig();
                this.showSuccess(this.translate.instant('HOME.UPDATE_SUCCESS'));
            }
        });
    }

    removeHiddenChannel(channel: string) {
        const set = new Set(this.configs.iptvChannelHiddenList || []);
        set.delete(channel);
        this.configs.iptvChannelHiddenList = Array.from(set);
        this.updateConfig();
        this.showSuccess(this.translate.instant('HOME.DELETE_SUCCESS'));
    }

    get hiddenChannels(): string[] {
        return Array.from(this.configs.iptvChannelHiddenList || []);
    }

    getSourceTypeLabel(type: number): string {
        switch (type) {
            case 0: return 'HOME.REMOTE';
            case 2: return 'HOME.XTREAM';
            case 1: return 'HOME.FILE';
            case 3: return 'HOME.STALKER';
            case 4: return 'HOME.AGGREGATE';
            default: return 'Unknown';
        }
    }

    getSourceTypeBadgeClass(type: number): string {
        switch (type) {
            case 0: return 'badge-remote';
            case 2: return 'badge-xtream';
            case 1: return 'badge-file';
            case 3: return 'badge-stalker';
            case 4: return 'badge-aggregate';
            default: return 'badge-default';
        }
    }

    /** 聚合配置的成员名（按线路优先级顺序）；其余类型返回空串 */
    aggregateMemberNames(source: IptvSource): string {
        if (source.sourceType !== 4) return '';
        return (source.aggregateSources || []).map(ref => ref.name).join('、');
    }

    get cacheTimeInHours(): number {
        return (this.configs.iptvSourceCacheTime || 0) / (1000 * 60 * 60);
    }

    set cacheTimeInHours(value: number) {
        this.configs.iptvSourceCacheTime = value * 1000 * 60 * 60;
        this.updateConfig();
    }

    showSuccess(message: string) {
        this.snackBar.open(message, this.translate.instant('HOME.CLOSE'), { duration: 3000 });
    }
}
