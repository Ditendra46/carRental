import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environment';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-payment-form',
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss']
})
export class PaymentFormComponent implements OnInit {
  paymentForm!: FormGroup; // Reactive form
  filteredPhoneNumbers: string[] = []; // List of phone numbers for autocomplete
  selectedCustomer: any = null; // Store selected customer details
  rentals: any[] = []; // List of rentals for the selected customer
  selectedRental: any = null; // Currently selected rental
  rentalDetails: any[] = []; // Rental details for the selected rental
  selectedRentalDetails: any[] = []; // Selected rental details

  constructor(private fb: FormBuilder, private http: HttpClient,private snackBar:MatSnackBar) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.paymentForm = this.fb.group({
      phone_number: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]], // Phone number validation
      payment_amount: [0, [Validators.required, Validators.min(1)]], // Payment amount
      payment_method: ['', Validators.required], // Payment method
      email: ['', [Validators.required, Validators.email]], // Email field
      name: ['', Validators.required], // Name field
      customer_id: ['', Validators.required], // Customer ID
        note: ['', Validators.maxLength(255)],
        purpose:['',Validators.required]
    });
  }

  // Triggered when the user types in the phone number field
  onPhoneNumberInput(): void {
    const phoneNumber = this.paymentForm.get('phone_number')?.value;

    if (phoneNumber && phoneNumber.length >= 3) {
      this.http.get(`${environment.apiBaseUrl}/customers/phone-number/${phoneNumber}`).subscribe({
        next: (response: any) => {
          if (response.success && response.data) {
            this.filteredPhoneNumbers = response.data.map((customer: any) => customer.phone_no);
          }
        },
        error: (error) => console.error('Error fetching phone numbers:', error)
      });
    } else {
      this.filteredPhoneNumbers = []; // Clear the list if the input is empty
    }
  }

  // Triggered when a phone number is selected from the autocomplete
  onPhoneNumberSelected(phone: string): void {
    this.http.get(`${environment.apiBaseUrl}/customers/phone-number/${phone}`).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.selectedCustomer = response.data[0]; 
          console.log(this.selectedCustomer)
          this.paymentForm.patchValue({ customer_id: this.selectedCustomer.customer_id_formatted });
          this.paymentForm.patchValue({ email: this.selectedCustomer.email_id });
          this.paymentForm.patchValue({ name: this.selectedCustomer.name });
          // Store selected customer details
          this.fetchRentals(this.selectedCustomer.customer_id_formatted); // Fetch rentals for the customer
        } else {
          this.selectedCustomer = null;
          this.rentals = [];
          //alert('No customer found with this phone number.');
        }
      },
      error: (error) => {
        console.error('Error fetching customer details:', error);
      //  this.selectedCustomer = null;
        this.rentals = [];
      }
    });
  }

  // Fetch rentals for the selected customer
  fetchRentals(customerId: string): void {
    this.http.get(`${environment.apiBaseUrl}/rentals/customer/${customerId}`).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.rentals = response.data;
          console.log(this.rentals.length)
        } else {
          this.rentals = [];
        }
      },
      error: (error) => {
        console.error('Error fetching rentals:', error);
        this.rentals = [];
      }
    });
  }

  // Triggered when a rental is selected
  onRentalSelect(rental: any): void {
    this.selectedRental = rental; // Store the selected rental
    console.log('Selected Rental:', this.selectedRental);
  
    // Fetch rental details for the selected rental
    this.fetchRentalDetails(rental.rental_id_formatted);
  }
  
  // Fetch rental details for the selected rental
  fetchRentalDetails(rentalId: string): void {
    this.http.get(`${environment.apiBaseUrl}/rentals/rentalDetails/${rentalId}`).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.rentalDetails = response.data.map((detail: any) => ({
            ...detail,
            selected: false // Initialize the `selected` property
          }));

          // Dynamically add form controls for checkboxes
          this.rentalDetails.forEach((detail) => {
            const controlName = `selected_${detail.rental_detail_id_formatted}`;
            if (!this.paymentForm.contains(controlName)) {
              this.paymentForm.addControl(controlName, this.fb.control(false));
            }
          });

          console.log('Rental Details:', this.rentalDetails);
        } else {
          this.rentalDetails = [];
          //alert('No rental details found for the selected rental.');
        }
      },
      error: (error) => {
        console.error('Error fetching rental details:', error);
        this.rentalDetails = [];
      }
    });
  }

  // Submit payment for the selected rental
  // Submit payment for the selected rental
