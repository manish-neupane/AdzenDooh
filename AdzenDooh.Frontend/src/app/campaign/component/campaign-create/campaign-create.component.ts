import {
  Component,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { finalize, Subject, takeUntil } from 'rxjs';
import { StepsModule } from 'primeng/steps';

import { AppComponent } from '../../../app.component';
import { sharedImports } from '../../../shared/component/primeng.import';
import { AuthService } from '../../../shared/service/auth.service';
import { CampaignService } from '../../service/campaign.service';
import {
  CampaignFormValue,
  DateRowValue,
  MvCampaign,
  MvCreateCampaign,
  MvScreen,
} from '../../model/campaign.model';
import { buildDatePayload, validateDateRanges } from './campaign-date-utils';

//  Form type aliases 

type DateRowGroup = FormGroup<{
  startDate: FormControl<Date | null>;
  endDate:   FormControl<Date | null>;
}>;

type CampaignFormGroup = FormGroup<{
  name:             FormControl<string | null>;
  remarks:          FormControl<string | null>;
  status:           FormControl<number | null>;
  screenSelections: FormArray<FormControl<boolean | null>>;
  dates:            FormArray<DateRowGroup>;
}>;

// ======================================

@Component({
  selector:    'campaign-create-edit',
  standalone:  true,
  imports:     [...sharedImports, StepsModule],
  templateUrl: './campaign-create.component.html',
  styleUrl:    './campaign-create.component.scss',
})
export class CampaignCreateComponent extends AppComponent implements OnDestroy {

  @Input()  availableScreens: MvScreen[] = [];
  @Output() afterFormClosed = new EventEmitter<MvCampaign | null>();

  protected formGroup!: CampaignFormGroup;
  protected isDialogOpen = false;
  protected isLoading    = false;
  protected activeStep   = 0;
  protected today        = new Date();

  private readonly __unSubscribeAll$ = new Subject<void>();

  readonly steps: { label: string }[] = [
    { label: 'Details' },
    { label: 'Screens' },
    { label: 'Dates'   },
  ];

  constructor(
    private injector:          Injector,
    private _fb:               FormBuilder,
    private _campaignService:  CampaignService,
    private _authService:      AuthService,
  ) {
    super(injector);
    this.initForm();
  }
 

    private initForm(): void {
    this.formGroup = this._fb.group<CampaignFormGroup['controls']>({
      name:             this._fb.control<string | null>('', Validators.required),
      remarks:          this._fb.control<string | null>(''),
      status:           this._fb.control<number | null>(0),
      screenSelections: this._fb.array<FormControl<boolean | null>>([]),
      dates:            this._fb.array<DateRowGroup>([]),
    });
  }
  //  Form accessors 

  protected get screenSelections(): FormArray<FormControl<boolean | null>> {
    return this.formGroup.controls.screenSelections;
  }

  protected get dates(): FormArray<DateRowGroup> {
    return this.formGroup.controls.dates;
  }

  //  Open / close 

  open(): void {
    this.activeStep = 0;
    this.today      = new Date();

    this.formGroup.patchValue({ name: '', remarks: '', status: 0 });
    this.formGroup.setControl('screenSelections', this.buildScreenCheckboxes());
    this.formGroup.setControl('dates', this._fb.array<DateRowGroup>([]));

    this.isDialogOpen = true;
  }

  protected onHide(): void {
    this.cancel();
  }

  protected cancel(): void {
    this.afterFormClosed.emit(null);
    this.close();
  }

  private close(): void {
    this.isDialogOpen = false;
  }

  //   Step navigation 

  nextStep(): void {
    if (!this.canAdvanceFrom(this.activeStep)) return;
    if (this.activeStep < this.steps.length - 1) this.activeStep++;
  }

  prevStep(): void {
    if (this.activeStep > 0) this.activeStep--;
  }

  private canAdvanceFrom(step: number): boolean {
    if (step === 0) return this.validateName();
    if (step === 1) return this.validateScreens();
    return true;
  }

  // Date rows 

  addDateRow(): void {
    this.dates.push(
      this._fb.group({
        startDate: this._fb.control<Date | null>(null, Validators.required),
        endDate:   this._fb.control<Date | null>(null, Validators.required),
      }) as DateRowGroup,
    );
  }

  removeDateRow(index: number): void {
    this.dates.removeAt(index);
  }

  //  Validation 

  private validateName(): boolean {
    const ctrl = this.formGroup.controls.name;
    if (ctrl.invalid) { ctrl.markAsTouched(); return false; }
    return true;
  }

  private validateScreens(): boolean {
    const hasSelection = this.getSelectedScreens().length > 0;
    if (!hasSelection) this.showMessage('warn', 'Validation', 'Select at least one screen.');
    return hasSelection;
  }

  private validateDates(): boolean {
    if (this.dates.length === 0) {
      this.showMessage('warn', 'Validation', 'Add at least one date range.');
      return false;
    }
    if (this.dates.invalid) {
      this.dates.markAllAsTouched();
      return false;
    }
    const error = validateDateRanges(this.dates.getRawValue() as DateRowValue[]);
    if (error) { this.showMessage('warn', 'Validation', error); return false; }
    return true;
  }

  //  5. Save 

  onSubmit(): void {
    if (!this.validateDates()) return;
    this.isLoading = true;

    this._campaignService
      .createCampaign(this.buildPayload())
      .pipe(
        takeUntil(this.__unSubscribeAll$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (res) => {
          this.showMessage('success', 'Success', 'Campaign created successfully.');
          this.afterFormClosed.emit(res.data);
          this.close();
        },
        error: (err: unknown) => {
          const message =
            err instanceof Error
              ? err.message
              : (err as { error?: { message?: string } })?.error?.message ?? 'Action failed.';
          this.showMessage('error', 'Error', message);
        },
      });
  }

  



  private buildScreenCheckboxes(): FormArray<FormControl<boolean | null>> {
    const controls = this.availableScreens.map(() =>
      this._fb.control<boolean | null>(false),
    );
    return this._fb.array(controls);
  }

  private buildPayload(): MvCreateCampaign {
    const raw = this.formGroup.getRawValue();
    const { tenantId, userId: createdBy } = this._authService.currentUser;

    return {
      tenantId,
      createdBy,
      name:           raw.name    ?? '',
      remarks:        raw.remarks ?? '',
      status:         raw.status  ?? 0,
      durationInDays: 0,
      screens:        this.getSelectedScreens(),
      dates:          buildDatePayload(this.dates.getRawValue() as DateRowValue[]),
    };
  }

  private getSelectedScreens(): { screenId: number }[] {
    return this.screenSelections.controls
      .map((ctrl, i) => ({ checked: ctrl.value === true, screen: this.availableScreens[i] }))
      .filter((x): x is { checked: true; screen: MvScreen } => x.checked && x.screen != null)
      .map((x) => ({ screenId: x.screen.id }));
  }



  ngOnDestroy(): void {
    this.__unSubscribeAll$.next();
    this.__unSubscribeAll$.complete();
  }
}