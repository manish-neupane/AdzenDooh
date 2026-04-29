// ─── grid.component.ts ───────────────────────────────────────────────────────
// A fully generic, reusable table component.
//
// RESPONSIBILITY: Render a table with columns, pagination, sorting, filtering,
// action buttons, and loading/empty/error states. That is ALL it does.
//
// It knows NOTHING about screens, campaigns, or any domain object.
// Every interaction is emitted outward — the parent decides what to do.

import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

import { GridConfig } from '../../model/grid-config.model';

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
export class GridComponent<T extends { id: number }> implements OnChanges {

  // ─── Inputs ───────────────────────────────────────────────────────────────

  @Input() config!: GridConfig<T>;
  @Input() loading: boolean = false;
  @Input() error: string = '';

  // ─── Outputs ──────────────────────────────────────────────────────────────

  // Parent handles pagination against the server
  @Output() pageChange = new EventEmitter<{ first: number; rows: number }>();

  // Parent handles sort against the server
  @Output() sortChange = new EventEmitter<{ field: string; order: number }>();

  // Parent handles filter against the server (debounce if needed in parent)
  @Output() filterChange = new EventEmitter<string>();

  // ─── Internal State ───────────────────────────────────────────────────────

  protected filterFields: string[] = [];
  protected pageRows: number = 10;
  protected filterValue: string = '';

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && this.config) {
      const marked = this.config.columns.filter(c => c.filterable).map(c => c.name);
      const all    = this.config.columns.map(c => c.name);
      this.filterFields = marked.length ? marked : all;
      this.pageRows     = this.config.rows ?? 10;
    }
  }

  // ─── Event Handlers ───────────────────────────────────────────────────────

  onPageChange(event: any): void {
    this.pageChange.emit({ first: event.first, rows: event.rows });
  }

  onSort(event: any): void {
    this.sortChange.emit({ field: event.field, order: event.order });
  }

  onFilter(): void {
    // Emit the current filter value; parent calls their load method
    this.filterChange.emit(this.filterValue.trim());
  }

  onFilterClear(): void {
    this.filterValue = '';
    this.filterChange.emit('');
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  getValue(row: T, columnName: string): any {
    return row[columnName as keyof T];
  }
}