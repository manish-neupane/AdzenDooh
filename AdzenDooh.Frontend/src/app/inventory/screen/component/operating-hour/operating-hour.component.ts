// ─── screen-operating-hour.component.ts ──────────────────────────────────────
// RESPONSIBILITY:
//   • Opens as a p-sidebar overlay from ScreenListComponent
//   • Loads all slots for the given screen once on open
//   • Filters slots in-memory when the selected day changes (no extra HTTP call)
//   • Handles add (single slot per submission) and delete actions

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
  DAY_OPTIONS,
  DayOfWeek
} from '../../model/operating-hour.model';

@Component({
  selector: 'screen-operating-hour',
  standalone: true,
  imports: [...sharedImports,CalendarModule],
  templateUrl: './operating-hour.component.html',
  styleUrl:    './operating-hour.component.scss'
})
export class ScreenOperatingHourComponent extends AppComponent implements OnDestroy {

 
 
  @Input() screen: MvScreen = {} as MvScreen;

 
  private sohService = inject(ScreenOperatingHourService);


  visible = false;

  
  dayOptions   = DAY_OPTIONS;
  selectedDay: DayOfWeek | null = null;

  // slot data
  allSlots:     MvScreenOperatingHour[] = [];   
  filteredSlots: MvScreenOperatingHour[] = [];  

  //  Loading / Error 
  isLoadingSlots  = false;
  isSaving        = false;
  isDeletingId: number | null = null;
  errorMessage    = '';

  
  // p-calendar 
  form = new FormGroup({
    startTime:            new FormControl<Date | null>(null, Validators.required),
    endTime:              new FormControl<Date | null>(null, Validators.required),
    averageAudienceCount: new FormControl<number | null>(null)
  });

  private _unSubscribeAll$ = new Subject<void>();

  constructor(private injector: Injector) {
    super(injector);
  }


  open(): void {
    this.visible     = true;
    this.selectedDay = null;
    this.allSlots    = [];
    this.filteredSlots = [];
    this.form.reset();
    this.loadSlots();
  }

  // ─── Data Loading 
  private loadSlots(): void {
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
            this.applyDayFilter();
          }
        },
        error: () => {
          this.errorMessage = 'Failed to load operating hours';
        }
      });
  }

  
  onDayChange(): void {
    this.form.reset();
    this.applyDayFilter();
  }

  private applyDayFilter(): void {
    if (this.selectedDay === null) {
      this.filteredSlots = [];
      return;
    }
    this.filteredSlots = this.allSlots.filter(s => s.dayOfWeek === this.selectedDay);
  }


  addSlot(): void {
    if (this.form.invalid || this.selectedDay === null) return;

    const { startTime, endTime, averageAudienceCount } = this.form.value;

    
    const toIso = (d: Date) => {
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      return `2026-01-01T${hh}:${mm}:00`;
    };

    const payload: MvAddScreenOperatingHour[] = [{
      screenId:             this.screen.id,
      createdBy:            1,             
      dayOfWeek:            this.selectedDay,
      startTime:            toIso(startTime!),
      endTime:              toIso(endTime!),
      averageAudienceCount: averageAudienceCount ?? null
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
            this.applyDayFilter();
            this.form.reset();
            this.showMessage('success', 'Saved', 'Slot added successfully');
          }
        },
        error: (err) => {
          this.showMessage('error', 'Error', err?.error?.message ?? 'Failed to add slot');
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
      deletedBy: 1   
    };

    this.sohService.deleteSlot(payload)
      .pipe(
        takeUntil(this._unSubscribeAll$),
        finalize(() => this.isDeletingId = null)
      )
      .subscribe({
        next: () => {
         
          this.allSlots = this.allSlots.filter(s => s.id !== slot.id);
          this.applyDayFilter();
          this.showMessage('success', 'Deleted', 'Slot deleted successfully');
        },
        error: () => {
          this.showMessage('error', 'Error', 'Failed to delete slot');
        }
      });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  // Extracts HH:mm from ISO datetime string for display
  formatTime(isoString: string): string {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  ngOnDestroy(): void {
    this._unSubscribeAll$.next();
    this._unSubscribeAll$.complete();
  }
}