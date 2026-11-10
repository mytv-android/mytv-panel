import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
    VideoPlayerCore, VideoPlayerRenderMode, VideoPlayerDisplayMode, VideoPlayerSeekToMode, RtspTransport,
    AudioBalanceLevel, VideoPlayerFrameRateFallback, WebViewCore,
} from '../api';
import { SETTINGS_UI, SettingsPageBase, humanizeMs, optionsWith } from '../settings-ui/settings-ui';

const SECOND = 1000;
/** 与 App 相同的取值：加载超时 1~60 秒、停滞重试 关闭/3~60 秒、起播前缓冲 0~10 秒逐秒再到 60 秒 */
const LOAD_TIMEOUTS = [1, 2, 3, 4, 5, 10, 15, 20, 25, 30, 45, 60].map(s => s * SECOND);
const STALL_RETRIES = [0, 3, 5, 8, 10, 15, 20, 30, 45, 60].map(s => s * SECOND);
const BUFFER_TIMES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30, 45, 60].map(s => s * SECOND);

/** 播放：常用、播不了或卡顿时、离开播放页时、网页源；高级里是解码与渲染细项 */
@Component({
    selector: 'app-player',
    imports: [
        FormsModule,
        MatSlideToggleModule,
        MatSelectModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatButtonToggleModule,
        TranslateModule,
        ...SETTINGS_UI,
    ],
    templateUrl: './player.component.html',
    host: {
        'animate.enter': 'enter',
        'animate.leave': 'leave'
    }
})
export class PlayerComponent extends SettingsPageBase {
    translate = inject(TranslateService);

    core = VideoPlayerCore;
    cores = Object.values(VideoPlayerCore);
    coreLabels: Record<VideoPlayerCore, string> = { MEDIA3: 'Media3', IJK: 'IJK', VLC: 'VLC', FS: 'FSPlayer', MPV: 'MPV' };
    displayModes = Object.values(VideoPlayerDisplayMode);
    displayModeLabels: Record<VideoPlayerDisplayMode, string> = {
        ORIGINAL: 'TV.settings_choice_display_original',
        FILL: 'TV.settings_choice_display_fill',
        CROP: 'TV.settings_choice_display_crop',
        FOUR_THREE: '4:3',
        SIXTEEN_NINE: '16:9',
        WIDE: '2.35:1',
    };
    balanceLevels = Object.values(AudioBalanceLevel);
    balanceLevelLabels: Record<AudioBalanceLevel, string> = {
        Off: 'TV.ui_player_view_volume_balance_level_off',
        Low: 'TV.ui_player_view_volume_balance_level_low',
        Medium: 'TV.ui_player_view_volume_balance_level_medium',
        High: 'TV.ui_player_view_volume_balance_level_high',
    };
    bufferPresets = [0, 2 * SECOND, 10 * SECOND];
    bufferPresetLabels = ['TV.settings_buffer_preset_fastest', 'TV.settings_buffer_preset_balanced', 'TV.settings_buffer_preset_smooth'];
    renderModes = Object.values(VideoPlayerRenderMode);
    renderModeLabels: Record<VideoPlayerRenderMode, string> = {
        SURFACE_VIEW: 'SurfaceView',
        TEXTURE_VIEW: 'TextureView',
        GL_SURFACE_VIEW: 'GLSurfaceView',
    };
    frameRateFallbacks = Object.values(VideoPlayerFrameRateFallback);
    frameRateFallbackLabels: Record<VideoPlayerFrameRateFallback, string> = {
        SYSTEM_DEFAULT: 'TV.ui_player_view_frame_rate_fallback_system',
        HZ_50: 'TV.ui_player_view_frame_rate_fallback_50',
        HZ_59_94: 'TV.ui_player_view_frame_rate_fallback_59_94',
        HZ_60: 'TV.ui_player_view_frame_rate_fallback_60',
    };
    seekToMode = VideoPlayerSeekToMode;
    rtspTransports = Object.values(RtspTransport);
    webViewCore = WebViewCore;
    webViewLoadingStyleLabels = ['TV.ui_webview_loading_style_normal', 'TV.ui_webview_loading_style_percent', 'TV.ui_webview_loading_style_black'];
    webViewResolutionLabels = ['TV.ui_webview_resolution_auto', 'TV.ui_webview_resolution_full', 'TV.ui_webview_resolution_p75', 'TV.ui_webview_resolution_p50'];
    webViewUaPresetLabels = ['TV.ui_webview_ua_system', 'TV.ui_webview_ua_windows', 'TV.ui_webview_ua_macos', 'TV.ui_webview_ua_ipad'];
    webViewLayerAccelLabels = ['TV.ui_webview_layer_off', 'TV.ui_webview_layer_hardware', 'TV.ui_webview_layer_software'];

    humanizeMs = humanizeMs;

    get loadTimeoutOptions(): number[] {
        return optionsWith(LOAD_TIMEOUTS, this.c.videoPlayerLoadTimeout);
    }

    get webViewLoadTimeoutOptions(): number[] {
        return optionsWith(LOAD_TIMEOUTS, this.c.webViewLoadTimeout);
    }

    get stallRetryOptions(): number[] {
        return optionsWith(STALL_RETRIES, this.c.videoPlayerStallRetryTimeout);
    }

    get bufferTimeOptions(): number[] {
        return optionsWith(BUFFER_TIMES, this.c.videoPlayerBufferTime);
    }

    stallRetryLabel(ms: number): string {
        return ms <= 0 ? this.translate.instant('TV.ui_player_view_stall_retry_off') : humanizeMs(ms);
    }

    bufferTimeLabel(ms: number): string {
        if (ms <= 0) return this.translate.instant('TV.settings_player_buffer_none');
        if (ms % SECOND === 0) return this.translate.instant('TV.settings_value_seconds', { p1: ms / SECOND });
        return humanizeMs(ms);
    }

    /** 画中画与后台播放互斥（与 App 相同） */
    onPipChange() {
        if (this.c.appPipEnable) this.c.appBackgroundPlayEnable = false;
        this.save();
    }

    onBackgroundPlayChange() {
        if (this.c.appBackgroundPlayEnable) this.c.appPipEnable = false;
        this.save();
    }

    addDecoderConfig() {
        const list = this.c.videoPlayerDecoderConfigRegexList?.list ?? [];
        this.c.videoPlayerDecoderConfigRegexList = {
            list: [...list, { pattern: '', core: VideoPlayerCore.MEDIA3, forceSoftDecode: false }],
        };
        this.save();
    }

    removeDecoderConfig(index: number) {
        const list = [...(this.c.videoPlayerDecoderConfigRegexList?.list ?? [])];
        list.splice(index, 1);
        this.c.videoPlayerDecoderConfigRegexList = { list };
        this.save();
    }
}
