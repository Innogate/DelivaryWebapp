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
import { ManifestsService } from '../../../../../services/manifests.service';
@Component({
  selector: 'app-manifest',
  imports: [DropdownModule, SelectModule, TableModule, AutoCompleteModule, RadioButtonModule, ButtonModule, FormsModule, InputTextModule, ReactiveFormsModule, CommonModule, DividerModule, CheckboxModule],
  templateUrl: './manifest.component.html',
  styleUrl: './manifest.component.scss'
})
export class ManifestComponent {
  cities: any[] = [];
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
  coloaderList: any[] = [];
  bookings: any[] = [];
  bookingList: any[] = [];
  filteredBookings: any[] = [];
  searchTerm: string = '';
  selectAll: boolean = false;

  showManufest: boolean = false;
  allManifests: any[] = [];

  selectedBookings: any[] = [];
  manifestsForm: FormGroup = new FormGroup({});


  loadTransportModes(): void {
    this.transportModes = [
      { label: 'Bus', value: 'B' },
      { label: 'Train', value: 'T' },
      { label: 'Flight', value: 'F' },
      { label: 'Cab', value: 'C' }
    ];
  }
  constructor(private branchService: BranchService,
    private coloaderService: coloaderService,
    private fb: FormBuilder,
    private cityService: CityService,
    private globalstore: GlobalStorageService,
    private alertService: AlertService,
    private manifestsService: ManifestsService,
  ) {
    this.manifestsForm = this.fb.group({
      destination_id: ['', Validators.required],
      coloader_id: ['', Validators.required],
      booking_id: [],
      destination_city_id: [''],
      transport_mode: ['', Validators.required]
    });

  }

