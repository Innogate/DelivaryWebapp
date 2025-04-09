import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PodUploadComponent } from './pod-upload.component';

describe('PodUploadComponent', () => {
  let component: PodUploadComponent;
  let fixture: ComponentFixture<PodUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PodUploadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PodUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
