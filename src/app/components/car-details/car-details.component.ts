import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-car-details',
  templateUrl: './car-details.component.html',
  styleUrls: ['./car-details.component.scss']
})
export class CarDetailsComponent implements OnInit {
  carForm: FormGroup;
  carMakes = ['Toyota', 'Honda', 'Ford', 'BMW', 'Audi'];
  carModels = ['Sedan', 'SUV', 'Hatchback', 'Truck'];
  fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
  transmissions = ['Manual', 'Automatic'];
  vehicleTypes=['Petrol', 'Diesel', 'Electric', 'Hybrid']
    years:number[]=[];
  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.carForm = this.fb.group({
      make: ['', Validators.required],
      model: ['', Validators.required],
      year: ['', Validators.required],
      vehicleType: ['', Validators.required],
      engineCapacity: ['', Validators.required],
      fuelType: ['', Validators.required],
      transmission: ['', Validators.required],
      carColor: ['', Validators.required],
      licensePlate: ['', Validators.required],
      registrationDate: ['', Validators.required],
      seatingCapacity: ['', Validators.required],
      mileage: ['', Validators.required],
      price: ['', Validators.required],
      carImage: [null] // For file upload
    });
  }

  ngOnInit(): void {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= 1990; i--) {
      this.years.push(i);
    }
  }

  onSubmit() {
    if (this.carForm.valid) {
        const formData = { ...this.carForm.value };

        // Format the registration date to YYYY-MM-DD
        const registrationDate = new Date(formData.registrationDate);
        formData.registrationDate = registrationDate.toISOString().split('T')[0]; //
      console.log('Form Submitted', this.carForm.value);
      this.http.post('https://carrental-0zt3.onrender.com/api/cars', formData)
        .subscribe(response => {
          console.log('Car details added:', response);
        }, error => {
          console.error('Error adding car details:', error);
        });
    } else {
      console.log('Form is invalid');
    }
  }

  onCancel() {
    // Handle cancel logic here
    this.carForm.reset();
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.carForm.patchValue({ carImage: file });
    }
  }
} 