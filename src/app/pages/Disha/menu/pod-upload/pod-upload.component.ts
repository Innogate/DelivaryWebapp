import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom, tap } from 'rxjs';
import { CityService } from '../../../../../services/city.service';
import { GlobalStorageService } from '../../../../../services/global-storage.service';
import { EmployeesService } from '../../../../../services/employees.service';
import { AlertService } from '../../../../../services/alert.service';
import { deliveryService } from '../../../../../services/delivery.service';
import { CommonModule } from '@angular/common';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { Router } from '@angular/router';

@Component({
    selector: 'app-pod-upload',
    imports: [DropdownModule, CommonModule, AutoCompleteModule, FormsModule, TagModule, ButtonModule, ReactiveFormsModule, CardModule],
    templateUrl: './pod-upload.component.html',
    styleUrl: './pod-upload.component.scss'
})
export class PodUploadComponent {
    filteredCities: any[] = [];
    cities: any[] = [];
    PodForm: FormGroup;
    selectedCity: any = null;
    EmployeeList: any[] = [];
    PodList: any[] = [];
    errorMessage: string = '';
    fileName: string = '';
    imageBlob: Blob | null = null;
    blobUrl: string | null = null;
    base64File: string | null = null; // This will store the Base64 string of the file.
    file_type: string = '';
    filteredPodInventory: any[] = [];
    uplodedListImage: any[] = [];
    showPod: boolean = false;


    constructor(private fb: FormBuilder, private globalstorageService: GlobalStorageService,
        private cityService: CityService, private EmployeeService: EmployeesService, private alertService: AlertService,private router: Router,
        private deliveryService: deliveryService,) {
        this.PodForm = this.fb.group({
            city_id: [''],
            employee_id: [''],
        });
    }

    async ngOnInit(): Promise<void> {
        this.globalstorageService.set('PAGE_TITLE', "Pod Upload");
        this.gateAllcity();
        this.gateAllEmployee();
        await this.gateAllBookingPod();
        this.filteredpod();
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
                            this.uplodedListImage = res.body;
                        }
                    }
                )
            ));
        } catch (error) {
            this.alertService.error('' + error);
        }
    }

    async gateAllEmployee() {
        const payload: any = {
            fields: [],
            max: 10,
            current: 0
        };
        try {
            await firstValueFrom(this.EmployeeService.getAllEmployees(payload).pipe(
                tap(
                    (res) => {
                        if (res.body) {
                            this.EmployeeList = res.body;
                        }
                    }
                )
            ));
        } catch (error) {
            this.alertService.error('' + error);
        }
    }

    async gateAllBookingPod() {
        const payload = {
            "max": 10,
            "current": 0
        };
        await firstValueFrom(this.deliveryService.fetchDeliveryInPod(payload).pipe(
            tap(
                (res) => {
                    if (res.body) {
                        this.PodList = res.body;
                    }
                },
                (error) => {
                    this.alertService.error(error?.error?.message || 'An error occurred while fetching bookings.');
                }
            )
        ));
    }

    // File selection handler
    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;

        const file = input.files[0];
        const allowedTypes = ['image/jpeg', 'image/png'];

        if (!allowedTypes.includes(file.type)) {
            console.error('Unsupported format');
            return;
        }
        this.file_type = file.type
        this.fileName = file.name;
        this.imageBlob = file;

        // Convert image file to Base64
        this.convertFileToBase64(file);
    }

    // Convert file to Base64 format
    convertFileToBase64(file: Blob): void {
        const reader = new FileReader();
        reader.onloadend = () => {
            this.base64File = reader.result as string;
        };
        reader.readAsDataURL(file);
    }

    // Save handler
    async onSave(): Promise<void> {
        if (!this.base64File) {
            this.alertService.error('Please select a valid file.');
            return;
        }

        const formData = {
            booking_id: "1",
            pod_data: this.base64File,
            data_formate: this.file_type
        };

        try {
            // Send JSON data (formData as a JSON object)
            await firstValueFrom(this.deliveryService.uploadPod(formData).pipe(
                tap(
                    (res) => {
                        if (res) {
                            this.alertService.success(res.message);
                            this.PodForm.reset();
                            this.fileName = '';
                            this.imageBlob = null;
                            this.base64File = null; // Reset Base64 string after successful upload
                        }
                    },
                    (error) => {
                        console.log(error.error.message);
                        this.alertService.error(error.error.message);
                    }
                )
            ));
            this.gateAllBookingPod();
        } catch (err) {
            this.alertService.error('Error: ' + err);
        }
    }

    // City selection handler
    onCitySelect(event: any) {
        this.PodForm?.patchValue({ destination_city_id: event.value.city_id });
        this.selectedCity = event.value;
    }

    // Search cities handler
    searchCity(event: any) {
        const query = event?.query?.toLowerCase() || '';
        console.log(query);

        this.filteredCities = this.cities.filter(city =>
            city.city_name?.toLowerCase().includes(query)
        );
    }



    filteredpod() {
        const { city_id, employee_id } = this.PodForm.value;

        if ((!city_id || city_id === '') && (!employee_id || employee_id === '')) {
            this.filteredPodInventory = [...this.PodList];
            return;
        }

        console.log(this.PodList);
        this.filteredPodInventory = this.PodList.filter(item => {
            const cityMatch = city_id ? item.destination_city_id === city_id : true;
            const employeeMatch = employee_id ? item.employee_id === employee_id : true;
            return cityMatch && employeeMatch;
        });
    }

    showPodList(data: string) {
        if (data === 'all') {
            this.showPod = true;
            this.fetchAllUplodedpod();
        } else {
            this.showPod = false;
        }
    }


    async fetchAllUplodedpod() {
        try {
            const response = await firstValueFrom(
                this.deliveryService.fetchAllUplodedpod().pipe(
                    tap(
                        (res) => {
                            if (res.body) {
                                this.uplodedListImage = res.body.map((pod: any) => {
                                    let podData = pod.pod_data || '';
                                    const mimeType = pod.data_formate || 'image/jpeg';

                                    // If malformed prefix like "dataimage/jpegbase64,...", clean it
                                    if (/^dataimage\/(jpeg|png)base64,?/i.test(podData)) {
                                        podData = podData.replace(/^dataimage\/(jpeg|png)base64,?/i, '');
                                        podData = `data:${mimeType};base64,${podData}`;
                                    }

                                    return {
                                        ...pod,
                                        pod_data: podData
                                    };
                                });
                            }
                        },
                        (error) => {
                            this.alertService.error(
                                error?.error?.message || 'An error occurred while fetching PODs.'
                            );
                        }
                    )
                )
            );

            console.log(this.uplodedListImage);
        } catch (err) {
            this.alertService.error('Failed to fetch uploaded PODs.');
            console.error(err);
        }
    }


    viewPod(pod: any) {
        console.log(pod);

        this.router.navigate(['/pages/viewpod', pod.booking_id]);
    }


}
