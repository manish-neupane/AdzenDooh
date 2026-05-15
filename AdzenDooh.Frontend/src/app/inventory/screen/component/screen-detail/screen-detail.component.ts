import { Component, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppComponent } from '../../../../app.component';
import { sharedImports } from '../../../../shared/component/primeng.import';
import { ScreenService } from '../../service/screen.service';
import { MvScreen, MvScreenDetail, MvScreenDetailParam } from '../../model/screen.model';
import { ScreenOperatingHourComponent } from '../operating-hour/operating-hour.component';
import { AuthService } from '../../../../shared/service/auth.service';

@Component({
  selector: 'screen-detail',
  standalone: true,
  imports: [...sharedImports, ScreenOperatingHourComponent],
  templateUrl: './screen-detail.component.html',
  styleUrl: './screen-detail.component.scss'
})
export class ScreenDetailComponent extends AppComponent implements OnInit, OnDestroy {

  @ViewChild('screenOperatingHour') private screenOperatingHour!: ScreenOperatingHourComponent;
  
  // DIALOG STATE 
  protected isOpen = false;
  protected isLoading = false;
  
  // SCREEN DATA 
  protected detail: MvScreenDetail | null = null;
  protected currentScreen: MvScreen | null = null;
  
  private readonly __unSubscribeAll$ = new Subject<void>();

  constructor(
    private readonly injector: Injector,
    private readonly _screenService: ScreenService,
    private readonly _authService: AuthService
  ) {
    super(injector);
  }

  public ngOnInit(): void { }

  //  DIALOG
  public open(screen: MvScreen): void {
    this.currentScreen = screen;
    this.isOpen = true;
    this.isLoading = true;
    this.detail = null;

    const param: MvScreenDetailParam = {
      screenId: screen.id,
      tenantId: this._authService.currentUser.tenantId
    };

    this.loadScreenDetail(param);
  }

  //  SCREEN DETAIL FROM API
  private loadScreenDetail(param: MvScreenDetailParam): void {
    this._screenService.getDetail(param)
      .pipe(
        takeUntil(this.__unSubscribeAll$),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (res) => (this.detail = res?.data ?? null),
        error: (err) => console.error(err),
      });
  }

  
  protected openOperatingHours(): void {
    if (!this.currentScreen) return;
    this.screenOperatingHour.open(this.currentScreen, 'view');
  }


  public ngOnDestroy(): void {
    this.__unSubscribeAll$.next();
    this.__unSubscribeAll$.complete();
  }
}