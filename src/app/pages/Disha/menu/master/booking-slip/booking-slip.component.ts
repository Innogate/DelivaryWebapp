import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom, tap } from 'rxjs';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { BranchService } from '../../../../../../services/branch.service';
import { AlertService } from '../../../../../../services/alert.service';
import { TokenService } from '../../../../../../services/token.service';
import { GlobalStorageService } from '../../../../../../services/global-storage.service';

@Component({
  selector: 'app-booking-slip',
  imports: [CommonModule, DropdownModule, InputTextModule, ReactiveFormsModule, FormsModule],
  templateUrl: './booking-slip.component.html',
  styleUrl: './booking-slip.component.scss'
})
export class BookingSlipComponent {
  BookingSlip: FormGroup;
  companies: any[] = [];
  cities: any[] = [];
  branchList: any[] = [];
  tokenList: any[] = [];
  showAddState: boolean = false;
  selectedFileName: string = '';
  private touchStartY: number = 0;
  company_id: number = 1;
  constructor(
    private branchService: BranchService, 
    private alertService: AlertService, 
    private fb: FormBuilder, 
    private tokenService: TokenService,
    private storage: GlobalStorageService) {
  
    this.BookingSlip = this.fb.group({
      branch_id: ['', Validators.required],
      start_no: ['', Validators.required],
      end_no: ['', Validators.required]
    })
  }

  ngOnInit() {
    this.storage.set('PAGE_TITLE', "BOOKING SLIP");
    this.gateAllToken();
    this.gateAllBranch();
  }


  async gateAllBranch() {
    const payload = {
      fields: ["branches.*"],
      max: 12,
      current: 0,
      relation: null
    };

    await firstValueFrom(
      this.branchService.getAllBranches(payload).pipe(
        tap(
          (res) => {
            if (res.body) {
              this.branchList = res.body;
            }
          }
        )
      )
    )
  }

  async gateAllToken() {
    const payload = {
      current: 0,
      max: 100
    };
    await firstValueFrom(
      this.tokenService.getAllToken(payload).pipe(
        tap(
          (res) => {
            if (res.body) {
              this.tokenList = res.body;
            }
          },
          (error) => {
            this.alertService.error(error.error.message);
          }
        )
      )
    )
  }




  async onSave() {
    if (this.BookingSlip.valid) {
      await firstValueFrom(this.tokenService.addNewToken(this.BookingSlip.value).pipe(
        tap(
          (res) => {
            if (res.body) {
              this.alertService.success(res.message);
              this.gateAllToken();
              this.BookingSlip.reset();
            }
          },
          (error) => {
            this.alertService.error(error.error.message);
          }
        )
      ))
    }
  }

  async deleteToken(data: any) {
    if (data) {
      const confirmation = this.alertService.confirm("You want to delete this Token ");
      if (await confirmation === false) {
        return;
      } else {
        await firstValueFrom(this.tokenService.deleteToken(data.credit_node_id).pipe(
          tap((response) => {
            this.alertService.success(response.message);
            this.gateAllToken();
          },
            (error) => {
              this.alertService.error(error.error.message);
            }
          ))
        )
      }
    }
  }


  toggleAddState() {
    this.showAddState = !this.showAddState;
  }

  onTouchStart(event: TouchEvent) {
    this.touchStartY = event.touches[0].clientY;
  }

  onTouchEnd(event: TouchEvent) {
    const touchEndY = event.changedTouches[0].clientY;
    if (touchEndY - this.touchStartY > 50) {
      this.showAddState = false;
    }
  }
}
