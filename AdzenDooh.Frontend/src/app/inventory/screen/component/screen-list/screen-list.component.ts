import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  Injector,
} from "@angular/core";
import { Subject, takeUntil, finalize } from "rxjs";
import {sharedImports} from "../../../../shared/primeng.import";
import { mvScreen, ScreenSearchFilter } from "../../model/screenModel";
import { ApiResponse } from "../../../../shared/model/sharedModel";
import { gridConfig } from "../../../../shared/model/grid-config.model";
import { screenColumns } from "./screen-list-columns";
import { ScreenService } from "../../service/screen.service";
import { GridComponent } from "../../../../shared/component/grid/grid.component";
import { ScreenCreateEditComponent } from "../screen-create-edit/screen-create-edit.component";
import { ScreenDetailsComponent } from "../screen-details/screen-details.component";
import { AppComponent } from "../../../../app.component";

@Component({
  selector: "screen-list",
  standalone: true,
  imports: [
    ...sharedImports,
    GridComponent,
    ScreenCreateEditComponent,
    ScreenDetailsComponent,
  ],
  templateUrl: "./screen-list.component.html",
  styleUrl: "./screen-list.component.css",
})
export class ScreenComponent extends AppComponent implements OnInit, OnDestroy {
  @ViewChild("screenCreateEdit") screenCreateEdit!: ScreenCreateEditComponent;

  screenConfig: gridConfig<mvScreen> = {
    columns: screenColumns,
    dataSource: { data: [] },
  };

  currentScreen = {} as mvScreen;
  isLoading = false;
  errorMessage = "";
  filter: ScreenSearchFilter = {};

  private _unSubscribeAll$ = new Subject<void>();

  constructor(
    private injector: Injector,
    private screenService: ScreenService,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.getScreens();
  }

  getScreens(): void {
    this.isLoading = true;
    this.errorMessage = "";
    this.screenService
      .getScreens(this.filter)

      
      .pipe(
        takeUntil(this._unSubscribeAll$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (response: ApiResponse<mvScreen[]>) => {
          if (response.success && response.data) {
            this.screenConfig.dataSource.data = response.data;
            this.screenConfig = { ...this.screenConfig };
          }
        },
        error: () => {
          this.errorMessage = "Failed to load screens";
        },
      });
  }

  addScreen(): void {
    this.currentScreen = { id: 0 } as mvScreen;
    this.screenCreateEdit.open();
  }

  editScreen(screen: mvScreen): void {
    this.currentScreen = { ...screen };
    this.screenCreateEdit.open();
  }



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
      `Are you sure you want to delete ${screen.screenName}?`,
      "Confirm Delete",
      "pi pi-exclamation-triangle",
      () => this.executeDelete(screen),
    );
  }

  private executeDelete(screen: mvScreen): void {
    this.isLoading = true;
    this.screenService
      .deleteScreen({ id: screen.id, updatedBy: 1 })
      .pipe(
        takeUntil(this._unSubscribeAll$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: () => {
          this.showMessage(
            "success",
            "Deleted",
            `${screen.screenName} removed successfully`,
          );
          this.screenConfig.dataSource.data =
            this.screenConfig.dataSource.data.filter((s) => s.id !== screen.id);
          this.screenConfig = { ...this.screenConfig };
        },
        error: () => {
          this.showMessage(
            "error",
            "Error",
            `Failed to delete ${screen.screenName}`,
          );
        },
      });
  }

  ngOnDestroy(): void {
    this._unSubscribeAll$.next();
    this._unSubscribeAll$.complete();
  }
}

