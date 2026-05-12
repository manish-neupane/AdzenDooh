import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  OnInit,
  ContentChild,
  TemplateRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule, TablePageEvent } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { GridConfig } from '../../model/grid-config.model';

interface SortEvent {
  field?: string;
  order?: number;
}

@Component({
  selector: 'grid-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    TooltipModule,
    IconFieldModule,
    InputIconModule
  ],
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent<T extends { id: number }> implements OnChanges, OnDestroy, OnInit {

  @Input() config!: GridConfig<T>;
  @Input() loading: boolean = false;
  @Input() error: string = '';

  @Output() pageChange   = new EventEmitter<{ first: number; rows: number }>();
  @Output() sortChange   = new EventEmitter<{ field: string; order: number }>();
  @Output() filterChange = new EventEmitter<string>();

  @ContentChild('customCell') customCellTemplate?: TemplateRef<any>;

  protected filterFields: (keyof T)[] = [];
  protected filterValue: string = '';
  
  // State for PrimeNG table
  protected first: number = 0;
  protected rows: number = 10;
  protected sortField: string = '';
  protected sortOrder: number = 1;

  private filterSubject = new Subject<string>();
  private _unSubscribeAll$ = new Subject<void>();

  ngOnInit(): void {
    this.filterSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this._unSubscribeAll$)
    ).subscribe(value => {
      // Reset to first page when filtering
      this.first = 0;
      this.filterChange.emit(value);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && this.config) {
      const marked = this.config.columns
        .filter(c => c.filterable)
        .map(c => c.name);
      
      const all = this.config.columns.map(c => c.name);
      this.filterFields = marked.length ? marked : all;
      
      // Update rows per page from config
      if (this.config.rows && this.config.rows !== this.rows) {
        this.rows = this.config.rows;
        this.first = 0;
      }
    }
  }

  onPageChange(event: TablePageEvent): void {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 10;
    
    this.pageChange.emit({ 
      first: this.first, 
      rows: this.rows 
    });
  }

  onSortChange(event: SortEvent): void {
    if (!event.field) return;
    
    this.sortField = event.field;
    this.sortOrder = event.order === 1 ? 1 : -1;
    
    // Reset to first page when sorting
    this.first = 0;
    
    this.sortChange.emit({ 
      field: this.sortField, 
      order: this.sortOrder 
    });
  }

onFilterChange(value: string): void {
    const trimmed = value.trim();
    this.filterValue = value;           // Update local model
    this.filterSubject.next(trimmed);   // Emit trimmed value
}
  onFilterClear(): void {
    this.filterValue = '';
    this.filterSubject.next('');
}

  getValue(row: T, key: keyof T): T[keyof T] {
    return row[key];
  }

  ngOnDestroy(): void {
    this._unSubscribeAll$.next();
    this._unSubscribeAll$.complete();
  }
}