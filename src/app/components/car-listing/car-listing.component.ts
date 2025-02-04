import { Component, OnInit } from '@angular/core';
import { SearchCriteria } from '../../models/search-criteria.interface';
import { Car } from '../../models/car.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-car-listing',
  templateUrl: './car-listing.component.html',
  styleUrls: ['./car-listing.component.scss'],
 
})
export class CarListingComponent implements OnInit {
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