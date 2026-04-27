import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  Injector,
} from "@angular/core";
import { Subject, takeUntil, finalize } from "rxjs";
import {sharedImports} from "../../../../shared/component/primeng.import";
import { mvScreen, mvScreenFilter,mvDeleteScreen } from "../../model/screen.model";
import { ApiResponse, GridResponse } from "../../../../shared/model/sharedModel";
import { gridConfig } from "../../../../shared/model/grid-config.model";
import { screenColumns } from "./screen-list-columns";
import { ScreenService } from "../../service/screen.service";
import { GridComponent } from "../../../../shared/component/grid/grid.component";
import { AppComponent } from "../../../../app.component";

// import { ScreenCreateEditComponent } from "../screen-create-edit/screen-create-edit.component";
// import { ScreenDetailsComponent } from "../screen-details/screen-details.component";


@Component({
  selector: "screen-list",
  standalone: true,
  imports: [
    ...sharedImports,
    GridComponent,
  ],
  templateUrl: "./screen-list.component.html",
  styleUrl: "./screen-list.component.scss",
})
export class ScreenComponent extends AppComponent implements OnInit, OnDestroy {
  // @ViewChild("screenCreateEdit") screenCreateEdit!: ScreenCreateEditComponent;

  screenConfig: gridConfig<mvScreen> = {
    columns: screenColumns,
    dataSource: { data: [] },
  };

  currentScreen = {} as mvScreen;
  isLoading = false;
  errorMessage = "";
  filter: mvScreenFilter = {};

  private _unSubscribeAll$ = new Subject<void>();

  constructor(
    private injector: Injector,
    private screenService: ScreenService,
  ) {
    super(injector);
  } 

  ngOnInit(): void {
    this.loadScreenGrid();
  }

  loadScreenGrid(): void {
    this.isLoading = true;
    this.errorMessage = "";
    this.screenService
      .screenGrid(this.filter)

      
      .pipe(
        takeUntil(this._unSubscribeAll$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (response: ApiResponse<GridResponse<mvScreen>>) => {
          if (response.success && response.data) {
            this.screenConfig.dataSource.data = response.data.data;
            this.screenConfig = { ...this.screenConfig };
          }
        },
        error: () => {
          this.errorMessage = "Failed to load screens";
        },
      });
  }

  // addScreen(): void {
  //   this.currentScreen = { id: 0 } as mvScreen;
  //   this.screenCreateEdit.open();
  // }

  // editScreen(screen: mvScreen): void {
  //   this.currentScreen = { ...screen };
  //   this.screenCreateEdit.open();
  // }



  afterFormClosed(screen: mvScreen | null): void {
    if (screen !== null) {
      const index = this.screenConfig.dataSource.data.findIndex(
        (s) => s.id === screen.id,
      );
      if (index > -1) {
        this.screenConfig.dataSource.data[index] = screen;
      } else {
        this.screenConfig.dataSource.data = [
          screen,
          ...this.screenConfig.dataSource.data,
        ];
      }
      this.screenConfig = { ...this.screenConfig };
    }
    this.currentScreen = {} as mvScreen;
  }

 
 
 
 deleteScreen(screen: mvScreen): void {
  this.confirmDialog(
    `Are you sure you want to delete ${screen.name}?`,
    "Confirm Delete",
    "pi pi-exclamation-triangle",
    () => this.executeDelete({ id: screen.id, deletedBy: 1 }), // map to mvDeleteScreen
  );
}

private executeDelete(screen: mvDeleteScreen): void {
  this.isLoading = true;
  this.screenService
    .deleteScreen(screen) // backend only needs id + deletedBy
    .pipe(
      takeUntil(this._unSubscribeAll$),
      finalize(() => (this.isLoading = false)),
    )
    .subscribe({
      next: () => {
        this.showMessage(
          "success",
          "Deleted",
          `Screen ${screen.id} removed successfully`,
        );
        this.screenConfig.dataSource.data =
          this.screenConfig.dataSource.data.filter((s) => s.id !== screen.id);
        this.screenConfig = { ...this.screenConfig };
      },
      error: () => {
        this.showMessage(
          "error",
          "Error",
          `Failed to delete screen ${screen.id}`,
        );
      },
    });


  }

  ngOnDestroy(): void {
    this._unSubscribeAll$.next();
    this._unSubscribeAll$.complete();
  }
}

