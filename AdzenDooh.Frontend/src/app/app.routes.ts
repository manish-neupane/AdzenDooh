import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/component/layout/layout.component';
import { ScreenComponent } from './inventory/screen/component/screen-list/screen-list.component';


export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'screens',   component: ScreenComponent },
      { path: '',          redirectTo: 'screens', pathMatch: 'full' },
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];