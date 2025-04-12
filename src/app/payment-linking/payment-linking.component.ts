import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-payment-linking',
  templateUrl: './payment-linking.component.html',
  styleUrls: ['./payment-linking.component.scss']
})
export class PaymentLinkingComponent implements OnInit {
  paymentForm!: FormGroup; // Reactive form
  filteredPhoneNumbers: string[] = []; // List of phone numbers for autocomplete
  selectedCustomer: any = null; // Store selected customer details
  rentals: any[] = []; // List of rentals for the selected customer
  selectedRental: any = null; // Currently selected rental
  rentalDetails: any[] = []; // Rental details for the selected rental
  selectedRentalDetails: any[] = []; // Selected rental details
  paymentdata: any;
  rentalDetailform!: FormGroup; // Form for rental details
  customPaymentAmount: number = 0; // Custom payment amount
  remainingAmount: number = 0; // Remaining amount
  customPaymentError: string = ''; // Custom payment error message
  customPaymentNote: string=''; // Custom payment note
  totalAvailableBalance: number = 0; // Total available balance fetched from API
  previousPayments: any[] = []; // Previous payments fetched from API
  pendingBills: any[] = []; // Pending bills fetched from API
  appliedAmount: number = 0; // Total applied amount
  remainingBalance: number = 0; // Remaining balance after applying payments
  transactionType: string = 'rental';
  constructor(private fb: FormBuilder, private http: HttpClient,private snackBar: MatSnackBar,private route:ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const customerId = params['cus_id'];
      if (customerId) {
        this.getCustomerDetails(customerId);
      }})
    this.initForm();
    //this.fetchCustomerDetails();
   // this.fetchPreviousPayments();
    //this.fetchPendingBills();
  }

  private initForm(): void {
    this.paymentForm = this.fb.group({
      phone_number: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]], // Phone number validation
      rental_id: ['', Validators.required], // Rental ID for payment
      payment_amount: [0, [Validators.required, Validators.min(1)]], // Payment amount
     // payment_method: ['', Validators.required], // Payment method
      email: ['', [Validators.required, Validators.email]], // Email field
      name: ['', Validators.required], // Name field
      customer_id: ['', Validators.required], // Customer ID
      note: ['', Validators.maxLength(255)],
      customPaymentNote: ['', Validators.maxLength(255)],
      customPaymentAmount: [0, [Validators.required, Validators.min(1)]],
      applied_amount: [0, [Validators.required, Validators.min(1)]], // Applied amount
       // Custom payment amount
     // payment_Id: ['', Validators.maxLength(255)],
      //payment_date: ['', Validators.required]
    });
    this.rentalDetailform= this.fb.group({
      rental_id: ['', Validators.required], 
      rental_detail_id:['', Validators.required],
      Pendingamount: ['', Validators.required], // Pending amount
       // Rental detail ID
      // Rental ID for payment    
    }) 
  }
  getCustomerDetails(customerId: string): void {
    this.http.get(`${environment.apiBaseUrl}/customers/${customerId}`).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.paymentForm.patchValue({
            phone_number: response.data.phone_no,})
          this.onPhoneNumberSelected(response.data.phone_no);
        
    }  } })}
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
          this.paymentForm.patchValue({
            customer_id: this.selectedCustomer.customer_id_formatted,
            email: this.selectedCustomer.email_id,
            name: this.selectedCustomer.name
          });

          // Fetch payment details for the customer
          this.http.get(`${environment.apiBaseUrl}/payments/${this.selectedCustomer.customer_id_formatted}`).subscribe({
            next: (result: any) => {
              if (result.data) {
                this.paymentdata = result.data;
                this.previousPayments = result.data.map((payment: any) => ({
                  ...payment,
                  selected: false // Initialize the selected property
                })); 
                this.previousPayments = this.previousPayments.filter((payment: any) => payment.remaining_amount > 0 && payment.payment_status === 'Active');
                console.log(this.previousPayments)
                               const totalRemainingAmount = this.paymentdata.reduce((sum:any, payment:any) => sum + payment.remaining_amount, 0);
                this.totalAvailableBalance=totalRemainingAmount
                this.paymentForm.patchValue({
                  payment_amount: totalRemainingAmount,
                  payment_Id: this.paymentdata[0].payment_id_formatted
                });
              }
            },
            error: (error) => console.error('Error fetching payment details:', error)
          });

          // Fetch rentals for the customer
          this.fetchRentals(this.selectedCustomer.customer_id_formatted);
        } else {
          this.selectedCustomer = null;
          this.rentals = [];
        }
      },
      error: (error) => {
        console.error('Error fetching customer details:', error);
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
          if (this.rentals.length > 0) {
            this.selectedRental = this.rentals[0]; // Select the first rental by default
            this.fetchRentalDetails(this.selectedRental.rental_id_formatted); // Fetch rental details for the selected rental
          } else {
            this.selectedRental = null;
            this.rentalDetails = [];
          }
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

  // Fetch rental details for the selected rental
  fetchRentalDetails(rentalId: string): void {
    console.log('Fetching rental details for rentalId:', rentalId); // Debugging

    this.http.get(`${environment.apiBaseUrl}/rentals/rentalDetails/${rentalId}`).subscribe({
      next: (response: any) => {
        console.log('Rental details response:', response); // Debugging

        if (response.success && response.data) {
          // Filter only unpaid and partially paid bills
          this.rentalDetails = response.data
            .map((detail: any) => ({
              ...detail,
              outstanding_amount: detail.prorated_amount - detail.total_paid ,
              selected: false // Calculate outstanding amount
            }))
            .filter((detail: any) => detail.outstanding_amount > 0); // Only include bills with outstanding amounts
          // Dynamically add form controls for checkboxes
          this.rentalDetails.forEach((detail) => {
            const controlName = `selected_${detail.rental_detail_id_formatted}`;
            if (!this.paymentForm.contains(controlName)) {
              this.paymentForm.addControl(controlName, this.fb.control(false));
            }
          });
        } else {
          console.warn('No rental details found for rentalId:', rentalId); // Debugging
          this.rentalDetails = [];
        }
      },
      error: (error) => {
        console.error('Error fetching rental details:', error); // Debugging
        this.rentalDetails = [];
      }
    });
  }

  // Submit payment for the selected rental
  submitPayment(): void {
    if (this.customPaymentError) {
      this.showError('Please fix the errors in the custom payment section.');
      return;
    }
  
    const selectedBills = this.rentalDetails.filter((detail) => detail.selected);
  
    if (selectedBills.length === 0) {
      this.showError('Please select at least one bill to apply the payment.');
      return;
    }
  
    // Prepare the payment data
    const paymentData = {
      customerId: this.paymentForm.get('customer_id')?.value,
      paymentAmount:this.paymentForm.get('customPaymentAmount')?.value,
      paymentId: this.paymentForm.get('payment_Id')?.value,
      notes: this.customPaymentNote || '',
      selectedBills: selectedBills.map((bill) => ({
        rental_detail_id: bill.rental_detail_id_formatted,
        outstanding_amount: bill.outstanding_amount
      }))
    };
  
    // Send the payment data to the backend
    this.http.post(`${environment.apiBaseUrl}/payments/apply`, paymentData).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.showError('Payment applied successfully!');
          this.fetchRentalDetails(this.selectedCustomer.customer_id_formatted); // Refresh the table
        } else {
          this.showError('Failed to apply payment. Please try again.');
        }
      },
      error: (error) => {
        console.error('Error applying payment:', error);
        this.showError('An error occurred while applying the payment.');
      }
    });
  }

  // Handle individual row selection
  onRowSelectionChange2(detail: any): void {
    this.updateSelectedRentalDetails();
  }

  // Update the list of selected rows
  updateSelectedRentalDetails(): void {
    this.selectedRentalDetails = this.rentalDetails.filter((detail) =>
      this.paymentForm.get(`selected_${detail.rental_detail_id_formatted}`)?.value
    );
  }
  // Toggle all rows
