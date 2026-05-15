import {
  Component,
  EventEmitter,
  Injector,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { finalize, Subject, takeUntil } from 'rxjs';
  
import { AccordionModule } from 'primeng/accordion';
import { BadgeModule } from 'primeng/badge';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';

import { AppComponent } from '../../../app.component';
import { sharedImports } from '../../../shared/component/primeng.import';
import { AuthService } from '../../../shared/service/auth.service';
import { CreativeService } from '../../../cms/creative/service/creative.service';
import { MvCreativeDdl } from '../../../cms/creative/model/creative.model';
import { CampaignService } from '../../service/campaign.service';
import { environment } from '../../../../environments/environment';

import {
  MvCampaignDetail,
  MvCreativeGroupedByScreen,
  MvCreativeRow,
  MvSaveCampaignCreative,
  MvScreenSlot,
} from '../../model/campaign.model';
import {
  deriveMaxDate,
  deriveMinDate,
  formatDateIso,
  getFileIcon,
  renumberSequences,
  toScreenSlot,
} from './assign-creative.util';

@Component({
  selector: 'campaign-assign-creative',
  standalone: true,
  imports: [
    ...sharedImports,
    ReactiveFormsModule,
    FormsModule,
    AccordionModule,
    BadgeModule,
    TableModule,
    TabViewModule,
  ],
  templateUrl: './campaign-assign-creative.component.html',
  styleUrl: './campaign-assign-creative.component.scss',
})
export class AssignCreativeComponent extends AppComponent implements OnInit, OnDestroy {
  @Output() afterFormClosed = new EventEmitter<void>();

  // DIALOG STATE
  protected isOpen = false;
  protected isCreativePickerOpen = false;
  protected isLoading = false;
  protected isSaving = false;

  // CAMPAIGN STATE
  protected campaignId = 0;
  protected campaign: MvCampaignDetail | null = null;
  protected minDate: Date | null = null;
  protected maxDate: Date | null = null;
  protected screenSlots: MvScreenSlot[] = [];
  protected activeTabIndex = 0;

  // CREATIVE PICKER STATE
  protected creatives: MvCreativeDdl[] = [];
  public formGroup!: FormGroup;

  // UTILITY
  public readonly getFileIcon = getFileIcon;

  private activeScreenIndex = -1;
  private readonly __unSubscribeAll$ = new Subject<void>();

  constructor(
    private readonly _fb: FormBuilder,
    private readonly _campaignService: CampaignService,
    private readonly _creativeService: CreativeService,
    private readonly _authService: AuthService,
    private readonly injector: Injector,
  ) {
    super(injector);
  }

  public ngOnInit(): void {
    this.initForm();
    this.loadCreativeDdl();
    this.loadCampaignDetails();
  }

  // FORM 
  private initForm(): void {
    this.formGroup = this._fb.group({
      creativeId:   [null, Validators.required],
      playSequence: [1, [Validators.required, Validators.min(1), Validators.max(999)]],
    });
  }

  private loadCreativeDdl(): void {
    this._creativeService
      .getDdl(this._authService.currentUser.tenantId)
      .pipe(takeUntil(this.__unSubscribeAll$))
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.creatives = res.data;
          }
        },
      });
  }

  private loadCampaignDetails(): void {
    this.isLoading = true;

    this._campaignService
      .getCampaignDetails(this.campaignId)
      .pipe(
        takeUntil(this.__unSubscribeAll$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (res) => {
          if (!res.success || !res.data) return;

          const { dates = [], screens = [] } = res.data;
          this.campaign = res.data;
          this.minDate = deriveMinDate(dates);
          this.maxDate = deriveMaxDate(dates);
          this.screenSlots = screens.map(toScreenSlot);
        },
        error: (err: unknown) => {
          const message =
            (err as { error?: { message?: string } })?.error?.message ??
            'Failed to load campaign details.';
          this.showMessage('error', 'Error', message);
        },
      });
  }

  // UPDATE SCREEN CREATIVES
  private patchScreenCreatives(screenIndex: number, creatives: MvCreativeRow[]): void {
    this.screenSlots = this.screenSlots.map((slot, i) =>
      i === screenIndex ? { ...slot, creatives } : slot,
    );
  }

  private resetState(): void {
    this.screenSlots = [];
    this.minDate = null;
    this.maxDate = null;
    this.campaign = null;
    this.activeTabIndex = 0;
  }

  //  DIALOG
  public open(campaignId: number): void {
    this.campaignId = campaignId;
    this.resetState();
    this.isOpen = true;
    this.loadCampaignDetails();
  }

  // DETAILS TAB - GROUP CREATIVES BY SCREEN
  public get creativesGroupedByScreen(): MvCreativeGroupedByScreen[] {
    return this.screenSlots.map((slot) => ({
      screenName: slot.screenName,
      creatives: (this.campaign?.creatives ?? [])
        .filter((c) => c.screenId === slot.screenId)
        .sort((a, b) => a.playSequence - b.playSequence),
    }));
  }

  public applyDateToAll(date: Date | null): void {
    if (!date) return;
    this.screenSlots = this.screenSlots.map((slot) => ({ ...slot, playDate: date }));
  }

  public openCreativePickerForScreen(screenIndex: number): void {
    this.activeScreenIndex = screenIndex;
    const nextSequence = this.screenSlots[screenIndex].creatives.length + 1;
    this.formGroup.reset({ creativeId: null, playSequence: nextSequence });
    this.isCreativePickerOpen = true;
  }

  public confirmAddCreative(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const { creativeId, playSequence } = this.formGroup.value;
    const selected = this.creatives.find((c) => c.id === creativeId);

    if (!selected) return;

    const newRow: MvCreativeRow = {
      creativeId:   selected.id,
      creativeName: selected.name,
      thumbnailUrl: `${environment.baseUrl}${selected.url}`,
      fileType:     selected.isVideo ? 'video' : 'image',
      playSequence,
    };

    const updatedCreatives = [
      ...this.screenSlots[this.activeScreenIndex].creatives,
      newRow,
    ].sort((a, b) => a.playSequence - b.playSequence);

    renumberSequences(updatedCreatives);
    this.patchScreenCreatives(this.activeScreenIndex, updatedCreatives);
    this.isCreativePickerOpen = false;
  }

  public shiftCreativeUp(screenIndex: number, rowIndex: number): void {
    if (rowIndex === 0) return;
    const creatives = [...this.screenSlots[screenIndex].creatives];
    [creatives[rowIndex - 1], creatives[rowIndex]] = [creatives[rowIndex], creatives[rowIndex - 1]];
    renumberSequences(creatives);
    this.patchScreenCreatives(screenIndex, creatives);
  }

  public shiftCreativeDown(screenIndex: number, rowIndex: number): void {
    const creatives = [...this.screenSlots[screenIndex].creatives];
    if (rowIndex >= creatives.length - 1) return;
    [creatives[rowIndex], creatives[rowIndex + 1]] = [creatives[rowIndex + 1], creatives[rowIndex]];
    renumberSequences(creatives);
    this.patchScreenCreatives(screenIndex, creatives);
  }

  public removeCreative(screenIndex: number, rowIndex: number): void {
    const creatives = [...this.screenSlots[screenIndex].creatives];
    creatives.splice(rowIndex, 1);
    renumberSequences(creatives);
    this.patchScreenCreatives(screenIndex, creatives);
  }

  // VALIDATION - READY SCREEN SLOTS
  public get readyScreenSlots(): MvScreenSlot[] {
    return this.screenSlots.filter((slot) => slot.playDate && slot.creatives.length > 0);
  }

  // VALIDATION - CAN SAVE
  public get canSave(): boolean {
    return this.readyScreenSlots.length > 0 && !this.isSaving;
  }

  public save(): void {
    if (!this.canSave) return;
    this.isSaving = true;

    const payload: MvSaveCampaignCreative = {
      campaignId: this.campaignId,
      createdBy:  this._authService.currentUser.userId,
      screens: this.readyScreenSlots.map((slot) => ({
        screenId:  slot.screenId,
        playDate:  formatDateIso(slot.playDate!),
        creatives: slot.creatives.map((c) => ({
          creativeId:   c.creativeId,
          playSequence: c.playSequence,
        })),
      })),
    };

    this._campaignService
      .createCampaignCreative(payload)
      .pipe(
        takeUntil(this.__unSubscribeAll$),
        finalize(() => (this.isSaving = false)),
      )
      .subscribe({
        next: (res) => {
          if (!res.success) return;
          this.showMessage('success', 'Saved', 'Creative assignments saved successfully.');
          this.afterFormClosed.emit();
          this.close();
        },
        error: (err: unknown) => {
          const message =
            (err as { error?: { message?: string } })?.error?.message ??
            'Failed to save assignments.';
          this.showMessage('error', 'Error', message);
        },
      });
  }

  public close(): void {
    this.isOpen = false;
  }

  public ngOnDestroy(): void {
    this.__unSubscribeAll$.next();
    this.__unSubscribeAll$.complete();
  }
}