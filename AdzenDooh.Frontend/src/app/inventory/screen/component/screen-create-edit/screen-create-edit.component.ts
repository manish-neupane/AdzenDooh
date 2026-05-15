import {
  Component,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  OnChanges,
  SimpleChanges
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
export class ScreenCreateEditComponent extends AppComponent implements OnInit, OnDestroy, OnChanges {

  @Input() screen!: MvScreen;
  @Output() afterFormClosed = new EventEmitter<MvScreen | null>();

  // DIALOG STATE
  protected formGroup!: FormGroup;
  protected isOpen = false;
  protected isLoading = false;
  protected errorMessage = '';

  // MAP PICKER STATE
  protected isMapDialogOpen = false;
  protected mapSearchText = '';
  protected selectedLatitude: number | null = null;
  protected selectedLongitude: number | null = null;

  private _unSubscribeAll$ = new Subject<void>();

  // GETTER
  public get isNewScreen(): boolean {
    return !this.screen?.id;
  }

  constructor(
    private injector: Injector,
    private formBuilder: FormBuilder,
    private _screenService: ScreenService
  ) {
    super(injector);
  }

  public ngOnInit(): void {
    this.initForm();
  }

  // FORM 
  private initForm(): void {
    this.formGroup = this.formBuilder.group({
      name: ['', Validators.required],
      resolution: ['', Validators.required],
      orientation: ['landscape', Validators.required],
      macAddress: ['', Validators.required],
      location: ['', Validators.required],
      status: ['active', Validators.required],
      address: ['']
    });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['screen'] && this.formGroup && this.screen) {
      this.loadScreenData();
    }
  }

  // LOAD SCREEN DATA INTO FORM
  private loadScreenData(): void {
    this.formGroup.patchValue({
      name: this.screen?.name ?? '',
      resolution: this.screen?.resolution ?? '',
      orientation: this.screen?.orientation ?? 'landscape',
      macAddress: this.screen?.macAddress ?? '',
      location: this.screen?.location ?? '',
      address: this.screen?.address ?? '',
      status: this.screen?.status ?? 'active'
    });
  }

  //  DIALOG
  public open(): void {
    if (this.formGroup) {
      if (this.isNewScreen) {
        this.formGroup.reset({
          name: '',
          resolution: '',
          orientation: 'landscape',
          macAddress: '',
          location: '',
          address: '',
          status: 'active'
        });
      } else {
        this.loadScreenData();
      }
      this.errorMessage = '';
      this.isOpen = true;
    }
  }

  protected onHide(): void {
    this.close();
  }

  protected cancel(): void {
    this.close();
  }

  protected onSubmit(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    this.saveScreen();
  }

  // SAVE SCREEN TO API
  private saveScreen(): void {
    const payload: MvUpsertScreen = {
      ...this.formGroup.value,
      tenantId: 1,
      createdBy: 1,
      ...(this.isNewScreen ? {} : { id: this.screen.id })
    };

    this._screenService.save(payload)
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
        }
      });
  }

  //  MAP 
  protected openMapPicker(): void {
    this.isMapDialogOpen = false;
  }

  protected confirmMapLocation(): void {
    if (this.selectedLatitude !== null && this.selectedLongitude !== null) {
      this.formGroup.patchValue({
        location: `${this.selectedLatitude}, ${this.selectedLongitude}`
      });
      this.isMapDialogOpen = false;
    }
  }

  private close(): void {
    this.isOpen = false;
  }

  public ngOnDestroy(): void {
    this._unSubscribeAll$.next();
    this._unSubscribeAll$.complete();
  }
}