// Check if all bills are selected
// Check if all bills are selected
// Check if all bills are selected
isAllSelected(): boolean {
  return this.rentalDetails.length > 0 && this.rentalDetails.every((bill) => bill.selected);
}

// Check if some bills are selected (for indeterminate state)
isIndeterminate(): boolean {
  const selectedCount = this.rentalDetails.filter((bill) => bill.selected).length;
  return selectedCount > 0 && selectedCount < this.rentalDetails.length;
}

// Toggle all bills' selection
toggleAllRows(checked: boolean): void {
  this.rentalDetails.forEach((bill) => {
    bill.selected = checked;
  });
  console.log('All rows toggled:', checked, this.rentalDetails);
}




validateCustomAmount(): void {
  if (this.customPaymentAmount > this.remainingAmount) {
    this.customPaymentError = 'Custom payment amount cannot exceed the remaining amount.';
  } else if (this.customPaymentAmount < 0) {
    this.customPaymentError = 'Custom payment amount cannot be negative.';
  } else {
    this.customPaymentError = '';
  }
}

// Fetch customer details from API
fetchCustomerDetails(): void {
  this.http.get(`${environment.apiBaseUrl}/customers/details`).subscribe({
    next: (response: any) => {
      if (response.success) {
        this.selectedCustomer = response.data;
        this.totalAvailableBalance = response.data.totalBalance || 0;
      }
    },
    error: (error) => {
      console.error('Error fetching customer details:', error);
    }
  });
}

