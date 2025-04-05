import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CityService } from '../../../../../services/city.service';
import { StateService } from '../../../../../services/state.service';
import { BranchService } from '../../../../../services/branch.service';
import { BookingService } from '../../../../../services/booking.service';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { debounceTime, firstValueFrom, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../../../services/alert.service';
import { SelectModule } from 'primeng/select';
import { EmployeesService } from '../../../../../services/employees.service';
import { DividerModule } from 'primeng/divider';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { GlobalStorageService } from '../../../../../services/global-storage.service';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable?: {
      finalY?: number;
    };
  }
}
@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss'],
  imports: [DropdownModule, SelectModule, AutoCompleteModule, RadioButtonModule, ButtonModule, FormsModule, InputTextModule, ReactiveFormsModule, CommonModule, DividerModule, CheckboxModule],
  providers: [MessageService]
})
export class BookingComponent implements OnInit {
  cities: any[] = [];
  branches: any[] = [];
  transportModes: any[] = [];
  bookings: any[] = [];
  // allCities: any[] = [];
  // selectedState: any;
  // searchResults: any[] = [];
  selectedBranch: any;
  selectedTransportMode: any;
  bookingForm: FormGroup = new FormGroup({});
  filteredCities: any[] = [];
  selectedCity: any = null;
  amount: number = 0;
  branchInfo: any;

  listOfConnersAndConsignees: any[] = [];

  constructor(
    private cityService: CityService,
    private stateService: StateService,
    private branchService: BranchService,
    private bookingService: BookingService,
    private messageService: MessageService,
    private fb: FormBuilder,
    private alertService: AlertService,
    private employeeService: EmployeesService,
    private globalstore: GlobalStorageService
  ) {
    this.createForm();
  }

  async ngOnInit(): Promise<void> {
    this.createForm();
    if (!this.bookingForm) {
      return;
    }
    this.globalstore.set('PAGE_TITLE', "BOOKING");
    this.createForm();
    this.loadTransportModes();
    this.gateAllBranch();
    this.bookingForm.valueChanges.subscribe(() => {
      this.calculateTotal();
    });
    setTimeout(() => {
      if (!this.bookingForm) {
        return;
      }
      this.bookingForm.patchValue({ to_pay: false }, { emitEvent: false });
      this.calculateTotal();
    }, 0);
    this.gateAllcity();
    this.branchInfo = this.globalstore.get('branchInfo');
    // this.onCheckboxChange(false);
  }


  createForm() {
    this.branchInfo = this.globalstore.get('branchInfo');
    //  set default values
    const cgst = this.branchInfo.cgst ?? 0;
    const sgst = this.branchInfo.sgst ?? 0;
    const igst = this.branchInfo.igst ?? 0;

    this.bookingForm = this.fb.group({
      // package section
      slip_no: ['', [Validators.required, Validators.pattern('^[0-9]+$')]], // Booking sleep number
      package_count: ['', [Validators.required, Validators.pattern('^[0-9]+$')]], //  package count
      package_weight: ['', [Validators.required,]], // package weight
      package_value: ['',], // package value
      package_contents: ['0'], // package contents

      // booking details
      consignor_name: ['', [Validators.required]], // consignor name
      consignor_mobile: ['', [Validators.pattern('^[0-9]{10}$')]], // consignor mobile number
      consignee_name: ['', [Validators.required]], // consignee name
      consignee_mobile: ['', [Validators.pattern('^[0-9]{10}$')]], // consignee mobile number
      destination_city_id: [null, Validators.required], // destination city
      destination_branch_id: [null, Validators.required], // destination branch
      transport_mode: [''], // transport mode


      // Billing section
      paid_type: "Prepaid", // payment type
      booking_address: ['UNSET'], // booking address
      shipper_charges: [5, Validators.min(5)], // shipper charges
      other_charges: [0], // other charges
      declared_value: [0],
      cgst: [cgst],
      sgst: [sgst],
      igst: [igst],
      total_value: ['', [Validators.required,]],

      to_pay: ['0'],
      on_account: ['0'],
      amount: [],

      // extra fields
      xp_branch_id: null,
    });
  }

