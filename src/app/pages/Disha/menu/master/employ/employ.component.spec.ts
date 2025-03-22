import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployComponent } from './employ.component';

describe('EmployComponent', () => {
  let component: EmployComponent;
  let fixture: ComponentFixture<EmployComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