// Fetch previous payments from API
fetchPreviousPayments(): void {
  this.http.get(`${environment.apiBaseUrl}/payments/previous/`).subscribe({
    next: (response: any) => {
      if (response.success) {
        this.previousPayments = response.data;
      }
    },
    error: (error) => {
      console.error('Error fetching previous payments:', error);
    }
  });
}

// Fetch pending bills from API
fetchPendingBills(): void {
  this.http.get(`${environment.apiBaseUrl}/bills/pending`).subscribe({
    next: (response: any) => {
      if (response.success) {
        this.pendingBills = response.data;
      }
    },
    error: (error) => {
      console.error('Error fetching pending bills:', error);
    }
  });
}

// Select all previous payments
checkAll(): void {
  this.previousPayments.forEach((payment) => {
    payment.selected = true; // Set all payments as selected
  });
  console.log('All payments selected:', this.previousPayments);
}

// Unselect all payments
uncheckAll(): void {
  this.previousPayments.forEach((payment) => {
    payment.selected = false; // Set all payments as unselected
  });
  console.log('All payments unselected:', this.previousPayments);
}
onPaymentSelectionChange(payment: any): void {
  console.log('Payment selection changed:', payment);
 // payment.selected= !payment.selected; // Toggle the selected state
  
  // Perform any additional logic if needed
  if (payment.selected) {
    console.log(`Payment ${payment.payment_id_formatted} selected.`);
  } else {
    console.log(`Payment ${payment.payment_id_formatted} deselected.`);
  }
}
// Calculate totals for applied payments and remaining balance
calculateTotals(): void {
  // Calculate the total applied amount from the selected bills
  this.appliedAmount = this.rentalDetails.reduce((sum, bill) => {
    const applyAmount = this.appliedAmount || 0; // Default to 0 if no value is entered
    return sum + applyAmount;
  }, 0);
  // Ensure the applied amount does not exceed the total available balance
  if (this.appliedAmount > this.totalAvailableBalance) {
    this.showError('The applied amount exceeds the total available balance!');
    this.appliedAmount = this.totalAvailableBalance; // Cap the applied amount
  }

  // Calculate the remaining balance
  this.remainingBalance = this.totalAvailableBalance - this.appliedAmount;
}
showError(message: string): void {
  this.snackBar.open(message, 'Close', {
    duration: 5000, // Duration in milliseconds
    panelClass: ['error-snackbar'], // Custom CSS class for styling
    horizontalPosition: 'right',
    verticalPosition: 'top'
  });
}
// Apply payments to bills
applyPayments(): void {
  const selectedPayments = this.previousPayments.filter((payment) => payment.selected);
  if (selectedPayments.length === 0 ) {
    this.showError('Please select at least one payment to apply.');
    return;
  }
  const appliedBills = this.rentalDetails.filter((bill) => bill.selected).map((bill) => ({
    rental_detail_id: bill.rental_detail_id_formatted,
    outstanding_amount: bill.outstanding_amount,
    // Include the applied amount for each bill
    rental_Id: bill.rental_id,
    applied_amount: bill.applied_amount | 0 // Default to 0 if no value is entered
  }));
if (appliedBills.length === 0 && this.appliedAmount === 0) {
    this.showError('Please select at least one bill to apply the payment.');
    return;
  } 
   const totalAppliedAmount = appliedBills.reduce((sum, bill) => sum + bill.applied_amount, 0);
   this.remainingBalance = this.totalAvailableBalance - totalAppliedAmount;

  if (totalAppliedAmount > this.remainingBalance && this.appliedAmount >this.remainingBalance) {
    this.showError('The applied amount exceeds the remaining balance!');
    return;
  }
  const payload = {
    customerId: this.selectedCustomer?.customer_id_formatted
    ,
    selectedPayments,
    appliedBills
  };

  this.http.post(`${environment.apiBaseUrl}/payments/apply`, payload).subscribe({
    next: (response: any) => {
      if (response.success) {
        this.showError('Payments applied successfully!');
        //this.fetchPreviousPayments(); // Refresh previous payments
        //this.fetchPendingBills(); // Refresh pending bills
        this.onPhoneNumberSelected(this.paymentForm.get('phone_number')?.value);
        this.appliedAmount=0;
      }
    },
    error: (error) => {
      console.error('Error applying payments:', error);
      this.showError('Failed to apply payments. Please try again.');
    }
  });
}

