import { Component, Input, Output, EventEmitter, forwardRef, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-textarea-with-lines',
  standalone: true,
  imports: [CommonModule, FormsModule, MatInputModule, MatFormFieldModule],
  templateUrl: './textarea-with-lines.component.html',
  styleUrls: ['./textarea-with-lines.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaWithLinesComponent),
      multi: true
    }
  ]
})
export class TextareaWithLinesComponent implements ControlValueAccessor, AfterViewInit {
  @Input() rows = 5;
  @Input() placeholder = '';
  @Input() label = '';
  @Input() required = false;
  @Output() change = new EventEmitter<string>();

  value = '';
  lines: number[] = [1];
  
  @ViewChild('textarea') textarea!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('lineNumbers') lineNumbers!: ElementRef<HTMLDivElement>;

  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: any): void {
    this.value = value || '';
    this.updateLines();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this.value = target.value;
    this.onChange(this.value);
    this.updateLines();
  }

  onBlur() {
      this.onTouched();
      this.change.emit(this.value);
  }

  onScroll(event: Event) {
    if (this.lineNumbers && this.textarea) {
        const container = this.lineNumbers.nativeElement.parentElement as HTMLElement;
        container.scrollTop = this.textarea.nativeElement.scrollTop;
    }
  }

  updateLines() {
    const lineCount = this.value.split('\n').length;
    this.lines = Array(Math.max(lineCount, 1)).fill(0).map((x, i) => i + 1);
  }

  ngAfterViewInit() {
      setTimeout(() => this.updateLines());
  }
}
