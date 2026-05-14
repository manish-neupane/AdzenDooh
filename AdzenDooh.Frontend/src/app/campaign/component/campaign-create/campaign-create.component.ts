import {
  Component,
  EventEmitter,
  Injector,
  Input,
  OnInit,
  OnDestroy,
  Output,
  ViewChild,
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
  MvScreenOption,
} from '../../model/campaign.model';
import { buildDatePayload, validateDateRanges } from './campaign-date-utils';


@Component({
  selector: 'campaign-create-edit',
  standalone: true,
  imports: [...sharedImports, StepsModule],
  templateUrl: './campaign-create.component.html',
  styleUrl: './campaign-create.component.scss',
})
export class CampaignCreateComponent extends AppComponent implements OnInit, OnDestroy {

  @Input() availableScreens: MvScreenOption[] = [];
  @Output() afterFormClosed = new EventEmitter<MvCampaign | null>();
  
 
  protected isDialogOpen = false;
  protected isLoading = false;
  protected activeStep = 0;
  protected today = new Date();
  protected formGroup!: FormGroup;

  private readonly __unSubscribeAll$ = new Subject<void>();

  readonly steps = [
    { label: 'Details' },
    { label: 'Screens' },
    { label: 'Dates' },
  ];

  constructor(
    private injector: Injector,
    private _fb: FormBuilder,
    private _campaignService: CampaignService,
    private _authService: AuthService,
  ) {
    super(injector);
    this.initForm();
  }


  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.formGroup = this._fb.group({
      name: this._fb.control('', Validators.required),
      remarks: this._fb.control(''),
      status: this._fb.control(0),
      screenSelections: this._fb.array([]),
      dates: this._fb.array([]),
    });
  }

  get screenSelections(): FormArray {
    return this.formGroup.get('screenSelections') as FormArray;
  }

  get dates(): FormArray {
    return this.formGroup.get('dates') as FormArray;
  }

  open(): void {
    this.activeStep = 0;
    this.today = new Date();

    this.formGroup.patchValue({ name: '', remarks: '', status: 0 });
    this.formGroup.setControl('screenSelections', this.buildScreenCheckboxes());
    this.formGroup.setControl('dates', this._fb.array([]));

    this.isDialogOpen = true;
  }

  onHide(): void {
    this.cancel();
  }

  cancel(): void {
    this.afterFormClosed.emit(null);
    this.close();
  }

  private close(): void {
    this.isDialogOpen = false;
  }
 


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

  addDateRow(): void {
    this.dates.push(
      this._fb.group({
        startDate: this._fb.control(null, Validators.required),
        endDate: this._fb.control(null, Validators.required),
      })
    );
  }

  removeDateRow(index: number): void {
    this.dates.removeAt(index);
  }

  private validateName(): boolean {
    const ctrl = this.formGroup.get('name');
    if (ctrl?.invalid) {
      ctrl.markAsTouched();
      return false;
    }
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
    const error = validateDateRanges(this.dates.getRawValue());
    if (error) {
      this.showMessage('warn', 'Validation', error);
      return false;
    }
    return true;
  }

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
          const message = err instanceof Error
            ? err.message
            : (err as any)?.error?.message ?? 'Action failed.';
          this.showMessage('error', 'Error', message);
        },
      });
  }

  private buildScreenCheckboxes(): FormArray {
    const controls = this.availableScreens.map(() =>
      this._fb.control(false)
    );
    return this._fb.array(controls);
  }

  private buildPayload(): MvCreateCampaign {
    const raw = this.formGroup.getRawValue();
    const { tenantId, userId: createdBy } = this._authService.currentUser;

    return {
      tenantId,
      createdBy,
      name: raw.name ?? '',
      remarks: raw.remarks ?? '',
      status: raw.status ?? 0,
      durationInDays: 0,
      screens: this.getSelectedScreens(),
      dates: buildDatePayload(this.dates.getRawValue()),
    };
  }

  private getSelectedScreens(): { screenId: number }[] {
    return this.screenSelections.controls
      .map((ctrl, i) => ({ checked: ctrl.value === true, screen: this.availableScreens[i] }))
      .filter(x => x.checked && x.screen != null)
      .map(x => ({ screenId: x.screen.id }));
  }

  ngOnDestroy(): void {
    this.__unSubscribeAll$.next();
    this.__unSubscribeAll$.complete();
  }
}