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

  /**
   * 页面行没有锚点，用当前语言的行标题文本找目标行；异步加载的页面最多等 1.5s。
   * 分类页的行是 .s-row（标题在 .s-row-title 第一个 span），嵌入的旧组件和展开细项仍是 .setting-item / .setting-block。
   * 目标在收起的「高级设置」卡片里时先展开它。
   */
  private highlight(labelKey: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const label = this.translate.instant(labelKey);
    const startedAt = Date.now();
    const titleOf = (element: HTMLElement) =>
      (element.querySelector(':scope > .s-row-text > .s-row-title > span')?.textContent
        ?? element.querySelector(':scope > .setting-label > span, :scope > span')?.textContent
        ?? element.textContent ?? '').trim();
    const tick = () => {
      const row = Array.from(
        document.querySelectorAll<HTMLElement>('.s-row, .setting-item, .setting-block, .slider-container')
      ).find(element => titleOf(element) === label);
      if (row) {
        const advanced = row.closest('.s-adv-body');
        if (advanced?.hasAttribute('hidden')) {
          advanced.closest('.s-adv')?.querySelector<HTMLElement>('.s-adv-toggle')?.click();
        }
        const pin = () => row.scrollIntoView({ block: 'center' });
        // 展开高级设置后要等一帧才有布局
        setTimeout(pin, 0);
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
