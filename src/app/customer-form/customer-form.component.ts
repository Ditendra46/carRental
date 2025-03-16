import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-customer-form',
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.scss']
})
export class CustomerFormComponent implements OnInit {
  customerForm!: FormGroup;
  statusOptions: string[] = ['Prospect', 'Active', 'Hold', 'Blocked'];
  formErrors: { [key: string]: string } = {};
  isEdit: boolean=false;
  customerId: number |null=null;
  errorMessage: any;
  additionalText: string | null='';

  constructor(private fb: FormBuilder, private http: HttpClient, public dialog: MatDialog, public router: ActivatedRoute,public route: Router) {
    this.initForm();
  }

  ngOnInit() {
    this.subscribeToFormChanges();
    this.router.params.subscribe(params => {
      if (params['id']) {
        this.isEdit = true;
        this.customerId = +params['id'];
        this.loadCustomerData(this.customerId);
        this.customerForm.disable();
      }
    });
    this.router.queryParamMap.subscribe(params => {
      this.additionalText = params.get('text');
    });
    if(this.additionalText==='edit'){
      this.customerForm.enable();
      this.isEdit=true;
    }else{
      this.customerForm.disable();
      this.isEdit=false;
    }
    
  }

  private loadCustomerData(id: number | null): void {
    this.http.get(`https://carrental-0zt3.onrender.com/api/customers/${id}`).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.customerForm.patchValue(response.data);
        }
      },
      error: (error) => console.error('Error loading car:', error)
    });
  }
  private initForm(): void {
    this.customerForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      visa: ['', Validators.maxLength(20)],
      referr_name: ['', Validators.maxLength(50)],
      referr_phno: ['', [Validators.maxLength(15)]],
      status: ['Prospect', Validators.required],
      category: ['', Validators.required],
      email_id: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      phone_no: ['', [Validators.required, Validators.maxLength(15)]],
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
        return 'Format: XXXXXXXXXX';
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
      const dialogRef = this.dialog.open((ConfirmationDialogComponent), {
        data:{
          title: 'Confirm Submission',
          message: 'Are you sure you want to submit this form?'
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.onSubmit();
        }
      });
    }
  }

  onSubmit(): void {
    if (this.customerForm.valid) {
    const url = this.isEdit
      ? `https://carrental-0zt3.onrender.com/api/customers/${this.customerId}`
      : 'https://carrental-0zt3.onrender.com/api/customers';

    const method = this.isEdit ? 'put' : 'post';

    this.http[method](url, this.customerForm.value).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.route.navigate(['/customers']);
        }
      },
      error:(error) => {
        const errorMessage = error.error.message;
       if (errorMessage.includes('Email')) {
         this.customerForm.get('email_id')?.setErrors({ customError: errorMessage });
       } 
        if (errorMessage.includes('Phone number')) {
         this.customerForm.get('phone_no')?.setErrors({ customError: errorMessage });
       } 
         this.errorMessage = errorMessage;
       }  });
  }
  }
  editCustomer(){
    this.customerForm.enable()
  }
  onReset(){}
}