import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environment';

@Component({
  selector: 'app-payment-list',
  templateUrl: './payment-list.component.html',
  styleUrls: ['./payment-list.component.scss']
})
export class PaymentListComponent {
  patmentList: any;
  //displayedColumns= ['payment_id','rental_detail_id','customer_id', 'created_date','amount','payment_method', 'payment_date','note','actions'];
  expandedElement: any | null = null;
  displayedColumns: string[] = [ 'payment_id', 'customer_id', 'payment_date', 'amount','remaining_amount','payment_method','payment_status','actions'];
  expand:boolean= false;

  constructor(private http: HttpClient,private router: Router) {
    // Initialize the component
  }
  ngOnInit() {
    this.http.get(`${environment.apiBaseUrl}/payments`).subscribe({
          next: (response: any) => {
            console.log(response);
            this.patmentList= response.data;
            // Handle the response data
    // Perform any necessary initialization
  }})
}
paymentLink(details: any) {
  // Navigate to the payment details page with the given ID
  // this.router.navigate(['/payment-form', id]);
  // const params =  details.payment_id_formatted;
  // console.log(params);
  // this.http.get(`${environment.apiBaseUrl}/payments/link/${params}`).subscribe({
  //   next:(response:any)=>{
      this.router.navigate(['/payment-link',details.customer_id]) 
      // Optionally, refresh the payment list after voiding
  //  }

 // })
  // Add your logic here to handle the payment link
  // For example, you might want to open a dialog or navigate to a different route
  // this.router.navigate(['/payment-form', id]);
}

  toggleRow(element: any): void {
    this.expand=!this.expand
    this.expandedElement = this.expandedElement === element ? null : element;
  }
  onPaymentAction(details: any): void {
    if (!details || !details.payment_id_formatted) {
      console.error('Invalid payment details provided.');
      return;
    }
  
    const payload = { paymentId: details.payment_id_formatted };
  
    this.http.put(`${environment.apiBaseUrl}/payments/void`, payload).subscribe({
      next: (response: any) => {
        console.log('Payment voided successfully:', response);
        // Optionally, refresh the payment list after voiding
        this.refreshPaymentList();
      },
      error: (error) => {
        console.error('Error voiding payment:', error);
        // Optionally, show an error message to the user
        alert('Failed to void the payment. Please try again.');
      }
    });
  }
  
  // Refresh the payment list after voiding a payment
  refreshPaymentList(): void {
    this.http.get(`${environment.apiBaseUrl}/payments`).subscribe({
      next: (response: any) => {
        console.log('Payment list refreshed:', response);
        this.patmentList = response.data;
      },
      error: (error) => {
        console.error('Error refreshing payment list:', error);
      }
    });
  }
}
