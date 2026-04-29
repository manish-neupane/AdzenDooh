// ─── screen-list.component.ts ────────────────────────────────────────────────
// RESPONSIBILITY: Owns everything screen-list related —
//   • fetching screens from the server
//   • wiring add/edit/delete actions
//   • holding the currently-selected screen for the dialog
//   • updating the local grid data after a save or delete
//
// It delegates:
//   • table rendering  → GridComponent
//   • dialog UI/form   → ScreenCreateEditComponent

import {
  Component,
  OnInit,
  OnDestroy,
  Injector,
  inject,
  ViewChild
} from '@angular/core';
import { Subject, takeUntil, finalize } from 'rxjs';
import { ScreenOperatingHourComponent } from '../operating-hour/operating-hour.component';

import { sharedImports } from '../../../../shared/component/primeng.import';
import { MvScreen, MvScreenFilter, MvDeleteScreen } from '../../model/screen.model';
import { ApiResponse, GridResponse, ParamOption } from '../../../../shared/model/sharedModel';
import { GridConfig } from '../../../../shared/model/grid-config.model';
import { screenColumns } from './screen-list-columns';
import { ScreenService } from '../../service/screen.service';
import { GridComponent } from '../../../../shared/component/grid/grid.component';
import { AppComponent } from '../../../../app.component';
import { ScreenCreateEditComponent } from '../screen-create-edit/screen-create-edit.component';
import { PageWrapperComponent } from "../../../../shared/component/page-wrapper/page-wrapper.component";

@Component({
  selector: 'screen-list',
  standalone: true,
  imports: [...sharedImports, GridComponent, ScreenCreateEditComponent, PageWrapperComponent,ScreenOperatingHourComponent],
  templateUrl: './screen-list.component.html',
  styleUrl: './screen-list.component.scss'
})
export class ScreenComponent extends AppComponent implements OnInit, OnDestroy {

  // ─── Child Reference ──────────────────────────────────────────────────────
  // Using template reference variable as per mentor preference, not ViewChild.
  // The #screenCreateEdit ref in the template gives us direct method access.
  @ViewChild('screenCreateEdit') screenCreateEdit!: ScreenCreateEditComponent;
  @ViewChild('screenOperatingHour') screenOperatingHour!: ScreenOperatingHourComponent;

  // ─── Services ─────────────────────────────────────────────────────────────
  private screenService = inject(ScreenService);

  // ─── Grid Config ──────────────────────────────────────────────────────────
  screenConfig: GridConfig<MvScreen> = {
    columns: screenColumns,
    dataSource: { data: [], totalCount: 0 },
    showActions: true,
    actions: [
      {
        type: 'edit',
        icon: 'pi pi-pencil',
        severity: 'info',
        tooltip: 'Edit',
        handler: (row) => this.editScreen(row)
      },
      {
        type: 'delete',
        icon: 'pi pi-trash',
        severity: 'danger',
        tooltip: 'Delete',
        handler: (row) => this.deleteScreen(row)
      },

      
      {
  type:     'info',
  icon:     'pi pi-clock',
  severity: 'info',
  tooltip:  'Operating Hours',
  handler:  (row) => this.openOperatingHours(row)
},
    ]
  };

  // ─── Query Params ─────────────────────────────────────────────────────────
  param: ParamOption<MvScreenFilter> = {
    filter: {} as MvScreenFilter,
    offset: 0,
    pageSize: 10
  };

  // ─── Component State ──────────────────────────────────────────────────────
  currentScreen = {} as MvScreen;
  isLoading     = false;
  errorMessage  = '';

  private _unSubscribeAll$ = new Subject<void>();

  // ─── Constructor ──────────────────────────────────────────────────────────
  constructor(private injector: Injector) {
    super(injector);
  }

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadScreens();
  }

  ngOnDestroy(): void {
    this._unSubscribeAll$.next();
    this._unSubscribeAll$.complete();
  }

  // ─── Data Loading ─────────────────────────────────────────────────────────
  loadScreens(): void {
    this.isLoading    = true;
    this.errorMessage = '';

    this.screenService.getGrid(this.param)
      .pipe(
        takeUntil(this._unSubscribeAll$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response: ApiResponse<GridResponse<MvScreen>>) => {
          if (response.success && response.data) {
            this.screenConfig = {
              ...this.screenConfig,
              dataSource: {
                data:       response.data.data,
                totalCount: response.data.totalCount
              }
            };
          }
        },
        error: () => {
          this.errorMessage = 'Failed to load screens';
        }
      });
  }

  // ─── Grid Event Handlers ──────────────────────────────────────────────────
  onPage(event: { first: number; rows: number }): void {
    this.param = { ...this.param, offset: event.first, pageSize: event.rows };
    this.loadScreens();
  }

  onSort(event: { field: string; order: number }): void {
    this.param = {
      ...this.param,
      sortBy:    event.field,
      sortOrder: event.order === 1 ? 'asc' : 'desc'
    };
    this.loadScreens();
  }

  onFilter(searchText: string): void {
    // Map the free-text search into your filter model.
    // Adjust the MvScreenFilter property name to match your backend.
    this.param = {
      ...this.param,
      offset: 0,  // reset to first page on new filter
      filter: { ...this.param.filter, search: searchText } as MvScreenFilter
    };
    this.loadScreens();
  }

  // ─── Dialog Actions ───────────────────────────────────────────────────────
  openAddScreen(): void {
    this.currentScreen = { id: 0 } as MvScreen;
    this.screenCreateEdit.open();
  }

  editScreen(screen: MvScreen): void {
    this.currentScreen = { ...screen };
    this.screenCreateEdit.open();
  }

  openOperatingHours(screen: MvScreen): void {
  this.currentScreen = { ...screen };
  this.screenOperatingHour.open();
}
  // ─── After Dialog Closes ──────────────────────────────────────────────────
  // Called by ScreenCreateEditComponent via (afterFormClosed) output.
  // If screen is null, the user cancelled or an error occurred — do nothing.
  // If screen has an id that exists in the list → update in place.
  // If it's a new id → prepend to the top of the list.
  afterFormClosed(screen: MvScreen | null): void {
    if (screen != null) {
      const index = this.screenConfig.dataSource.data.findIndex(s => s.id === screen.id);

      const updatedData = index > -1
        ? this.screenConfig.dataSource.data.map((s, i) => i === index ? screen : s)
        : [screen, ...this.screenConfig.dataSource.data];

      this.screenConfig = {
        ...this.screenConfig,
        dataSource: {
          ...this.screenConfig.dataSource,
          data: updatedData
        }
      };
    }

    // Always clear selection after dialog closes
    this.currentScreen = {} as MvScreen;
  }

  // ─── Delete ───────────────────────────────────────────────────────────────
  deleteScreen(screen: MvScreen): void {
    this.confirmDialog(
      `Are you sure you want to delete "${screen.name}"?`,
      'Confirm Delete',
      'pi pi-exclamation-triangle',
      () => this.executeDelete({ id: screen.id, deletedBy: 1 })
    );
  }

  private executeDelete(payload: MvDeleteScreen): void {
    this.isLoading = true;

    this.screenService.deleteScreen(payload)
      .pipe(
        takeUntil(this._unSubscribeAll$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: () => {
          this.showMessage('success', 'Deleted', 'Screen deleted successfully');
          this.loadScreens();
        },
        error: () => {
          this.showMessage('error', 'Error', 'Failed to delete screen');
        }
      });
  }
}