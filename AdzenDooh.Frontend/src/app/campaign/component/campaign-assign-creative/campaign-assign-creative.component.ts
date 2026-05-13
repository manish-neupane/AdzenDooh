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

import { TabViewModule } from 'primeng/tabview';
import { AppComponent } from '../../../app.component';
import { sharedImports } from '../../../shared/component/primeng.import';
import { CampaignService } from '../../service/campaign.service';
import { AuthService } from '../../../shared/service/auth.service';
import { AccordionModule } from 'primeng/accordion';
import { BadgeModule } from 'primeng/badge';
import {TableModule} from 'primeng/table';

import {
  MvCampaignDetail,
  MvSaveCampaignCreative,
  MvScreenSlot,
  MvCreativeRow,
} from '../../model/campaign.model';
import { MvCreativeDdl } from '../../../cms/creative/model/creative.model';
import {
  formatDateIso,
  deriveMinDate,
  deriveMaxDate,
  getFileIcon,
  renumberSequences,
  toScreenSlot,
} from './assign-creative.util';
import { CreativeService } from '../../../cms/creative/service/creative.service';
import { environment } from '../../../../environments/environment';


@Component({
  selector: 'assign-creative',
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

  protected isPlaylistOpen = false;
  protected isCreativePickerOpen = false;
  protected isLoading = false;
  protected isSaving = false;

  protected campaignId = 0;
  protected minDate: Date | null = null;
  protected maxDate: Date | null = null;
  protected screenSlots: MvScreenSlot[] = [];

  protected creatives: MvCreativeDdl[] = [];

  private activeScreenIndex = -1;
  protected formGroup!: FormGroup;

  
  protected activeTabIndex = 0;
  protected detail: MvCampaignDetail | null = null;

  readonly getFileIcon = getFileIcon;
  private readonly __unSubscribeAll$ = new Subject<void>();

  constructor(
    private _fb: FormBuilder,
    private _campaignService: CampaignService,
    private _creativeService: CreativeService,
    private _authService: AuthService,
    private injector: Injector,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.initForm();
    this.getCreativeDdl();
  }



   protected initForm(): void {
    this.formGroup = this._fb.group({
      creativeId: [null, Validators.required],
      playSequence: [1, [Validators.required, Validators.min(1), Validators.max(999)]],
    });
  }


    protected getCreativeDdl(): void {
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
  

  open(campaignId: number): void {
    this.campaignId = campaignId;
    this.screenSlots = [];
    this.minDate = null;
    this.maxDate = null;
    this.detail = null;
    this.activeTabIndex = 0;
    this.isPlaylistOpen = true;

    this.getCampaignScreens();
  }

  close(): void {
    this.isPlaylistOpen = false;
  }

  

  private getCampaignScreens(): void {
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

          const detail: MvCampaignDetail = res.data;
          this.detail = detail;
          this.minDate = deriveMinDate(detail.dates ?? []);
          this.maxDate = deriveMaxDate(detail.dates ?? []);
          this.screenSlots = (detail.screens ?? []).map(toScreenSlot);
        },
        error: (err: unknown) => {
          const message =
            (err as { error?: { message?: string } })?.error?.message ??
            'Failed to load campaign details.';
          this.showMessage('error', 'Error', message);
        },
      });
  }


  // Details tab
  get creativesGroupedByScreen() {
  return this.screenSlots.map(slot => ({
    screenName: slot.screenName,
    creatives: (this.detail?.creatives ?? [])
      .filter(c => c.screenId === slot.screenId)
      .sort((a, b) => a.playSequence - b.playSequence),
  }));
}

  //  Play-date helper 

  applyDateToAll(date: Date | null): void {
    if (!date) return;
    this.screenSlots = this.screenSlots.map((slot) => ({ ...slot, playDate: date }));
  }

  //  Creative picker 

  openCreativePickerForScreen(screenIndex: number): void {
    this.activeScreenIndex = screenIndex;

    const nextSequence = this.screenSlots[screenIndex].creatives.length + 1;
    this.formGroup.reset({ creativeId: null, playSequence: nextSequence });

    this.isCreativePickerOpen = true;
  }

  confirmAddCreative(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const { creativeId, playSequence } = this.formGroup.value;
    const selected = this.creatives.find((c) => c.id === creativeId)!;

    const newRow: MvCreativeRow = {
      creativeId: selected.id,
      creativeName: selected.name,
      thumbnailUrl: `${environment.baseUrl}${selected.url}`,
      fileType: selected.isVideo ? 'video' : 'image',
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

  // Reorder / remove 

  moveCreativeUp(screenIndex: number, rowIndex: number): void {
    if (rowIndex === 0) return;
    const creatives = [...this.screenSlots[screenIndex].creatives];
    [creatives[rowIndex - 1], creatives[rowIndex]] = [creatives[rowIndex], creatives[rowIndex - 1]];
    renumberSequences(creatives);
    this.patchScreenCreatives(screenIndex, creatives);
  }

  moveCreativeDown(screenIndex: number, rowIndex: number): void {
    const creatives = [...this.screenSlots[screenIndex].creatives];
    if (rowIndex >= creatives.length - 1) return;
    [creatives[rowIndex], creatives[rowIndex + 1]] = [creatives[rowIndex + 1], creatives[rowIndex]];
    renumberSequences(creatives);
    this.patchScreenCreatives(screenIndex, creatives);
  }

  removeCreative(screenIndex: number, rowIndex: number): void {
    const creatives = [...this.screenSlots[screenIndex].creatives];
    creatives.splice(rowIndex, 1);
    renumberSequences(creatives);
    this.patchScreenCreatives(screenIndex, creatives);
  }

  private patchScreenCreatives(screenIndex: number, creatives: MvCreativeRow[]): void {
    this.screenSlots = this.screenSlots.map((slot, i) =>
      i === screenIndex ? { ...slot, creatives } : slot,
    );
  }

  //  Validation 

  protected get readyScreenSlots(): MvScreenSlot[] {
    return this.screenSlots.filter((slot) => slot.playDate && slot.creatives.length > 0);
  }

  protected get canSave(): boolean {
    return this.readyScreenSlots.length > 0 && !this.isSaving;
  }

  //  Save 

  save(): void {
    if (!this.canSave) return;
    this.isSaving = true;

    const payload: MvSaveCampaignCreative = {
      campaignId: this.campaignId,
      createdBy: this._authService.currentUser.userId,
      screens: this.readyScreenSlots.map((slot) => ({
        screenId: slot.screenId,
        playDate: formatDateIso(slot.playDate!),
        creatives: slot.creatives.map((c) => ({
          creativeId: c.creativeId,
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
          if (res.success) {
            this.showMessage('success', 'Saved', 'Creative assignments saved successfully.');
            this.afterFormClosed.emit();
            this.close();
          }
        },
        error: (err: unknown) => {
          const message =
            (err as { error?: { message?: string } })?.error?.message ??
            'Failed to save assignments.';
          this.showMessage('error', 'Error', message);
        },
      });
  }

    ngOnDestroy(): void {
    this.__unSubscribeAll$.next();
    this.__unSubscribeAll$.complete();
  }
}