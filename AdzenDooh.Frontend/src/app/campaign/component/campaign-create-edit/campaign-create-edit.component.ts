import { Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { finalize, Subject, takeUntil } from 'rxjs';
import { StepsModule } from 'primeng/steps';

import { AppComponent } from '../../../app.component';
import { sharedImports } from '../../../shared/component/primeng.import';
import { AuthService } from '../../../shared/service/auth.service';
import { ApiResponse } from '../../../shared/model/sharedModel';
import { CampaignService } from '../../service/campaign.service';
import { CampaignFormValue, DateRowValue, MvCampaign, MvCreateCampaign, MvScreen } from '../../model/campaign.model';
import { buildDatePayload, validateDateRanges } from '../campaign-create-edit/campaign-date-utils';

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

@Component({
  selector:    'campaign-create-edit',
  standalone:  true,
  imports:     [...sharedImports, StepsModule],
  templateUrl: './campaign-create-edit.component.html',
  styleUrl:    './campaign-create-edit.component.scss',
})
export class CampaignCreateComponent extends AppComponent implements OnInit, OnDestroy {

  @Input()  availableScreens: MvScreen[] = [];
  @Output() afterFormClosed = new EventEmitter<MvCampaign | null>();

  protected formGroup!:  CampaignFormGroup;
  protected isOpen       = false;
  protected isLoading    = false;
  protected errorMessage = '';
  protected activeStep   = 0;
  protected today        = new Date();

  readonly steps: { label: string }[] = [
    { label: 'Details' },
    { label: 'Screens' },
    { label: 'Dates'   },
  ];

  private readonly _unSubscribeAll$ = new Subject<void>();

  constructor(
    private readonly injector:        Injector,
    private readonly fb:              FormBuilder,
    private readonly campaignService: CampaignService,
    private readonly authService:     AuthService,
  ) {
    super(injector);
  }

  ngOnInit(): void { this.buildForm(); }

  get screenSelections(): FormArray<FormControl<boolean | null>> {
    return this.formGroup.controls.screenSelections;
  }

  get dates(): FormArray<DateRowGroup> {
    return this.formGroup.controls.dates;
  }

  open(): void {
    this.activeStep   = 0;
    this.errorMessage = '';
    this.today        = new Date();

    this.formGroup.patchValue({ name: '', remarks: '', status: 0 });
    this.formGroup.setControl('screenSelections', this.buildScreenCheckboxes());
    this.formGroup.setControl('dates', this.fb.array<DateRowGroup>([]));

    this.isOpen = true;
  }

  nextStep(): void {
    if (!this.canAdvanceFrom(this.activeStep)) return;
    if (this.activeStep < this.steps.length - 1) this.activeStep++;
  }

  prevStep(): void {
    if (this.activeStep > 0) this.activeStep--;
  }

  addDateRow(): void {
    this.dates.push(
      this.fb.group({
        startDate: this.fb.control<Date | null>(null, Validators.required),
        endDate:   this.fb.control<Date | null>(null, Validators.required),
      }) as DateRowGroup
    );
  }

  removeDateRow(index: number): void {
    this.dates.removeAt(index);
  }

  onSubmit(): void {
    if (!this.validateDates()) return;
    this.isLoading    = true;
    this.errorMessage = '';
    this.save();
  }

  protected onHide(): void { this.cancel(); }
  protected cancel(): void { this.afterFormClosed.emit(null); this.close(); }

  private buildForm(): void {
    this.formGroup = this.fb.group<CampaignFormGroup['controls']>({
      name:             this.fb.control<string | null>('', Validators.required),
      remarks:          this.fb.control<string | null>(''),
      status:           this.fb.control<number | null>(0),
      screenSelections: this.fb.array<FormControl<boolean | null>>([]),
      dates:            this.fb.array<DateRowGroup>([]),
    });
  }

  private buildScreenCheckboxes(): FormArray<FormControl<boolean | null>> {
    const controls = this.availableScreens.map(() => this.fb.control<boolean | null>(false));
    return this.fb.array(controls);
  }

  private canAdvanceFrom(step: number): boolean {
    if (step === 0) return this.validateName();
    if (step === 1) return this.validateScreens();
    return true;
  }

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

  private save(): void {
    this.campaignService.createCampaign(this.buildPayload())
      .pipe(
        takeUntil(this._unSubscribeAll$),
        finalize(() => this.isLoading = false),
      )
      .subscribe({
        next:  res => this.onSaveSuccess(res),
        error: err => this.onSaveError(err),
      });
  }

  private onSaveSuccess(response: ApiResponse<MvCampaign>): void {
    this.showMessage('success', 'Success', 'Campaign created successfully');
    this.afterFormClosed.emit(response.data);
    this.close();
  }

  private onSaveError(err: unknown): void {
    const msg = err instanceof Error
      ? err.message
      : (err as { error?: { message?: string } })?.error?.message ?? 'Action failed';
    this.errorMessage = msg;
    this.showMessage('error', 'Error', msg);
  }

  private buildPayload(): MvCreateCampaign {
    const raw = this.formGroup.getRawValue();
    const { tenantId, userId: createdBy } = this.authService.currentUser;

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
      .map(x => ({ screenId: x.screen.id }));
  }

  private close(): void { this.isOpen = false; }

  ngOnDestroy(): void {
    this._unSubscribeAll$.next();
    this._unSubscribeAll$.complete();
  }
}