import {
  Component, Input, Output, EventEmitter,
  OnChanges, SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { gridConfig } from '../../model/grid-config.model';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'grid-table',
  standalone: true,
  imports: [CommonModule, TableModule, InputTextModule, ButtonModule, TooltipModule],
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'], 
})
export class GridComponent<T extends { id: number }> implements OnChanges {

  @Input() config!: gridConfig<T>;

  // @Output() rowEdit   = new EventEmitter<T>();
  // @Output() rowDelete = new EventEmitter<T>();
  // @Output() rowView   = new EventEmitter<T>();
 
  protected columns:      string[] = [];
  protected filterFields: string[] = [];
  protected pageRows:     number   = 10;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && this.config) {
      this.columns = this.config.columns.map(c => c.name);
      const marked = this.config.columns.filter(c => c.filterable).map(c => c.name);
      this.filterFields = marked.length ? marked : this.columns;
      this.pageRows = this.config.rows ?? 10;
    }
  }
  
  

  getValue(row: T, columnName: string): any {
    return row[columnName as keyof T];
  }
}