  async gateAllcity() {
    const storedCities = this.globalstore.get<{ city_id: number; city_name: string }[]>('cities');

    if (storedCities) {
      this.cities = storedCities;
      this.filteredCities = [];
      return;
    }
    try {
      await firstValueFrom(
        this.cityService.getAllCities({
          "fields": [],
          "max": 2000,
          "current": 0
        }).pipe(
          tap((res) => {
            this.cities = Array.isArray(res.body) ? res.body : [];
            this.globalstore.set('cities', this.cities, true);
          })
        )
      );
    } catch (error: any) {
      this.alertService.error(error?.error?.message || 'Failed to fetch cities');
      this.cities = [];
    }
    this.filteredCities = [];
  }
  searchCity(event: any) {
    const query = event.query.toLowerCase();
    this.filteredCities = this.cities.filter(city =>
      city.city_name.toLowerCase().includes(query)
    );
  }

  onCitySelect(event: any) {
    console.log('Selected City:', event);  // Debugging
    if (event) {
      console.log('Selected City ID:', event.value.id);
      console.log('Selected City Name:', event.value.name);
    }
  }



  async saveBooking() {
    if (!this.bookingForm) {
      return;
    }
    if (!this.bookingForm.valid) {
      this.alertService.error("Form is invalid. Please fill in all required fields.");
      return;
    }

    let formData = { ...this.bookingForm.value };
    if (formData.destination_city_id && typeof formData.destination_city_id === 'object') {
      formData.destination_city_id = formData.destination_city_id.city_id;
    }

    await firstValueFrom(this.bookingService.addNewBooking(formData).pipe(
      tap(
        async (res) => {
          if (res.body) {
            await this.alertService.success(res.message);
            this.createForm();
          }
        },
        error => {
          this.alertService.error(error.error.message);
        }
      )
    ))
  }

  async gateAllBranch() {
    const payload =
    {
      "fields": [],
      "max": 12,
      "current": 0,
    }

    await firstValueFrom(this.branchService.getAllBranches(payload).pipe(
      tap(
        (res) => {
          if (res.body) {
            this.branches = res.body;
          }
        }
      )
    ))
  }
  loadTransportModes(): void {
    this.transportModes = [
      { label: 'Bus', value: 'B' },
      { label: 'Train', value: 'T' },
      { label: 'Flight', value: 'F' },
      { label: 'Cab', value: 'C' }
    ];
  }
  book(): void {
    console.log("Not implemented");
  }


  calculateAmount() {
    if (!this.bookingForm) {
      return;
    }
    const weight = Number(this.bookingForm.get('package_weight')?.value) || 0;
    const charges = Number(this.bookingForm.get('package_value')?.value) || 0;
    const amount = weight > 0 && charges > 0 ? +(weight * charges).toFixed(2) : 0;

    this.bookingForm.patchValue({ total_value: amount, amount }, { emitEvent: false });
  }

  calculateTotal() {
    if (!this.bookingForm) {
      return;
    }
    const formValues = this.bookingForm.value;
    const shipper = Number(formValues.shipper_charges) || 5;
    const other = Number(formValues.other_charges) || 0;
    const cgst = Number(formValues.cgst ?? 0);
    const sgst = Number(formValues.sgst ?? 0);
    const igst = Number(formValues.igst ?? 0);
    const amount = Number(formValues.amount) || 0;
    const subtotal = +(amount + shipper + other).toFixed(2);
    let gstAmount = 0;
    if (formValues.to_pay) {
      gstAmount = +(subtotal * (igst / 100)).toFixed(2);
    } else {
      const cgstAmount = +(subtotal * (cgst / 100)).toFixed(2);
      const sgstAmount = +(subtotal * (sgst / 100)).toFixed(2);
      gstAmount = +(cgstAmount + sgstAmount).toFixed(2);
    }

    const total_value = +(subtotal + gstAmount).toFixed(2);

    this.bookingForm.patchValue({ total_value }, { emitEvent: false });
  }

