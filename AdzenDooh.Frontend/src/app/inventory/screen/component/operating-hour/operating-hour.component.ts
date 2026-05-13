import {
  Component,
  Input,
  OnDestroy,
  Injector,
  inject
} from '@angular/core';
import { Subject, takeUntil, finalize } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';

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
  styleUrl:    './operating-hour.component.scss'
})
export class ScreenOperatingHourComponent extends AppComponent implements OnDestroy {

  private readonly sohService  = inject(ScreenOperatingHourService);
  private readonly authService = inject(AuthService);

  isOpen = false;

  dayOptions  = DayOption;
  selectedDay: DayOfWeek | null = null;

  @Input() screen: MvScreen | null = null;

  allSlots: MvScreenOperatingHour[] = [];
  slotsByDay: Record<string, MvScreenOperatingHour[]> = {};

  isLoadingSlots = false;
  isSaving       = false;
  isDeletingId: number | null = null;
  errorMessage   = '';

  formGroup = new FormGroup({
    startTime:            new FormControl<Date | null>(null, Validators.required),
    endTime:              new FormControl<Date | null>(null, Validators.required),
    averageAudienceCount: new FormControl<number | null>(null),
  });

  private readonly _unSubscribeAll$ = new Subject<void>();

  constructor(private injector: Injector) {
    super(injector);
  }

  open(screen: MvScreen): void {
    this.isOpen      = true;
    this.screen       = screen;
    this.selectedDay  = null;
    this.allSlots     = [];
    this.slotsByDay   = {};
    this.errorMessage = '';
    this.formGroup.reset();
    this.loadSlots();
  }

  private loadSlots(): void {
    if (!this.screen) return;

    this.isLoadingSlots = true;
    this.errorMessage   = '';

    this.sohService.getSlots({ screenId: this.screen.id })
      .pipe(
        takeUntil(this._unSubscribeAll$),
        finalize(() => this.isLoadingSlots = false)
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.allSlots = response.data;
            this.rebuildSlotsByDay();
          }
        },
        error: () => {
          this.errorMessage = 'Failed to load operating hours';
        }
      });
  }

  private rebuildSlotsByDay(): void {
    const map: Record<string, MvScreenOperatingHour[]> = {};
    for (const day of DayOption) {
      map[day.value] = [];
    }
    for (const slot of this.allSlots) {
      if (map[slot.dayOfWeek] !== undefined) {
        map[slot.dayOfWeek].push(slot);
      }
    }
    this.slotsByDay = map;
  }

  onDayChange(): void {
    this.formGroup.reset();
  }

  addSlot(): void {
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
      screenId:             this.screen.id,
      createdBy:            this.authService.currentUser.userId,
      dayOfWeek:            this.selectedDay,
      startTime:            toIso(startTime),
      endTime:              toIso(endTime),
      averageAudienceCount: averageAudienceCount ?? null,
    }];

    this.isSaving = true;

    this.sohService.addSlots(payload)
      .pipe(
        takeUntil(this._unSubscribeAll$),
        finalize(() => this.isSaving = false)
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.allSlots = [...this.allSlots, ...response.data];
            this.rebuildSlotsByDay();
            this.formGroup.reset();
            this.showMessage('success', 'Saved', 'Slot added successfully');
          }
        },
        error: (err: unknown) => {
          const msg = (err as { error?: { message?: string } })?.error?.message ?? 'Failed to add slot';
          this.showMessage('error', 'Error', msg);
        }
      });
  }

  deleteSlot(slot: MvScreenOperatingHour): void {
    this.confirmDialog(
      `Delete slot ${this.formatTime(slot.startTime)} – ${this.formatTime(slot.endTime)}?`,
      'Confirm Delete',
      'pi pi-exclamation-triangle',
      () => this.executeDelete(slot)
    );
  }

  private executeDelete(slot: MvScreenOperatingHour): void {
    this.isDeletingId = slot.id;

    const payload: MvDeleteScreenOperatingHour = {
      id:        slot.id,
      deletedBy: this.authService.currentUser.userId,
    };

    this.sohService.deleteSlot(payload)
      .pipe(
        takeUntil(this._unSubscribeAll$),
        finalize(() => this.isDeletingId = null)
      )
      .subscribe({
        next: () => {
          this.allSlots = this.allSlots.filter(s => s.id !== slot.id);
          this.rebuildSlotsByDay();
          this.showMessage('success', 'Deleted', 'Slot deleted successfully');
        },
        error: () => {
          this.showMessage('error', 'Error', 'Failed to delete slot');
        }
      });
  }

  formatTime(isoString: string | null | undefined): string {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  ngOnDestroy(): void {
    this._unSubscribeAll$.next();
    this._unSubscribeAll$.complete();
  }
}