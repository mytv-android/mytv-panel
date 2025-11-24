import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { ConfigsService, AppApi } from '../api';

@Component({
  selector: 'app-debug',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatSlideToggleModule, MatIconModule, TranslateModule],
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

  async exportData() {
    try {
      const data = await AppApi.getLogcat();
      const blob = new Blob([data], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;

      // 使用时间戳生成唯一文件名
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.download = `logcat_${timestamp}.txt`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 释放 URL 对象
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }
}
