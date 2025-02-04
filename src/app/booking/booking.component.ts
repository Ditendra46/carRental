import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../user.service';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit {
  bookingForm: FormGroup;
  licensePlate: string='';
  carDetails: any;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private userService: UserService,
    private http: HttpClient
  ) {
    this.bookingForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      rentalDays: [1, [Validators.required, Validators.min(1)]],
      carLicensePlate: [{ value: '', disabled: true }, Validators.required],
    });
  }

  ngOnInit(): void {
    this.licensePlate = this.route.snapshot.paramMap.get('licensePlate')!;
    this.userService.getCars().subscribe(cars => {
      this.carDetails = cars.find(car => car.license_plate === this.licensePlate);
      if (this.carDetails) {
        this.bookingForm.patchValue({
          carLicensePlate: this.carDetails.license_plate,
        });
      }
    });
  }

  onSubmit() {
    if (this.bookingForm.valid) {
      const userData = {
        name: this.bookingForm.value.name,
        email: this.bookingForm.value.email,
        phone: this.bookingForm.value.phone,
      };

      // Update the URL to include the backend port (e.g., 3000)
      this.http.post('http://localhost:3000/api/users', userData).subscribe((response: any) => {
        const userId = response.userId; // Get the user ID (either new or existing)

        // Prepare rental data
        const rentalData = {
          rental_days: this.bookingForm.value.rentalDays,
          car_license_plate: this.carDetails.license_plate,
          user_id: userId,
        };

        // Save rental data to the rentals table
        this.http.post('http://localhost:3000/api/bookings', rentalData).subscribe(() => {
          console.log('Booking confirmed!');
          // Optionally, navigate to a confirmation page or show a success message
        });
      });
    }
  }
}
