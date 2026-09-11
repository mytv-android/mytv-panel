import { Component, effect, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ConfigsService, AppConfigs, VideoPlayerCore, VideoPlayerRenderMode, VideoPlayerDisplayMode, VideoPlayerSeekToMode, RtspTransport, VideoPlayerDecoderConfig, VideoPlayerDecoderConfigs, AudioBalanceLevel, ASRMode, AudioBalanceLevelLabels, ASRModeLabels, ASRTranslationEngine, ASRTranslationEngineLabels, VideoPlayerFrameRateFallback, VideoPlayerFrameRateFallbackLabels, ASRVadType, ASRVadTypeLabels, VideoPlayerSuperResolutionMode, VideoPlayerFrameInterpolationMode, VideoPlayerInterpolationTargetFps, VideoPlayerAiExecutionBackend } from '../api';
import { TextareaWithLinesComponent } from '../common/textarea-with-lines/textarea-with-lines.component';

@Component({
    selector: 'app-player',
    standalone: true,
    imports: [
        FormsModule,
        MatCardModule,
        MatSlideToggleModule,
        MatSelectModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatButtonToggleModule,
        MatSnackBarModule,
        TranslateModule,
        TextareaWithLinesComponent
    ],
    templateUrl: './player.component.html',
    styleUrl: './player.component.css',
    host: {
        'animate.enter': 'enter',
        'animate.leave': 'leave'
    }
})
export class PlayerComponent {
    configsService = inject(ConfigsService);
    snackBar = inject(MatSnackBar);
    translate = inject(TranslateService);
    breakpointObserver = inject(BreakpointObserver);
    configs: AppConfigs = {};

    videoPlayerCores = Object.values(VideoPlayerCore);
    videoPlayerRenderModes = Object.values(VideoPlayerRenderMode);
    videoPlayerDisplayModes = Object.values(VideoPlayerDisplayMode);
    videoPlayerSeekToModes = Object.values(VideoPlayerSeekToMode);
    rtspTransports = Object.values(RtspTransport);
    videoPlayerDecoderConfigs = Object.values(VideoPlayerDecoderConfig).filter(v => typeof v === 'number');
    audioBalanceLevels = Object.values(AudioBalanceLevel);
    audioBalanceLevelLabels = AudioBalanceLevelLabels;
    asrModes = Object.values(ASRMode);
    asrModeLabels = ASRModeLabels;
    asrTranslationEngines = Object.values(ASRTranslationEngine);
    asrTranslationEngineLabels = ASRTranslationEngineLabels;
    asrTranslationEngine = ASRTranslationEngine;
    frameRateFallbacks = Object.values(VideoPlayerFrameRateFallback);
    frameRateFallbackLabels = VideoPlayerFrameRateFallbackLabels;
    superResolutionModes = Object.values(VideoPlayerSuperResolutionMode);
    frameInterpolationModes = Object.values(VideoPlayerFrameInterpolationMode);
    interpolationTargetFps = Object.values(VideoPlayerInterpolationTargetFps);
    aiExecutionBackends = Object.values(VideoPlayerAiExecutionBackend);
    asrVadTypes = Object.values(ASRVadType);
    asrVadTypeLabels = ASRVadTypeLabels;
    isSmallScreen = false;

    constructor() {
        effect(() => {
            this.configs = this.configsService.data();
            if (this.configs.globalVideoPlayerSuperResolutionMode === undefined) {
                this.configs.globalVideoPlayerSuperResolutionMode = this.configs.globalVideoPlayerSuperResolution
                    ? VideoPlayerSuperResolutionMode.GPU_SPATIAL
                    : VideoPlayerSuperResolutionMode.OFF;
            }
            if (this.configs.globalVideoPlayerFrameInterpolationMode === undefined) {
                this.configs.globalVideoPlayerFrameInterpolationMode = this.configs.globalVideoPlayerFrameInterpolation
                    ? VideoPlayerFrameInterpolationMode.GPU_BLEND
                    : VideoPlayerFrameInterpolationMode.OFF;
            }
            if (this.configs.globalVideoPlayerInterpolationTargetFps === undefined) {
                this.configs.globalVideoPlayerInterpolationTargetFps = VideoPlayerInterpolationTargetFps.AUTO;
            }
            if (this.configs.globalVideoPlayerAiExecutionBackend === undefined) {
                this.configs.globalVideoPlayerAiExecutionBackend = VideoPlayerAiExecutionBackend.AUTO;
            }
        });
        this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Small, '(max-width: 600px)'])
            .subscribe(result => {
                this.isSmallScreen = result.matches;
            });
    }

    updateConfig(): Promise<void> {
        return this.configsService.updateData(this.configs);
    }

    async saveAsr() {
        try {
            await this.updateConfig();
            this.snackBar.open(this.translate.instant('PLAYER.ASR_SAVED'), undefined, { duration: 3000 });
        } catch {
            this.snackBar.open(this.translate.instant('PLAYER.ASR_SAVE_FAILED'), undefined, { duration: 3000 });
        }
    }

    addDecoderConfig() {
        if (!this.configs.videoPlayerDecoderConfigRegexList) {
            this.configs.videoPlayerDecoderConfigRegexList = { list: [] };
        }
        if (!this.configs.videoPlayerDecoderConfigRegexList.list) {
            this.configs.videoPlayerDecoderConfigRegexList.list = [];
        }
        this.configs.videoPlayerDecoderConfigRegexList.list.push({
            pattern: '',
            core: VideoPlayerCore.MEDIA3,
            forceSoftDecode: false
        });
        this.updateConfig();
    }

    removeDecoderConfig(index: number) {
        if (this.configs.videoPlayerDecoderConfigRegexList?.list) {
            this.configs.videoPlayerDecoderConfigRegexList.list.splice(index, 1);
            this.updateConfig();
        }
    }

    addProxyRule() {
        if (!this.configs.videoPlayerProxyRuleList) {
            this.configs.videoPlayerProxyRuleList = { list: [] };
        }
        if (!this.configs.videoPlayerProxyRuleList.list) {
            this.configs.videoPlayerProxyRuleList.list = [];
        }
        this.configs.videoPlayerProxyRuleList.list.push({
            pattern: '',
            proxy: ''
        });
        this.updateConfig();
    }

    removeProxyRule(index: number) {
        if (this.configs.videoPlayerProxyRuleList?.list) {
            this.configs.videoPlayerProxyRuleList.list.splice(index, 1);
            this.updateConfig();
        }
    }
}
