import { Component } from '@angular/core';
import { Car, SearchCriteria } from '../models/car.interface';

@Component({
  selector: 'app-rental-car-dashboard',
  templateUrl: './rental-car-dashboard.component.html',
  styleUrls: ['./rental-car-dashboard.component.scss']
})
export class RentalCarDashboardComponent {
  searchCriteria: SearchCriteria = {
    pickupLocation: '',
    pickupDate: '',
    pickupTime: '',
    returnDate: '',
    returnTime: ''
  };
  
  cars: Car[] = [];
  totalVehicles: number = 0;

  filters = {
    gearType: '',
    fuelType: '',
    brands: '',
    vehicleClass: '',
    rentalCompanies: ''
  };

  ngOnInit() {
    // Load cars data
    this.loadCars();
  }

  loadCars() {
    // Implement API call to get cars
  }

  rentNow(car: Car) {
    // Implement rental logic
  }

  clearAllFilters() {
    this.filters = {
      gearType: '',
      fuelType: '',
      brands: '',
      vehicleClass: '',
      rentalCompanies: ''
    };
  }
}
