import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { firstValueFrom, tap } from 'rxjs';
import { BranchService } from '../../../../../services/branch.service';
import { TableModule } from 'primeng/table';
import { CityService } from '../../../../../services/city.service';
import { GlobalStorageService } from '../../../../../services/global-storage.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { coloaderService } from '../../../../../services/coloader.service';
import { AlertService } from '../../../../../services/alert.service';
@Component({
  selector: 'app-manifest',
  imports: [DropdownModule, SelectModule, TableModule, AutoCompleteModule, RadioButtonModule, ButtonModule, FormsModule, InputTextModule, ReactiveFormsModule, CommonModule, DividerModule, CheckboxModule],
  templateUrl: './manifest.component.html',
  styleUrl: './manifest.component.scss'
})
export class ManifestComponent {
  companies: any[] = [];
  states: any[] = [];
  cities: any[] = [];
  branchList: any[] = [];
  showAddState: boolean = false;
  selectedFileName: string = '';
  private touchStartY: number = 0;
  isEditing: boolean = false;
  company_id: number = 1;
  transportModes: any[] = [];
  selectedTransportMode: any;
  filteredCities: any[] = [];
  selectedCity: any = null;
  branches: any[] = [];
  coLoaderOptions: any[] = [];
  form: FormGroup;
  coloaderList: any[] = [];
  constructor(private branchService: BranchService,
    private coloaderService: coloaderService,
    private fb: FormBuilder,
    private cityService: CityService,
    private globalstore: GlobalStorageService,
    private alertService: AlertService) {
    this.form = this.fb.group({
      branch_name: ['', Validators.required],
      destination_city_id: ['', Validators.required],
      co_loader: ['', Validators.required],
      transport_mode: ['', Validators.required]
    })
  }

  ngOnInit(): void {
    this.gateAllBranch();
    this.loadTransportModes();
    this.gateAllcity();
    this.gateAllColoaders();
  }



