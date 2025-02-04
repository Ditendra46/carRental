import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../user.service';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmationComponent } from '../delete-confirmation/delete-confirmation.component';

@Component({
  selector: 'app-edit-car',
  templateUrl: './edit-car.component.html',
  styleUrls: ['./edit-car.component.scss']
})
export class EditCarComponent implements OnInit {
  carForm: FormGroup;
  licensePlate: string='';
  carMakes = ['Toyota', 'Honda', 'Ford', 'BMW', 'Audi'];
  carModels = ['Sedan', 'SUV', 'Hatchback', 'Truck'];
  fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
  transmissions = ['Manual', 'Automatic'];
  vehicleTypes=['Petrol', 'Diesel', 'Electric', 'Hybrid']
    years:number[]=[];
  isEditable: boolean=false;
  maxDate: string;
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private userService:UserService,
    private dialog: MatDialog 
  ) {
    this.carForm = this.fb.group({
      make: [{ value: '', disabled: true }, Validators.required],
      model: [{ value: '', disabled: true }, Validators.required],
      year: [{ value: null, disabled: true }, Validators.required],
      vehicle_type: [{ value: '', disabled: true }, Validators.required],
      engine_capacity: [{ value: '', disabled: true }, Validators.required],
      fuel_type: [{ value: '', disabled: true }, Validators.required],
      transmission: [{ value: '', disabled: true }, Validators.required],
      color: [{ value: '', disabled: true }, Validators.required],
      license_plate: [{ value: '', disabled: true }, Validators.required],
      registration_date: [{ value: '', disabled: true }, Validators.required],
      seating_capacity: [{ value: '', disabled: true }, Validators.required],
      mileage: [{ value: '', disabled: true }, Validators.required],
      price: [{ value: '', disabled: true }, Validators.required],
      car_image: [{ value: '', disabled: true } ] // Optional
    });
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    const currentYear =new Date().getFullYear();
    for (let i = currentYear; i >= 1990; i--) {
      this.years.push(i);
    }
    this.licensePlate = this.route.snapshot.paramMap.get('licensePlate')!;
    this.userService.getCars().subscribe((cars: any[]) => { // Specify the type as any[]
      const car = cars.find(c => c.license_plate === this.licensePlate);
      if (car) {
        console.log(car)
        this.carForm.patchValue(car);
      }
    });
  }

  onSubmit(event:any) {
    event.stopPropagation(); // Prevent the click event from bubbling up

    if (this.carForm.valid) {
      const formData = { ...this.carForm.value };

        // Format the registration date to YYYY-MM-DD
        const registrationDate = new Date(formData.registration_date);
        formData.registration_date = registrationDate.toISOString().split('T')[0];
      this.userService.updateCar(this.licensePlate, formData).subscribe(() => {
        this.isEditable = false; // Disable editing after successful update
        this.carForm.disable();
        //this.router.navigate(['/']); // Redirect to the car list or another page
      });
    }
  }
  onEdit() {

    this.isEditable = true;
    this.carForm.enable(); 
    this.carForm.get('license_plate')?.disable()// Enable the form fields
  }
  onCancel() {
    this.isEditable = false;
    this.carForm.disable(); // Disable the form fields
  }
  deleteCar(){
    
    const dialogRef = this.dialog.open(DeleteConfirmationComponent);

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.userService.deleteCar(this.licensePlate).subscribe(() => {
        this.router.navigate(['/']); // Redirect after deletion
      });
    }
  });
  }

  
}