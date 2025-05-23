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
import { tap, firstValueFrom } from 'rxjs';
import { BranchService } from '../../../../../services/branch.service';
import { TableModule } from 'primeng/table';
import { CityService } from '../../../../../services/city.service';
import { GlobalStorageService } from '../../../../../services/global-storage.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { coloaderService } from '../../../../../services/coloader.service';
import { AlertService } from '../../../../../services/alert.service';
import { ManifestsService } from '../../../../../services/manifests.service';
import { ToastModule } from 'primeng/toast';
import { MenuModule } from 'primeng/menu';
import { CardModule } from 'primeng/card';
import { CalendarModule } from 'primeng/calendar';
import { TagModule } from 'primeng/tag';
import { printBase64File, saveFile } from '../../../../../utility/function';

@Component({
    selector: 'app-manifest',
    imports: [
        DropdownModule,
        SelectModule,
        TableModule,
        AutoCompleteModule,
        RadioButtonModule,
        ButtonModule,
        FormsModule,
        InputTextModule,
        ReactiveFormsModule,
        CommonModule,
        DividerModule,
        CheckboxModule,
        ToastModule,
        MenuModule,
        CardModule,
        CalendarModule,
        TagModule
    ],
    templateUrl: './manifest.component.html',
    styleUrl: './manifest.component.scss'
})
export class ManifestComponent {
    cities: any[] = [];

    transportModes: any[] = [];
    selectedTransportMode: any;
    filteredCities: any[] = [];
    selectedCity: any = null;
    branches: any[] = [];
    coLoaderOptions: any[] = [];
    coloaderList: any[] = [];

    searchTerm: string = '';
    selectAll: boolean = false;

    showManifests: boolean = false;
    allManifests: any[] = [];

    selectedBookings: any[] = [];
    manifestsForm: FormGroup = new FormGroup({});
    manifestFilterForm: FormGroup = new FormGroup({});

    //   inventory
    bookingsInventory: any[] = [];
    selectedBookingsInventory: any[] = [];
    filteredBookingsInventory: any[] = [];
    searchTermInventory: string = '';