// Cancel the operation
cancel(): void {
  this.showError('Action canceled.');
}
// Check if all bills are selected
areAllBillsSelected(): boolean {
  return this.rentalDetails.every((bill) => bill.selected);
}
onTransactionTypeChange(event: Event): void {
  const selectedValue = (event.target as HTMLSelectElement).value;
  console.log('Transaction type changed to:', selectedValue);
  // Perform any additional logic based on the selected transaction type
}
// Check if some bills are selected (for indeterminate state)
isIndeterminate2(): boolean {
  const selectedCount = this.rentalDetails.filter((bill) => bill.selected).length;
  return selectedCount > 0 && selectedCount < this.rentalDetails.length;
}

// Toggle all bills' selection
toggleAllBills(checked: boolean): void {
  this.rentalDetails.forEach((bill) => {
    bill.selected = checked;
  });
  console.log('All bills toggled:', checked, this.rentalDetails);
}

// Handle individual bill selection change
onBillSelectionChange(bill: any): void {
  console.log('Bill selection changed:', bill);
  //bill.selected = !bill.selected; // Toggle the selected state
  // Optionally, you can perform additional logic here
}
// Amountapplied(bill: any) {
// console.log('Bill selection changed:', bill);
// if((bill.prorated_amount- bill.total_paid)<this.appliedAmount){
//   this.showError('The applied amount exceeds the remaining balance!');
//   return; 
// }
// }
// Getter for FormArray
get previousPaymentsFormArray(): FormArray {
  return this.paymentForm.get('previousPayments') as FormArray;
}

// Handle checkbox selection change


// Toggle all rows in the history card
toggleAllPayments(checked: boolean): void {
  this.previousPayments.forEach((bill) => {
    bill.selected = checked;
  });
  console.log('All rows toggled:', checked, this.rentalDetails);}

// Check if all rows are selected
isAllPaymentsSelected(): boolean {
  return  this.previousPayments.length > 0 && this.previousPayments.every((bill) => bill.selected);
}

// Check if some rows are selected
isPaymentsIndeterminate(): boolean {
  const selectedCount = this.previousPayments.filter((bill) => bill.selected).length;
  return selectedCount > 0 && selectedCount < this.previousPayments.length;
}
Amountapplied(bill: any, index: number) {
  const appliedAmount = this.rentalDetails[index].applied_amount;
this.appliedAmount = this.rentalDetails.reduce((amount: number, element: any) => {
   return amount + (element.applied_amount || 0); // Assuming applied_amount is a property of each
}, 0);
this.remainingBalance = this.totalAvailableBalance - this.appliedAmount;
  // Validate the applied amount
  if (appliedAmount > (bill.prorated_amount - bill.total_paid)) {
    this.showError('The applied amount exceeds the remaining balance!');
    this.rentalDetails[index].applied_amount = 0; // Reset the applied amount
    return;
  }

  console.log(`Applied amount for bill ${bill.rental_detail_id_formatted}:`, appliedAmount);
}
}
