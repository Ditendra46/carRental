import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-rental-list',
  templateUrl: './rental-list.component.html',
  styleUrls: ['./rental-list.component.scss']
})
export class RentalListComponent implements OnInit {
  rentals: any[] = [];
  displayedColumns: string[] = [
    'Rental_ID_Formatted',
    'Inventory_ID',
    'Customer_ID',
    'Ins_Company',
    'Ins_Policy_No',
    'Ins_Expiry_Dt',
    'Start_Date',
    'End_Date',
    'Days',
    'Duration',
    'Rate',
    'Discount',
    'Rent_Amount',
    'Pay_Method',
    'Adv_Amnt',
    'Ref_Amnt',
    'Ref_Name',
    'Ref_Ph',
    'Ext_YN',
    'created_date',
    'last_modified_date',
    'car_model',
    'car_make',
    'car_vin',
    'customer_name',
    'customer_email',
    'customer_phone'
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchRentals();
  }

  fetchRentals(): void {
    this.http.get('http://localhost:3000/api/rentals').subscribe({
      next: (response: any) => {
        if (response.success) {
          this.rentals = response.data;
        }
      },
      error: (error) => console.error('Error fetching rentals:', error)
    });
  }
}
