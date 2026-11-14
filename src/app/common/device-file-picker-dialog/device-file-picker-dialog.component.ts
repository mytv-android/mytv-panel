import { Component, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppApi, DeviceFileRoot, DeviceFileSelection, FileEntry, FileListResult } from '../../api';

export type { DeviceFileSelection } from '../../api';
export type DeviceFilePickerMode = 'file' | 'directory' | 'any';

export interface DeviceFilePickerData {
    mode: DeviceFilePickerMode;
    initialPath?: string;
}

/** Android Uri.fromFile 等价形式：逐段编码，保留路径分隔符。 */
export function filePathToUri(path: string): string {
    const encoded = path.replace(/^\/+/, '').split('/').map(segment => encodeURIComponent(segment)).join('/');
    return `file:///${encoded}`;
}

/** 云同步目录以 / 结尾，文件不保留末尾 /；类型只认 select API 的返回值。 */
export function formatDirectorySelection(selection: DeviceFileSelection): string {
    const path = selection.path.replace(/\/+$/, '');
    return selection.isDirectory ? `${path}/` : path;
}

/** file URI 只用于定位；普通路径中的空格、#、中文和 % 均不解码。 */
function initialDevicePath(initialPath?: string): string {
    const raw = initialPath?.trim() ?? '';
    if (!/^file:\/\//i.test(raw)) return raw;
    try {
        return decodeURIComponent(new URL(raw).pathname);
    } catch {
        return '';
    }
}

@Component({
    selector: 'app-device-file-picker-dialog',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatSelectModule,
        TranslateModule,
    ],
    templateUrl: './device-file-picker-dialog.component.html',
    styleUrl: './device-file-picker-dialog.component.css',
})
export class DeviceFilePickerDialogComponent implements OnInit, OnDestroy {
    private dialogRef = inject(MatDialogRef<DeviceFilePickerDialogComponent, DeviceFileSelection>);
    private data = inject<DeviceFilePickerData>(MAT_DIALOG_DATA);
    private platformId = inject(PLATFORM_ID);
    private translate = inject(TranslateService);

    readonly mode = this.data.mode;
    roots: DeviceFileRoot[] = [];
    externalStorageGranted = true;
    currentPath = '';
    parentPath: string | null = null;
    entries: FileEntry[] = [];
    loading = false;
    selecting = false;
    error = '';
    private listingLoaded = false;
    private requestId = 0;
    private closed = false;

    ngOnInit(): void {
        // 对话框只由用户操作打开，避免 SSR 预渲染触发设备 API。
        if (isPlatformBrowser(this.platformId)) {
            void this.initialize();
        }
    }

    ngOnDestroy(): void {
        this.closed = true;
        this.requestId++;
    }

    get titleKey(): string {
        if (this.mode === 'file') return 'FILE_PICKER.TITLE_FILE';
        if (this.mode === 'directory') return 'FILE_PICKER.TITLE_DIRECTORY';
        return 'FILE_PICKER.TITLE_ANY';
    }

    get selectedRoot(): string {
        return this.matchingRoot(this.currentPath)?.path ?? '';
    }

    get breadcrumbs(): { name: string, path: string }[] {
        if (!this.currentPath) return [];
        const crumbs: { name: string, path: string }[] = [];
        let path = '';
        for (const part of this.currentPath.split('/').filter(Boolean)) {
            path += `/${part}`;
            crumbs.push({ name: part, path });
        }
        return crumbs;
    }

    get displayedEntries(): FileEntry[] {
        return this.entries
            .filter(entry => this.mode !== 'directory' || entry.isDir)
            .sort((a, b) => Number(b.isDir) - Number(a.isDir) || a.name.localeCompare(b.name));
    }

    get canSelectCurrent(): boolean {
        return this.mode !== 'file' && this.listingLoaded && !this.loading && !this.selecting && !this.error;
    }

    openDirectory(path: string): void {
        if (this.loading || this.selecting || this.closed) return;
        void this.loadDirectory(path);
    }

    openEntry(entry: FileEntry): void {
        const path = this.currentPath.replace(/\/+$/, '') + `/${entry.name}`;
        if (entry.isDir) {
            this.openDirectory(path);
        } else if (this.mode !== 'directory') {
            void this.select(path);
        }
    }

    selectCurrent(): void {
        if (this.canSelectCurrent) {
            void this.select(this.currentPath);
        }
    }

    retry(): void {
        if (this.currentPath) {
            this.openDirectory(this.currentPath);
        } else {
            void this.initialize();
        }
    }

