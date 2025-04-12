import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { Customer } from '../interfaces/Customer.interface';
import { MatPaginator } from '@angular/material/paginator';
import { environment } from 'src/environment';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent implements OnInit,AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
    displayedColumns: string[] = ['name', 'email', 'phone', 'city', 'state', 'status','craetedDate','licenseExpiry','dlIssueState',  'actions',];
  customers = new MatTableDataSource<Customer>([]);
  loading = true;
  error = '';
  filterValues= {
    search: '',
    name: '',
    email: '',
    phone: '',
    city: ''
  };
  cityOptions: string[] = [];
  stateOptions: string[] = [];
  statusOptions: string[] = [];

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    public router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadCustomers();
    this.customers.filterPredicate = (data: Customer, filter: string) => {
        const searchTerms = JSON.parse(filter);
        return (
          (!searchTerms.name || (data.name && data.name.toLowerCase().includes(searchTerms.name))) &&
          (!searchTerms.email || (data.email_id && data.email_id.toLowerCase().includes(searchTerms.email))) &&
          (!searchTerms.phone || (data.phone_no && data.phone_no.toLowerCase().includes(searchTerms.phone))) &&
          (!searchTerms.city || (data.city && data.city.toLowerCase().includes(searchTerms.city)))
        ) || false; // Ensure a boolean is always returned
      };
   // this.filterValues = JSON.parse(localStorage.getItem('search') || '{}');
    if (JSON.stringify(this.filterValues) !== '{}') {
      //this.customers.filter = this.filterValues;
    }
  }
  ngAfterViewInit(): void {
    console.log('Paginator:', this.paginator);
    console.log('Customers:', this.customers);
  
    if (this.paginator) {
      this.customers.paginator = this.paginator;
      console.log('Paginator connected successfully');
    } else {
      console.error('Paginator is not ready in ngAfterViewInit');
    }
  
    this.cdr.detectChanges();
  }
  private loadCustomers(): void {
    this.loading = true;
    this.http.get<any>(`${environment.apiBaseUrl}/customers`).subscribe({
      next: (response) => {
        this.customers.data = response.data;
  
        // Assign paginator after data is loaded
        if (this.paginator) {
          this.customers.paginator = this.paginator;
          console.log('Paginator assigned:', this.paginator);
        } else {
          console.error('Paginator is not available');
        }
  
        const statusSet = new Set<string>();
        const citySet = new Set<string>();
        const stateSet = new Set<string>();
  
        this.customers.data.forEach((data: Customer) => {
          statusSet.add(data.status);
          citySet.add(data.city);
          stateSet.add(data.state);
        });
  
        this.statusOptions = Array.from(statusSet);
        this.cityOptions = Array.from(citySet);
        this.stateOptions = Array.from(stateSet);
        this.loading = false;
        this.cdr.detectChanges();
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
    this.filterValues.search = filterValue.trim().toLowerCase();
    this.customers.filter = JSON.stringify(this.filterValues);
    localStorage.setItem('search', JSON.stringify(this.filterValues));
  }

  applyNameFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.filterValues.name = filterValue;
    this.customers.filter = JSON.stringify(this.filterValues);
  }

  applyEmailFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.filterValues.email = filterValue;
    this.customers.filter = JSON.stringify(this.filterValues);
  }

  applyPhoneFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.filterValues.phone = filterValue;
    this.customers.filter = JSON.stringify(this.filterValues);
  }

  applyCityFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.filterValues.city = filterValue;
    this.customers.filter = JSON.stringify(this.filterValues);
  }

  clearNameFilter(): void {
    this.filterValues.name = '';
    this.customers.filter = JSON.stringify(this.filterValues);
  }
  
  clearEmailFilter(): void {
    this.filterValues.email = '';
    this.customers.filter = JSON.stringify(this.filterValues);
  }
  
  clearPhoneFilter(): void {
    this.filterValues.phone = '';
    this.customers.filter = JSON.stringify(this.filterValues);
  }
  
  clearCityFilter(): void {
    this.filterValues.city = '';
    this.customers.filter = JSON.stringify(this.filterValues);
  }

  onEdit(customer: Customer, type: string): void {
    this.router.navigate(['/customer-form', customer.customer_id], { queryParams: { text: type } });
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
        this.http.delete(`${environment.apiBaseUrl}/customers/${customer.customer_id}`).subscribe({
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
  addNewCustomer(): void {
    this.router.navigate(['/addcustomers'], { queryParams: { text: 'Add' } });
  }

}