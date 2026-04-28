import { Component, EventEmitter, Injector, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { MvScreen, MvUpsertScreen } from '../../model/screen.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ScreenService } from '../../service/screen.service';
import { finalize, Subject, takeUntil } from 'rxjs';
import { ApiResponse } from '../../../../shared/model/sharedModel';
import { AppComponent } from '../../../../app.component';
import { sharedImports } from '../../../../shared/component/primeng.import';

@Component({
  selector: 'screen-create-edit',
  standalone: true,
  imports: [...sharedImports],
  templateUrl: './screen-create-edit.component.html',
  styleUrl: './screen-create-edit.component.scss'
})
export class ScreenCreateEditComponent extends AppComponent implements OnInit, OnChanges, OnDestroy {

  @Input() screen!: MvScreen;
  @Output() afterFormClosed = new EventEmitter<MvScreen | null>();

  formGroup!: FormGroup;
  isOpen       = false;
  isLoading    = false;
  errorMessage = "";

  private _unSubscribeAll$ = new Subject<void>();

  get isNewScreen(): boolean {
    return !this.screen || !this.screen.id;
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
      name:        ['', Validators.required],
      resolution:  ['', Validators.required],
      orientation: ['landscape', Validators.required],
      macAddress:  ['', Validators.required],
      location:    ['', Validators.required],
      address:     ['']
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['screen'] && this.formGroup) {
      this.errorMessage = "";
      this.formGroup.reset(this.screen);
    }
  }

  public open(): void {
    this.formGroup.patchValue({
      name:        this.screen?.name        || '',
      resolution:  this.screen?.resolution  || '',
      orientation: this.screen?.orientation || 'landscape',
      macAddress:  this.screen?.macAddress  || '',
      location:    this.screen?.location    || '',
      address:     this.screen?.address     || ''
    });
    this.errorMessage = "";
    this.isOpen = true;
  }

  protected close(): void {
    this.isOpen = false;
  }

  protected onSubmit(): void {
    if (this.formGroup.invalid) return;
    this.isLoading    = true;
    this.errorMessage = "";
    this.saveScreen();
  }

  private saveScreen(): void {
    const payload = this.formGroup.value as MvUpsertScreen;
    this.screenService.saveScreen(payload)
      .pipe(takeUntil(this._unSubscribeAll$), finalize(() => this.isLoading = false))
      .subscribe({
        next: (response: ApiResponse<MvScreen[]>) => {
          this.showMessage("success", "Success", this.isNewScreen ? "Screen created!" : "Screen updated!");
          this.afterFormClosed.emit(response.data[0]);
          this.close();
        },
        error: (err: any) => {
          this.handleError(err);
          this.afterFormClosed.emit(null);
        }
      });
  }

  private handleError(err: any): void {
    this.isLoading = false;
    const msg = err?.error?.message ?? "Action failed";
    this.showMessage("error", "Error", msg);
    this.errorMessage = msg;
  }

  ngOnDestroy(): void {
    this._unSubscribeAll$.next();
    this._unSubscribeAll$.complete();
  }
}