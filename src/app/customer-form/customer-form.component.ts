import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-customer-form',
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.scss']
})
export class CustomerFormComponent implements OnInit {
  customerForm!: FormGroup;
  statusOptions: string[] = ['Prospect', 'Active', 'Hold', 'Blocked'];
  formErrors: { [key: string]: string } = {};

  constructor(private fb: FormBuilder, private http: HttpClient, public dialog: MatDialog) {
    this.initForm();
  }

  ngOnInit() {
    this.subscribeToFormChanges();
    
  }

  private initForm(): void {
    this.customerForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      visa: ['', Validators.maxLength(20)],
      referr_name: ['', Validators.maxLength(50)],
      referr_phno: ['', [Validators.maxLength(15), Validators.pattern(/^\d{3}-\d{3}-\d{4}$/)]],
      status: ['Prospect', Validators.required],
      category: ['', Validators.required],
      email_id: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      phone_no: ['', [Validators.required, Validators.maxLength(15), Validators.pattern(/^\d{3}-\d{3}-\d{4}$/)]],
      add_1: ['', [Validators.required, Validators.maxLength(100)]],
      add_2: ['', Validators.maxLength(100)],
      city: ['', [Validators.required, Validators.maxLength(50)]],
      state: ['', [Validators.required, Validators.maxLength(50)]],
      zipcd: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      country: ['', Validators.maxLength(50)],
      dl_no: ['', [Validators.required, Validators.maxLength(50)]]
    });
  }

  private subscribeToFormChanges(): void {
    this.customerForm.valueChanges.subscribe(() => {
      this.checkValidationErrors();
    });
  }

  private checkValidationErrors(): void {
    Object.keys(this.customerForm.controls).forEach(key => {
      const control = this.customerForm.get(key);
      if (control && control.dirty && control.invalid) {
        const errors = control.errors;
        if (errors) {
          this.formErrors[key] = this.getErrorMessage(key, errors);
        }
      } else {
        delete this.formErrors[key];
      }
    });
  }

  private getErrorMessage(field: string, errors: any): string {
    if (errors.required) {
      return `${this.formatFieldName(field)} is required`;
    }
    if (errors.maxlength) {
      return `${this.formatFieldName(field)} cannot exceed ${errors.maxlength.requiredLength} characters`;
    }
    if (errors.pattern) {
      if (field === 'phone_no' || field === 'referr_phno') {
        return 'Format: XXX-XXX-XXXX';
      }
      if (field === 'zipcd') {
        return '5-digit zip code required';
      }
    }
    if (errors.email) {
      return 'Invalid email format';
    }
    return '';
  }

  private formatFieldName(field: string): string {
    return field
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getFieldError(fieldName: string): string {
    const control = this.customerForm.get(fieldName);
    if (control && control.dirty && control.invalid) {
      return this.formErrors[fieldName] || '';
    }
    return '';
  }

  openConfirmationDialog(): void {
    if (this.customerForm.valid) {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent);
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.onSubmit();
        }
      });
    }
  }

  onSubmit(): void {
    if (this.customerForm.valid) {
      this.http.post('http://localhost:3000/api/customers', this.customerForm.value).subscribe(
        response => {
          console.log('Customer added successfully', response);
          this.customerForm.reset();
          Object.keys(this.formErrors).forEach(key => delete this.formErrors[key]);
        },
        error => {
          console.error('Error adding customer', error);
        }
      );
    }
  }
}