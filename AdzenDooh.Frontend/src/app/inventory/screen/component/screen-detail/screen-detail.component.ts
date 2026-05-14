import { Component, Injector, OnDestroy, ViewChild } from '@angular/core';
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
export class ScreenDetailComponent extends AppComponent implements OnDestroy {

  @ViewChild('screenOperatingHour') screenOperatingHour!: ScreenOperatingHourComponent;
  
  isOpen = false;
  isLoading = false;
  detail: MvScreenDetail | null = null;
  currentScreen: MvScreen | null = null;
  private __unSubscribeAll$ = new Subject<void>();

  constructor(
    injector: Injector,
    private _screenService: ScreenService,
    private _authService: AuthService
  ) {
    super(injector);
  }

open(screenId: number): void {
  this.currentScreen = { id: screenId } as MvScreen; 
  this.isOpen = true;
  this.isLoading = true;
  this.detail = null;

  const param: MvScreenDetailParam = {
    screenId,
    tenantId: this._authService.currentUser.tenantId
  };

  this._screenService.getDetail(param)
    .pipe(
      takeUntil(this.__unSubscribeAll$),
      finalize(() => (this.isLoading = false))
    )
    .subscribe({
      next: res => (this.detail = res?.data ?? null),
      error: err => console.error(err),
    });
}

  openOperatingHours(): void {
    if (!this.currentScreen) return;
    this.screenOperatingHour.open(this.currentScreen, 'edit');
  }

  ngOnDestroy(): void {
    this.__unSubscribeAll$.next();
    this.__unSubscribeAll$.complete();
  }
}