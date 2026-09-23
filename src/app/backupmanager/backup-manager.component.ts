import { Component, inject, effect, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppApi, BackupItem } from '../api';

@Component({
    selector: 'app-backup-manager',
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
        TranslateModule,
    ],
    templateUrl: './backup-manager.component.html',
    styleUrl: './backup-manager.component.css',
    host: {
        'animate.enter': 'enter',
        'animate.leave': 'leave'
    }
})
export class BackupManagerComponent {
    private snackBar = inject(MatSnackBar);
    private translate = inject(TranslateService);

    items: BackupItem[] = [];
    loading = false;
    newName = '';
    restoringName: string | null = null;
    deletingName: string | null = null;

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
        effect(() => {
            if (isPlatformBrowser(this.platformId)) {
                this.refresh();
            }
        });
    }

    async refresh() {
        this.loading = true;
        try {
            const result = await AppApi.getBackupList();
            this.items = result.data ?? [];
        } catch (e) {
            console.error(e);
            this.showError(e);
        } finally {
            this.loading = false;
        }
    }

    async create() {
        const name = this.newName.trim();
        if (!name) return;
        this.loading = true;
        try {
            await AppApi.createBackup(name);
            this.newName = '';
            this.showSuccess('BACKUP.CREATE_SUCCESS');
            await this.refresh();
        } catch (e) {
            console.error(e);
            this.showError(e);
        } finally {
            this.loading = false;
        }
    }

    startRestore(name: string) {
        this.restoringName = name;
        this.deletingName = null;
    }

    cancelRestore() {
        this.restoringName = null;
    }

    async confirmRestore() {
        const name = this.restoringName;
        if (!name) return;
        this.loading = true;
        try {
            await AppApi.restoreBackup(name);
            this.restoringName = null;
            this.showSuccess('BACKUP.RESTORE_SUCCESS');
        } catch (e) {
            console.error(e);
            this.showError(e);
        } finally {
            this.loading = false;
        }
    }

    startDelete(name: string) {
        this.deletingName = name;
        this.restoringName = null;
    }

    cancelDelete() {
        this.deletingName = null;
    }

    async confirmDelete() {
        const name = this.deletingName;
        if (!name) return;
        this.loading = true;
        try {
            await AppApi.deleteBackup(name);
            this.deletingName = null;
            this.showSuccess('HOME.DELETE_SUCCESS');
            await this.refresh();
        } catch (e) {
            console.error(e);
            this.showError(e);
        } finally {
            this.loading = false;
        }
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

    formatTime(time: number): string {
        if (time <= 0) return '-';
        const d = new Date(time);
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }

    private showSuccess(key: string) {
        this.snackBar.open(this.translate.instant(key), this.translate.instant('HOME.CLOSE'), { duration: 3000 });
    }

    private showError(e: unknown) {
        const message = (e as { error?: { message?: string } })?.error?.message;
        this.snackBar.open(
            message || this.translate.instant('BACKUP.OPERATION_FAILED'),
            this.translate.instant('HOME.CLOSE'),
            { duration: 3000 }
        );
    }
}