    filter_item = [
        { label: 'All', value: 'all' },
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Cancelled', value: 'cancelled' }
    ]

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
            destination_city_id: [1217],
            bag_count: [],
            transport_mode: ['', Validators.required]
        });

        this.manifestFilterForm = this.fb.group({
            city_id: [''],
            destination_branch_id: [''],
            date: [''],
        })
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
            "max": 1000000,
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
            "max": 50000,
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
            "max": 1000,
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
                        this.bookingsInventory = res.body;
                    }
                })
            ));
        } catch (error: any) {
            this.alertService.error(error?.error?.message || 'An error occurred while fetching bookings.');
        }
    }

    // filterBookings() {
    //     this.filteredBookingsInventory = this.bookingsInventory.filter(booking =>
    //         booking.slip_no.toLowerCase().includes(this.searchTerm.toLowerCase()) &&
    //         (this.manifestsForm?.value.destination_id ? booking.destination_branch_id == this.manifestsForm.value.destination_id : true) &&
    //         (this.selectedTransportMode ? booking.transport_mode == this.selectedTransportMode : true) &&
    //         (this.selectedCity ? this.selectedCity.city_id == booking.destination_city_id : true) // Corrected comparison
    //     );
    // }
    filterBookings() {
        this.filteredBookingsInventory = this.bookingsInventory.filter(booking => {
            const isSlipMatched = booking.slip_no.toLowerCase().includes(this.searchTerm.toLowerCase());
            const isCityMatched = this.selectedCity ? this.selectedCity.city_id === booking.destination_city_id : true;

            if (booking.status === 5) {
                // Show only if manifested and city matches
                if (booking.manifest_id !== null && isCityMatched) {
                    console.log('Slip:', booking.slip_no, 'City:', booking.destination_city_id);
                    return isCityMatched;
                }
                return false;
            }

            console.log(this.filteredBookingsInventory)

            // For other statuses, apply all filters
            const isTransportMatched = this.selectedTransportMode ? booking.transport_mode === this.selectedTransportMode : true;
            const isBranchMatched = this.manifestsForm?.value.destination_id
                ? booking.destination_branch_id === this.manifestsForm.value.destination_id
                : true;

            return isSlipMatched && isCityMatched && isTransportMatched && isBranchMatched;
        });
    }






    // generate Manifest
    generateManifest() {
        // get all id from selected bookings
        const selectedBookingIds = this.selectedBookingsInventory.map(booking => booking.booking_id);

        try {
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
                            this.selectedBookingsInventory = [];
                            this.getAllBookings();
                        }
                    },
                    (error) => {
                        this.alertService.error(error.error.message);
                    }
                )
            ))
        } catch {
            this.alertService.error('An error occurred while generating manifest.');
        }

        console.log('Selected Booking IDs:', selectedBookingIds, this.manifestsForm.value);
    }


    searchCity(event: any) {
        const query = event?.query?.toLowerCase() || '';
        console.log(query)


        this.filteredCities = this.cities.filter(city =>
            city.city_name?.toLowerCase().includes(query)
        );
    }

    onCitySelect(event: any) {
        this.manifestsForm?.patchValue({ destination_city_id: event.value.city_id });
        this.selectedCity = event.value;
    }




    async printManifest(id: any) {
        const payload: any = {
            "fields": [],
            "manifests_id": id
        };

        await firstValueFrom(this.manifestsService.getManifestById(payload).pipe(
            tap((res) => {
                if (res.body) {
                    this.generatePDF(res.body, true);  // Pass `true` for printing
                }
            })
        ));
    }

    generatePDF(data: any | null | undefined = null, isPrint = false) {
        if (!data) {
            return;
        }

        const doc = new jsPDF();
        const today = new Date();
        const formattedDate = new Date(data.create_at).toLocaleString('en-GB', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).replace(',', '');

        const formatWeight = (weight: any) => {
            console.log('Weight:', weight);
            if (typeof weight === "string") {
                weight = parseFloat(weight.replace(/[^\d.]/g, ""));
            }

            if (isNaN(weight) || weight === 0) {
                return '0 KG 0 GM';
            }

            // Convert from KG to grams only if it's a float (i.e., <1000)
            if (weight < 1000) {
                weight = weight * 1000;
            }

            const kg = Math.floor(weight / 1000);
            const gm = Math.round(weight % 1000);

            return `${kg} KG ${gm} GM`;
        };


        const transportMode = data.bookings[0]?.transport_mode;
        const selectedMode = this.transportModes.find(mode => mode.value === transportMode);
        const transportLabel = selectedMode ? selectedMode.label : transportMode;

        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');

        doc.setFillColor(0, 51, 102);
        doc.rect(0, 10, doc.internal.pageSize.width, 15, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.text('Disha Airways Enterprise Manifest', 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Origin Branch: ' + data.origin_branch, 20, 35);
        doc.text('Destination Branch: ' + data.destination_branch, 20, 42);
        doc.text('Co-loader: ' + data.coloader_name, 20, 49);
        doc.text(`Generated on: ${formattedDate}`, 20, 56);

        doc.setTextColor(255, 0, 0);
        doc.text('Manifest ID: ' + data.manifests_number, 150, 35);
        doc.text('Total shipment to dispatch: ' + data.bookings.length, 150, 42);
        doc.text('Mode Of Transport: ' + transportLabel, 150, 49);
        doc.text('Number of Bag: ' + data.bag_count, 150, 56);
        const tableColumn = ['CN No.', 'No of Packages', 'Product Weight', 'Consignee', 'Destination', 'To Pay'];

        const tableRows = data.bookings.map((
            b: {
                slip_no: { toString: () => any };
                package_count: { toString: () => any };
                package_weight: any;
                consignee_name: string;
                destination_city_name: any;
                to_pay: any;
                total_value: any;
            }
        ) => {
            // Set amount if to_pay is truthy and not 0
            if (b.to_pay && b.to_pay !== 0) {
                b.total_value = b.total_value;
            }

            const toPayValue = b.to_pay ? (b.total_value?.toString() || '') : '';

            const weight = parseFloat(b.package_weight);
            const weightDisplay = !weight ? 'Document' : formatWeight(weight);

            return [
                b.slip_no.toString(),
                b.package_count.toString(),
                weightDisplay,
                b.consignee_name.toUpperCase(),
                b.destination_city_name,
                toPayValue
            ];
        });



        autoTable(doc, {
            startY: 65,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            styles: {
                fontSize: 10,
                cellPadding: 4,
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
                1: { halign: 'center' },
                2: { halign: 'center', textColor: [255, 0, 0] },
                3: { halign: 'left' },
                4: { halign: 'center', textColor: [0, 128, 0] },
                5: { halign: 'center' }
            }
        });

        doc.setFillColor(0, 51, 102);
        doc.rect(0, doc.internal.pageSize.height - 15, doc.internal.pageSize.width, 15, 'F');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(255, 255, 255);
        doc.text('This is a system-generated manifest. No signature required.', 20, doc.internal.pageSize.height - 7);

        // **Print Instead of Download**
        if (isPrint) {
            doc.autoPrint();
            window.open(doc.output('bloburl'), '_blank');  // Open print dialog
            // convert to base64 and console log
            const blob = doc.output('blob');
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                printBase64File(base64String, data.manifests_number + '.pdf');
            };
            reader.readAsDataURL(blob);
        } else {
            doc.save(data.manifests_number + '_Manifest_Report.pdf');
            // convert to base64 and console log
            const blob = doc.output('blob');
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                saveFile(base64String, data.manifests_number + '.pdf');
            };
            reader.readAsDataURL(blob);
        }
    }


    async showManifest() {
        this.showManifests = !this.showManifests;
        this.manifestsForm.reset();
        if (this.showManifests) {
            await this.getAllManifests();
            this.filterManifest();

        }
    }

    filterManifest() {
        const { date, city_id, destination_branch_id } = this.manifestFilterForm.value;
        const isNoFilterApplied = !date && !city_id && !destination_branch_id;

        if (isNoFilterApplied) {
            this.filteredBookingsInventory = [...this.allManifests];
            return;
        }

        const cityIdValue = city_id?.city_id || city_id;
        const destBranchIdValue = destination_branch_id?.destination_id || destination_branch_id;
        const formatDate = (d: Date) => d.toLocaleDateString('en-CA'); // gives YYYY-MM-DD in local timezone
        const selectedDate = date ? formatDate(new Date(date)) : null;
        this.filteredBookingsInventory = this.allManifests?.filter(booking => {
            const bookingDate = booking.create_at?.split(' ')[0];
            return (
                (selectedDate ? bookingDate === selectedDate : true) &&
                (cityIdValue ? booking.destination_city_id === +cityIdValue : true) &&
                (destBranchIdValue ? booking.destination_id === +destBranchIdValue : true)
            );
        });
    }


    async downloadManifest(id: any) {
        const payload: any = {
            "fields": [],
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

    getCityName(cityId: number): string {
        const cities = this.globalstore.get('cities') as { city_id: number; city_name: string }[] || [];
        const city = cities.find(city => city.city_id === cityId);
        return city ? city.city_name : 'Unknown City';
    }

    getBranchName(branchId: number): string {
        const branches = this.branches
        const branch = branches.find(branch => branch.branch_id === branchId);
        return branch ? branch.branch_name : 'Unknown Branch';
    }
}