  async search($event: any) {
    const string = $event.query;
    await firstValueFrom(this.bookingService.searchConsignee(string).pipe(
      tap(
        (res) => {
          if (res.body) {
            this.listOfConnersAndConsignees = res.body;
          }
        }
      )
    ))
  }

  upperCase(event: any) {
    event.target.value = event.target.value.toUpperCase();
  }

  onConsigneeSelect(event: any) {
    if (!this.bookingForm) {
      return;
    }
    this.bookingForm.patchValue(
      { 
        consignee_name: event.value.consignee_name, 
        consignee_mobile: event.value.consignee_mobile,
      })
  }

  onConsignorSelect(event: any) {
    if (!this.bookingForm) {
      return;
    }
    console.log(event);
    this.bookingForm.patchValue({
      consignor_name: event.value.consignor_name,
      consignor_mobile: event.value.consignor_mobile,
    });
  }



  generateBookingSlipPDF(): void {
    const formValue = this.bookingForm.value;
    const doc = new jsPDF();
    let y = 10;
  
    // Header: Company Info
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('DISHA AIRWAYS ENTERPRISE', 70, y);
    y += 7;
  
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('H.O.: 164, M.G. Road, 1st Floor, Kolkata - 7', 10, y);
    y += 5;
    doc.text('B.O.: 15B, Kakkar Street, Gr. Floor, Kolkata - 7', 10, y);
    y += 5;
    doc.text('Phone: 033-40686001', 10, y);
    y += 5;
    doc.text('PAN: ADOPD0043R    GSTIN: 19ADOPD0043R1ZZ', 10, y);
    y += 8;
  
    doc.setDrawColor(0);
    doc.line(10, y, 200, y); // horizontal separator
    y += 6;
  
    // Consignor and Consignee
    doc.setFont('helvetica', 'bold');
    doc.text('Consignor:', 10, y);
    doc.setFont('helvetica', 'normal');
    doc.text(formValue.consignor_name || '-', 35, y);
  
    doc.setFont('helvetica', 'bold');
    doc.text('Consignee:', 110, y);
    doc.setFont('helvetica', 'normal');
    doc.text(formValue.consignee_name || '-', 140, y);
    y += 7;
  
    // Origin & Destination
    doc.setFont('helvetica', 'bold');
    doc.text('Origin:', 10, y);
    doc.setFont('helvetica', 'normal');
    doc.text('Kolkata', 30, y); // or dynamic from form if needed
  
    doc.setFont('helvetica', 'bold');
    doc.text('Destination:', 110, y);
    doc.setFont('helvetica', 'normal');
    doc.text(formValue.destination_city_id || '-', 140, y);
    y += 7;
  
    // Package Info
    doc.setFont('helvetica', 'bold');
    doc.text('No of Pkgs:', 10, y);
    doc.setFont('helvetica', 'normal');
    doc.text(formValue.package_count?.toString() || '-', 40, y);
  
    doc.setFont('helvetica', 'bold');
    doc.text('Actual Weight:', 70, y);
    doc.setFont('helvetica', 'normal');
    doc.text(formValue.package_weight?.toString() || '-', 110, y);
    y += 7;
  
    // Value and Charges
    doc.setFont('helvetica', 'bold');
    doc.text('Declared Value Rs:', 10, y);
    doc.setFont('helvetica', 'normal');
    doc.text(formValue.declared_value?.toString() || '-', 50, y);
  
    doc.setFont('helvetica', 'bold');
    doc.text('Charges (Taxable):', 110, y);
    doc.setFont('helvetica', 'normal');
    doc.text(formValue.shipper_charges?.toString() || '0.00', 160, y);
    y += 7;
  
    // Tax Info
    doc.setFont('helvetica', 'bold');
    doc.text('IGST @18%:', 10, y);
    doc.setFont('helvetica', 'normal');
    doc.text(formValue.igst?.toString() || '-', 40, y);
  
    doc.setFont('helvetica', 'bold');
    doc.text('SGST @9%:', 110, y);
    doc.setFont('helvetica', 'normal');
    doc.text(formValue.sgst?.toString() || '-', 140, y);
    y += 7;
  
    // Total Section
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', 10, y);
    doc.setFontSize(12);
    doc.text(`${formValue.total_value || '0.00'}`, 40, y);
    y += 10;
  
    // Date & Signature
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 10, y);
    doc.text('Signature:', 160, y);
    doc.line(180, y + 1, 200, y + 1);
    y += 15;
  
