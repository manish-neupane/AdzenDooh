import {
  Component, Input, Output, EventEmitter, OnChanges, SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

import { GridConfig } from '../../model/grid-config.model';

@Component({
  selector: 'grid-table',
  standalone: true,
  imports: [CommonModule, TableModule, InputTextModule, ButtonModule, TooltipModule],
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
})
export class GridComponent<T extends { id: number }> implements OnChanges {

  @Input() config!: GridConfig<T>;
  @Input() loading: boolean = false;
  @Input() error: string = '';

  @Output() pageChange = new EventEmitter<{ first: number; rows: number }>();
  @Output() sortChange = new EventEmitter<{ field: string; order: number }>();

  protected filterFields: string[] = [];
  protected pageRows: number = 10;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && this.config) {
      const columns = this.config.columns.map(c => c.name);
      const marked = this.config.columns.filter(c => c.filterable).map(c => c.name);
      this.filterFields = marked.length ? marked : columns;
      this.pageRows = this.config.rows ?? 10;
    }
  }

  onPageChange(event: any): void {
    this.pageChange.emit({ first: event.first, rows: event.rows });
  }

  onSort(event: any): void {
    this.sortChange.emit({ field: event.field, order: event.order });
  }

  getValue(row: T, columnName: string): any {
    return row[columnName as keyof T];
  }
}