submitPayment(): void {
  // if (this.paymentForm.invalid) {
  //   alert('Please fill in all required fields.');
  //   return;
  // }

  // Extract selected rental detail IDs
  // const selectedRentalDetailIds = this.selectedRentalDetails.map((detail) => detail.rental_detail_id_formatted);

  const paymentData = {
    customerId: this.paymentForm.get('customer_id')?.value,
   // rentalId: this.selectedRental?.rental_id_formatted || null,
    paymentAmount: this.paymentForm.get('payment_amount')?.value,
    paymentMethod: this.paymentForm.get('payment_method')?.value,
    purpose:this.paymentForm.get('purpose')?.value,
    notes: this.paymentForm.get('note')?.value || '',
   // rental_detail_id: selectedRentalDetailIds // Send only the selected rental detail IDs
  };

  //console.log('Payment Data:', paymentData);

  this.http.post(`${environment.apiBaseUrl}/payments/link`, paymentData).subscribe({
    next: (response: any) => {
      if (response.success) {
        //alert('Payment successfully applied!');
        this.paymentForm.reset();
        this.selectedRentalDetails = [];
        this.showError('Payment successfully applied!');
        this.rentalDetails.forEach((detail) => {
          const control = this.paymentForm.get(`selected_${detail.rental_detail_id_formatted}`);
          if (control) {
            control.setValue(false);
          }
        });
      } else {
        //alert('Failed to apply payment. Please try again.');
      }
    },
    error: (error) => {
      console.error('Error submitting payment:', error);
     // alert('An error occurred while processing the payment.');
    }
  });
}
showError(message: string): void {
  this.snackBar.open(message, 'Close', {
    duration: 5000, // Duration in milliseconds
    panelClass: ['error-snackbar'], // Custom CSS class for styling
    horizontalPosition: 'right',
    verticalPosition: 'top'
  });
}
  onRentalCheckboxChange(rental:any,event: any): void {
    console.log(event);
    //if (event) {
      this.selectedRental =rental.rental_id_formatted;
      this.http.get(`${environment.apiBaseUrl}/rentals/rentalDetails/${this.selectedRental}`).subscribe({
        next: (response: any) => {
          if (response.success && response.data) {
            //this.paymentForm.patchValue({ rental_id: response.data.rental_id }); // Update the form with the selected rental ID
           this.rentalDetails = response.data;

          }
        },
        error: (error) => {
          console.error('Error fetching rental details:', error);
        }
      })
    //}
  
}

onRentalDetailsSelectionChange(rental: any): void {
  this.selectedRental =rental.rental_id_formatted;
  this.http.get(`${environment.apiBaseUrl}/rentals/rentalDetails/${this.selectedRental}`).subscribe({
    next: (response: any) => {
      if (response.success && response.data) {
        //this.paymentForm.patchValue({ rental_id: response.data.rental_id }); // Update the form with the selected rental ID
       this.rentalDetails = response.data;

      }
    },
    error: (error) => {
      console.error('Error fetching rental details:', error);
    }
  })
  // You can perform additional actions here, such as updating the form or fetching more data
}
selectAllRentalDetails(checked: boolean): void {
  //this.rentalDetails.forEach((detail) => (detail.selected = checked));
}
// Check if all rows are selected
isAllSelected(): boolean {
  return this.rentalDetails.every((detail) =>
    this.paymentForm.get(`selected_${detail.rental_detail_id_formatted}`)?.value
  );
}

// Check if some rows are selected (for indeterminate state)
isIndeterminate(): boolean {
  return this.rentalDetails.some((detail) =>
    this.paymentForm.get(`selected_${detail.rental_detail_id_formatted}`)?.value
  ) && !this.isAllSelected();
}

// Toggle selection for all rows
toggleAllRows(checked: boolean): void {
  console.log('Toggle All Rows:', checked);
  this.rentalDetails.forEach((detail) => {
    const control = this.paymentForm.get(`selected_${detail.rental_detail_id_formatted}`);
    if (control) {
      control.setValue(checked);
    }
  });
  this.updateSelectedRentalDetails();
}

// Handle individual row selection
onRowSelectionChange(detail: any): void {
  console.log('Row Selection Changed:', detail);
  this.updateSelectedRentalDetails();
}

// Update the list of selected rows
updateSelectedRentalDetails(): void {
  this.selectedRentalDetails = this.rentalDetails.filter((detail) =>
    this.paymentForm.get(`selected_${detail.rental_detail_id_formatted}`)?.value
  );
  console.log('Selected Rental Details:', this.selectedRentalDetails);
}
}