import { Component, Inject } from '@angular/core';

import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { TranslateModule } from '@ngx-translate/core';
import { EpgSource } from '../../api';
import { EpgSourceDialogComponent } from '../epg-source-dialog/epg-source-dialog.component';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-epg-manager',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatRadioModule,
    DragDropModule,
    TranslateModule
],
  templateUrl: './epg-manager.component.html',
  styleUrl: './epg-manager.component.css'
})
export class EpgManagerComponent {
  sources: EpgSource[] = [];
  currentSource: EpgSource | undefined;

  constructor(
    public dialogRef: MatDialogRef<EpgManagerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { sources: EpgSource[], currentSource?: EpgSource },
    private dialog: MatDialog
  ) {
    this.sources = data.sources ? [...data.sources] : [];
    this.currentSource = data.currentSource;
  }

  drop(event: CdkDragDrop<EpgSource[]>) {
    moveItemInArray(this.sources, event.previousIndex, event.currentIndex);
  }

  addSource() {
    const dialogRef = this.dialog.open(EpgSourceDialogComponent, {
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.sources.push(result);
      }
    });
  }

  editSource(index: number, source: EpgSource) {
    const dialogRef = this.dialog.open(EpgSourceDialogComponent, {
      data: { source }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.sources[index] = result;
        // Update current source if it was edited
        if (this.currentSource && this.currentSource.url === source.url && this.currentSource.name === source.name) {
            this.currentSource = result;
        }
      }
    });
  }

  deleteSource(index: number) {
    const deletedSource = this.sources[index];
    this.sources.splice(index, 1);
    // Clear current source if it was deleted
    if (this.currentSource && this.currentSource.url === deletedSource.url && this.currentSource.name === deletedSource.name) {
        this.currentSource = undefined;
    }
  }

  setCurrent(source: EpgSource) {
    this.currentSource = source;
  }

  isCurrent(source: EpgSource): boolean {
    return !!this.currentSource && this.currentSource.url === source.url && this.currentSource.name === source.name;
  }

  onSave() {
    this.dialogRef.close({ sources: this.sources, currentSource: this.currentSource });
  }

  onCancel() {
    this.dialogRef.close();
  }
}
