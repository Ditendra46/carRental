import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RentalCarDashboardComponent } from './rental-car-dashboard.component';

describe('RentalCarDashboardComponent', () => {
  let component: RentalCarDashboardComponent;
  let fixture: ComponentFixture<RentalCarDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RentalCarDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RentalCarDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
