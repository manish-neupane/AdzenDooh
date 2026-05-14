import { Component, Injector, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { finalize, Subject, takeUntil } from 'rxjs';

import { AppComponent } from '../../../app.component';
import { sharedImports } from '../../../shared/component/primeng.import';
import { ApiResponse, GridResponse, ParamOption } from '../../../shared/model/sharedModel';
import { GridConfig } from '../../../shared/model/grid-config.model';
import { GridComponent } from '../../../shared/component/grid/grid.component';
import { PageWrapperComponent } from '../../../shared/component/page-wrapper/page-wrapper.component';
import { CampaignService } from '../../service/campaign.service';
import { CampaignCreateComponent } from '../campaign-create/campaign-create.component';
import { MvCampaign, MvCampaignFilter, MvScreen } from '../../model/campaign.model';
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

  @ViewChild('campaignCreateEdit')    campaignCreateEdit!:    CampaignCreateComponent;
  @ViewChild('campaignDetail')        campaignDetail!:        CampaignDetailComponent;
  @ViewChild('campaignAssignCreative') campaignAssignCreative!: AssignCreativeComponent;

  //  Status helpers 
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

  //  Grid config 
  campaignConfig: GridConfig<MvCampaign> = {
    columns: campaignColumns,
    dataSource: { data: [], totalCount: 0 },
    showActions: true,
    actions: [
      {
        type: 'info',
        icon: 'pi pi-eye',
        severity: 'info',
        tooltip: 'View Details',
        handler: (row: MvCampaign) => this.onViewDetail(row),
      },
      {
        type: 'edit',
        icon: 'pi pi-images',          // distinct icon — assign media
        severity: 'info',
        tooltip: 'Assign Creative',
        handler: (row: MvCampaign) => this.onAddCampaignCreative(row),
      },
    ],
  };

  //  State 
  isLoading    = false;
  errorMessage = '';
  screenDdl: MvScreen[] = [];

  param: ParamOption<MvCampaignFilter> = {
    tenantId: 1,
    filter:   { search: '' } as MvCampaignFilter,
    offset:   0,
    pageSize: 10,
  };

  private readonly _unSubscribeAll$ = new Subject<void>();

  constructor(
    private readonly authService:    AuthService,
    private readonly campaignService: CampaignService,
    private readonly screenService:   ScreenService,
    private readonly injector:        Injector,
  ) {
    super(injector);
  }

  //  Lifecycle 

  ngOnInit(): void {
    this.loadScreenDdl();
    this.loadCampaigns();
  }


  //  Data loading 

  private loadCampaigns(showLoading: boolean = true): void {
    if (showLoading) {
      this.isLoading    = true;
      this.errorMessage = '';
    }

    this.campaignService.getCampaigns(this.param)
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

  private loadScreenDdl( ): void {
    this.screenService.getDdl({ TenantId: this.authService.currentUser.tenantId })
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

  //  Dialog actions 

  protected addCampaign(): void {
    this.campaignCreateEdit.open();
  }

  protected onViewDetail(campaign: MvCampaign): void {
    this.campaignDetail.open(campaign.id);
  }

  protected onAddCampaignCreative(campaign: MvCampaign): void {
    this.campaignAssignCreative.open(campaign.id);
  }

  //  Callbacks from child dialogs ──────────────────────────────────────


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

  /** Called by assign-creative after save — just refresh the grid */
  public afterAssignCreativeClosed(): void {
    this.loadCampaigns();
  }

  //  Grid event handlers ───────────────────────────────────────────────

  onPage(event: { first: number; rows: number }): void {
    this.param = { ...this.param, offset: event.first, pageSize: event.rows };
    this.loadCampaigns();
  }

  onSort(event: { field: string; order: number }): void {
    this.param = {
      ...this.param,
      sortBy:    event.field,
      sortOrder: event.order === 1 ? 'asc' : 'desc',
    };
    this.loadCampaigns();
  }

  onFilter(search: string): void {
    this.param = { ...this.param, offset: 0, filter: { ...this.param.filter, searchText: search } };
    this.loadCampaigns(false);
  }



  
  ngOnDestroy(): void {
    this._unSubscribeAll$.next();
    this._unSubscribeAll$.complete();

  }


}