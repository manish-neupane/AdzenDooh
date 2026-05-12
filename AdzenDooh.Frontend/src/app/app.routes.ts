import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/component/layout/layout.component';
import { ScreenComponent } from './inventory/screen/component/screen-list/screen-list.component';
import { ScreenOperatingHourComponent } from './inventory/screen/component/operating-hour/operating-hour.component';
import { CreativeListComponent } from './cms/creative/component/creative-list/creative-list.component';
// import { CampaignCreateComponent } from './campaign/component/campaign-create-edit/campaign-create-edit.component';
import { CampaignListComponent } from './campaign/component/campaign-list/campaign-list.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'screens', component: ScreenComponent },
      {path: 'operating-hours', component: ScreenOperatingHourComponent},
      {path:'media', component: CreativeListComponent },
      {path:'campaigns' , component: CampaignListComponent },
      { path: '', redirectTo: 'screens', pathMatch: 'full' },
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];