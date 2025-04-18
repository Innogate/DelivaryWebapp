import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DropdownModule } from 'primeng/dropdown';
import { firstValueFrom, tap } from 'rxjs';
import { GlobalStorageService } from '../../../../../services/global-storage.service';
import { CityService } from '../../../../../services/city.service';
import { EmployeesService } from '../../../../../services/employees.service';
import { AlertService } from '../../../../../services/alert.service';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { deliveryService } from '../../../../../services/delivery.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { printBase64File, saveFile } from '../../../../../utility/function';
import { strict } from 'assert';

@Component({
  selector: 'app-delivery',
  imports: [DropdownModule, CommonModule, AutoCompleteModule, FormsModule, TagModule, ButtonModule, ReactiveFormsModule],
  templateUrl: './delivery.component.html',
  styleUrl: './delivery.component.scss'
})
export class DeliveryComponent {
  filteredCities: any[] = [];
  cities: any[] = [];
  deliveryForm: FormGroup;
  selectedCity: any = null;
  EmployeeList: any[] = [];
  selectedBookingsInventory: any[] = [];
  filteredBookingsInventory: any[] = [];
  bookingsInventory: any[] = [];
  city_id = 0;

  constructor(private fb: FormBuilder, private globalstorageService: GlobalStorageService,
    private cityService: CityService, private EmployeeService: EmployeesService, private alertService: AlertService,
    private deliveryService: deliveryService,) {
    this.deliveryForm = this.fb.group({
      city_id: ['', Validators.required],
      employee_id: ['', Validators.required],
    });
  }


  async ngOnInit(): Promise<void> {
    this.globalstorageService.set('PAGE_TITLE', "DELIVERY");
    this.gateAllcity();
    this.gateAllEmployee();
    await this.getAllBookings();
    this.filterDelivery();
  }



