// ─── campaign-detail.component.ts ────────────────────────────────────────────
// RESPONSIBILITY:
//   • Opens as a p-dialog from CampaignListComponent
//   • Loads full campaign detail (screens + dates) on open
//   • Read-only view — no editing, just display

import {
  Component,
  OnDestroy,
  Injector,
  inject
} from '@angular/core';
import { Subject, takeUntil, finalize } from 'rxjs';
import { TagModule } from 'primeng/tag';

import { sharedImports } from '../../../shared/component/primeng.import';
import { AppComponent } from '../../../app.component';
import { CampaignService } from '../../service/campaign.service';
import { MvCampaignDetail, MvCampaignScreen, MvCampaignDate } from '../../model/campaign.model';

@Component({
  selector: 'campaign-detail',
  standalone: true,
  imports: [...sharedImports, TagModule],
  templateUrl: './campaign-detail.component.html',
  styleUrl:    './campaign-detail.component.scss'
})
export class CampaignDetailComponent extends AppComponent implements OnDestroy {

  private campaignService = inject(CampaignService);

  visible = false;

  campaign: MvCampaignDetail | null = null;

  isLoading    = false;
  errorMessage = '';

  private _unSubscribeAll$ = new Subject<void>();

  constructor(private injector: Injector) {
    super(injector);
  }

  //  Open 

  open(campaignId: number): void {
    this.visible     = true;
    this.campaign    = null;
    this.errorMessage = '';
    this.loadDetail(campaignId);
  }

  //  Data Loading 

 private loadDetail(campaignId: number): void {
  this.isLoading = true;

  this.campaignService.getCampaignDetails(campaignId)
    .pipe(
      takeUntil(this._unSubscribeAll$),
      finalize(() => this.isLoading = false)
    )
    .subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.campaign = response.data;
        } else {
          this.errorMessage = 'No data returned for this campaign.';
        }
      },
      error: () => {
        this.errorMessage = 'Failed to load campaign details.';
      }
    });
}

  

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString([], {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }

  getStatusLabel(status: number): string {
    const map: Record<number, string> = {
      0: 'Draft',
      1: 'Active',
      2: 'Paused',
      3: 'Completed'
    };
    return map[status] ?? 'Unknown';
  }




  ngOnDestroy(): void {
    this._unSubscribeAll$.next();
    this._unSubscribeAll$.complete();
  }
}