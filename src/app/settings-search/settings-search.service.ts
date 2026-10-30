import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { SettingsSearchDialogComponent } from './settings-search-dialog.component';
import { SettingsSearchEntry } from './settings-search.index';

/** 打开设置搜索弹窗；选中后跳到对应页面并高亮该设置行。 */
@Injectable({ providedIn: 'root' })
export class SettingsSearchService {
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private platformId = inject(PLATFORM_ID);
  private highlightTimer?: ReturnType<typeof setTimeout>;

  open(): void {
    if (this.dialog.openDialogs.length) return;
    this.dialog
      .open<SettingsSearchDialogComponent, unknown, SettingsSearchEntry>(SettingsSearchDialogComponent, {
        width: '560px',
        maxWidth: '92vw',
        autoFocus: 'dialog',
      })
      .afterClosed()
      .subscribe(entry => {
        if (!entry) return;
        this.router.navigate([entry.route]).then(() => this.highlight(entry.labelKey));
      });
  }

  /** 页面行没有锚点，用当前语言的行标题文本找目标行；异步加载的页面最多等 1.5s。 */
  private highlight(labelKey: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const label = this.translate.instant(labelKey);
    const startedAt = Date.now();
    const tick = () => {
      const row = Array.from(
        document.querySelectorAll<HTMLElement>('.setting-item, .setting-block, .slider-container')
      ).find(element => (element.textContent || '').trim().startsWith(label));
      if (row) {
        const pin = () => row.scrollIntoView({ block: 'center' });
        pin();
        // 页面数据加载后行高可能变化，再补一次定位
        setTimeout(pin, 350);
        row.classList.add('is-search-hit');
        if (this.highlightTimer) clearTimeout(this.highlightTimer);
        this.highlightTimer = setTimeout(() => row.classList.remove('is-search-hit'), 2400);
      } else if (Date.now() - startedAt < 1500) {
        setTimeout(tick, 50);
      }
    };
    setTimeout(tick, 0);
  }
}
