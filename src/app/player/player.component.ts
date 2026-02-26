import { Component, inject, effect } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { ConfigsService, AppConfigs, VideoPlayerCore, VideoPlayerRenderMode, VideoPlayerDisplayMode, VideoPlayerSeekToMode, RtspTransport, VideoPlayerDecoderConfig, VideoPlayerDecoderConfigs } from '../api';
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
    TranslateModule,
    TextareaWithLinesComponent
],
    templateUrl: './player.component.html',
    styleUrl: './player.component.css'
})
export class PlayerComponent {
    configsService = inject(ConfigsService);
    configs: AppConfigs = {};

    videoPlayerCores = Object.values(VideoPlayerCore);
    videoPlayerRenderModes = Object.values(VideoPlayerRenderMode);
    videoPlayerDisplayModes = Object.values(VideoPlayerDisplayMode);
    videoPlayerSeekToModes = Object.values(VideoPlayerSeekToMode);
    rtspTransports = Object.values(RtspTransport);
    videoPlayerDecoderConfigs = Object.values(VideoPlayerDecoderConfig).filter(v => typeof v === 'number');

    constructor() {
        effect(() => {
            this.configs = this.configsService.data();
        });
    }

    updateConfig() {
        this.configsService.updateData(this.configs);
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
}
