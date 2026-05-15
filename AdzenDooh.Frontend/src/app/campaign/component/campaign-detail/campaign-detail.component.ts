import {
  Component,
  Injector,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { finalize, Subject, takeUntil } from 'rxjs';
import { TagModule } from 'primeng/tag';

import { sharedImports } from '../../../shared/component/primeng.import';
import { AppComponent } from '../../../app.component';
import { CampaignService } from '../../service/campaign.service';
import {
  MvCampaignDetail,
  MvCampaignScreen,
  MvCampaignDate,
} from '../../model/campaign.model';

@Component({
  selector: 'campaign-detail',
  standalone: true,
  imports: [...sharedImports, TagModule],
  templateUrl: './campaign-detail.component.html',
  styleUrl: './campaign-detail.component.scss',
})
export class CampaignDetailComponent extends AppComponent implements OnInit, OnDestroy {

  protected isDialogOpen = false;
  protected isLoading = false;
  protected campaignDetail: MvCampaignDetail | null = null;

  private readonly __unSubscribeAll$ = new Subject<void>();

  constructor(
    private _campaignService: CampaignService,
    private injector: Injector,
  ) {
    super(injector);
  }

  public ngOnInit(): void {}

  //  DIALOG
  public open(campaignId: number): void {
    this.campaignDetail = null;
    this.isDialogOpen = true;
    this.loadCampaignDetail(campaignId);
  }

  // LOAD CAMPAIGN FROM API
  private loadCampaignDetail(campaignId: number): void {
    this.isLoading = true;

    this._campaignService
      .getCampaignDetails(campaignId)
      .pipe(
        takeUntil(this.__unSubscribeAll$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.campaignDetail = res.data;
          } else {
            this.showMessage('warn', 'No Data', 'No data returned for this campaign.');
          }
        },
        error: () => {
          this.showMessage('error', 'Error', 'Failed to load campaign details.');
        },
      });
  }

  // FORMAT DATE FOR DISPLAY
  protected formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  protected getStatusLabel(status: number): string {
    const map: Record<number, string> = {
      0: 'Draft',
      1: 'Active',
      2: 'Completed',
      3: 'Inactive',
    };
    return map[status] ?? 'Unknown';
  }

  public close(): void {
    this.isDialogOpen = false;
  }

  public ngOnDestroy(): void {
    this.__unSubscribeAll$.next();
    this.__unSubscribeAll$.complete();
  }
}