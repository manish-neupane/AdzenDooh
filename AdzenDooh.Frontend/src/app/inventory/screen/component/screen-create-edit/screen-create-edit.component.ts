// ─── screen-create-edit.component.ts ─────────────────────────────────────────
// RESPONSIBILITY: Own the dialog UI, the reactive form, and the save HTTP call.
//
// Lifecycle of this component:
//   1. Parent sets [screen] input (could be empty object for add, or full object for edit)
//   2. Parent calls open() via template reference variable
//   3. open() populates the form and shows the dialog
//   4. User submits → saveScreen() → emits afterFormClosed with the saved record
//   5. User cancels → close() → emits afterFormClosed(null)
//
// IMPORTANT — form population happens ONLY in open().
// ngOnChanges does NOT touch the form. This avoids a race condition where
// ngOnChanges fires and resets the form before open() has patched the values.

import {
  Component,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil, finalize } from 'rxjs';

import { AppComponent } from '../../../../app.component';
import { sharedImports } from '../../../../shared/component/primeng.import';
import { MvScreen, MvUpsertScreen } from '../../model/screen.model';
import { ScreenService } from '../../service/screen.service';
import { ApiResponse } from '../../../../shared/model/sharedModel';

@Component({
  selector: 'screen-create-edit',
  standalone: true,
  imports: [...sharedImports],
  templateUrl: './screen-create-edit.component.html',
  styleUrl: './screen-create-edit.component.scss'
})
export class ScreenCreateEditComponent extends AppComponent implements OnInit, OnDestroy {

  // ─── Inputs & Outputs ─────────────────────────────────────────────────────
  @Input() screen!: MvScreen;
  @Output() afterFormClosed = new EventEmitter<MvScreen | null>();

  // ─── State ────────────────────────────────────────────────────────────────
  formGroup!: FormGroup;
  isOpen       = false;
  isLoading    = false;
  errorMessage = '';

  private _unSubscribeAll$ = new Subject<void>();

  // ─── Computed ─────────────────────────────────────────────────────────────
  get isNewScreen(): boolean {
    return !this.screen?.id;
  }

  // ─── Constructor ──────────────────────────────────────────────────────────
  constructor(
    private injector: Injector,
    private formBuilder: FormBuilder,
    private screenService: ScreenService
  ) {
    super(injector);
  }

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.buildForm();
  }

  ngOnDestroy(): void {
    this._unSubscribeAll$.next();
    this._unSubscribeAll$.complete();
  }

  // ─── Form ─────────────────────────────────────────────────────────────────
  private buildForm(): void {
    this.formGroup = this.formBuilder.group({
      name:        ['', Validators.required],
      resolution:  ['', Validators.required],
      orientation: ['landscape', Validators.required],
      macAddress:  ['', Validators.required],
      location:    ['', Validators.required],
      address:     ['']
    });
  }

  // ─── Public API (called by parent via template ref) ───────────────────────
  open(): void {
    // Reset the form cleanly first, then patch with current screen values.
    // Doing both here (not in ngOnChanges) keeps population in one place
    // and avoids any timing issues.
    this.formGroup.reset({
      name:        this.screen?.name        ?? '',
      resolution:  this.screen?.resolution  ?? '',
      orientation: this.screen?.orientation ?? 'landscape',
      macAddress:  this.screen?.macAddress  ?? '',
      location:    this.screen?.location    ?? '',
      address:     this.screen?.address     ?? ''
    });
    this.errorMessage = '';
    this.isOpen       = true;
  }

  // ─── Dialog Event Handlers ────────────────────────────────────────────────
  protected onHide(): void {
    // Called when the user clicks the X or clicks outside the dialog.
    // We treat this the same as Cancel.
    this.close();
  }

  protected cancel(): void {
    this.close();
  }

  protected onSubmit(): void {
    if (this.formGroup.invalid) {
      // Mark all fields as touched so validation messages appear
      this.formGroup.markAllAsTouched();
      return;
    }
    this.isLoading    = true;
    this.errorMessage = '';
    this.saveScreen();
  }

  // ─── Save ─────────────────────────────────────────────────────────────────
  private saveScreen(): void {
    const payload: MvUpsertScreen = {
      ...this.formGroup.value,
      // Include id only for edits; 0 or undefined signals a create
      ...(this.isNewScreen ? {} : { id: this.screen.id })
    };

    this.screenService.saveScreen(payload)
      .pipe(
        takeUntil(this._unSubscribeAll$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response: ApiResponse<MvScreen[]>) => {
          const saved = response.data[0];
          this.showMessage(
            'success',
            'Success',
            this.isNewScreen ? 'Screen created successfully' : 'Screen updated successfully'
          );
          this.afterFormClosed.emit(saved);
          this.close();
        },
        error: (err: any) => {
          const msg = err?.error?.message ?? 'Action failed';
          this.errorMessage = msg;
          this.showMessage('error', 'Error', msg);
          // Do NOT emit afterFormClosed here — the dialog stays open so the
          // user can correct the error and try again.
        }
      });
  }

  // ─── Close ────────────────────────────────────────────────────────────────
  private close(): void {
    this.isOpen = false;
  }
}