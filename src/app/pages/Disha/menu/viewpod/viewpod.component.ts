import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { deliveryService } from '../../../../../services/delivery.service';
import { firstValueFrom, tap } from 'rxjs';
import { AlertService } from '../../../../../services/alert.service';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-viewpod',
  imports: [CommonModule, DialogModule],
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
  displayImagePopup = false;
  zoom = 1;
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
    } catch (err) {
      this.alertService.error('Failed to fetch uploaded PODs.');
    }
  }


  // File selection handler
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const allowedTypes = ['image/jpeg', 'image/png'];

    if (!allowedTypes.includes(file.type)) {
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
                    }
                },
                (error) => {
                    this.alertService.error(error.error.message);
                }
            )
        ));
    } catch (err) {
        this.alertService.error('Error: ' + err);
    }
}

showImagePopup() {
  this.zoom = 1; // Reset zoom on open
  this.displayImagePopup = true;
}

onZoom(event: WheelEvent) {
  event.preventDefault();
  const delta = Math.sign(event.deltaY);
  if (delta < 0 && this.zoom < 3) {
    this.zoom += 0.1;
  } else if (delta > 0 && this.zoom > 0.5) {
    this.zoom -= 0.1;
  }
  this.zoom = parseFloat(this.zoom.toFixed(2));
}

}
