import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingSlipComponent } from './booking-slip.component';

describe('BookingSlipComponent', () => {
  let component: BookingSlipComponent;
  let fixture: ComponentFixture<BookingSlipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingSlipComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingSlipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
