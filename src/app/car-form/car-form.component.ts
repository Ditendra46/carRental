import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

export interface CarFormSections {
  vehicleDetails: string[];
  appearance: string[];
  purchaseInfo: string[];
  pricing: string[];
  statusDates: string[];
}

export const FORM_SECTIONS: CarFormSections = {
  vehicleDetails: ['vin', 'model', 'make', 'odo'],
  appearance: ['color', 'int_color', 'ext_color'],
  purchaseInfo: ['source', 'src_name', 'purpose'],
  pricing: ['buying_price', 'sales_tax', 'retail_price', 'wholesale_price', 'rental_amount', 'sold_price'],
  statusDates: ['status', 'procure_date', 'ready_date', 'sales_date']
};

@Component({
  selector: 'app-car-form',
  templateUrl: './car-form.component.html',
  styleUrls: ['./car-form.component.scss']
})
export class CarFormComponent implements OnInit {
  carForm!: FormGroup;
  formSections = FORM_SECTIONS;
  sourceOptions: string[] = ['Auction', 'Individual'];
  purposeOptions: string[] = ['Sale', 'Rent', 'Own'];
  statusOptions: string[] = ['Repair', 'Sold', 'Rented', 'In Market'];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    public dialog: MatDialog
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.subscribeToFormChanges();
  }

  private initForm(): void {
    this.carForm = this.fb.group({
      vin: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      model: ['', [Validators.required, Validators.maxLength(50)]],
      make: ['', [Validators.required, Validators.maxLength(4)]],
      odo: ['', [Validators.required, Validators.min(0)]],
      color: ['', [Validators.required, Validators.maxLength(30)]],
      int_color: ['', [Validators.maxLength(30)]],
      ext_color: ['', [Validators.maxLength(30)]],
      source: ['', [Validators.required]],
      src_name: ['', [Validators.required, Validators.maxLength(50)]],
      purpose: ['', [Validators.required]],
      buying_price: ['', [Validators.required, Validators.min(0)]],
      sales_tax: ['', [Validators.required, Validators.min(0)]],
      retail_price: ['', [Validators.required, Validators.min(0)]],
      wholesale_price: ['', [Validators.required, Validators.min(0)]],
      rental_amount: ['', [Validators.min(0)]],
      sold_price: ['', [Validators.min(0)]],
      status: ['', [Validators.required]],
      procure_date: ['', [Validators.required]],
      ready_date: [''],
      sales_date: ['']
    });
  }

  private subscribeToFormChanges(): void {
    this.carForm.valueChanges.subscribe(() => {
      this.validateDates();
      this.validatePrices();
    });

    // Debug form status
    this.carForm.statusChanges.subscribe(status => {
      console.log('Form Status:', status);
      console.log('Form Valid:', this.carForm.valid);
      this.logFormErrors();
    });
  }

  private logFormErrors(): void {
    const controls = this.carForm.controls;
    Object.keys(controls).forEach(key => {
      const control = controls[key];
      if (control.errors) {
        console.log(`${key} Errors:`, control.errors);
      }
    });
  }

  private validateDates(): void {
    const procureDate = this.carForm.get('procure_date')?.value;
    const readyDate = this.carForm.get('ready_date')?.value;
    const salesDate = this.carForm.get('sales_date')?.value;

    if (readyDate && procureDate && new Date(readyDate) < new Date(procureDate)) {
      this.carForm.get('ready_date')?.setErrors({ 'invalidDate': true });
    }
    if (salesDate && procureDate && new Date(salesDate) < new Date(procureDate)) {
      this.carForm.get('sales_date')?.setErrors({ 'invalidDate': true });
    }
  }

  private validatePrices(): void {
    const buyingPrice = this.carForm.get('buying_price')?.value;
    const retailPrice = this.carForm.get('retail_price')?.value;
    const wholesalePrice = this.carForm.get('wholesale_price')?.value;

    if (retailPrice && buyingPrice && retailPrice < buyingPrice) {
      this.carForm.get('retail_price')?.setErrors({ 'invalidPrice': true });
    }
    if (wholesalePrice && buyingPrice && wholesalePrice < buyingPrice) {
      this.carForm.get('wholesale_price')?.setErrors({ 'invalidPrice': true });
    }
  }

  getErrorMessage(field: string): string {
    const control = this.carForm.get(field);
    if (control?.errors) {
      if (control.errors['required']) return `${field} is required`;
      if (control.errors['min']) return `${field} must be greater than 0`;
      if (control.errors['maxlength']) return `${field} exceeds maximum length`;
      if (control.errors['pattern']) return `Invalid ${field} format`;
      if (control.errors['invalidDate']) return `Invalid date sequence`;
      if (control.errors['invalidPrice']) return `Price must be greater than buying price`;
    }
    return '';
  }

  onSubmit(): void {
    if (this.carForm.valid) {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: '350px',
        data: { title: 'Confirm Submission', message: 'Are you sure you want to submit?' }
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.http.post('http://localhost:3000/api/cars', this.carForm.value).subscribe({
            next: (response: any) => {
              if (response.success) {
                console.log('Car added successfully');
                this.carForm.reset();
              }
            },
            error: (error) => {
              console.error('Error adding car:', error);
            }
          });
        }
      });
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}