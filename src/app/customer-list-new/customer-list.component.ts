import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { Customer } from '../interfaces/Customer.interface';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent implements OnInit {
  displayedColumns: string[] = ['name', 'email', 'phone', 'city', 'state', 'status', 'actions'];
  customers = new MatTableDataSource<Customer>([]);
  loading = true;
  error = '';
  filterValues = {
    search: '',
    city: '',
    state: '',
    status: ''
  };
  cityOptions: string[] = [];
  stateOptions: string[] = [];
  statusOptions: string[] = [];

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
    this.customers.filterPredicate = (data: Customer, filter: string) => {
      const searchTerms = JSON.parse(filter);
            return (data.name.toLowerCase().includes(searchTerms.search) ||
            data.email_id.toLowerCase().includes(searchTerms.search) ||
            data.phone_no.toLowerCase().includes(searchTerms.search) ||
            data.city.toLowerCase().includes(searchTerms.search) ||
            data.state.toLowerCase().includes(searchTerms.search) ||
            data.status.toLowerCase().includes(searchTerms.search)) &&
           (searchTerms.city ? data.city === searchTerms.city : true) &&
           (searchTerms.state ? data.state === searchTerms.state : true) &&
           (searchTerms.status ? data.status === searchTerms.status : true);
    };
  }

  private loadCustomers(): void {
    this.loading = true;
    this.http.get<any>('https://carrental-0zt3.onrender.com/api/customers').subscribe({
      next: (response) => {
        this.customers.data = response.data;
        const statusSet = new Set<string>();
                const makeSet = new Set<string>();
                const modelSet = new Set<string>();
        
                this.customers.data.forEach((data: Customer) => {
                  console.log(data);
                  statusSet.add(data.status);
                  makeSet.add(data.city);
                  modelSet.add(data.state);
                });
        
                this.statusOptions = Array.from(statusSet);
                this.cityOptions = Array.from(makeSet);
                this.stateOptions = Array.from(modelSet);
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load customers';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.customers.filter = filterValue.trim().toLowerCase();
  }

  applyCityFilter(event: string): void {
    //const filterValue = (event.target as HTMLInputElement).value;
   // this.filterValues.city = event//.trim().toLowerCase();
    this.customers.filter = JSON.stringify(this.filterValues);
  }
  applyStateFilter(event: string): void {
    //const filterValue = (event.target as HTMLInputElement).value;
    //this.filterValues.state = event//.trim().toLowerCase();
    this.customers.filter = JSON.stringify(this.filterValues);
  }
  applyStatusFilter(event: string): void {
   // const filterValue = (event.target as HTMLInputElement).value;
   // this.filterValues.status = event//.trim().toLowerCase();
    this.customers.filter = JSON.stringify(this.filterValues);
  }

  onEdit(customer: Customer,type:string): void {
    this.router.navigate(['/customer-form', customer.customer_id],{ queryParams: { text: type } });
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
        this.http.delete(`https://carrental-0zt3.onrender.com/api/customers/${customer.customer_id}`).subscribe({
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
  clearCityFilter(): void {
    this.filterValues.city = '';
    this.customers.filter = JSON.stringify(this.filterValues);
  }

  clearStateFilter(): void {
    this.filterValues.state = '';
    this.customers.filter = JSON.stringify(this.filterValues);
  }

  clearStatusFilter(): void {
    this.filterValues.status = '';
    this.customers.filter = JSON.stringify(this.filterValues);
  }
}