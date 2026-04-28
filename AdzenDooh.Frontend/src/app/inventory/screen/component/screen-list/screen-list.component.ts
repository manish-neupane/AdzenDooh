import { Component, OnInit, OnDestroy, Injector, inject, viewChild, ViewChild } from "@angular/core";
import { Subject, takeUntil, finalize } from "rxjs";

import { sharedImports } from "../../../../shared/component/primeng.import";
import { MvScreen, MvScreenFilter, MvDeleteScreen } from "../../model/screen.model";
import { ApiResponse, GridResponse, ParamOption } from "../../../../shared/model/sharedModel";
import { GridConfig } from "../../../../shared/model/grid-config.model";
import { screenColumns } from "./screen-list-columns";
import { ScreenService } from "../../service/screen.service";
import { GridComponent } from "../../../../shared/component/grid/grid.component";
import { AppComponent } from "../../../../app.component";
import { ScreenCreateEditComponent } from "../screen-create-edit/screen-create-edit.component";

@Component({
  selector: "screen-list",
  standalone: true,
  imports: [...sharedImports, GridComponent,ScreenCreateEditComponent],
  templateUrl: "./screen-list.component.html",
  styleUrl: "./screen-list.component.scss",
})
export class ScreenComponent extends AppComponent implements OnInit, OnDestroy {

 
 @ViewChild("screenCreateEdit") screenCreateEdit!: ScreenCreateEditComponent;
  private screenService = inject(ScreenService);



//grid config
  screenConfig: GridConfig<MvScreen> = {
    columns: screenColumns,
    dataSource: {
      data: [],
      totalCount: 0
    },
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
      }
    ]
  };

  

  param: ParamOption<MvScreenFilter> = {
    filter: {} as MvScreenFilter,
    offset: 0,
    pageSize: 10
  };
  
  currentScreen = {} as MvScreen;
  isLoading    = false;
  errorMessage = "";

  private _unSubscribeAll$ = new Subject<void>();

  

  constructor(private injector: Injector) {
    super(injector);
  }

  

  ngOnInit(): void {
    this.loadScreen();
  }

  

  loadScreen(): void {
    this.isLoading    = true;
    this.errorMessage = "";

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
                data: response.data.data,
                totalCount: response.data.totalCount
              }
            };
          }
        },
        error: () => {
          this.errorMessage = "Failed to load screens";
        }
      });
  }


  onPage(event: { first: number; rows: number }): void {
    this.param = { ...this.param, offset: event.first, pageSize: event.rows };
    this.loadScreen();
  }

  onSort(event: { field: string; order: number }): void {
    this.param = { ...this.param, sortBy: event.field, sortOrder: event.order === 1 ? 'asc' : 'desc' };
    this.loadScreen();
  }

  // ─── Actions ------------------------------------------
   addScreen(): void {
    this.currentScreen = {id:0 } as MvScreen;
    this.screenCreateEdit.open();
  }
  editScreen(screen: MvScreen): void {
    this.currentScreen = {...screen};
    this.screenCreateEdit.open();
  }

  afterFormClosed(screen: MvScreen | null ): void{
    if(screen != null){
      const index = this.screenConfig.dataSource.data.findIndex(
        (s) => s.id == screen.id,

      );

      if(index > -1){
        this.screenConfig.dataSource.data[index] = screen;

      }

      else{
        this.screenConfig.dataSource.data= [
          screen,
          ...this.screenConfig.dataSource.data,

        ];

      }

      this.screenConfig = { ...this.screenConfig};
    }
    this.currentScreen = {} as MvScreen
  }

  deleteScreen(screen: MvScreen): void {
    this.confirmDialog(
      `Are you sure you want to delete ${screen.name}?`,
      "Confirm Delete",
      "pi pi-exclamation-triangle",
      () => this.executeDelete({ id: screen.id, deletedBy: 1 })
    );
  }

  private executeDelete(screen: MvDeleteScreen): void {
    this.isLoading = true;

    this.screenService.deleteScreen(screen)
      .pipe(
        takeUntil(this._unSubscribeAll$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: () => {
          this.showMessage("success", "Deleted", "Screen deleted successfully");
          this.loadScreen();
        },
        error: () => {
          this.showMessage("error", "Error", "Failed to delete screen");
        }
      });
  }


  ngOnDestroy(): void {
    this._unSubscribeAll$.next();
    this._unSubscribeAll$.complete();
  }
}