  ngOnInit(): void {
    this.globalstore.set('PAGE_TITLE', "MANIFEST");
    this.gateAllBranch();
    this.loadTransportModes();
    this.gateAllcity();
    this.gateAllColoaders();
    this.getAllBookings();
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

  async getAllManifests() {
    const payload = {
      "fields": [],
      "max": 10,
      "current": 0
    }
    await firstValueFrom(this.manifestsService.getManifest(payload).pipe(
      tap(
        (res) => {
          if (res.body) {
            this.allManifests = res.body;
          }
        }
      )
    ))
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

  // gate all bookings
  async getAllBookings() {
    try {
      await firstValueFrom(this.manifestsService.gateAllBookings().pipe(
        tap((res: any) => {
          if (res?.body) {
            this.bookings = res.body;

            this.bookingList = this.bookings.map((booking: any) => ({
              id: booking.booking_id,
              slipNo: booking.slip_no,
              destinationBranchId: booking.destination_branch_id,
              transportMode: booking.transport_mode
            }));

            this.filteredBookings = [...this.bookingList];
          }
        })
      ));
    } catch (error: any) {
      this.alertService.error(error?.error?.message || 'An error occurred while fetching bookings.');
    }
  }



  filterBookings() {
    this.filteredBookings = this.bookingList.filter(booking =>
      booking.slipNo.toLowerCase().includes(this.searchTerm.toLowerCase()) &&
      (this.manifestsForm?.value.destination_id ? booking.destinationBranchId == this.manifestsForm.value.destination_id : true) &&
      (this.selectedTransportMode ? booking.transportMode == this.selectedTransportMode : true)
    );
  }

  // generate Manifest
  generateManifest() {
    // get all id from selected bookings
    const selectedBookingIds = this.selectedBookings.map(booking => booking.id);

    try{
      if (this.manifestsForm.invalid) {
        this.alertService.error('Please fill all required fields');
        return;
      }

     this.manifestsForm.value.booking_id = selectedBookingIds;
     this.manifestsForm.value.dest
     const payload = this.manifestsForm.value

      firstValueFrom(this.manifestsService.generateManifest(payload).pipe(
        tap(
          (res) => {
            if (res.body) {
              this.alertService.success(res.message);
              this.manifestsForm.reset();
              this.selectedBookings = [];
              this.getAllBookings();
            }
          },
          (error) => {
            this.alertService.error(error.error.message);
          }
        )
      ))
    } catch{
      this.alertService.error('An error occurred while generating manifest.');
    }

    console.log('Selected Booking IDs:', selectedBookingIds, this.manifestsForm.value);
  }


  selectAllBookings() {
    this.selectedBookings = this.filteredBookings;
    this.filteredBookings = [];
    this.bookings = [];
  }

  deselectAllBookings() {
    this.selectedBookings = [];
    this.filteredBookings = this.bookingList;
  }

  updateSelected() {
    this.selectAll = this.filteredBookings.every(booking => booking.selected);
  }

  searchCity(event: any) {
    const query = event?.query?.toLowerCase() || '';
    console.log(query)


    this.filteredCities = this.cities.filter(city =>
      city.city_name?.toLowerCase().includes(query)
    );
  }

  onCitySelect(event: any) {
    // console.log('Selected City:', event);
  }

  toggleAddState() {
    this.showAddState = !this.showAddState;
    this.isEditing = false;
  }


  generatePDF(data: any | null | undefined = null) {
    if (!data) {
      return;
    }
    else{
      console.log(data)
    }

    const doc = new jsPDF();
    const today = new Date();
    const formattedDate = new Date(data.create_at).toLocaleString('en-GB', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).replace(',', ''); // Removing the comma for better formatting

    const formatWeight = (weight: any) => {
      if (typeof weight === "string") {
          weight = parseFloat(weight.replace(/[^\d.]/g, ""));
      }
      if (typeof weight === "number") {
          weight = weight * 1000; // Convert KG to GM if input is in KG
      }

      let kg = Math.floor(weight / 1000);
      let gm = Math.round(weight % 1000);

      return `${kg} KG ${gm} GM`;
  };

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
    doc.text('Origin Branch: '+data.origin_branch, 20, 35);
    doc.text('Destination Branch: '+data.destination_branch, 20, 42);
    doc.text('Co-loader: '+data.coloader_name, 20, 49);
    doc.text(`Generated on: ${formattedDate}`, 20, 56);

    // **Manifest ID & Mode of Transport**
    doc.setTextColor(255, 0, 0); // Red
    doc.text('Manifest ID: '+data.manifests_number, 150, 35);
    doc.text('Total shipment to dispatch: '+data.bookings.length, 150, 42);
    doc.text('Mode Of Transport: Air', 150, 49);

    // **Table Columns**
    const tableColumn = [
      'CN No.', 'No of Packages', 'Product Weight', 'Consignee', 'Destination', 'To Pay'
    ];

    // **Table Rows (Data)**
    const tableRows = data.bookings.map((b: { slip_no: { toString: () => any; }; package_count: { toString: () => any; }; package_weight: string; consignor_name: string; destination_branch_name: any; }) => [
      b.slip_no.toString(),
      b.package_count.toString(),
      formatWeight(parseInt(b.package_weight)),
      b.consignor_name.toUpperCase(),
      b.destination_branch_name,
      ''
  ]);

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
    doc.save(data.manifests_number + '_Manifest_Report.pdf');
  }

  showManifest() {
    this.showManufest = !this.showManufest;
    if (this.showManufest) {
      this.getAllManifests();
    }
  }

  async downloadManifest(id:any) {
    const payload: any = {
      "fields" : [],
      "manifests_id": id
    }
    await firstValueFrom(this.manifestsService.getManifestById(payload).pipe(
      tap(
        (res) => {
          if (res.body) {
            this.generatePDF(res.body)
          }
        }
      )
    ))
  }

  selectBooking(booking: any) {
    this.selectedBookings.push(booking);
    this.filteredBookings.splice(this.filteredBookings.indexOf(booking), 1);
    this.bookingList.splice(this.bookingList.indexOf(booking), 1);
  }
}
