import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { firstValueFrom, tap } from 'rxjs';
import { BookingService } from '../../../../../services/booking.service';
import { AlertService } from '../../../../../services/alert.service';
import { StateService } from '../../../../../services/state.service';
import { CityService } from '../../../../../services/city.service';
import { BranchService } from '../../../../../services/branch.service';
import { GlobalStorageService } from '../../../../../services/global-storage.service';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { Router } from '@angular/router';

@Component({
  selector: 'app-booking-status',
  standalone: true,
  imports: [CommonModule, AutoCompleteModule, DropdownModule, CalendarModule, FormsModule, ReactiveFormsModule, DatePickerModule],
  templateUrl: './booking-status.component.html',
  styleUrls: ['./booking-status.component.scss']
})
export class BookingStatusComponent implements OnInit {

  bookingList?: any[];
  filteredBookingsInventory?: any[];
  current = 0;
  max = 10;
  bookingStatusForm: FormGroup;
  branches: any[] = [];
  cities: any[] = [];
  filteredCities: any[] = [];
  selectedCity: any;
  branchInfo: any;
  cgstAmount: number = 0;
  sgstAmount: number = 0;
  igstAmount: number = 0;
  stateName: string = '';



  constructor(
    private bookService: BookingService,
    private alertService: AlertService,
    private branchService: BranchService,
    private storage: GlobalStorageService,
    private fb: FormBuilder,
    private globalStorage: GlobalStorageService,
    private cityService: CityService,
    private globalstorageService: GlobalStorageService,
    private router: Router,
    private stateService: StateService
  ) {
    this.bookingStatusForm = this.fb.group({
      bookingDate: [''],
      destination_city_id: [''],
      destination_id: ['']
    })

  }

  async ngOnInit() {
    this.storage.set('PAGE_TITLE', "BOOKING LIST");
    await this.getAllBooking();
    this.gateAllBranch();
    this.gateAllcity();
    this.filterBookingList()
    this.branchInfo = this.globalstorageService.get('branchInfo');
    await this.getStatebyId(this.branchInfo.state_id)
  }

  async getAllBooking() {
    try {
      await firstValueFrom(this.bookService.getBookingList({
        felid: [],
        current: this.current,
        max: this.max
      }).pipe(
        tap(
          (res) => {
            if (res?.body && Array.isArray(res.body)) {
              this.current = res.body.length;
              this.bookingList = this.bookingList ? [...this.bookingList, ...res.body] : res.body;
              this.filterBookingList();
            }
          },
          (error) => {
            this.alertService.error(error?.error?.message || 'An error occurred while fetching bookings.');
          }
        )
      ))


    } catch (error: any) {
      this.alertService.error(error?.error?.message || 'An error occurred while fetching bookings.');
    }
  }



