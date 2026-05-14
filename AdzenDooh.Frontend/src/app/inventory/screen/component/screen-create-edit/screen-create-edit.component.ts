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

  protected formGroup!: FormGroup;
  protected isOpen = false;
  protected isLoading = false;
  protected errorMessage = '';

  private _unSubscribeAll$ = new Subject<void>();

  get isNewScreen(): boolean {
    return !this.screen?.id;
  }

  constructor(
    private injector: Injector,
    private formBuilder: FormBuilder,
    private screenService: ScreenService
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.initForm();
  }

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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['screen'] && this.formGroup && this.screen) {
      this.loadScreenData();
    }
  }

  open(): void {
    if (this.formGroup) {
      if (this.isNewScreen) {
        // Reset form for new screen
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
        // Load data for existing screen
        this.loadScreenData();
      }
      this.errorMessage = '';
      this.isOpen = true;
    }
  }

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

  private saveScreen(): void {
    const payload: MvUpsertScreen = {
      ...this.formGroup.value,
      tenantId: 1,
      createdBy: 1,
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
        }
      });
  }

  private close(): void {
    this.isOpen = false;
  }

  ngOnDestroy(): void {
    this._unSubscribeAll$.next();
    this._unSubscribeAll$.complete();
  }
}