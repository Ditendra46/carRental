import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BikeService } from '../../services/bike.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  stats = {
    totalBikes: 0,
    availableBikes: 0,
    activeRentals: 0,
    totalRevenue: 0
  };

  recentBookings = [
    {
      id: 'B001',
      customerName: 'John Doe',
      bikeName: 'Mountain Explorer Pro',
      startDate: '2024-03-15',
      endDate: '2024-03-17',
      status: 'Active'
    },
    {
      id: 'B002',
      customerName: 'Jane Smith',
      bikeName: 'City Cruiser E-Bike',
      startDate: '2024-03-14',
      endDate: '2024-03-16',
      status: 'Completed'
    }
  ];

  popularBikes = [
    {
      name: 'Mountain Explorer Pro',
      rentCount: 45,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800'
    },
    {
      name: 'City Cruiser E-Bike',
      rentCount: 38,
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800'
    }
  ];

  constructor(private bikeService: BikeService) {}

  ngOnInit() {
    this.loadStats();
  }

  private loadStats() {
    this.bikeService.getBikes().subscribe(bikes => {
      this.stats.totalBikes = bikes.length;
      this.stats.availableBikes = bikes.filter(bike => bike.available).length;
      this.stats.activeRentals = 3; // Hardcoded for demo
      this.stats.totalRevenue = 1250; // Hardcoded for demo
    });
  }
} 