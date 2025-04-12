import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewpodComponent } from './viewpod.component';

describe('ViewpodComponent', () => {
  let component: ViewpodComponent;
  let fixture: ComponentFixture<ViewpodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewpodComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewpodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
