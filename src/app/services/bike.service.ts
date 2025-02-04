import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BikeService {
  private bikes = [{
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
    // ... sample bikes from previous code ...
  ];

  getBikes(): Observable<any[]> {
    return of(this.bikes);
  }
} 