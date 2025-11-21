import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class CustomPaginatorIntl extends MatPaginatorIntl {
  constructor(private translate: TranslateService) {
    super();
    this.translate.onLangChange.subscribe(() => {
      this.getTranslations();
    });
    this.getTranslations();
  }

  rangeLabelIntl: string = '{{start}} - {{end}} / {{length}}';

  getTranslations() {
    this.translate.get([
      'LOG.ITEMS_PER_PAGE',
      'LOG.NEXT_PAGE',
      'LOG.PREV_PAGE',
      'LOG.FIRST_PAGE',
      'LOG.LAST_PAGE',
      'LOG.RANGE_LABEL'
    ]).subscribe(translations => {
      this.itemsPerPageLabel = translations['LOG.ITEMS_PER_PAGE'];
      this.nextPageLabel = translations['LOG.NEXT_PAGE'];
      this.previousPageLabel = translations['LOG.PREV_PAGE'];
      this.firstPageLabel = translations['LOG.FIRST_PAGE'];
      this.lastPageLabel = translations['LOG.LAST_PAGE'];
      this.rangeLabelIntl = translations['LOG.RANGE_LABEL'];
      this.changes.next();
    });
  }

  override getRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length === 0 || pageSize === 0) {
      return this.rangeLabelIntl
        .replace('{{start}}', '0')
        .replace('{{end}}', '0')
        .replace('{{length}}', '0');
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
    return this.rangeLabelIntl
        .replace('{{start}}', (startIndex + 1).toString())
        .replace('{{end}}', endIndex.toString())
        .replace('{{length}}', length.toString());
  };
}
