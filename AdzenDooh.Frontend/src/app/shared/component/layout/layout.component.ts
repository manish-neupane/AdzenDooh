import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive,ButtonModule,RippleModule,TooltipModule,AvatarModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  isCollapsed = false;

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  navGroups = ['Inventory', 'Media', 'Campaigns'];

  navItems = [
    { label: 'Screens',         route: 'screens',          icon: 'pi pi-th-large',  group: 'Inventory' },
    // { label: 'Operating Hours', route: 'operating-hours',  icon: 'pi pi-clock',     group: 'Inventory' },
    { label: 'Media Library',   route: 'media',            icon: 'pi pi-video',     group: 'Media'     },
    // { label: 'Playlists',       route: 'playlists',        icon: 'pi pi-list',      group: 'Media'     },
    { label: 'Campaigns',       route: 'campaigns',        icon: 'pi pi-megaphone', group: 'Campaigns' },
    // { label: 'Ads',             route: 'ads',              icon: 'pi pi-image',     group: 'Campaigns' },
    // { label: 'Bookings',        route: 'bookings',         icon: 'pi pi-briefcase', group: 'Campaigns' },
  ];

  itemsByGroup(group: string) {
    return this.navItems.filter(i => i.group === group);
  }
}