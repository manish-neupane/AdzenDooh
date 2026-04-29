import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/component/layout/layout.component';
import { ScreenComponent } from './inventory/screen/component/screen-list/screen-list.component';
import { ScreenOperatingHourComponent } from './inventory/screen/component/operating-hour/operating-hour.component';
import { CreativeListComponent } from './inventory/creative/component/creative-list/creative-list.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'screens', component: ScreenComponent },
      {path: 'operating-hours', component: ScreenOperatingHourComponent},
      {path:'media', component: CreativeListComponent },
      { path: '', redirectTo: 'screens', pathMatch: 'full' },
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];