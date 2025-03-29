import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';
import { GlobalStorageService } from '../../../services/global-storage.service';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, AppConfigurator],
    template: ` 
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action not-for-mobile" (click)="layoutService.onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
          <a class="layout-topbar-logo text-xs" routerLink="/">
<span class="text-[13px] sm:text-[14px] md:text-[16px] lg:text-[18px] xl:text-[20px] 
             bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 
             text-transparent bg-clip-text font-bold uppercase tracking-wide 
             drop-shadow-lg animate-pulse">
    {{ branchInfo.branch_name || 'Disha Airways' }} 
</span>
<span class="bg-gradient-to-r from-sky-400 via-cyan-500 to-indigo-500 
             text-transparent bg-clip-text font-bold uppercase tracking-wide 
             drop-shadow-lg text-[13px] sm:text-[14px] md:text-[16px] lg:text-[18px] xl:text-[20px]">
    ({{ branchInfo.user_name }})
</span>
</a>

        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
              {{ globalstorage.get('PAGE_TITLE') }}
            </div>
        </div>
    </div>`
})
export class AppTopbar {

    constructor(public layoutService: LayoutService, public globalstorage: GlobalStorageService) { }

    get branchInfo(): { branch_name: string; user_name: string } {
        const branchData = this.globalstorage.get('branchInfo') as { branch_name?: string } || {};
        const userData = this.globalstorage.get('userInfo') as { first_name?: string; last_name?: string } || {};

        return {
            branch_name: branchData.branch_name ?? 'Disha Airways',
            user_name: `${userData.first_name ?? ''}` || 'Guest User'
        };
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }
}