  async gateAllBranch() {
    const payload =
    {
      "fields": [],
      "max": 5000,
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


  async gateAllcity() {
    const storedCities = this.globalStorage.get<{ city_id: number; city_name: string }[]>('cities');
    if (storedCities) {
      this.cities = storedCities;
      this.filteredCities = [];
      return;
    }

    try {
      await firstValueFrom(this.cityService.getAllCities({
        "fields": ["city_id", "city_name"],
        "max": 5000,
        "current": 0,
      }).pipe(
        tap(
          (res) => {
            if (res.body) {
              this.cities = res.body;
              this.globalStorage.set('cities', this.cities, true);
            }
          }
        )
      ))
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  }
  


  editBooking(booking: any) {
    this.router.navigate(['/pages/booking'], { state: { booking } });
    // this.globalStorage.set('PAGE_TITLE', "BOOKING EDIT");
    // this.globalStorage.set('PAGE_URL', "/disha/menu/booking-edit");
    // this.globalStorage.set('PAGE_URL_ID', booking.booking_id);


  }

  onCitySelect(event: any) {
    if (event.value) {
      console.log(event.value);
      this.bookingStatusForm?.patchValue({ destination_city_id: event.value.city_id });
      this.selectedCity = event.value;
      if (event.value.destination_city_id == '', event.value.destination_city_id == undefined) {
        this.filterBookingList();

      }
    }

    this.filterBookingList();
  }

  searchCity(event: any) {
    const query = event?.query?.toLowerCase() || '';
    console.log(query)
    this.filterBookingList();

    this.filteredCities = this.cities.filter(city =>
      city.city_name?.toLowerCase().includes(query)
    );
  }

  getCityName(cityId: number): string {
    const cities = this.storage.get('cities') as { city_id: number; city_name: string }[] || [];
    const city = cities.find(city => city.city_id === cityId);
    return city ? city.city_name : ''; // Return city name or empty string if not found
  }

  onCityInputChange(value: any) {
    if (!value || typeof value === 'string') {
      this.bookingStatusForm.patchValue({ destination_city_id: null });
    }
    this.filterBookingList();
  }


  filterBookingList() {
    const { bookingDate, destination_city_id, destination_id } = this.bookingStatusForm.value;
    console.log('Filter values:', { bookingDate, destination_city_id, destination_id });

    const selectedDate = bookingDate
      ? new Date(bookingDate).toLocaleDateString('en-CA')
      : null;

    this.filteredBookingsInventory = this.bookingList?.filter(booking => {
      const bookingCreatedDate = new Date(booking.created_at).toLocaleDateString('en-CA');

      return (
        (selectedDate ? bookingCreatedDate === selectedDate : true) &&
        (destination_city_id ? booking.destination_city_id === +destination_city_id : true) &&
        (destination_id ? booking.destination_branch_id === +destination_id : true)
      );
    });
  }


  transportModes = [
    { label: 'Bus', value: 'B' },
    { label: 'Train', value: 'T' },
    { label: 'Flight', value: 'F' },
    { label: 'Cab', value: 'C' }
  ];

  getTransportModeLabel(value: string): string {
    const mode = this.transportModes.find(mode => mode.value === value);
    return mode ? mode.label : value;
  }


  calculateTotal(charges?: number, shipper?: number, other?: number, cgst?: number, sgst?: number, igst?: number): number {
    // Ensure all values are numbers, replace undefined/null with 0
    const c = Number(charges) || 0;
    const s = Number(shipper) || 0;
    const o = Number(other) || 0;
    const cgstVal = Number(cgst) || 0;
    const sgstVal = Number(sgst) || 0;
    const igstVal = Number(igst) || 0;

    const subtotal = c + s + o;
    const cgstAmount = (cgstVal / 100) * subtotal;
    const sgstAmount = (sgstVal / 100) * subtotal;
    const igstAmount = (igstVal / 100) * subtotal;

    return subtotal + cgstAmount + sgstAmount + igstAmount;
  }

  async onScroll(event: any): Promise<void> {
    const bottom = event.target.scrollHeight === event.target.scrollTop + event.target.clientHeight;
    if (bottom) {
      await this.getAllBooking();
    }
  }

  async cancelOder(bookingId: number) {
    await firstValueFrom(this.bookService.cancelBooking(bookingId).pipe(
      tap(
        (res) => {
          if (res?.body) {
            this.alertService.success(res.body.message);
            this.bookingList = this.bookingList?.filter(booking => booking?.booking_id !== bookingId);
          }
        }
      )
    ))
  }




  async generateBookingSlipPDF(data: any, option: 'print' | 'download'): Promise<void> {
    const doc = new jsPDF('p', 'mm', 'a4');
    const positions = [5];
  
    for (const offsetY of positions) {
      await this.drawTemplate(doc, 5, offsetY, data);
    }
  
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
  
    if (option === 'print') {
      const win = window.open(blobUrl, '_blank');
      if (!win) {
        alert('Please allow popups to print the document.');
        return;
      }
      win.onload = () => {
        win.focus();
        win.print();
      };
    } else if (option === 'download') {
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = 'booking-slip.pdf';
      a.click();
    }
  }
  


  async printBookingSlip(data: any) {
    const pdfBlob:any = await this.generateBookingSlipPDF(data, 'print');
  
    const blobUrl = URL.createObjectURL(pdfBlob);
  
    const win = window.open(blobUrl, '_blank');
  
    if (!win) {
      alert('Popup blocked! Please allow popups in your browser.');
    } else {
      
      setTimeout(() => {
        win.focus();
        win.print();
      }, 500);
    }
  }
  
  
  
  
  
  

  async drawTemplate(doc: jsPDF, offsetX: number, offsetY: number, data: any) {
    const w = 200;
    const h = 68;
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    const paymentStatus = data.to_pay ? 'TO PAY' : 'PAID';

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
    doc.text(''+this.branchInfo.address, offsetX + 2, offsetY + 14);
    doc.text(
      'City: ' + this.getCityName(this.branchInfo.city_id) + ', State: ' + this.stateName,
      offsetX + 2,
      offsetY + 18
    );    doc.text('Phone : '+this.branchInfo.contact_no, offsetX + 2, offsetY + 22);
    doc.text(`PAN : ${this.branchInfo.udyam_no || '-'}   •   GSTIN : ${this.branchInfo.gst_no || '-'}`, offsetX + 2, offsetY + 26);

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
    doc.text('' + data.consignor_name, offsetX + 20, offsetY + 39);

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
    doc.text('' + data.consignee_name, offsetX + 20, offsetY + 58);

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
    doc.text('' + this.getCityName(data.destination_city_id), offsetX + 95, offsetY + 27);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(7);
    doc.text('No Of Pkgs.: ' + data.package_count, offsetX + 80, offsetY + 34);
    doc.text('Declared Value Rs.: ' + data.declared_value, offsetX + 80, offsetY + 38);
    doc.text('Actual Weight.: ' + data.package_weight, offsetX + 80, offsetY + 42);
    doc.text('Weight Charges.: ' + data.package_value, offsetX + 80, offsetY + 46);
    doc.text('Said To Contain.: ', offsetX + 80, offsetY + 50);
    doc.text('PAID / TO PAY.: ' + paymentStatus, offsetX + 80, offsetY + 54);

    // Consignment Note
    doc.setFillColor(255, 0, 0);
    doc.rect(offsetX + 150, offsetY + 6, 50, 5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('CONSIGNMENT NOTE', offsetX + 152, offsetY + 9.5);

    doc.setTextColor(0, 0, 0);
    doc.text('' + data.slip_no, offsetX + 155, offsetY + 20);
    doc.text('Date : ' + formattedDate, offsetX + 155, offsetY + 25);

    // Charges Section
    doc.setFontSize(7);
    const chargesY = offsetY + 30;
    const rightDetails = [
      // 'Charges (Taxable Value)  210.00',
      'Other Charges          - ' + data.other_charges,
      'Shippers Charges       - ' + data.shipper_charges,
      'CGST @  ' + data.cgst + '%            ' + this.calculateGst(data, data.cgst),
      'SGST @  ' + data.sgst + '%            ' + this.calculateGst(data, data.sgst),
      'IGST @  ' + data.igst + '%            ' + this.calculateGst(data, data.igst),
      'TOTAL                    ' + data.total_value,
    ];

    let cy = chargesY;
    rightDetails.forEach((txt) => {
      doc.text(txt, offsetX + 155, cy);
      cy += 4;
    });

    // QR CODE
    const qrData = await QRCode.toDataURL(data.slip_no, { margin: 1, width: 100 });
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


  calculateGst(data: any | null, gst: number): number {
    if (!data || typeof data.total_value !== 'number') return 0;
  
    const totalGst = data.cgst + data.sgst + data.igst;
  
    const baseAmount = (data.total_value * 100) / (100 + totalGst);
  
    const result = (baseAmount * gst) / 100;
  
    return parseFloat(result.toFixed(2)); ;
  }

  async getStatebyId(data: any){
    if(data){
      const payload = {
        state_id: data
      }
      await firstValueFrom(this.stateService.getStateById(payload).pipe(
        tap(
          (res) => {
            if (res.body) {
              this.stateName = res.body.state_name;
            }
          },
          (error) => {
            this.alertService.error(error?.error?.message || 'An error occurred while fetching states.');
          }
        )
      ))
    }
  }
  
  
}
