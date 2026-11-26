import { Component, PLATFORM_ID, computed, effect, inject, signal, untracked } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppApi, ChannelFavorite } from '../../api';
import { SettingsPageBase, SettingsSectionComponent } from '../../settings-ui/settings-ui';

/**
 * 频道页「收藏」分区：拖动排序、置顶、换成当前源的线路、取消收藏，失效的一键整理。
 * 顺序就是 iptvChannelFavoriteList 本身的顺序；排序 / 置顶 / 取消收藏改完整包写回，电视即时生效。
 * 「换成当前源的线路」由电视端替换并写入（api/favorites/replace-line），之后必须先从电视
 * 重新拉取配置再做别的：本地这份还是替换前的，拿它整包写回会把替换覆盖掉。
 */
@Component({
    selector: 'app-favorites-section',
    imports: [DragDropModule, MatButtonModule, MatIconModule, MatTooltipModule, TranslateModule, SettingsSectionComponent],
    templateUrl: './favorites-section.component.html',
    styleUrl: './favorites-section.component.css',
})
export class FavoritesSectionComponent extends SettingsPageBase {
    private snackBar = inject(MatSnackBar);
    private translate = inject(TranslateService);

    /** 电视端判定能「换成当前源的线路」的收藏（台名） */
    replaceable = signal<ReadonlySet<string>>(new Set());
    /** 写回或换线路进行中，期间禁用所有操作 */
    busy = signal(false);
    /** 加载失败的台标地址，改显示台名 */
    brokenLogos = signal<ReadonlySet<string>>(new Set());

    /** 可换线路的名单只取决于收藏和当前源：这两样变了才重新向电视要 */
    private replaceableKey = computed(() => {
        const c = this.configsService.data();
        const list = c.iptvChannelFavoriteList?.value;
        if (!list) return '';
        return JSON.stringify([
            c.iptvSourceCurrentIdx,
            c.iptvSourceList?.value.map((s) => s.name),
            list.map((f) => [f.channel.name, f.iptvSourceName, f.groupName, !!f.missing]),
        ]);
    });
    private replaceableSeq = 0;
    /** 电视端的当前订阅源名（随可换名单一起返回） */
    private currentSource = '';

    constructor() {
        super();
        if (isPlatformBrowser(inject(PLATFORM_ID))) {
            effect(() => {
                if (this.replaceableKey()) untracked(() => this.loadReplaceable());
            });
        }
    }

    get favorites(): ChannelFavorite[] {
        return this.c.iptvChannelFavoriteList?.value ?? [];
    }

    /** 失效原因（i18n 键）：来源订阅源已删除，或刷新后源里找不到这个台；null = 正常 */
    staleReason(f: ChannelFavorite): string | null {
        if (!(this.c.iptvSourceList?.value ?? []).some((s) => s.name === f.iptvSourceName)) {
            return 'TV.ui_favorites_stale_source_deleted';
        }
        return f.missing ? 'TV.ui_favorites_stale_missing' : null;
    }

    /** 失效的收藏分两拨：当前源里有同名台的换线路，没有的取消收藏 */
    tidy(): { replace: string[], remove: string[] } {
        const replace: string[] = [];
        const remove: string[] = [];
        for (const f of this.favorites) {
            if (!this.staleReason(f)) continue;
            (this.replaceable().has(f.channel.name) ? replace : remove).push(f.channel.name);
        }
        return { replace, remove };
    }

    lineCount(f: ChannelFavorite): number {
        return f.channel.lineList?.value?.length ?? 0;
    }

    logoFailed(url: string) {
        this.brokenLogos.update((s) => new Set(s).add(url));
    }

    drop(event: CdkDragDrop<ChannelFavorite[]>) {
        if (event.previousIndex === event.currentIndex) return;
        const list = [...this.favorites];
        moveItemInArray(list, event.previousIndex, event.currentIndex);
        this.setFavorites(list);
    }

    moveToTop(index: number) {
        const list = [...this.favorites];
        moveItemInArray(list, index, 0);
        this.setFavorites(list);
    }

    remove(names: string[]) {
        const drop = new Set(names);
        this.setFavorites(this.favorites.filter((f) => !drop.has(f.channel.name)));
    }

    async replaceLine(names: string[]) {
        if (!names.length || this.busy()) return;
        this.busy.set(true);
        try {
            const { replaced } = await AppApi.replaceFavoritesLine(names);
            // 电视端已改好并写入，先拉回最新配置；期间不能 save() 本地旧副本
            await this.configsService.refresh();
            await this.loadReplaceable();
            if (replaced > 0) {
                this.toast(names.length === 1
                    ? this.translate.instant('TV.ui_favorites_line_replaced', { p1: this.currentSource, p2: names[0] })
                    : this.translate.instant('TV.ui_favorites_tidy_replaced', { p1: this.currentSource, p2: replaced }));
            } else {
                this.toast(this.translate.instant('HOME.UPDATE_FAILED'));
            }
        } catch {
            this.toast(this.translate.instant('HOME.UPDATE_FAILED'));
        } finally {
            this.busy.set(false);
        }
    }

    private async setFavorites(value: ChannelFavorite[]) {
        this.c.iptvChannelFavoriteList = { value };
        this.busy.set(true);
        try {
            await this.save();
        } catch {
            // ConfigsService 已提示保存失败
        } finally {
            this.busy.set(false);
        }
    }

    private async loadReplaceable() {
        const seq = ++this.replaceableSeq;
        try {
            const res = await AppApi.getFavoritesReplaceable();
            if (seq !== this.replaceableSeq) return;
            this.currentSource = res.currentSource;
            this.replaceable.set(new Set(res.names));
        } catch {
            if (seq === this.replaceableSeq) this.replaceable.set(new Set());
        }
    }

    private toast(message: string) {
        this.snackBar.open(message, undefined, { duration: 3000 });
    }
}