    // Save
    doc.save(`BookingSlip_${formValue.slip_no || '000'}.pdf`);
  }


  
  generateConsignmentNote() {
    const doc = new jsPDF();

    // Header
    doc.setDrawColor(255, 0, 0); // red border
    doc.setTextColor(255, 0, 0); // red text
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Disha AIRWAYS', 14, 15);
    doc.setFontSize(12);
    doc.text('ENTERPRISE', 14, 22);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('H.O. : 164, M. G. Road, 1st Floor, Kolkata - 7', 14, 27);
    doc.text('B.O. : 15B, Kalakar Street, Gr. Floor, Kolkata - 7', 14, 32);
    doc.text('Phone : 033-40686091', 14, 37);
    doc.text('PAN : ADOPD0043R  •  GSTIN : 19ADOPD0043R1Z7', 14, 42);

    // Red box title
    doc.setFillColor(255, 0, 0);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.rect(140, 10, 60, 8, 'F');
    doc.text('CONSIGNMENT NOTE', 145, 16);

    // Origin/Destination
    doc.setTextColor(0);
    autoTable(doc, {
      startY: 45,
      theme: 'grid',
      styles: { fontSize: 9 },
      head: [['Origin', 'KOLKATA', 'No.', '4074']],
      body: [['Destination', 'MUM', 'Date', '25/1/24']],
      columnStyles: {
        1: { halign: 'center', fontStyle: 'bold' },
        3: { halign: 'center' },
      },
    });

    // Consignor/Consignee section
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 2,
      theme: 'grid',
      styles: { fontSize: 9 },
      head: [['Consignor', '', '']],
      body: [
        ['GST No.', 'Agarwal Handicraft', ''],
        ['Consignee', '', ''],
        ['GST No.', 'Fashion Zone', ''],
      ],
      columnStyles: { 1: { fontStyle: 'bold' } },
    });

    // Packages & charges section
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 2,
      theme: 'grid',
      styles: { fontSize: 9 },
      body: [
        ['No. of Pkgs.', '1', 'Declared Value Rs.', '11490'],
        ['Actual Weight', '2.700', 'Weight Charges', ''],
        ['Said to Contain', '', 'PAID / TO PAY', 'TO PAY'],
        ['Rupees in word', '482', '', ''],
      ],
    });

    // Charges summary section
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 2,
      theme: 'grid',
      styles: { fontSize: 9 },
      body: [
        ['Charges (Taxable Value)', '210.00'],
        ['Other Charges', ''],
        ['Shippers Charges', ''],
        ['CGST @ 9%', '18.90'],
        ['SGST @ 9%', '18.90'],
        ['IGST @ 18%', ''],
        ['TOTAL', '247.80'],
      ],
      columnStyles: { 1: { halign: 'right' } },
    });

    // Footer
    const footerY = (doc as any).lastAutoTable.finalY + 10;
    doc.setTextColor(255, 0, 0);
    doc.setFontSize(10);
    doc.text('ORIGINAL FOR RECIPIENT', 14, footerY);
    doc.setTextColor(0);
    doc.text('Signature', 170, footerY);

    // Save PDF
  // Auto print
  doc.autoPrint();

  // Open in new tab with print dialog
  window.open(doc.output('bloburl'), '_blank');
  }
  
}
