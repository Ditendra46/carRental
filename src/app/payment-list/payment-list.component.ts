import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { environment } from 'src/environment';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-payment-list',
  templateUrl: './payment-list.component.html',
  styleUrls: ['./payment-list.component.scss']
})
export class PaymentListComponent implements OnInit {
  displayedColumns: string[] = ['rental_detail_id', 'payment_id', 'customer_id', 'payment_date', 'amount', 'remaining_amount', 'payment_method', 'payment_status', 'actions'];
  patmentList = new MatTableDataSource<any>([]);
  filteredPayments = this.patmentList;
  constructor(private http: HttpClient, private dialog: MatDialog, private router: Router) {}

  ngOnInit(): void {
    this.refreshPaymentList();
  }

  refreshPaymentList(): void {
    this.http.get(`${environment.apiBaseUrl}/payments`).subscribe({
      next: (response: any) => {
        this.patmentList.data = response.data;
        this.filteredPayments = this.patmentList;
      },
      error: (error) => {
        console.error('Error fetching payment list:', error);
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.filteredPayments.filter = filterValue;
  }

  confirmCancel(payment: any): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '300px',
      data: { 
        title: 'Cancel Payment',
        message: `Are you sure you want to cancel payment ${payment.payment_id_formatted}?` }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cancelPayment(payment.payment_id_formatted);
      }
    });
  }

  cancelPayment(paymentId: string): void {
    this.http.put(`${environment.apiBaseUrl}/payments/void`, { paymentId }).subscribe({
      next: () => {
        this.refreshPaymentList();
      },
      error: (error) => {
        console.error('Error cancelling payment:', error);
      }
    });
  }

  paymentLink(payment: any): void {
    this.router.navigate(['/payment-link', payment.customer_id]);

    console.log(`Linking payment ${payment.payment_id}`);
  }
  onAddPayment(){
    this.router.navigate(['/payment-form']);

}
}
