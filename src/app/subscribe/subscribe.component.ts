import { Component, inject, effect } from '@angular/core';
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
import { TranslateModule } from '@ngx-translate/core';
import { ConfigsService, AppConfigs, AppApi, IptvSource, IptvHybridMode, IptvHybridModeLabels } from '../api';
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
        TextareaWithLinesComponent
    ],
    templateUrl: './subscribe.component.html',
    styleUrl: './subscribe.component.css'
})
export class SubscribeComponent {
    configsService = inject(ConfigsService);
    dialog = inject(MatDialog);
    configs: AppConfigs = {};

    channelAliasExample = JSON.stringify({
        __suffix: ['-高码', '-HD'],
        CCTV1: ['CCTV1HD', 'CCTV1 HD'],
    }, null, 2);

    iptvHybridMode = IptvHybridMode;
    iptvHybridModeLabels = IptvHybridModeLabels;
    hybridModes = Object.values(IptvHybridMode);

    channelAlias = '';

    // Pagination
    pageSize = 10;
    pageIndex = 0;

    constructor() {
        effect(() => {
            this.configs = this.configsService.data();
        });
        AppApi.getChannelAlias().then(alias => {
            this.channelAlias = alias;
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
        this.configsService.updateData(this.configs);
    }

    updateChannelAlias() {
        AppApi.changeChannelAlias(this.channelAlias);
    }

    // Subscription Source Management
    addSource() {
        const dialogRef = this.dialog.open(SubscribeSourceDialogComponent, {
            data: { source: null },
            width: '500px'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                const list = this.configs.iptvSourceList?.value || [];
                this.configs.iptvSourceList = { value: [...list, result] };
                this.updateConfig();
            }
        });
    }

    editSource(index: number, source: IptvSource) {
        const dialogRef = this.dialog.open(SubscribeSourceDialogComponent, {
            data: { source: source },
            width: '500px'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                const list = [...(this.configs.iptvSourceList?.value || [])];
                list[index] = result;
                this.configs.iptvSourceList = { value: list };
                this.updateConfig();
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

        this.updateConfig();
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
            width: '300px'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                const set = new Set(this.configs.iptvChannelGroupHiddenList || []);
                set.add(result);
                this.configs.iptvChannelGroupHiddenList = set;
                this.updateConfig();
            }
        });
    }

    removeHiddenGroup(group: string) {
        const set = new Set(this.configs.iptvChannelGroupHiddenList || []);
        set.delete(group);
        this.configs.iptvChannelGroupHiddenList = set;
        this.updateConfig();
    }

    get hiddenGroups(): string[] {
        return Array.from(this.configs.iptvChannelGroupHiddenList || []);
    }

    getSourceTypeLabel(type: number): string {
        switch (type) {
            case 0: return 'HOME.REMOTE';
            case 1: return 'HOME.XTREAM';
            case 2: return 'HOME.FILE';
            case 3: return 'HOME.CONTENT';
            default: return 'Unknown';
        }
    }

    getSourceTypeBadgeClass(type: number): string {
        switch (type) {
            case 0: return 'badge-remote';
            case 1: return 'badge-xtream';
            case 2: return 'badge-file';
            case 3: return 'badge-content';
            default: return 'badge-default';
        }
    }

    get cacheTimeInHours(): number {
        return (this.configs.iptvSourceCacheTime || 0) / (1000 * 60 * 60);
    }

    set cacheTimeInHours(value: number) {
        this.configs.iptvSourceCacheTime = value * 1000 * 60 * 60;
        this.updateConfig();
    }
}
