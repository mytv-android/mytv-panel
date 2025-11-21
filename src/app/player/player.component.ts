import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { ConfigsService, AppConfigs, VideoPlayerCore, VideoPlayerRenderMode, VideoPlayerDisplayMode, VideoPlayerSeekToMode, RtspTransport } from '../api';
import { TextareaWithLinesComponent } from '../common/textarea-with-lines/textarea-with-lines.component';

@Component({
    selector: 'app-player',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatSlideToggleModule,
        MatSelectModule,
        MatFormFieldModule,
        MatInputModule,
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

    constructor() {
        effect(() => {
            this.configs = this.configsService.data();
        });
    }

    updateConfig() {
        this.configsService.updateData(this.configs);
    }
}
