import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingResiveComponent } from './booking-resive.component';

describe('BookingResiveComponent', () => {
  let component: BookingResiveComponent;
  let fixture: ComponentFixture<BookingResiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingResiveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingResiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
