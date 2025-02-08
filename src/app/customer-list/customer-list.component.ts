import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { Customer } from '../interfaces/Customer.interface';
import { Router } from '@angular/router';


@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent implements OnInit {
  customers: Customer[] = [];
  loading = true;
  error = '';

  constructor(private http: HttpClient, private dialog: MatDialog,public router: Router) {
    
  }

  ngOnInit(): void {
    this.loadCustomers();
    
  }

  private loadCustomers(): void {
    this.loading = true;
    this.http.get<Customer[]>('http://localhost:3000/api/customers').subscribe({
      next: (response: any) => {
        this.customers = response.data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load customers';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  onEdit(customer: Customer): void {
    this.router.navigate(['/customer-form', customer.customer_id]);
    // Add edit functionality
  }

  onDelete(customer: Customer): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: { 
        title: 'Confirm Deletion', 
        message: `Are you sure you want to delete customer ${customer.name}?` 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.http.delete(`http://localhost:3000/api/customers/${customer.customer_id}`).subscribe({
          next: () => {
            this.loadCustomers(); // Refresh the list
          },
          error: (error) => {
            this.error = 'Failed to delete customer';
            console.error('Error:', error);
          }
        });
      }
    });
  }
}