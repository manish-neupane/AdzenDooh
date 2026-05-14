

import { Component, OnInit, OnDestroy, Injector, inject, ViewChild } from '@angular/core';
import { Subject, takeUntil, finalize } from 'rxjs';

import { sharedImports } from '../../../../shared/component/primeng.import';
import { MvCreative, MvCreativeFilter, MvDeleteCreative } from '../../model/creative.model';
import { ApiResponse, GridResponse, ParamOption } from '../../../../shared/model/sharedModel';
import { CreativeService } from '../../service/creative.service';
import { AppComponent } from '../../../../app.component';
import { CreativeUploadComponent } from '../creative-upload/creative-upload.component';
import { PageWrapperComponent } from "../../../../shared/component/page-wrapper/page-wrapper.component";
import { AuthService } from '../../../../shared/service/auth.service';
import { environment } from '../../../../../environments/environment';
import { PaginatorModule } from 'primeng/paginator';
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'creative-list',
  standalone: true,
  imports: [...sharedImports, CreativeUploadComponent, PageWrapperComponent, PaginatorModule, RouterOutlet],
  templateUrl: './creative-list.component.html',
  styleUrl: './creative-list.component.scss'
})
export class CreativeListComponent extends AppComponent implements OnInit, OnDestroy {

  @ViewChild('creativeUpload') creativeUpload!: CreativeUploadComponent;

  private creativeService = inject(CreativeService);
  private authService    = inject(AuthService);

  apiUrl      = environment.apiUrl.replace('/api', '');
  creatives:  MvCreative[] = [];
  totalCount  = 0;
  isLoading   = false;
  errorMessage = '';

  param: ParamOption<MvCreativeFilter> = {
    tenantId: this.authService.currentUser.tenantId,
    filter:   {} as MvCreativeFilter,
    offset:   0,
    pageSize: 10
  };

  private _unSubscribeAll$ = new Subject<void>();
  toast: any;

  constructor(private injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    
    this.loadCreatives();
  }

 

  //  Data 

  loadCreatives(showLoading: boolean = true): void {

    if (showLoading) {
      this.isLoading = true;
    }
    this.creativeService.getGrid(this.param)
      .pipe(
        takeUntil(this._unSubscribeAll$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response: ApiResponse<GridResponse<MvCreative>>) => {
          if (response.success && response.data) {
            this.creatives   = response.data.data;
            this.totalCount  = response.data.totalCount;
          }
        },
        error: () => this.errorMessage = 'Failed to load media'
      });
  }

  //  Upload 

  openUpload(): void {
    this.creativeUpload.open();
  }

  onUploadClosed(success: boolean): void {
    if (success) this.loadCreatives();
  }

  //  Delete 

deleteCreative(creative: MvCreative): void {
  console.log('delete clicked', creative);
  this.confirmDialog(
    `Deleting "${creative.name}" will remove it from all campaigns it is currently used in. This action cannot be undone. Are you sure?`,
    'Delete Creative',
    'pi pi-exclamation-triangle',
    () => this.executeDelete({ id: creative.id, deletedBy: this.authService.currentUser.userId })
  );
}

private executeDelete(payload: MvDeleteCreative): void {
  this.isLoading = true;

  this.creativeService.deleteCreative(payload)
    .pipe(
      takeUntil(this._unSubscribeAll$),
      finalize(() => this.isLoading = false)
    )
    .subscribe({
      next: () => {
        this.showMessage('success', 'Deleted', 'Creative deleted successfully');
        this.loadCreatives();
      },
      error: () => {
        this.showMessage('error', 'Error', 'Failed to delete creative');
      }
    });
}

  //  Pagination 

 onPage(event: { first: number; rows: number }): void {
  this.param = { 
    ...this.param, 
    offset: event.first ?? 0, 
    pageSize: event.rows ?? 10 
  };
  this.loadCreatives();
}

  //  Filters 

  onFilter(searchText: string): void {
    this.param = {
      ...this.param,
      offset: 0,
      filter: { ...this.param.filter, searchText } as MvCreativeFilter
    };
    this.loadCreatives(false);
  }

onTypeChange(type: string): void {
  const isVideo: boolean | undefined =
    type === 'video' ? true  :
    type === 'image' ? false :
    undefined;

  this.param = {
    ...this.param,
    offset: 0,
    filter: { ...this.param.filter, isVideo }
  };
  this.loadCreatives(false);
}

previewItem: MvCreative | null = null;
previewVisible = false;

openPreview(item: MvCreative): void {
  this.previewItem  = item;
  this.previewVisible = true;
}

closePreview(): void {
  this.previewItem  = null;
  this.previewVisible = false;
}

 ngOnDestroy(): void {
    this._unSubscribeAll$.next();
    this._unSubscribeAll$.complete();
  }
}