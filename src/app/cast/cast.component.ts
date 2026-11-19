import { Component, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { SETTINGS_UI, SettingsPageBase } from '../settings-ui/settings-ui';
import { ServicesComponent } from '../services/services.component';
import { McpPermissionLevel, McpPermissionLevelLabels } from '../api';

/** 投屏与扩展：投屏接收开关与设备通告名；AI 助手（MCP）；脚本服务（网页面板的服务管理整块嵌入）。可下载组件只在 App 里设置 */
@Component({
    selector: 'app-cast',
    imports: [
        FormsModule,
        MatSlideToggleModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        TranslateModule,
        ServicesComponent,
        ...SETTINGS_UI,
    ],
    template: `
        <app-settings-page label="TV.settings_category_cast" summary="TV.settings_category_cast_summary">
            <app-settings-section label="TV.settings_section_cast_cast">
                <app-settings-row label="TV.settings_app_cast_receiver" desc="TV.settings_app_cast_receiver_desc">
                    <mat-slide-toggle [(ngModel)]="c.castReceiverEnabled" (change)="save()"></mat-slide-toggle>
                </app-settings-row>

                <app-settings-row label="TV.settings_cast_device_name" desc="TV.settings_cast_device_name_desc">
                    <mat-form-field appearance="outline" subscriptSizing="dynamic" class="s-field">
                        <input matInput [(ngModel)]="c.castDeviceName" (change)="save()" maxlength="32">
                    </mat-form-field>
                </app-settings-row>
            </app-settings-section>

            <app-settings-section label="TV.settings_mcp_section">
                <app-settings-row label="TV.settings_mcp_title" desc="TV.settings_mcp_summary">
                    <mat-slide-toggle [(ngModel)]="c.mcpEnable" (change)="toggleMcp($event.checked)"></mat-slide-toggle>
                </app-settings-row>

                <app-settings-row label="TV.settings_mcp_level" desc="TV.settings_mcp_level_desc">
                    <mat-form-field appearance="outline" subscriptSizing="dynamic" class="s-field">
                        <mat-select [(ngModel)]="c.mcpPermissionLevel" (selectionChange)="save()"
                                    [disabled]="!c.mcpEnable">
                            @for (level of mcpLevels; track level) {
                            <mat-option [value]="level">{{ mcpLevelLabels[level] }}</mat-option>
                            }
                        </mat-select>
                    </mat-form-field>
                </app-settings-row>

                <app-settings-row label="TV.settings_mcp_token" desc="TV.settings_mcp_token_desc">
                    <div class="mcp-token">
                        <code>{{ c.mcpToken || '—' }}</code>
                        <button mat-stroked-button type="button" [disabled]="!c.mcpEnable" (click)="resetToken()">
                            <mat-icon>refresh</mat-icon>
                            {{ 'TV.settings_mcp_token_reset' | translate }}
                        </button>
                    </div>
                </app-settings-row>

                <app-settings-row label="TV.settings_mcp_endpoint">
                    <div class="mcp-token">
                        <code>{{ endpoint }}</code>
                        <button mat-stroked-button type="button" (click)="copy(clientConfig())">
                            <mat-icon>content_copy</mat-icon>
                            {{ 'TV.settings_mcp_copy_client' | translate }}
                        </button>
                    </div>
                </app-settings-row>

                <app-settings-row label="TV.settings_mcp_notice" desc="TV.settings_mcp_notice_desc">
                    <mat-slide-toggle [(ngModel)]="c.mcpShowNotice" (change)="save()"
                                      [disabled]="!c.mcpEnable"></mat-slide-toggle>
                </app-settings-row>
            </app-settings-section>

            <app-settings-section label="TV.ui_python_service">
                <app-settings-row label="TV.ui_python_service" desc="TV.settings_cast_script_desc"></app-settings-row>
                <div class="s-card-body s-embed">
                    <app-services></app-services>
                </div>
            </app-settings-section>
        </app-settings-page>
    `,
    host: {
        'animate.enter': 'enter',
        'animate.leave': 'leave'
    }
})
export class CastComponent extends SettingsPageBase {
    private snackBar = inject(MatSnackBar);
    private platformId = inject(PLATFORM_ID);

    mcpLevels = Object.values(McpPermissionLevel);
    mcpLevelLabels = McpPermissionLevelLabels;

    /** 预渲染时没有 location，回落到相对路径；浏览器里就是设备的局域网地址 */
    get endpoint(): string {
        const origin = isPlatformBrowser(this.platformId) ? location.origin : '';
        return `${origin}/mcp`;
    }

    /** 面板自己的地址就是设备地址，客户端直接照抄 */
    clientConfig(): string {
        return JSON.stringify(
            {
                mcpServers: {
                    mytv: {
                        url: this.endpoint,
                        headers: { Authorization: `Bearer ${this.c.mcpToken || '<token>'}` },
                    },
                },
            },
            null,
            2,
        );
    }

    toggleMcp(enabled: boolean): void {
        // 开启时若还没有令牌就生成：与 App 侧 ensureMcpToken 的行为一致
        if (enabled && !this.c.mcpToken) {
            this.c.mcpToken = randomToken();
        }
        this.save();
    }

    resetToken(): void {
        this.c.mcpToken = randomToken();
        this.save();
        this.snackBar.open('OK', undefined, { duration: 1500 });
    }

    copy(text: string): void {
        navigator.clipboard.writeText(text);
        this.snackBar.open('OK', undefined, { duration: 1500 });
    }
}

/** 32 位 URL-safe 随机串，与 App 侧生成规则一致（24 字节 base64url） */
function randomToken(): string {
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    return btoa(String.fromCharCode(...bytes))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}
