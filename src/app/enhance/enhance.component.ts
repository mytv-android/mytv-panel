import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
    ASRMode, ASRTranslationEngine, ASRVadType, ASRVadTypeLabels, ASRTranslationColors,
    VideoPlayerSuperResolutionMode, VideoPlayerFrameInterpolationMode, VideoPlayerInterpolationTargetFps,
    VideoPlayerAiExecutionBackend,
} from '../api';
import { SETTINGS_UI, SettingsPageBase, optionsWith } from '../settings-ui/settings-ui';

/** 字幕与画质：AI 实时字幕、字幕翻译（App 里是子页，网页面板直接展开）；画质增强 */
@Component({
    selector: 'app-enhance',
    imports: [
        FormsModule,
        MatSlideToggleModule,
        MatSelectModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSnackBarModule,
        TranslateModule,
        ...SETTINGS_UI,
    ],
    templateUrl: './enhance.component.html',
    styleUrl: './enhance.component.css',
    host: {
        'animate.enter': 'enter',
        'animate.leave': 'leave'
    }
})
export class EnhanceComponent extends SettingsPageBase {
    snackBar = inject(MatSnackBar);
    translate = inject(TranslateService);

    engine = ASRTranslationEngine;
    engines = Object.values(ASRTranslationEngine);
    engineLabels: Record<ASRTranslationEngine, string> = {
        '': 'TV.ui_player_view_asr_translation_not_configured',
        tencent: 'TV.ui_player_view_asr_translation_engine_tencent',
        baidu: 'TV.ui_player_view_asr_translation_engine_baidu',
        mtranserver: 'TV.ui_player_view_asr_translation_engine_mtranserver',
        youdao: 'TV.ui_player_view_asr_translation_engine_youdao',
        google: 'TV.ui_player_view_asr_translation_engine_google',
        microsoft: 'TV.ui_player_view_asr_translation_engine_microsoft',
    };
    /** 与 App 相同：各语言用自己的写法，不随界面语言翻译 */
    targetLangs: [string, string][] = [
        ['en', 'English'], ['zh', '中文'], ['ja', '日本語'], ['ko', '한국어'], ['fr', 'Français'], ['de', 'Deutsch'],
        ['es', 'Español'], ['ru', 'Русский'], ['pt', 'Português'], ['it', 'Italiano'], ['th', 'ไทย'],
        ['vi', 'Tiếng Việt'], ['id', 'Bahasa Indonesia'], ['ms', 'Bahasa Melayu'], ['ar', 'العربية'], ['yue', '粤语'],
    ];
    vadTypes = Object.values(ASRVadType);
    vadTypeLabels = ASRVadTypeLabels;
    translationColors = ASRTranslationColors;

    superResolutionModes = Object.values(VideoPlayerSuperResolutionMode);
    superResolutionLabels: { [mode: string]: string | undefined } = {
        OFF: 'TV.ui_player_view_super_resolution_mode_off',
        ANIME4K: 'TV.ui_player_view_super_resolution_mode_anime4k',
        GPU_FSR: 'TV.ui_player_view_super_resolution_mode_fsr',
        SGSR1: 'TV.ui_player_view_super_resolution_mode_sgsr1',
        SGSR2: 'TV.ui_player_view_super_resolution_mode_sgsr2',
        ARM_ASR: 'TV.ui_player_view_super_resolution_mode_arm_asr',
        AI_LITE: 'TV.ui_player_view_super_resolution_mode_ai_lite',
        REAL_ESRGAN_VULKAN: 'TV.ui_player_view_super_resolution_mode_real_esrgan_vulkan',
        // App 里旧版取值显示为「关闭」
        LEGACY_REAL_ESRGAN: 'TV.ui_player_view_super_resolution_mode_off',
    };
    interpolationModes = Object.values(VideoPlayerFrameInterpolationMode);
    interpolationLabels: { [mode: string]: string | undefined } = {
        OFF: 'TV.ui_player_view_frame_interpolation_mode_off',
        GPU_BLEND: 'TV.ui_player_view_frame_interpolation_mode_gpu',
        RIFE_VULKAN: 'TV.ui_player_view_frame_interpolation_mode_rife_vulkan',
        LEGACY_RIFE: 'TV.ui_player_view_frame_interpolation_mode_off',
    };
    targetFpsList = Object.values(VideoPlayerInterpolationTargetFps);
    targetFpsLabels: Record<VideoPlayerInterpolationTargetFps, string> = {
        AUTO: 'TV.ui_player_view_interpolation_target_fps_auto',
        FPS_30: 'TV.ui_player_view_interpolation_target_fps_30',
        FPS_50: 'TV.ui_player_view_interpolation_target_fps_50',
        FPS_60: 'TV.ui_player_view_interpolation_target_fps_60',
        FPS_120: 'TV.ui_player_view_interpolation_target_fps_120',
    };
    aiBackends = Object.values(VideoPlayerAiExecutionBackend);
    aiBackendLabels: Record<VideoPlayerAiExecutionBackend, string> = {
        AUTO: 'TV.ui_player_view_ai_execution_backend_auto',
        NNAPI: 'TV.ui_player_view_ai_execution_backend_nnapi',
        CPU: 'TV.ui_player_view_ai_execution_backend_cpu',
    };

    get superResolutionOptions(): string[] {
        return optionsWith<string>(this.superResolutionModes, this.c.globalVideoPlayerSuperResolutionMode);
    }

    get interpolationOptions(): string[] {
        return optionsWith<string>(this.interpolationModes, this.c.globalVideoPlayerFrameInterpolationMode);
    }

    /** App 的「实验性领先字幕」开关：开 = SOURCE_TAP_PREFERRED，关 = RENDERER_ONLY */
    get leadingSubtitles(): boolean {
        return this.c.videoPlayerASRMode === ASRMode.SOURCE_TAP_PREFERRED;
    }

    set leadingSubtitles(on: boolean) {
        this.c.videoPlayerASRMode = on ? ASRMode.SOURCE_TAP_PREFERRED : ASRMode.RENDERER_ONLY;
    }

    /** 识别与翻译的细项改完统一点保存，避免每输入一个字符就让设备端重启识别 */
    async saveAsr() {
        try {
            await this.save();
            this.snackBar.open(this.translate.instant('PLAYER.ASR_SAVED'), undefined, { duration: 3000 });
        } catch {
            this.snackBar.open(this.translate.instant('PLAYER.ASR_SAVE_FAILED'), undefined, { duration: 3000 });
        }
    }
}
