import { Component, booleanAttribute, inject, input, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { AppConfigs, ConfigsService } from '../api';

/**
 * 设置分类页的公共骨架，与 App 新版设置页一一对应：
 * 页标题 + 摘要 → 每节一张卡片（节标题）→ 行（左：标题、标签、说明；右：控件）→ 默认收起的「高级设置」卡片。
 * 文案键一律传 i18n 键（TV.* 为 App strings.xml 原文），由组件内部翻译。样式在 styles.scss。
 */

/** 与 App humanizeMs() 相同：按秒 / 分 / 小时 / 天取整显示 */
export function humanizeMs(ms: number): string {
    if (ms < 60_000) return `${ms / 1000} s`;
    if (ms < 3_600_000) return `${ms / 60_000} min`;
    if (ms < 86_400_000) return `${ms / 3_600_000} h`;
    return `${ms / 86_400_000} d`;
}

/** 取值列表里没有当前值（旧版本写入的自定义值）时把它补在末尾，下拉框才能显示出来 */
export function optionsWith<T>(values: T[], current: T | undefined | null): T[] {
    return current === undefined || current === null || values.includes(current) ? values : [...values, current];
}

/** 分类页基类：c 为当前整包配置，改完调用 save() 整包写回 */
export abstract class SettingsPageBase {
    configsService = inject(ConfigsService);

    get c(): AppConfigs {
        return this.configsService.data();
    }

    save(): Promise<void> {
        return this.configsService.updateData(this.c);
    }
}

@Component({
    selector: 'app-settings-page',
    imports: [TranslateModule],
    template: `
        <header class="s-page-head">
            <h1>{{ label() | translate }}</h1>
            <p>{{ summary() | translate }}</p>
        </header>
        <ng-content />
    `,
    host: { class: 's-page' },
})
export class SettingsPageComponent {
    label = input.required<string>();
    summary = input.required<string>();
}

@Component({
    selector: 'app-settings-section',
    imports: [TranslateModule],
    template: `
        <h2 class="s-card-head">
            {{ label() | translate }}
            @if (surface() === 'tv') {
                <small>{{ 'SETTINGS_UI.SURFACE_TV' | translate }}</small>
            } @else if (surface() === 'touch') {
                <small>{{ 'SETTINGS_UI.SURFACE_TOUCH' | translate }}</small>
            }
        </h2>
        <ng-content />
    `,
    host: { class: 's-card' },
})
export class SettingsSectionComponent {
    label = input.required<string>();
    /** tv：App 只在电视（遥控器）上显示；touch：只在触屏设备上显示 */
    surface = input<'tv' | 'touch' | ''>('');
}

@Component({
    selector: 'app-settings-advanced',
    imports: [TranslateModule, MatIconModule],
    template: `
        <button type="button" class="s-adv-toggle" [attr.aria-expanded]="open()" (click)="open.set(!open())">
            <mat-icon>tune</mat-icon>
            <span class="s-adv-text">
                <span class="s-adv-title">{{ 'TV.settings_advanced' | translate }}</span>
                <span class="s-row-desc">{{ 'TV.settings_advanced_summary' | translate: { p1: count() } }}</span>
            </span>
            <mat-icon class="s-adv-chev">chevron_right</mat-icon>
        </button>
        <div class="s-adv-body" [hidden]="!open()">
            <ng-content />
        </div>
    `,
    host: { class: 's-card s-adv' },
})
export class SettingsAdvancedComponent {
    count = input.required<number>();
    open = signal(false);
}

@Component({
    selector: 'app-settings-row',
    imports: [TranslateModule],
    template: `
        <div class="s-row-text">
            <div class="s-row-title">
                <span>{{ label() | translate }}</span>
                @if (recMedia3()) {
                    <span class="s-tag rec">{{ 'TV.settings_tag_recommend_media3' | translate }}</span>
                }
                @if (beta()) {
                    <span class="s-tag beta">{{ 'TV.settings_tag_beta' | translate }}</span>
                }
                @if (experimental()) {
                    <span class="s-tag beta">{{ 'TV.settings_tag_experimental' | translate }}</span>
                }
                @if (media3()) {
                    <span class="s-tag cond">{{ 'TV.settings_tag_media3_only' | translate }}</span>
                }
                @if (surfaceView()) {
                    <span class="s-tag cond">{{ 'TV.settings_tag_surface_view' | translate }}</span>
                }
                @if (classic()) {
                    <span class="s-tag cond">{{ 'TV.settings_tag_classic' | translate }}</span>
                }
                @if (surface() === 'tv') {
                    <span class="s-tag cond">{{ 'SETTINGS_UI.SURFACE_TV' | translate }}</span>
                } @else if (surface() === 'touch') {
                    <span class="s-tag cond">{{ 'SETTINGS_UI.SURFACE_TOUCH' | translate }}</span>
                }
            </div>
            @if (desc()) {
                <div class="s-row-desc">{{ desc() | translate: descParams() }}</div>
            }
            <ng-content select="[desc]" />
            @if (detail()) {
                <div class="s-row-detail">{{ detail() | translate }}</div>
            }
        </div>
        <div class="s-row-ctl"><ng-content /></div>
        <ng-content select="[below]" />
    `,
    host: { class: 's-row' },
})
export class SettingsRowComponent {
    label = input.required<string>();
    desc = input('');
    descParams = input<Record<string, unknown>>();
    /** App 竖屏在说明下面多显示的一行技术细节（*_desc_detail） */
    detail = input('');
    surface = input<'tv' | 'touch' | ''>('');
    recMedia3 = input(false, { transform: booleanAttribute });
    beta = input(false, { transform: booleanAttribute });
    experimental = input(false, { transform: booleanAttribute });
    media3 = input(false, { transform: booleanAttribute });
    surfaceView = input(false, { transform: booleanAttribute });
    classic = input(false, { transform: booleanAttribute });
}

export const SETTINGS_UI = [SettingsPageComponent, SettingsSectionComponent, SettingsAdvancedComponent, SettingsRowComponent] as const;
