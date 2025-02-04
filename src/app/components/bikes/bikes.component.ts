import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-bikes',
  templateUrl: './bikes.component.html',
  styleUrls: ['./bikes.component.scss'],
 
})
export class BikesComponent implements OnInit {
  bikes = [
    {
      id: 1,
      name: 'Mountain Explorer Pro',
      type: 'Mountain Bike',
      price: 45,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800',
      available: true,
      specs: {
        frame: 'Aluminum',
        gears: '21-Speed',
        brakes: 'Hydraulic Disc',
        suspension: 'Front & Rear'
      }
    },
    {
      id: 2,
      name: 'City Cruiser E-Bike',
      type: 'Electric Bike',
      price: 65,
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800',
      available: true,
      specs: {
        frame: 'Carbon Fiber',
        motor: '500W Hub',
        battery: '48V 13Ah',
        range: '60 miles'
      }
    },
    {
      id: 3,
      name: 'Urban Commuter',
      type: 'Hybrid Bike',
      price: 35,
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800',
      available: true,
      specs: {
        frame: 'Steel',
        gears: '8-Speed',
        brakes: 'Mechanical Disc',
        weight: '12kg'
      }
    },
    {
      id: 4,
      name: 'Road Master Elite',
      type: 'Road Bike',
      price: 55,
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1511994298241-608e28f14fde?w=800',
      available: false,
      specs: {
        frame: 'Carbon Fiber',
        gears: '22-Speed',
        brakes: 'Rim',
        weight: '8kg'
      }
    }
  ];

  filters = {
    type: '',
    priceRange: '',
    availability: ''
  };

  ngOnInit() {}

  applyFilters() {
    // Implement filtering logic
  }

  rentBike(bikeId: number) {
    // Implement rental logic
  }
} 