    close(): void {
        this.closed = true;
        this.requestId++;
        this.dialogRef.close();
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
        const date = new Date(mtime);
        const pad = (value: number) => value.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    }

    private async initialize(): Promise<void> {
        if (this.closed) return;
        const request = ++this.requestId;
        this.loading = true;
        this.error = '';
        this.entries = [];
        this.listingLoaded = false;
        try {
            const result = await AppApi.getDeviceFilePickerRoots();
            if (!this.isActive(request)) return;
            if (!result.data || result.data.roots.length === 0) throw result;
            this.roots = result.data.roots;
            this.externalStorageGranted = result.data.externalStorageGranted;

            let candidate = this.initialCandidate();
            const root = this.matchingRoot(candidate)?.path ?? this.roots[0].path;
            if (!this.matchingRoot(candidate)) candidate = root;

            // 文件、尚不存在的目录都通过 list 失败向上回退，不按扩展名猜类型。
            while (this.isActive(request)) {
                this.currentPath = candidate;
                try {
                    const listing = await AppApi.getDeviceFilePickerList(candidate);
                    if (!this.isActive(request)) return;
                    if (!listing.data) throw listing;
                    this.applyListing(listing.data);
                    return;
                } catch (error) {
                    if (!this.isActive(request)) return;
                    const parent = this.parentWithin(candidate, root);
                    if (parent === null) throw error;
                    candidate = parent;
                }
            }
        } catch (error) {
            if (this.isActive(request)) this.error = this.errorMessage(error);
        } finally {
            if (this.isActive(request)) this.loading = false;
        }
    }

    private async loadDirectory(path: string): Promise<void> {
        const request = ++this.requestId;
        this.loading = true;
        this.error = '';
        this.currentPath = path;
        this.parentPath = null;
        this.entries = [];
        this.listingLoaded = false;
        try {
            const result = await AppApi.getDeviceFilePickerList(path);
            if (!this.isActive(request)) return;
            if (!result.data) throw result;
            this.applyListing(result.data);
        } catch (error) {
            if (this.isActive(request)) this.error = this.errorMessage(error);
        } finally {
            if (this.isActive(request)) this.loading = false;
        }
    }

    private async select(path: string): Promise<void> {
        if (this.loading || this.selecting || this.closed) return;
        const request = ++this.requestId;
        this.selecting = true;
        this.error = '';
        try {
            const result = await AppApi.selectDeviceFile(path);
            if (!this.isActive(request)) return;
            if (!result.data) throw result;
            const selection = result.data;
            if ((this.mode === 'file' && selection.isDirectory) ||
                (this.mode === 'directory' && !selection.isDirectory)) {
                throw new Error(this.translate.instant('FILE_PICKER.INVALID_PATH'));
            }
            // close 之后不再写组件状态，canonical 结果直接交给调用方。
            this.closed = true;
            this.requestId++;
            this.dialogRef.close(selection);
        } catch (error) {
            if (this.isActive(request)) this.error = this.errorMessage(error);
        } finally {
            if (this.isActive(request)) this.selecting = false;
        }
    }

    private applyListing(data: NonNullable<FileListResult['data']>): void {
        this.currentPath = data.path;
        this.parentPath = data.parent;
        this.entries = data.entries;
        this.listingLoaded = true;
        this.error = '';
    }

    private initialCandidate(): string {
        const fallback = this.roots[0].path;
        const raw = initialDevicePath(this.data.initialPath);
        if (!raw.startsWith('/') || raw.includes('\0') || raw.split('/').includes('..')) return fallback;
        return this.matchingRoot(raw) ? raw : fallback;
    }

    private matchingRoot(path: string): DeviceFileRoot | undefined {
        return this.roots
            .filter(root => this.isWithin(path, root.path))
            .sort((a, b) => b.path.length - a.path.length)[0];
    }

    private isWithin(path: string, root: string): boolean {
        return path === root || path.startsWith(root.endsWith('/') ? root : `${root}/`);
    }

    private parentWithin(path: string, root: string): string | null {
        const normalized = path.replace(/\/+$/, '') || '/';
        if (normalized === root) return null;
        const index = normalized.lastIndexOf('/');
        const parent = index <= 0 ? '/' : normalized.slice(0, index);
        return this.isWithin(parent, root) ? parent : null;
    }

    private isActive(request: number): boolean {
        return !this.closed && request === this.requestId;
    }

    private errorMessage(error: unknown): string {
        const value = error as { error?: { message?: string }, message?: string };
        return value?.error?.message || value?.message || this.translate.instant('FILE_PICKER.DIRECTORY_ERROR');
    }
}
