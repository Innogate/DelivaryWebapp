import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { deliveryService } from '../../../../../services/delivery.service';
import { firstValueFrom, tap } from 'rxjs';
import { AlertService } from '../../../../../services/alert.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-viewpod',
  imports: [CommonModule],
  templateUrl: './viewpod.component.html',
  styleUrl: './viewpod.component.scss'
})
export class ViewpodComponent {
  bookingId!: number;
  uplodedListImage: any;
  base64File: string | null = null; // This will store the Base64 string of the file.
  file_type: string = '';
  filteredPodInventory: any[] = [];
  showPod: boolean = false;
  fileName: string = '';
  imageBlob: Blob | null = null;

  constructor(private route: ActivatedRoute, private deliveryService: deliveryService, private alertService: AlertService) { }

  ngOnInit(): void {
    this.bookingId = +this.route.snapshot.paramMap.get('id')!;
    if (this.bookingId) {
      this.gatePodById(this.bookingId);
    }
  }


  async gatePodById(id: any) {
    const payload = { booking_id: id };
    try {
      const response = await firstValueFrom(
        this.deliveryService.podById(payload).pipe(
          tap(
            (res) => {
              if (res.body) {
                console.log(res.body);
                this.base64File = res.body.pod_data;
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

      console.log(this.base64File);
    } catch (err) {
      this.alertService.error('Failed to fetch uploaded PODs.');
      console.error(err);
    }
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
    console.log("base 90", this.base64File);
    reader.readAsDataURL(file);
  }




  // Save handler
  async onSave(): Promise<void> {
    if (!this.base64File) {
        this.alertService.error('Please select a valid file.');
        return;
    }

    const formData = {
      city_id: 2,
        booking_id: this.bookingId,
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
                        // this.PodForm.reset();
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
    } catch (err) {
        this.alertService.error('Error: ' + err);
    }
}



}
