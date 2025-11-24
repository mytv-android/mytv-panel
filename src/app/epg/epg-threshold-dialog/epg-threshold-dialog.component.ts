import { Component, Inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-epg-threshold-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatRadioModule,
    MatInputModule,
    MatFormFieldModule,
    TranslateModule
],
  templateUrl: './epg-threshold-dialog.component.html',
  styleUrl: './epg-threshold-dialog.component.css'
})
export class EpgThresholdDialogComponent {
  threshold: number;
  customValue: number = 12;
  isCustom: boolean = false;

  options = [
    { value: -1, label: 'EPG.THRESHOLD_ALWAYS' },
    { value: 0, label: '00:00' },
    { value: 6, label: '06:00' },
    { value: 12, label: '12:00' },
    { value: 18, label: '18:00' },
  ];

  constructor(
    public dialogRef: MatDialogRef<EpgThresholdDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { threshold: number }
  ) {
    this.threshold = data.threshold !== undefined ? data.threshold : -1;
    
    // Check if current value is one of the options
    const isOption = this.options.some(opt => opt.value === this.threshold);
    if (!isOption && this.threshold !== -1) {
      this.isCustom = true;
      this.customValue = this.threshold;
    }
  }

  onOptionChange(value: number) {
    this.isCustom = false;
    this.threshold = value;
  }

  onCustomSelect() {
    this.isCustom = true;
    this.threshold = this.customValue;
  }

  onCustomValueChange() {
    if (this.isCustom) {
      this.threshold = this.customValue;
    }
  }

  onSave() {
    this.dialogRef.close(this.threshold);
  }

  onCancel() {
    this.dialogRef.close();
  }
}