  async gateAllcity() {
    const storedCities = this.globalstorageService.get<{ city_id: number; city_name: string }[]>('cities');
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
              this.globalstorageService.set('cities', this.cities, true);
            }
          }
        )
      ))
    } catch (error: any) {
      this.alertService.error('' + error.error.message);
    }
  }

  async gateAllEmployee() {
    const payload: any = {
      fields: [],
      max: 100,
      current: 0
    }
    try {
      await firstValueFrom(this.EmployeeService.getAllEmployees(payload).pipe(
        tap(
          (res) => {
            if (res.body) {
              this.EmployeeList = res.body;
            }
          }
        )
      ))
    } catch (error:any) {
      this.alertService.error('' + error.error.message);
    }
  }





  async getAllBookings() {

    try {
      await firstValueFrom(this.deliveryService.fetchDelivery().pipe(
        tap((res: any) => {
          if (res?.body) {
            this.bookingsInventory = res.body;
          }
        })
      ));
    } catch (error: any) {
      this.alertService.error(error?.error?.message || 'An error occurred while fetching bookings.');
    }
  }



  async addNewDelivery() {
    if (this.selectedBookingsInventory.length === 0) {
      this.alertService.error('Please select booking');
      return;
    }
    if (!this.deliveryForm.valid) {
      return;
    }

    const selectedBookingIds = this.selectedBookingsInventory.map(booking => booking.booking_id);

    try {

      const payload = {
        employee_id: this.deliveryForm.value.employee_id,
        city_id: this.deliveryForm.value.city_id.city_id,
        booking_lists: selectedBookingIds,
      }

      await firstValueFrom(this.deliveryService.addNewDelivery(payload).pipe(
        tap(
          async (res) => {
            if (res) {
              await this.generatePDF();
              await this.alertService.success(res.message);
              this.selectedBookingsInventory = [];
              this.getAllBookings();
            }
          },
          (error) => {
            this.alertService.error(error?.error?.message || 'An error occurred while adding delivery.');
          }
        )
      ));

    } catch (error: any) {
      this.alertService.error(error?.error?.message || 'An error occurred while adding delivery.');
    }
  }



  // felterBookings() {
  //   if (this.deliveryForm.value.city_id) {
  //     this.filteredBookingsInventory = this.bookingsInventory.filter(booking => booking.city_id === this.selectedCity.city_id);
  //   } else {
  //     this.filteredBookingsInventory = this.bookingsInventory;
  //   }
  // }


  filterDelivery() {
    const { city_id } = this.deliveryForm.value;
    if (!city_id || city_id === '') {
      this.filteredBookingsInventory = [...this.bookingsInventory];
      return;
    }

    this.filteredBookingsInventory = this.bookingsInventory.filter(item => item.destination_city_id === city_id);
    this.city_id = city_id
  }






  selectBooking(booking: any) {
    this.selectedBookingsInventory.push(booking);
    this.filteredBookingsInventory.splice(this.filteredBookingsInventory.indexOf(booking), 1);
    this.bookingsInventory.splice(this.bookingsInventory.indexOf(booking), 1);
  }

  removeBooking(booking: any) {
    this.filteredBookingsInventory.push(booking);
    this.bookingsInventory.push(booking);
    this.selectedBookingsInventory.splice(this.selectedBookingsInventory.indexOf(booking), 1);
  }


  selectAllBookings() {
    this.selectedBookingsInventory = this.filteredBookingsInventory;
    // remover all item from bookingsInventory
    this.bookingsInventory = this.bookingsInventory.filter(booking => !this.filteredBookingsInventory.includes(booking));
    this.filteredBookingsInventory = [];
  }

  deselectAllBookings() {
    this.filteredBookingsInventory = this.selectedBookingsInventory;
    // add all item from bookingsInventory
    this.bookingsInventory = this.bookingsInventory.concat(this.selectedBookingsInventory);
    this.selectedBookingsInventory = [];
  }


  onCitySelect(event: any) {
    this.deliveryForm?.patchValue({ city_id: event.value.city_id });
    this.selectedCity = event.value;
  }


  searchCity(event: any) {
    const query = event?.query?.toLowerCase() || '';
    (query)


    this.filteredCities = this.cities.filter(city =>
      city.city_name?.toLowerCase().includes(query)
    );
  }



  generatePDF(isPrint = true) {
    const doc = new jsPDF();
    const formattedDate = new Date().toLocaleString('en-GB', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).replace(',', '');

    // White Background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');

    // Header Bar
    doc.setFillColor(0, 51, 102);
    doc.rect(0, 10, doc.internal.pageSize.width, 15, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('Delivery List', 105, 20, { align: 'center' });

    // Info Section
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Employee Name: ' + (this.getEmployeeNameById(this.deliveryForm.value.employee_id) || 'N/A'), 20, 35);
    doc.text('Generated on: ' + formattedDate, 20, 42);

    // Define new table headers
    const tableColumn = ['Slip No.', 'Consignee', 'Consignee Mobile', 'Consignor', 'Consignor Mobile', 'No. of Packages', 'City'];

    // Construct table rows with the updated fields
    const tableRows = this.selectedBookingsInventory.map((b: any) => {
      return [
        b.slip_no?.toString() || '',
        b.consignee_name?.toUpperCase() || '',
        b.consignee_mobile || '',
        b.consignor_name?.toUpperCase() || '',
        b.consignor_mobile || '',
        b.package_count?.toString() || '',
        this.getCityName(b.destination_city_id || '')
      ];
    });

    autoTable(doc, {
      startY: 50,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 3,
        halign: 'center',
        textColor: [0, 0, 0],
      },
      headStyles: {
        fillColor: [0, 102, 204],
        textColor: [255, 255, 255],
        fontSize: 11
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { halign: 'center', textColor: [0, 0, 255] },
        1: { halign: 'left' },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'center', textColor: [0, 128, 0] }
      }
    });

    // Footer
    doc.setFillColor(0, 51, 102);
    doc.rect(0, doc.internal.pageSize.height - 15, doc.internal.pageSize.width, 15, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(255, 255, 255);
    doc.text('This is a system-generated delivery list. No signature required.', 20, doc.internal.pageSize.height - 7);

    if (isPrint) {
      doc.autoPrint();
      window.open(doc.output('bloburl'), '_blank');
      // convert to base64 and console log
      const blob = doc.output('blob');
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        printBase64File(base64String, ('Delivery') +(new Date().toDateString())+'.pdf');
      };
      reader.readAsDataURL(blob);
    } else {
      doc.save(('Delivery') + '_List_Report.pdf');
      const blob = doc.output('blob');
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        saveFile(base64String, ('Delivery') +(new Date().toDateString())+'.pdf');
      };
      reader.readAsDataURL(blob);
    }
  }


  getCityName(cityId: number): string {
    const cities = this.globalstorageService.get('cities') as { city_id: number; city_name: string }[] || [];
    const city = cities.find(city => city.city_id === cityId);
    return city ? city.city_name : ''; // Return city name or empty string if not found
  }

  getEmployeeNameById(id: number): string {
    const employee = this.EmployeeList.find(emp => emp.employee_id === id);
    return employee ? employee.employee_name : 'Unknown';
  }


}
