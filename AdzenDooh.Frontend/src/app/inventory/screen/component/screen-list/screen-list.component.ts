import {
  Component,
  OnInit,
  OnDestroy,
  Injector,
  ViewChild
} from '@angular/core';
import { Subject, takeUntil, finalize } from 'rxjs';
import { ScreenOperatingHourComponent } from '../operating-hour/operating-hour.component';

import { sharedImports } from '../../../../shared/component/primeng.import';
import { MvScreen, MvScreenFilter, MvDeleteScreen } from '../../model/screen.model';
import {  ParamOption } from '../../../../shared/model/sharedModel';
import { GridConfig } from '../../../../shared/model/grid-config.model';
import { screenColumns } from './screen-list-columns';
import { ScreenService } from '../../service/screen.service';
import { GridComponent } from '../../../../shared/component/grid/grid.component';
import { AppComponent } from '../../../../app.component';
import { ScreenCreateEditComponent } from '../screen-create-edit/screen-create-edit.component';
import { PageWrapperComponent } from '../../../../shared/component/page-wrapper/page-wrapper.component';
import { RouterOutlet } from "@angular/router";
import { ScreenDetailComponent } from '../screen-detail/screen-detail.component';

@Component({
  selector: 'screen-list',
  standalone: true,
  imports: [...sharedImports, GridComponent, ScreenCreateEditComponent, PageWrapperComponent, ScreenOperatingHourComponent, RouterOutlet, ScreenDetailComponent],
  templateUrl: './screen-list.component.html',
  styleUrl: './screen-list.component.scss'
})
export class ScreenComponent extends AppComponent implements OnInit, OnDestroy {

  @ViewChild('screenCreateEdit') screenCreateEdit!: ScreenCreateEditComponent;
  @ViewChild('screenOperatingHour') screenOperatingHour!: ScreenOperatingHourComponent;
  @ViewChild('screenDetail') screenDetail!: ScreenDetailComponent;

  screenConfig: GridConfig<MvScreen> = {
    columns: screenColumns,
    dataSource: { data: [], totalCount: 0 },
    showActions: true,
    actions: [
     

       {
        type: 'info',
        icon: 'pi pi-info-circle',
        severity: 'info',
        tooltip: 'Details',
        handler: (row) => this.openDetail(row)
      },
       {
        type: 'edit',
        icon: 'pi pi-pencil',
        severity: 'info',
        tooltip: 'Edit',
        handler: (row) => this.editScreen(row)
      },
         {
        type: 'info',
        icon: 'pi pi-calendar-clock',
        severity: 'info',
        tooltip: 'Operating Hours',
        handler: (row) => this.openOperatingHours(row)
      },
     
   
     
       {
        type: 'delete',
        icon: 'pi pi-trash',
        severity: 'danger',
        tooltip: 'Delete',
        handler: (row) => this.deleteScreen(row)
      },
    ]
  };

  param: ParamOption<MvScreenFilter> = {
    filter: {} as MvScreenFilter,
    offset: 0,
    pageSize: 10
  };

  protected currentScreen = {} as MvScreen;
  protected isLoading = false;
  protected errorMessage = '';
  private _unSubscribeAll$ = new Subject<void>();

  constructor(
    private _screenService: ScreenService,
    private injector: Injector
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.loadScreens();
  }

  loadScreens(showLoading:boolean = true): void {
    if (showLoading) {
      this.isLoading = true;
    }
    this._screenService.getAll(this.param)
      .pipe(
        takeUntil(this._unSubscribeAll$),
        finalize(() => {
          if (showLoading) {
            this.isLoading = false;
          }
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.screenConfig = {
              ...this.screenConfig,
              dataSource: {
                data: response.data.data,
                totalCount: response.data.totalCount
              }
            };
          }
        },
        error: () => this.errorMessage = 'Failed to load screens'
      });
  }

  //  Grid event handlers 

  onPage(event: { first: number; rows: number }): void {
    this.param = { ...this.param, offset: event.first, pageSize: event.rows };
    this.loadScreens();
  }

  onSort(event: { field: string; order: number }): void {
    this.param = {
      ...this.param,
      sortBy: event.field,
      sortOrder: event.order === 1 ? 'asc' : 'desc'
    };
    this.loadScreens();
  }

  onFilter(searchText: string): void {
    this.param = {
      ...this.param,
      offset: 0,
      filter: { ...this.param.filter, searchText }
    };
    this.loadScreens(false);
  }

  //  Dialog actions 

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
    this.screenOperatingHour.open(screen, 'edit');
  }

  openDetail(screen: MvScreen): void {
    this.currentScreen = { ...screen };
    this.screenDetail.open(screen);
  }

  afterFormClosed(screen: MvScreen | null): void {
    if (screen != null) {
      const index = this.screenConfig.dataSource.data.findIndex(s => s.id === screen.id);

      const updatedData = index > -1
        ? this.screenConfig.dataSource.data.map((s, i) => i === index ? screen : s)
        : [screen, ...this.screenConfig.dataSource.data];

      this.screenConfig = {
        ...this.screenConfig,
        dataSource: { ...this.screenConfig.dataSource, data: updatedData }
      };
    }

    this.currentScreen = {} as MvScreen;
  }

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

  this._screenService.deleteScreen(payload)
    .pipe(
      takeUntil(this._unSubscribeAll$),
      finalize(() => this.isLoading = false)
    )
    .subscribe({
      next: () => {
        // Manually remove from grid (like save does)
        const updatedData = this.screenConfig.dataSource.data.filter(
          screen => screen.id !== payload.id
        );
        
        this.screenConfig = {
          ...this.screenConfig,
          dataSource: {
            data: updatedData,
            totalCount: this.screenConfig.dataSource.totalCount - 1
          }
        };
        
        this.showMessage('success', 'Deleted', 'Screen deleted successfully');
        // Don't call loadScreens()
      },
      error: () => {
        this.showMessage('error', 'Error', 'Failed to delete screen');
      }
    });
}

  ngOnDestroy(): void {
    this._unSubscribeAll$.next();
    this._unSubscribeAll$.complete();
  }
}