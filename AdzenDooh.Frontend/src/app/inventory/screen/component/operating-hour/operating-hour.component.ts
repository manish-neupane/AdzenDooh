import {
  Component,
  Input,
  OnDestroy,
  Injector,
  OnInit
} from '@angular/core';
import { Subject, takeUntil, finalize } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { sharedImports } from '../../../../shared/component/primeng.import';
import { AppComponent } from '../../../../app.component';
import { ScreenOperatingHourService } from '../../service/operating-hour.service';
import { MvScreen } from '../../model/screen.model';
import { CalendarModule } from 'primeng/calendar';
import {
  MvScreenOperatingHour,
  MvAddScreenOperatingHour,
  MvDeleteScreenOperatingHour,
  DayOption,
  DayOfWeek
} from '../../model/operating-hour.model';
import { AuthService } from '../../../../shared/service/auth.service';

@Component({
  selector: 'screen-operating-hour',
  standalone: true,
  imports: [...sharedImports, CalendarModule],
  templateUrl: './operating-hour.component.html',
  styleUrl: './operating-hour.component.scss'
})
export class ScreenOperatingHourComponent extends AppComponent implements OnInit, OnDestroy {

  @Input() screen: MvScreen | null = null;
  @Input() mode: 'edit' | 'view' = 'edit';

  // DIALOG STATE
  protected isOpen = false;
  protected isLoading = false;
  protected isCreating = false;
  protected isDeletingId: number | null = null;
  protected errorMessage = '';

  // OPERATING HOURS STATE
  protected dayOptions = DayOption;
  protected selectedDay: DayOfWeek | null = null;
  protected operatingHours: MvScreenOperatingHour[] = [];
  protected operatingHoursByDay: Record<string, MvScreenOperatingHour[]> = {};

  
  public formGroup!: FormGroup;

  private readonly __unSubscribeAll$ = new Subject<void>();

  constructor(
    private injector: Injector,
    private _fb: FormBuilder,
    private readonly _screenOperatingHourService: ScreenOperatingHourService,
    private readonly _authService: AuthService
  ) {
    super(injector);
  }

  public ngOnInit(): void {
    this.initForm();
  }

  // FORM 
  private initForm(): void {
    this.formGroup = this._fb.group({
      startTime: this._fb.control<Date | null>(null, Validators.required),
      endTime: this._fb.control<Date | null>(null, Validators.required),
      averageAudienceCount: this._fb.control<number | null>(null, Validators.required),
    });
  }

  // CHECK IF VIEW MODE
  protected get isViewMode(): boolean {
    return this.mode === 'view';
  }

  //  DIALOG
  public open(screen: MvScreen, mode: 'edit' | 'view' = 'edit'): void {
    this.isOpen = true;
    this.screen = screen;
    this.mode = mode;
    this.selectedDay = null;
    this.operatingHours = [];
    this.operatingHoursByDay = {};
    this.errorMessage = '';
    
    if (this.mode === 'edit') {
      this.initForm();
    }
    
    this.loadOperatingHours();
  }

  // LOAD OPERATING HOURS FROM API
  private loadOperatingHours(): void {
    if (!this.screen) return;

    this.isLoading = true;
    this.errorMessage = '';

    this._screenOperatingHourService.getHours({ screenId: this.screen.id })
      .pipe(
        takeUntil(this.__unSubscribeAll$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.operatingHours = response.data;
            this.rebuildOperatingHoursByDay();
          }
        },
        error: () => {
          this.errorMessage = 'Failed to load operating hours';
        }
      });
  }

  //  HOURS GROUPED BY DAY
  private rebuildOperatingHoursByDay(): void {
    const map: Record<string, MvScreenOperatingHour[]> = {};
    
    for (const day of DayOption) {
      map[day.value] = [];
    }
    
    for (const hour of this.operatingHours) {
      if (map[hour.dayOfWeek] !== undefined) {
        map[hour.dayOfWeek].push(hour);
      }
    }
    
    this.operatingHoursByDay = map;
  }

  // HANDLE DAY SELECTION CHANGE
  public onDayChange(): void {
    this.initForm();
  }

  public createOperatingHour(): void {
    if (this.formGroup.invalid || this.selectedDay === null || !this.screen) return;

    const { startTime, endTime, averageAudienceCount } = this.formGroup.getRawValue();

    if (!startTime || !endTime) return;

    const TIME_ONLY_DATE = '1970-01-01';

    const toIso = (d: Date): string => {
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      return `${TIME_ONLY_DATE}T${hh}:${mm}:00`;
    };

    const payload: MvAddScreenOperatingHour[] = [{
      screenId: this.screen.id,
      createdBy: this._authService.currentUser.userId,
      dayOfWeek: this.selectedDay,
      startTime: toIso(startTime),
      endTime: toIso(endTime),
      averageAudienceCount: averageAudienceCount ?? null,
    }];

    this.isCreating = true;

    this._screenOperatingHourService.create(payload)
      .pipe(
        takeUntil(this.__unSubscribeAll$),
        finalize(() => this.isCreating = false)
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.operatingHours = [...this.operatingHours, ...response.data];
            this.rebuildOperatingHoursByDay();
            this.initForm();
            this.showMessage('success', 'Created', 'Operating hour created successfully');
          }
        },
        error: (err: unknown) => {
          const msg = (err as { error?: { message?: string } })?.error?.message ?? 'Failed to create operating hour';
          this.showMessage('error', 'Error', msg);
        }
      });
  }

  public deleteOperatingHour(operatingHour: MvScreenOperatingHour): void {
    this.confirmDialog(
      `Delete operating hour ${this.formatTime(operatingHour.startTime)} – ${this.formatTime(operatingHour.endTime)}?`,
      'Confirm Delete',
      'pi pi-exclamation-triangle',
      () => this.executeDelete(operatingHour)
    );
  }

  private executeDelete(operatingHour: MvScreenOperatingHour): void {
    this.isDeletingId = operatingHour.id;

    const payload: MvDeleteScreenOperatingHour = {
      id: operatingHour.id,
      deletedBy: this._authService.currentUser.userId,
    };

    this._screenOperatingHourService.delete(payload)
      .pipe(
        takeUntil(this.__unSubscribeAll$),
        finalize(() => this.isDeletingId = null)
      )
      .subscribe({
        next: () => {
          this.operatingHours = this.operatingHours.filter(h => h.id !== operatingHour.id);
          this.rebuildOperatingHoursByDay();
          this.showMessage('success', 'Deleted', 'Operating hour deleted successfully');
        },
        error: () => {
          this.showMessage('error', 'Error', 'Failed to delete operating hour');
        }
      });
  }

  public formatTime(isoString: string | null | undefined): string {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  public ngOnDestroy(): void {
    this.__unSubscribeAll$.next();
    this.__unSubscribeAll$.complete();
  }
}