import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SETTINGS_SEARCH_INDEX, SettingsSearchEntry } from './settings-search.index';

interface SettingsSearchGroup {
  pageKey: string;
  items: SettingsSearchEntry[];
}

@Component({
  selector: 'app-settings-search-dialog',
  standalone: true,
  imports: [FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatIconModule, TranslateModule],
  templateUrl: './settings-search-dialog.component.html',
  styleUrl: './settings-search-dialog.component.css'
})
export class SettingsSearchDialogComponent implements AfterViewInit {
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  query = '';
  groups: SettingsSearchGroup[] = [];
  flat: SettingsSearchEntry[] = [];
  selected = 0;

  constructor(
    public dialogRef: MatDialogRef<SettingsSearchDialogComponent, SettingsSearchEntry>,
    private translate: TranslateService,
  ) {
    this.update();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.searchInput?.nativeElement.focus());
  }

  onQueryChange(value: string): void {
    this.query = value;
    this.selected = 0;
    this.update();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (this.flat.length) this.selected = Math.min(this.flat.length - 1, this.selected + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (this.flat.length) this.selected = Math.max(0, this.selected - 1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const entry = this.flat[this.selected];
      if (entry) this.choose(entry);
    }
  }

  isSelected(entry: SettingsSearchEntry): boolean {
    return this.flat[this.selected] === entry;
  }

  choose(entry: SettingsSearchEntry): void {
    this.dialogRef.close(entry);
  }

  private update(): void {
    const query = this.normalize(this.query);
    const groups = new Map<string, SettingsSearchEntry[]>();
    for (const entry of SETTINGS_SEARCH_INDEX) {
      const label = this.normalize(this.translate.instant(entry.labelKey));
      const desc = entry.descKey ? this.normalize(this.translate.instant(entry.descKey)) : '';
      const page = this.normalize(this.translate.instant(entry.pageKey));
      if (!query || label.includes(query) || desc.includes(query) || page.includes(query)) {
        const items = groups.get(entry.pageKey) ?? [];
        items.push(entry);
        groups.set(entry.pageKey, items);
      }
    }
    this.groups = Array.from(groups, ([pageKey, items]) => ({ pageKey, items }));
    this.flat = this.groups.flatMap(group => group.items);
    if (this.selected >= this.flat.length) {
      this.selected = Math.max(0, this.flat.length - 1);
    }
  }

  private normalize(value: string): string {
    return (value || '').toLowerCase().replace(/\s+/g, '');
  }
}
