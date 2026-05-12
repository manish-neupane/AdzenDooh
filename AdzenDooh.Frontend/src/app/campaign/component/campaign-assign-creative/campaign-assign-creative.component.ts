import {
  Component,
  EventEmitter,
  INJECTOR,
  Injector,
  Input,
  OnDestroy,
  Output,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { finalize, Subject, takeUntil } from "rxjs";

import { AppComponent } from "../../../app.component";
import { sharedImports } from "../../../shared/component/primeng.import";
import { CampaignService } from "../../service/campaign.service";
import { AuthService } from "../../../shared/service/auth.service";
import { AccordionModule } from "primeng/accordion";
import { BadgeModule } from "primeng/badge";

import {
  MvCampaignDetail,
  MvSaveCampaignCreative,
} from "../../model/campaign.model";

import {
  MvCreativeDdl,
  MvScreenSlot,
  MvCreativeRow,
} from "../../model/campaign.model";

import {
  formatDateIso,
  deriveMinDate,
  deriveMaxDate,
  getFileIcon,
  renumberSequences,
  toScreenSlot,
  toCreativeDdl,
} from "./assign-creative.util";

@Component({
  selector: "assign-creative",
  standalone: true,
  imports: [
    ...sharedImports,
    ReactiveFormsModule,
    FormsModule,
    AccordionModule,
    BadgeModule,
  ],
  templateUrl: "./campaign-assign-creative.component.html",
  styleUrl: "./campaign-assign-creative.component.scss",
})
export class AssignCreativeComponent extends AppComponent implements OnDestroy {
  @Output() afterFormClosed = new EventEmitter<void>();

  private readonly _unSubscribeAll$ = new Subject<void>();
  protected isOpen = false;
  protected addDialogVisible = false;
  protected isLoading = false;
  protected isSaving = false;
  protected campaignId = 0;

  protected minDate: Date | null = null;
  protected maxDate: Date | null = null;
  protected screens: MvScreenSlot[] = [];
  protected creatives: MvCreativeDdl[] = [];

  private screenIndex = -1;
  protected playlistForm!: FormGroup;

  readonly getIcon = getFileIcon;

  constructor(
    private readonly fb: FormBuilder,
    private readonly campaignService: CampaignService,
    private readonly authService: AuthService,
    private readonly injector: Injector,
  ) {
    super(injector);
    this.buildForm();
  }

  open(campaignId: number): void {
    this.campaignId = campaignId;
    this.screens = [];
    this.minDate = null;
    this.maxDate = null;
    this.isOpen = true;
    this.loadDetail();
    this.loadCreatives();
  }

  close(): void {
    this.isOpen = false;
  }

  private buildForm(): void {
    this.playlistForm = this.fb.group({
      creativeId: [null, Validators.required],
      playSequence: [
        1,
        [Validators.required, Validators.min(1), Validators.max(999)],
      ],
    });
  }

  private loadDetail(): void {
    this.isLoading = true;

    this.campaignService
      .getCampaignDetails(this.campaignId)
      .pipe(
        takeUntil(this._unSubscribeAll$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            const detail: MvCampaignDetail = res.data;

            this.minDate = deriveMinDate(detail.dates ?? []);
            this.maxDate = deriveMaxDate(detail.dates ?? []);
            this.screens = (detail.screens ?? []).map(toScreenSlot);
          }
        },
        error: (err: unknown) => {
          const msg =
            (err as { error?: { message?: string } })?.error?.message ??
            "Failed to load campaign details";
          this.showMessage("error", "Error", msg);
        },
      });
  }

  private loadCreatives(): void {
    // this.creativeService.getAll({ tenantId: this.authService.currentUser.tenantId })
    //   .pipe(takeUntil(this._unSubscribeAll$))
    //   .subscribe({
    //     next: (res) => {
    //       if (res.success && res.data) {
    //         this.creatives = res.data.map(toCreativeDdl);
    //       }
    //     },
    //   });

    this.creatives = [
      {
        id: 1,
        name: "Spring Sale Banner",
        thumbnailUrl: "",
        fileType: "image",
      },
      { id: 2, name: "Product Video 30s", thumbnailUrl: "", fileType: "video" },
      { id: 3, name: "Brand HTML5 Ad", thumbnailUrl: "", fileType: "html" },
      {
        id: 4,
        name: "Summer Promo Banner",
        thumbnailUrl: "",
        fileType: "image",
      },
    ];
  }

  applyDateToAll(sourceDate: Date | null): void {
    if (!sourceDate) return;
    this.screens = this.screens.map((s) => ({ ...s, playDate: sourceDate }));
  }

  //  Add
  
  addMedia(slotIndex: number): void {
    this.screenIndex = slotIndex;
    const nextSeq = this.screens[slotIndex].creatives.length + 1;
    this.playlistForm.reset({ creativeId: null, playSequence: nextSeq });
    this.addDialogVisible = true;
  }

  confirmAdd(): void {
    if (this.playlistForm.invalid) {
      this.playlistForm.markAllAsTouched();
      return;
    }

    const { creativeId, playSequence } = this.playlistForm.value;
    const creative = this.creatives.find((c) => c.id === creativeId)!;

    const updated: MvCreativeRow[] = [
      ...this.screens[this.screenIndex].creatives,
      {
        creativeId: creative.id,
        creativeName: creative.name,
        thumbnailUrl: creative.thumbnailUrl,
        fileType: creative.fileType,
        playSequence,
      },
    ].sort((a, b) => a.playSequence - b.playSequence);

    renumberSequences(updated);

    this.screens = this.screens.map((s, i) =>
      i === this.screenIndex ? { ...s, creatives: updated } : s,
    );
    this.addDialogVisible = false;
  }

  //  Creative row actions

  removeCreative(slotIndex: number, rowIndex: number): void {
    const updated = [...this.screens[slotIndex].creatives];
    updated.splice(rowIndex, 1);
    renumberSequences(updated);
    this.screens = this.screens.map((s, i) =>
      i === slotIndex ? { ...s, creatives: updated } : s,
    );
  }

  moveUp(slotIndex: number, rowIndex: number): void {
    if (rowIndex === 0) return;
    const updated = [...this.screens[slotIndex].creatives];
    [updated[rowIndex - 1], updated[rowIndex]] = [
      updated[rowIndex],
      updated[rowIndex - 1],
    ];
    renumberSequences(updated);
    this.screens = this.screens.map((s, i) =>
      i === slotIndex ? { ...s, creatives: updated } : s,
    );
  }

  moveDown(slotIndex: number, rowIndex: number): void {
    const updated = [...this.screens[slotIndex].creatives];
    if (rowIndex >= updated.length - 1) return;
    [updated[rowIndex], updated[rowIndex + 1]] = [
      updated[rowIndex + 1],
      updated[rowIndex],
    ];
    renumberSequences(updated);
    this.screens = this.screens.map((s, i) =>
      i === slotIndex ? { ...s, creatives: updated } : s,
    );
  }

  //  Validation

  get validSlots(): MvScreenSlot[] {
    return this.screens.filter((s) => s.playDate && s.creatives.length > 0);
  }

  get isSubmittable(): boolean {
    return this.validSlots.length > 0 && !this.isSaving;
  }

  //  Save

  save(): void {
    if (!this.isSubmittable) return;
    this.isSaving = true;

    const payload: MvSaveCampaignCreative = {
      campaignId: this.campaignId,
      createdBy: this.authService.currentUser.userId,
      screens: this.validSlots.map((s) => ({
        screenId: s.screenId,
        playDate: formatDateIso(s.playDate!),
        creatives: s.creatives.map((c) => ({
          creativeId: c.creativeId,
          playSequence: c.playSequence,
        })),
      })),
    };

    this.campaignService
      .createCampaignCreative(payload)
      .pipe(
        takeUntil(this._unSubscribeAll$),
        finalize(() => (this.isSaving = false)),
      )
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.showMessage(
              "success",
              "Saved",
              "Creative assignment(s) saved successfully.",
            );
            this.afterFormClosed.emit();
            this.close();
          }
        },
        error: (err: unknown) => {
          const msg =
            (err as { error?: { message?: string } })?.error?.message ??
            "Failed to save assignments";
          this.showMessage("error", "Error", msg);
        },
      });
  }

  ngOnDestroy(): void {
    this._unSubscribeAll$.next();
    this._unSubscribeAll$.complete();
  }
}
