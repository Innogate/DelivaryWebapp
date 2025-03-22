import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoLoaderComponent } from './co-loader.component';

describe('CoLoaderComponent', () => {
  let component: CoLoaderComponent;
  let fixture: ComponentFixture<CoLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoLoaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
