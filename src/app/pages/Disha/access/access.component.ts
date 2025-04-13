import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PagesService } from '../../../../services/pages.service';
import { firstValueFrom, tap } from 'rxjs';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { AlertService } from '../../../../services/alert.service';
import { GlobalStorageService } from '../../../../services/global-storage.service';

@Component({
    selector: 'app-access',
    imports: [
        TableModule,
        BadgeModule,
        CommonModule,
        InputTextModule,
        ToggleButtonModule,
        FormsModule],
    templateUrl: './access.component.html',
    styleUrls: ['./access.component.scss']
})
export class AccessComponent implements OnInit {
    pages: any[] = [];
    permissions: any[] = [];
    accessList: any[] = [];
    showAddState: boolean = false;
    isEditing: boolean = false;
    userId: any;
    accessForm: any = {
        user_id: '',
        permission_code: ['0', '0', '0', '0', '0'],  // Default permission codes (Read, Write, Update, Delete, Admin)
    };

    myAccess: any;

    constructor(
        private route: ActivatedRoute,
        private service: PagesService,
        private alert: AlertService,
        private storage: GlobalStorageService,
        private pagesService: PagesService
    ) { }

    ngOnInit() {
        this.storage.set('PAGE_TITLE', "PERMISSIONS");
        this.userId = this.route.snapshot.paramMap.get('userId');
        this.getAllPageList();
        this.getUserAccess(this.userId);
        this.gateMyAccess();
    }

    async getAllPageList() {
        await firstValueFrom(this.service.getAllPages().pipe(
            tap((res) => {
                if (res.body) {
                    this.pages = res.body;
                }
            })
        ));
    }

    async getUserAccess(userId: any) {
        await firstValueFrom(this.service.getUserAccess(userId).pipe(
            tap((res) => {
                if (res.body) {
                    this.permissions = res.body;
                    this.createAccessList();
                }
            })
        ));
    }

    // Convert '0'/'1' to false/true when creating access list for checkboxes
    createAccessList() {
        this.accessList = this.pages.map(page => {
            // Find the matching permission for this page
            const permission = this.permissions.find(p => p.page_id === page.page_id);

            // If permission is found, process it; otherwise, use default permission codes
            const permissionCodeArray = permission ?
                permission.permission_code.split('').map((code: string) => code === '1') : // Convert '1'/'0' to boolean
                [false, false, false, false, false]; // Default to all false

            return {
                ...page, // Spread the page data
                page_id: page.page_id,
                user_id: permission ? permission.user_id : this.userId, // Add user_id from permission if available
                permission_code: permissionCodeArray, // Converted permission codes (boolean)
                permission_status: permission ? permission.status : null, // Status from permission
                created_at: permission ? permission.created_at : null, // Created at date
                updated_at: permission ? permission.updated_at : null, // Updated at date
                created_by: permission ? permission.created_by : null, // Created by user (if available)
                showMore: false, // For toggling details in the UI
            };
        });
        console.log(this.accessList);
    }



    toggleAddState() {
        this.showAddState = !this.showAddState;
    }

    // Convert permission code from boolean (false/true) to string ('0'/'1') when saving
    async updatePermissionCode(access: any) {
        const updatedPermissionCode = access.permission_code.map((val: boolean) => (val ? '1' : '0')).join('');
        // console.log(access);  // This should log the correct '1'/'0' string for save
        await firstValueFrom(this.service.updateAccess(access.user_id, updatedPermissionCode, access.page_id).pipe(
            tap((res) => {
                if (res.message) {
                    this.alert.success('Permission code updated successfully');
                }
            })
        ))
    }

    togglePermission(index: number, access: any) {
        // console.log(access.permission_code);
        // console.log(access.permission_code[index], access.permission_code);
        // access.permission_code[index] = !access.permission_code[index]; // Flip the boolean value
        // console.log(access.permission_code[index], access.permission_code);
        // this.updatePermissionCode(access);  // Ensure that permission code is updated immediately
    }

    // Enable editing a permission entry
    updateAccess(access: any) {
        this.isEditing = true;
        this.accessForm = { ...access };
        this.showAddState = true;
    }

    disableAccess(access: any) {
        // Disable access logic
    }

    async gateMyAccess() {
        await firstValueFrom(this.pagesService.getMyAccess().pipe(
            tap((res:any) => {
               this.myAccess = res.body;
            })
        ))
    }
}
