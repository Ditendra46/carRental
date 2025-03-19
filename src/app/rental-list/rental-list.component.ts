import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { Rental } from '../interfaces/Rental.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rental-list',
  templateUrl: './rental-list.component.html',
  styleUrls: ['./rental-list.component.scss']
})
export class RentalListComponent implements OnInit {
  rentals = new MatTableDataSource<any>([]);
  displayedColumns: string[] = [
    'Rental_ID_Formatted',
    'car_vin',
    'customer_name',
    'customer_email',
    'customer_phone',
    'Ins_Company',
    'Ins_Policy_No',
    'Rate',
    'Rent_Amount',
    'Pay_Method',
    'Adv_Amnt',
    'actions'
  ];
  filterValues = {
    search: '',
    customer_name: '',
    car_vin: '',
    ins_company: ''
  };
  customerOptions: string[] = [];
  carVinOptions: string[] = [];
  insCompanyOptions: string[] = [];

  constructor(private http: HttpClient, public router: Router) {}

  ngOnInit(): void {
    this.fetchRentals();
    this.rentals.filterPredicate = (data: any, filter: string): boolean => {
      let searchTerms;
      try {
        searchTerms = JSON.parse(filter); // Parse the filter string as JSON
      } catch (e) {
        console.error('Error parsing filter JSON:', e);
        return false;
      }
  
      return (
        (!searchTerms.car_vin || data.car?.vin?.toString().toLowerCase().includes(searchTerms.car_vin)) &&
        (!searchTerms.customer_name || data.customer?.name?.toLowerCase().includes(searchTerms.customer_name.toLowerCase())) &&
        //(!searchTerms.car_vin || data.car?.vin?.toString().toLowerCase() === searchTerms.car_vin.toLowerCase()) &&
        (!searchTerms.ins_company || data.ins_company?.toLowerCase() === searchTerms.ins_company.toLowerCase())
      );
    };
  }
  fetchRentals(): void {
    this.http.get('https://carrental-0zt3.onrender.com/api/rentals').subscribe({
      next: (response: any) => {
        if (response.success) {
          this.rentals.data = response.data;
          this.customerOptions = [...new Set(response.data.map((rental: any) => rental.customer?.name as string))] as string[];
          this.carVinOptions = [...new Set(response.data.map((rental: any) => rental.car?.vin as string))] as string[];
          this.insCompanyOptions = [...new Set(response.data.map((rental: any) => rental.ins_company as string))] as string[];
        }
      },
      error: (error) => console.error('Error fetching rentals:', error)
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.filterValues.car_vin = filterValue;
    this.rentals.filter = JSON.stringify(this.filterValues);
  }
  
  applyCustomerNameFilter(customerName: string): void {
    this.filterValues.customer_name = customerName;
    this.rentals.filter = JSON.stringify(this.filterValues);
  }
  
  applyCarVinFilter(carVin: string): void {
    this.filterValues.car_vin = carVin;
    this.rentals.filter = JSON.stringify(this.filterValues);
  }
  
  applyInsCompanyFilter(insCompany: string): void {
    this.filterValues.ins_company = insCompany;
    this.rentals.filter = JSON.stringify(this.filterValues);
  }

  clearCustomerNameFilter(): void {
    this.filterValues.customer_name = '';
    this.rentals.filter = JSON.stringify(this.filterValues);
  }

  clearCarVinFilter(): void {
    this.filterValues.car_vin = '';
    this.rentals.filter = JSON.stringify(this.filterValues);
  }

  clearInsCompanyFilter(): void {
    this.filterValues.ins_company = '';
    this.rentals.filter = JSON.stringify(this.filterValues);
  }
  clearVinFilter(): void {
    this.filterValues.car_vin = ''; 
    this.rentals.filter = JSON.stringify(this.filterValues);
  }
  createFilter(): (data: any, filter: string) => boolean {
    return (data: any, filter: string): boolean => {
      let searchTerms;
      try {
        searchTerms = JSON.parse(filter);
      } catch (e) {
        console.error('Error parsing filter JSON:', e);
        return false;
      }
      return (
        (data.customer?.name?.toLowerCase().includes(searchTerms.search) || '') &&
        (data.car?.vin?.toString().toLowerCase().includes(searchTerms.search) || '') &&
        (data.customer?.email_id?.toLowerCase().includes(searchTerms.search) || '') &&
        (data.customer?.phone_no?.toLowerCase().includes(searchTerms.search) || '') &&
        (data.ins_company?.toLowerCase().includes(searchTerms.search) || '') &&
        (data.ins_policy_no?.toLowerCase().includes(searchTerms.search) || '') &&
        (data.rental_id_formatted?.toLowerCase().includes(searchTerms.search) || '') &&
        (data.inventory_id?.toLowerCase().includes(searchTerms.search) || '') &&
        (data.rate?.toString().includes(searchTerms.search) || '') &&
        (data.rent_amount?.toString().includes(searchTerms.search) || '') &&
        (data.pay_method?.toLowerCase().includes(searchTerms.search) || '') &&
        (data.adv_amnt?.toString().includes(searchTerms.search) || '') &&
        (searchTerms.customer_name ? data.customer?.name === searchTerms.customer_name : true) &&
        (searchTerms.car_vin ? data.car?.vin === searchTerms.car_vin : true) &&
        (searchTerms.ins_company ? data.ins_company === searchTerms.ins_company : true)
      );
    };
  }

  onEdit(rental: any, additionalText: string): void {
    this.router.navigate(['/rent', rental.car.car_id], { queryParams: { text: additionalText } });
  }
}