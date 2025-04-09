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
import QRCode from 'qrcode';
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
  imports: [DropdownModule, SelectModule, AutoCompleteModule, RadioButtonModule,
     ButtonModule, FormsModule, InputTextModule, ReactiveFormsModule, CommonModule,
      DividerModule, CheckboxModule],
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
  FormData: any;
  responce: any;
  listOfConnersAndConsignees: any[] = [];
  cgstAmount: number = 0;
  sgstAmount: number = 0;
  gstAmount: number = 0;
  igstAmount: number = 0;

  constructor(
    private cityService: CityService,
    private stateService: StateService,
    private branchService: BranchService,
    private bookingService: BookingService,
    private messageService: MessageService,
    private fb: FormBuilder,
    private alertService: AlertService,
    private employeeService: EmployeesService,
    private globalstorageService: GlobalStorageService
  ) {
    this.createForm();
  }

  async ngOnInit(): Promise<void> {
    this.createForm();
    if (!this.bookingForm) {
      return;
    }
    this.globalstorageService.set('PAGE_TITLE', "BOOKING");
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
    this.branchInfo = this.globalstorageService.get('branchInfo');
    // this.onCheckboxChange(false);
  }


  createForm() {
    this.branchInfo = this.globalstorageService.get('branchInfo');
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
    const storedCities = this.globalstorageService.get<{ city_id: number; city_name: string }[]>('cities');

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
            this.globalstorageService.set('cities', this.cities, true);
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

    this.FormData = formData;

    await firstValueFrom(this.bookingService.addNewBooking(formData).pipe(
      tap(
        async (res) => {
          if (res.body) {
            await this.alertService.success(res.message);
            this.responce = res.body;
            this.generateBookingSlipPDF();
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
    console.log(formValues.shipper_charges);
    const shipper = Number(formValues.shipper_charges) || 5;
    const other = Number(formValues.other_charges) || 0;
    const cgst = Number(formValues.cgst ?? 0);
    const sgst = Number(formValues.sgst ?? 0);
    const igst = Number(formValues.igst ?? 0);
    const amount = Number(formValues.amount) || 0;
    const subtotal = +(amount + shipper + other).toFixed(2);
    if (formValues.to_pay) {
      this.gstAmount=this.igstAmount = +(subtotal * (igst / 100)).toFixed(2);
    } else {
      this.cgstAmount = +(subtotal * (cgst / 100)).toFixed(2);
      this.sgstAmount = +(subtotal * (sgst / 100)).toFixed(2);
      this.gstAmount = +(this.cgstAmount + this.sgstAmount).toFixed(2);
    }

    const total_value = +(subtotal + this.gstAmount).toFixed(2);

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






  async generateBookingSlipPDF() {
    const doc = new jsPDF('p', 'mm', 'a4');
    const positions = [5, 78, 151, 224]; // Row positions for 4 slips

    for (const offsetY of positions) {
      await this.drawTemplate(doc, 5, offsetY);
    }

    // Open in a new tab for print
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  }





  async drawTemplate(doc: jsPDF, offsetX: number, offsetY: number) {
    const w = 200;
    const h = 68;
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    const paymentStatus = this.FormData.to_pay ? 'TO PAY' : 'PAID';

    // Outer Border
    doc.setDrawColor(0);
    doc.rect(offsetX, offsetY, w, h);

    // ---- HEADER ----
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 0, 0);
    doc.setFontSize(10);
    doc.text('' + this.branchInfo.branch_name, offsetX + 2, offsetY + 6);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text('ENTERPRISE', offsetX + 2, offsetY + 10);
    doc.text('H.O. : 164, M. G. Road, 1st Floor, Kolkata - 7', offsetX + 2, offsetY + 14);
    doc.text('B.O. : 15B, Kalakar Street, Gr. Floor, Kolkata - 7', offsetX + 2, offsetY + 18);
    doc.text('Phone : 033-40686991', offsetX + 2, offsetY + 22);
    doc.text('PAN : ADOPD0043R    •    GSTIN : 19ADOPD0043R1Z7', offsetX + 2, offsetY + 26);

    // Consignor Block
    doc.setFillColor(0, 180, 150);
    doc.rect(offsetX, offsetY + 30, 60, 5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Consignor', offsetX + 2, offsetY + 33);

    doc.setFontSize(7);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text('Name:', offsetX + 2, offsetY + 39);
    doc.setFont('helvetica', 'bold');
    doc.text('' + this.FormData.consignor_name, offsetX + 20, offsetY + 39);

    doc.setFont('helvetica', 'normal');
    doc.text('GST No.:', offsetX + 2, offsetY + 44);
    doc.setFont('helvetica', 'bold');
    doc.text('', offsetX + 20, offsetY + 44);

    // Consignee Section
    doc.setFillColor(0, 180, 150);
    doc.rect(offsetX, offsetY + 47, 60, 5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Consignee', offsetX + 2, offsetY + 50);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text('Name:', offsetX + 2, offsetY + 58);
    doc.setFont('helvetica', 'bold');
    doc.text('' + this.FormData.consignee_name, offsetX + 20, offsetY + 58);

    doc.setFont('helvetica', 'normal');
    doc.text('GST No.:', offsetX + 2, offsetY + 63);
    doc.setFont('helvetica', 'bold');
    doc.text('', offsetX + 20, offsetY + 63);

    // Origin
    doc.setFillColor(0, 180, 150);
    doc.rect(offsetX + 80, offsetY + 6, 45, 5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('Origin', offsetX + 97, offsetY + 9.5);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.text('' + this.getCityName(this.branchInfo.city_id), offsetX + 95, offsetY + 15);

    // Distinction
    doc.setFillColor(0, 180, 150);
    doc.rect(offsetX + 80, offsetY + 18, 45, 5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('Destination', offsetX + 94, offsetY + 21.5);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.text('' + this.getCityName(this.FormData.destination_city_id), offsetX + 95, offsetY + 27);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(7);
    doc.text('No Of Pkgs.: ' + this.FormData.package_count, offsetX + 80, offsetY + 34);
    doc.text('Declared Value Rs.: ' + this.FormData.declared_value, offsetX + 80, offsetY + 38);
    doc.text('Actual Weight.: ' + this.FormData.package_weight, offsetX + 80, offsetY + 42);
    doc.text('Weight Charges.: ' + this.FormData.package_value, offsetX + 80, offsetY + 46);
    doc.text('Said To Contain.: ', offsetX + 80, offsetY + 50);
    doc.text('PAID / TO PAY.: ' + paymentStatus, offsetX + 80, offsetY + 54);

    // Consignment Note
    doc.setFillColor(255, 0, 0);
    doc.rect(offsetX + 150, offsetY + 6, 50, 5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('CONSIGNMENT NOTE', offsetX + 152, offsetY + 9.5);

    doc.setTextColor(0, 0, 0);
    doc.text('' + this.responce, offsetX + 155, offsetY + 20);
    doc.text('Date : ' + formattedDate, offsetX + 155, offsetY + 25);

    // Charges Section
    doc.setFontSize(7);
    const chargesY = offsetY + 30;
    const rightDetails = [
      // 'Charges (Taxable Value)  210.00',
      'Other Charges          - ' + this.FormData.other_charges,
      'Shippers Charges       - ' + this.FormData.shipper_charges,
      'CGST @  ' + this.FormData.cgst + '%            ' + this.cgstAmount,
      'SGST @  ' + this.FormData.sgst + '%            ' + this.sgstAmount,
      'IGST @  ' + this.FormData.igst + '%            ' + this.igstAmount,
      'TOTAL                    ' + this.FormData.total_value,
    ];

    let cy = chargesY;
    rightDetails.forEach((txt) => {
      doc.text(txt, offsetX + 155, cy);
      cy += 4;
    });

    // QR CODE
    const qrData = await QRCode.toDataURL(this.responce, { margin: 1, width: 100 });
    const qrX = offsetX + 125;
    const qrY = offsetY + 40;
    const qrSize = 18;

    doc.addImage(qrData, 'PNG', qrX, qrY, qrSize, qrSize);
    doc.setFontSize(6);
    doc.setTextColor(0, 0, 0);
    doc.text('Scan Slip No.', qrX, qrY + qrSize + 4);

    // Signature
    doc.setFontSize(7);
    doc.text('Signature', offsetX + 180, offsetY + h - 2);
  }


  async qr() {
    try {
      const doc = new jsPDF(); // create jsPDF instance
      const offsetX = 20;
      const offsetY = 20;
      const slip_no = '100'; // default slip number

      console.log('QR button clicked');

      const qrData = await QRCode.toDataURL(slip_no, { margin: 1, width: 100 });
      const qrX = offsetX + 120;
      const qrY = offsetY + 50;
      const qrSize = 15;

      doc.addImage(qrData, 'PNG', qrX, qrY, qrSize, qrSize);
      doc.setFontSize(6);
      doc.text('Scan Slip No.', qrX, qrY + qrSize + 3);

      doc.save('booking-slip.pdf'); // optional: save PDF
    } catch (err) {
      console.error('QR Code Error:', err);
    }
  }
  getCityName(cityId: number): string {
    const cities = this.globalstorageService.get('cities') as { city_id: number; city_name: string }[] || [];
    const city = cities.find(city => city.city_id === cityId);
    return city ? city.city_name : ''; // Return city name or empty string if not found
  }

}
