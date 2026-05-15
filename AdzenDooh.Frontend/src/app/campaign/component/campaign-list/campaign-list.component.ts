import { Component, Injector, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { finalize, Subject, takeUntil } from 'rxjs';

import { AppComponent } from '../../../app.component';
import { sharedImports } from '../../../shared/component/primeng.import';
import { ParamOption } from '../../../shared/model/sharedModel';
import { GridConfig } from '../../../shared/model/grid-config.model';
import { GridComponent } from '../../../shared/component/grid/grid.component';
import { PageWrapperComponent } from '../../../shared/component/page-wrapper/page-wrapper.component';
import { CampaignService } from '../../service/campaign.service';
import { CampaignCreateComponent } from '../campaign-create/campaign-create.component';
import { MvCampaign, MvCampaignFilter, MvScreenOption } from '../../model/campaign.model';
import { campaignColumns } from './campaign-list-column';
import { ScreenService } from '../../../inventory/screen/service/screen.service';
import { AuthService } from '../../../shared/service/auth.service';
import { CampaignDetailComponent } from '../campaign-detail/campaign-detail.component';
import { RouterOutlet } from '@angular/router';
import { AssignCreativeComponent } from '../campaign-assign-creative/campaign-assign-creative.component';

@Component({
  selector: 'campaign-list',
  standalone: true,
  imports: [
    ...sharedImports,
    CampaignCreateComponent,
    GridComponent,
    PageWrapperComponent,
    CampaignDetailComponent,
    RouterOutlet,
    AssignCreativeComponent,  
  ],
  templateUrl: './campaign-list.component.html',
  styleUrl: './campaign-list.component.scss',
})
export class CampaignListComponent extends AppComponent implements OnInit, OnDestroy {

  @ViewChild('campaignCreateEdit') private campaignCreateEdit!: CampaignCreateComponent;
  @ViewChild('campaignDetail') private campaignDetail!: CampaignDetailComponent;
  @ViewChild('campaignAssignCreative') private campaignAssignCreative!: AssignCreativeComponent;

  // GRID CONFIG
  public campaignConfig: GridConfig<MvCampaign> = {
    columns: campaignColumns,
    dataSource: { data: [], totalCount: 0 },
    showActions: true,
    actions: [
      {
        type: 'edit',
        icon: 'pi pi-upload',          
        severity: 'info',
        tooltip: 'Assign Creative',
        handler: (row: MvCampaign) => this.onAssignCreative(row),
      },
      {
        type: 'info',
        icon: 'pi pi-info-circle',
        severity: 'info',
        tooltip: 'View Details',
        handler: (row: MvCampaign) => this.onViewDetail(row),
      },
    ],
  };

  // STATE
  public isLoading = false;
  public errorMessage = '';
  public screenDdl: MvScreenOption[] = [];

  public param: ParamOption<MvCampaignFilter> = {
    tenantId: 1,
    filter:   { search: '' } as MvCampaignFilter,
    offset:   0,
    pageSize: 10,
  };

  private readonly _unSubscribeAll$ = new Subject<void>();

  public constructor(
    private readonly _authService:    AuthService,
    private readonly _campaignService: CampaignService,
    private readonly _screenService:   ScreenService,
    private readonly injector:        Injector,
  ) {
    super(injector);
  }

  public ngOnInit(): void {
    this.loadScreenDdl();
    this.loadCampaigns();
  }

  private loadScreenDdl(): void {
    this._screenService.getDdl({ TenantId: this._authService.currentUser.tenantId })
      .pipe(takeUntil(this._unSubscribeAll$))
      .subscribe({
        next: (res) => {
          if (res.success && res.data) this.screenDdl = res.data;
        },
        error: (err: unknown) => {
          const msg = (err as { error?: { message?: string } })?.error?.message
            ?? 'Failed to load screens';
          this.showMessage('error', 'Error', msg);
        },
      });
  }

  private loadCampaigns(showLoading: boolean = true): void {
    if (showLoading) {
      this.isLoading    = true;
      this.errorMessage = '';
    }

    this._campaignService.getCampaigns(this.param)
      .pipe(
        takeUntil(this._unSubscribeAll$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            const transformedData = res.data.data.map(campaign => ({
              ...campaign,
              statusDisplay:  this.getStatusText(campaign.status),
              statusCssClass: this.getStatusClass(campaign.status),
            }));
            this.campaignConfig = {
              ...this.campaignConfig,
              dataSource: { data: transformedData, totalCount: res.data.totalCount },
            };
          }
        },
        error: (err: unknown) => {
          const msg = (err as { error?: { message?: string } })?.error?.message
            ?? 'Failed to load campaigns';
          this.errorMessage = msg;
          this.showMessage('error', 'Error', msg);
        },
      });
  }

  protected getStatusText(status: number): string {
    const map: Record<number, string> = { 0: 'Draft', 1: 'Active', 2: 'Inactive' };
    return map[status] ?? 'Unknown';
  }

  protected getStatusClass(status: number): string {
    switch (status) {
      case 0:  return 'status-draft';
      case 1:  return 'status-active';
      case 2:  return 'status-inactive';  
      default: return '';
    }
  }

  //  CREATE CAMPAIGN DIALOG
  protected addCampaign(): void {
    this.campaignCreateEdit.open();
  }

  //  DETAIL DIALOG
  protected onViewDetail(campaign: MvCampaign): void {
    this.campaignDetail.open(campaign.id);
  }

  //  ASSIGN CREATIVE DIALOG
  protected onAssignCreative(campaign: MvCampaign): void {
    this.campaignAssignCreative.open(campaign.id);
  }

  public afterFormClosed(campaign: MvCampaign | null): void {
    if (!campaign) return;

    const idx = this.campaignConfig.dataSource.data.findIndex(c => c.id === campaign.id);
    const updatedData = idx > -1
      ? this.campaignConfig.dataSource.data.map((c, i) => i === idx ? campaign : c)
      : [campaign, ...this.campaignConfig.dataSource.data];

    this.campaignConfig = {
      ...this.campaignConfig,
      dataSource: { ...this.campaignConfig.dataSource, data: updatedData },
    };
  }

  // CALLBACK - AFTER ASSIGN CREATIVE CLOSED
  public afterAssignCreativeClosed(): void {
    this.loadCampaigns();
  }

  // GRID 
  public onPage(event: { first: number; rows: number }): void {
    this.param = { ...this.param, offset: event.first, pageSize: event.rows };
    this.loadCampaigns();
  }

  public onSort(event: { field: string; order: number }): void {
    this.param = {
      ...this.param,
      sortBy:    event.field,
      sortOrder: event.order === 1 ? 'asc' : 'desc',
    };
    this.loadCampaigns();
  }

  public onFilter(search: string): void {
    this.param = { ...this.param, offset: 0, filter: { ...this.param.filter, searchText: search } };
    this.loadCampaigns(false);
  }

  public ngOnDestroy(): void {
    this._unSubscribeAll$.next();
    this._unSubscribeAll$.complete();
  }
}