import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslateModule } from '@ngx-translate/core';
import { ConfigsService } from '../api';

@Component({
  selector: 'app-debug',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatSlideToggleModule, TranslateModule],
  templateUrl: './debug.component.html',
  styleUrl: './debug.component.css'
})
export class DebugComponent {
  configs = inject(ConfigsService);

  async toggleShowFps() {
    const current = this.configs.data().debugShowFps;
    await this.configs.updateData({ ...this.configs.data(), debugShowFps: !current });
  }

  async toggleShowVideoPlayerMetadata() {
    const current = this.configs.data().debugShowVideoPlayerMetadata;
    await this.configs.updateData({ ...this.configs.data(), debugShowVideoPlayerMetadata: !current });
  }

  async toggleShowLayoutGrids() {
    const current = this.configs.data().debugShowLayoutGrids;
    await this.configs.updateData({ ...this.configs.data(), debugShowLayoutGrids: !current });
  }
}