  async gateAllcity() {
    const storedCities = this.globalstore.get<{ city_id: number; city_name: string }[]>('cities');
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
              this.globalstore.set('cities', this.cities, true);
            }
          }
        )
      ))
    } catch (error) {
      console.error('Error fetching cities:', error);
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



  // gate all coloaders
  async gateAllColoaders() {
    const payload = {
      "fields": [],
      "max": 12,
      "current": 0
    }
    await firstValueFrom(this.coloaderService.fetchColoader(payload).pipe(
      tap(
        (res) => {
          if (res.body) {
            this.coloaderList = res.body;
          }
        },
        (error) => {
          this.alertService.error(error.error.message);
        }
      )
    ))
  }




  // Filter city suggestions based on user input
  searchCity(event: any) {
    // console.log('Search City:', event.query);
    const query = event?.query?.toLowerCase() || ''; // Ensure query exists
    console.log(query)


    this.filteredCities = this.cities.filter(city =>
      city.city_name?.toLowerCase().includes(query) // Ensure city.name exists
    );
    console.log(this.filteredCities)
  }


  // Handle city selection
  onCitySelect(event: any) {
    console.log('Selected City:', event);
  }


  loadTransportModes(): void {
    this.transportModes = [
      { label: 'Bus', value: 'B' },
      { label: 'Train', value: 'T' },
      { label: 'Flight', value: 'F' },
      { label: 'Cab', value: 'C' }
    ];
  }




  toggleAddState() {
    this.showAddState = !this.showAddState;
    this.isEditing = false;
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
















  bookingList = [
    { number: 'BK-1001', selected: false },
    { number: 'BK-1002', selected: false },
    { number: 'BK-1003', selected: false },
    { number: 'BK-1004', selected: false },
    { number: 'BK-1005', selected: false },
    { number: 'BK-1005', selected: false }

  ];
  filteredBookings = [...this.bookingList]; // Copy of booking list
  searchTerm: string = '';
  selectAll: boolean = false;

  // Toggle Select All
  toggleSelectAll() {
    this.filteredBookings.forEach(booking => booking.selected = this.selectAll);
  }

  // Update Selected Checkboxes
  updateSelected() {
    this.selectAll = this.filteredBookings.every(booking => booking.selected);
  }

  // Search and Filter Bookings
  filterBookings() {
    this.filteredBookings = this.bookingList.filter(booking =>
      booking.number.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  // Save Selected Bookings
  saveSelectedBookings() {
    const selectedBookings = this.bookingList
      .filter(b => b.selected)
      .map(b => b.number);

    console.log('Selected Booking Numbers:', selectedBookings);
  }













  generatePDF() {
    const doc = new jsPDF();
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    // **Set Page Background Color**
    doc.setFillColor(230, 240, 255); // Light Blue Background
    doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F'); // Fills the page

    // **Company Title with Background**
    doc.setFillColor(0, 51, 102); // Dark Blue
    doc.rect(0, 10, doc.internal.pageSize.width, 15, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255); // White Text
    doc.text('Disha Airways Enterprise Manifest', 105, 20, { align: 'center' });

    // **Header Information**
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0); // Black Text
    doc.text('Origin Branch: DISHA KALAKAR STREET KOLKATA', 20, 35);
    doc.text('Destination Branch: DISHA SURAT', 20, 42);
    doc.text('Co-loader: SHAKTI CARGO AND LOGISTICS', 20, 49);
    doc.text(`Generated on: ${formattedDate}`, 20, 56);

    // **Manifest ID & Mode of Transport**
    doc.setTextColor(255, 0, 0); // Red
    doc.text('Manifest ID: GJ00478', 150, 35);
    doc.text('Total shipment to dispatch: 8', 150, 42);
    doc.text('Mode Of Transport: Air', 150, 49);

    // **Table Columns**
    const tableColumn = [
      'CN No.', 'No of Packages', 'Product Weight', 'Consignee', 'Destination', 'To Pay'
    ];

    // **Table Rows (Data)**
    const tableRows = [
      ['2465', '1', '1 KG 20 GM', 'RAJSHREE LACE', 'Surat', ''],
      ['8962', '1', '0 KG 10 GM', 'ASOPALAV ENDEAVOURS LLP', 'Surat', ''],
      ['8948', '1', '0 KG 10 GM', 'RAAG SUTRA', 'Surat', ''],
      ['2446', '1', '0 KG 10 GM', 'ASOPALAV ENDEAVOURS LLP', 'Surat', ''],
      ['2460', '1', '0 KG 60 GM', 'VRUNDAVAB TEX', 'Surat', ''],
      ['29303', '1', '0 KG 60 GM', 'VINAYAK TEX PRINT', 'Surat', ''],
      ['29290', '1', '2 KG 80 GM', 'RAJWADI EMPORIM', 'Surat', ''],
      ['29266', '1', '2 KG', 'ASOPALAV ENDEAVOURS LLP', 'Surat', '']
    ];

    // **Styled Table**
    autoTable(doc, {
      startY: 65, // Start position below the header
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 4,
        halign: 'center',
        textColor: [0, 0, 0], // Black Text
      },
      headStyles: {
        fillColor: [0, 102, 204], // Vibrant Blue Header
        textColor: [255, 255, 255], // White Text
        fontSize: 11
      },
      alternateRowStyles: { fillColor: [245, 245, 245] }, // Light Gray alternate row
      columnStyles: {
        0: { halign: 'center', textColor: [0, 0, 255] }, // Blue for CN No.
        1: { halign: 'center' },
        2: { halign: 'center', textColor: [255, 0, 0] }, // Red for Product Weight
        3: { halign: 'left' },
        4: { halign: 'center', textColor: [0, 128, 0] }, // Green for Destination
        5: { halign: 'center' }
      }
    });

    // **Footer Section with Gradient**
    doc.setFillColor(0, 51, 102); // Dark Blue
    doc.rect(0, doc.internal.pageSize.height - 15, doc.internal.pageSize.width, 15, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(255, 255, 255); // White Text
    doc.text('This is a system-generated manifest. No signature required.', 20, doc.internal.pageSize.height - 7);

    // **Save PDF**
    doc.save('Styled_Manifest_Report.pdf');
  }


}
