import { Component, OnInit, signal, Renderer2, OnDestroy, ViewChild, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AppApi, AppLog } from '../api';
import { CustomPaginatorIntl } from './custom-paginator-intl';

@Component({
  selector: 'app-log',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    TranslateModule
  ],
  providers: [
    { provide: MatPaginatorIntl, useClass: CustomPaginatorIntl }
  ],
  templateUrl: './log.component.html',
  styleUrl: './log.component.css'
})
export class LogComponent implements OnInit, OnDestroy, AfterViewInit {
  dataSource = new MatTableDataSource<AppLog>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  selectedLevel = 'ALL';
  levels = ['ALL', 'INFO', 'ERROR', 'WARN', 'DEBUG'];
  
  displayedColumns: string[] = ['time', 'level', 'tag', 'message', 'cause'];

  // Resizing state
  private isResizing = false;
  private currentResizeColumn: HTMLElement | null = null;
  private startX = 0;
  private startWidth = 0;
  private globalMouseMoveListener: (() => void) | null = null;
  private globalMouseUpListener: (() => void) | null = null;
  private globalTouchMoveListener: (() => void) | null = null;
  private globalTouchEndListener: (() => void) | null = null;

  constructor(
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.dataSource.filterPredicate = (data: AppLog, filter: string) => {
      if (filter === 'ALL') return true;
      return data.level === filter;
    };
    if (isPlatformBrowser(this.platformId)) {
      this.loadLogs();
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy() {
    this.removeGlobalListeners();
  }

  onResizeStart(event: MouseEvent | TouchEvent, columnHeader: HTMLElement) {
    this.isResizing = true;
    this.currentResizeColumn = columnHeader;
    
    if (event instanceof MouseEvent) {
      this.startX = event.pageX;
    } else if (event instanceof TouchEvent && event.touches.length > 0) {
      this.startX = event.touches[0].pageX;
    }
    
    this.startWidth = columnHeader.offsetWidth;

    event.preventDefault(); // Prevent text selection

    // Add global listeners
    this.globalMouseMoveListener = this.renderer.listen('document', 'mousemove', (e) => this.onResize(e));
    this.globalMouseUpListener = this.renderer.listen('document', 'mouseup', () => this.onResizeEnd());
    this.globalTouchMoveListener = this.renderer.listen('document', 'touchmove', (e) => this.onResize(e));
    this.globalTouchEndListener = this.renderer.listen('document', 'touchend', () => this.onResizeEnd());
  }

  onResize(event: MouseEvent | TouchEvent) {
    if (!this.isResizing || !this.currentResizeColumn) return;

    let pageX = 0;
    if (event instanceof MouseEvent) {
      pageX = event.pageX;
    } else if (event instanceof TouchEvent && event.touches.length > 0) {
      pageX = event.touches[0].pageX;
    } else {
      return;
    }

    const diff = pageX - this.startX;
    const newWidth = Math.max(50, this.startWidth + diff); // Min width 50px
    
    this.renderer.setStyle(this.currentResizeColumn, 'width', `${newWidth}px`);
    this.renderer.setStyle(this.currentResizeColumn, 'max-width', `${newWidth}px`);
    this.renderer.setStyle(this.currentResizeColumn, 'min-width', `${newWidth}px`);
  }

  onResizeEnd() {
    this.isResizing = false;
    this.currentResizeColumn = null;
    this.removeGlobalListeners();
  }

  private removeGlobalListeners() {
    if (this.globalMouseMoveListener) {
      this.globalMouseMoveListener();
      this.globalMouseMoveListener = null;
    }
    if (this.globalMouseUpListener) {
      this.globalMouseUpListener();
      this.globalMouseUpListener = null;
    }
    if (this.globalTouchMoveListener) {
      this.globalTouchMoveListener();
      this.globalTouchMoveListener = null;
    }
    if (this.globalTouchEndListener) {
      this.globalTouchEndListener();
      this.globalTouchEndListener = null;
    }
  }

  async loadLogs() {
    try {
      const data = await AppApi.getLogs();
      // Sort by time desc
      data.sort((a, b) => b.time - a.time);
      this.dataSource.data = data;
      this.applyFilter();
    } catch (error) {
      console.error('Failed to load logs', error);
    }
  }

  applyFilter() {
    this.dataSource.filter = this.selectedLevel;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
  }
}
