import { Component, inject, effect, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppApi, FileEntry } from '../api';

/** 文件页「使用」选中项时，把路径暂存到 sessionStorage 供首页订阅源表单读取 */
export const FILE_PICKER_KEY = 'mytv-file-picker-path';

@Component({
    selector: 'app-file',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSnackBarModule,
        MatTooltipModule,
        TranslateModule,
    ],
    templateUrl: './file.component.html',
    styleUrl: './file.component.css',
    host: {
        'animate.enter': 'enter',
        'animate.leave': 'leave'
    }
})
export class FileComponent {
    private snackBar = inject(MatSnackBar);
    private translate = inject(TranslateService);
    private router = inject(Router);

    currentPath = '';
    parentPath: string | null = null;
    entries: FileEntry[] = [];
    loading = false;

    sortKey: 'name' | 'size' | 'mtime' = 'name';
    sortAsc = true;

    newFolderName = '';
    renamingEntry: FileEntry | null = null;
    renameValue = '';
    deletingEntry: FileEntry | null = null;
    uploadTarget = '';

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
        effect(() => {
            if (isPlatformBrowser(this.platformId)) {
                this.load('');
            }
        });
    }

    get sortedEntries(): FileEntry[] {
        const dirs = this.entries.filter(e => e.isDir);
        const files = this.entries.filter(e => !e.isDir);
        const sortFn = (a: FileEntry, b: FileEntry) => {
            let ret = 0;
            if (this.sortKey === 'name') {
                ret = a.name.localeCompare(b.name);
            } else if (this.sortKey === 'size') {
                ret = a.size - b.size;
            } else {
                ret = a.mtime - b.mtime;
            }
            return this.sortAsc ? ret : -ret;
        };
        return [...dirs.sort(sortFn), ...files.sort(sortFn)];
    }

    get breadcrumbs(): { name: string, path: string }[] {
        if (!this.currentPath) return [];
        const parts = this.currentPath.split('/').filter(p => p.length > 0);
        const crumbs: { name: string, path: string }[] = [];
        let acc = '';
        for (const part of parts) {
            acc += '/' + part;
            crumbs.push({ name: part, path: acc });
        }
        return crumbs;
    }

    sortBy(key: 'name' | 'size' | 'mtime') {
        if (this.sortKey === key) {
            this.sortAsc = !this.sortAsc;
        } else {
            this.sortKey = key;
            this.sortAsc = true;
        }
    }

    async load(path: string) {
        this.loading = true;
        this.newFolderName = '';
        this.renamingEntry = null;
        this.renameValue = '';
        this.deletingEntry = null;
        try {
            const result = await AppApi.getFileList(path);
            this.currentPath = result.data?.path ?? path;
            this.parentPath = result.data?.parent ?? null;
            this.entries = result.data?.entries ?? [];
        } catch (e) {
            console.error(e);
            this.showError(e);
        } finally {
            this.loading = false;
        }
    }

    open(entry: FileEntry) {
        if (!entry.isDir) return;
        this.load(this.join(entry.name));
    }

    up() {
        if (this.parentPath) {
            this.load(this.parentPath);
        }
    }

    private join(name: string): string {
        return this.currentPath.replace(/\/+$/, '') + '/' + name;
    }

    async createFolder() {
        const name = this.newFolderName.trim();
        if (!name) return;
        try {
            await AppApi.createFileDir(this.join(name));
            this.showSuccess('FILE.CREATE_SUCCESS');
            await this.load(this.currentPath);
        } catch (e) {
            console.error(e);
            this.showError(e);
        }
    }

    startRename(entry: FileEntry) {
        this.renamingEntry = entry;
        this.renameValue = entry.name;
        this.deletingEntry = null;
    }

    cancelRename() {
        this.renamingEntry = null;
        this.renameValue = '';
    }

    async confirmRename() {
        const entry = this.renamingEntry;
        const newName = this.renameValue.trim();
        if (!entry || !newName || newName === entry.name) {
            this.cancelRename();
            return;
        }
        try {
            await AppApi.renameFile(this.join(entry.name), newName);
            this.showSuccess('HOME.UPDATE_SUCCESS');
            await this.load(this.currentPath);
        } catch (e) {
            console.error(e);
            this.showError(e);
        }
    }

    startDelete(entry: FileEntry) {
        this.deletingEntry = entry;
        this.renamingEntry = null;
    }

    cancelDelete() {
        this.deletingEntry = null;
    }

    async confirmDelete() {
        const entry = this.deletingEntry;
        if (!entry) return;
        try {
            await AppApi.deleteFile(this.join(entry.name));
            this.showSuccess('HOME.DELETE_SUCCESS');
            await this.load(this.currentPath);
        } catch (e) {
            console.error(e);
            this.showError(e);
        }
    }

    async onUploadSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input || !input.files || input.files.length === 0) return;
        const file = input.files[0];
        this.uploadTarget = file.name;
        try {
            await AppApi.uploadFile(this.join(file.name), file);
            this.showSuccess('FILE.UPLOAD_SUCCESS');
            await this.load(this.currentPath);
        } catch (e) {
            console.error(e);
            this.showError(e);
        } finally {
            this.uploadTarget = '';
            input.value = '';
        }
    }

    /** 把选中文件路径写入首页订阅源地址输入框，供「本地文件」类型订阅源直接使用 */
    use(entry: FileEntry) {
        if (entry.isDir) return;
        sessionStorage.setItem(FILE_PICKER_KEY, this.join(entry.name));
        this.router.navigateByUrl('/');
    }

    formatSize(size: number): string {
        if (size <= 0) return '-';
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let value = size;
        let unit = 0;
        while (value >= 1024 && unit < units.length - 1) {
            value /= 1024;
            unit++;
        }
        return `${value.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
    }

    formatTime(mtime: number): string {
        if (mtime <= 0) return '-';
        const d = new Date(mtime);
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

    private showSuccess(key: string) {
        this.snackBar.open(this.translate.instant(key), this.translate.instant('HOME.CLOSE'), { duration: 3000 });
    }

    private showError(e: unknown) {
        const message = (e as { error?: { message?: string } })?.error?.message;
        this.snackBar.open(
            message || this.translate.instant('FILE.OPERATION_FAILED'),
            this.translate.instant('HOME.CLOSE'),
            { duration: 3000 }
        );
    }
}
