import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { Cardetails } from '../interfaces/Cardetails.interface';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-car-list',
  templateUrl: './car-list.component.html',
  styleUrls: ['./car-list.component.scss']
})
export class CarListComponent implements OnInit {
  displayedColumns: string[] = ['actions', 'make', 'model', 'vin', 'color', 'status', 'procure_date'];
  cars = new MatTableDataSource<Cardetails>([]);
  loading = true;
  error = '';
  statusOptions: string[] = [];
  makeOptions: string[] = []; // Replace with actual makes
  modelOptions: string[] = []; // Replace with actual models
  filterValues = {
    status: '',
    make: '',
    model: ''
  };

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.loadCars();
    this.cars.filterPredicate = this.createFilter();
    
  }

  private loadCars(): void {
    this.loading = true;
    this.http.get<any>('https://carrental-0zt3.onrender.com/api/cars').subscribe({
      next: (response) => {
        this.cars.data = response.data;
      //  this.cars.data = response.data;
        const statusSet = new Set<string>();
        const makeSet = new Set<string>();
        const modelSet = new Set<string>();

        this.cars.data.forEach((data: Cardetails) => {
          console.log(data);
          statusSet.add(data.status);
          makeSet.add(data.make);
          modelSet.add(data.model);
        });

        this.statusOptions = Array.from(statusSet);
        this.makeOptions = Array.from(makeSet);
        this.modelOptions = Array.from(modelSet);
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load cars';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.cars.filter = filterValue.trim().toLowerCase();
  }

  applyStatusFilter(event: any): void {
    //const filterValue = event.value;
   // this.filterValues.status = filterValue.trim().toLowerCase();
    this.cars.filter = JSON.stringify(this.filterValues);
  }
  applyMakeFilter(event: any): void {
    //const filterValue = event.value;
    //this.filterValues.make = filterValue.trim().toLowerCase();
    this.cars.filter = JSON.stringify(this.filterValues);
  }

  applyModelFilter(event: any): void {
    //const filterValue = event.value;
    //this.filterValues.model = filterValue.trim().toLowerCase();
    this.cars.filter = JSON.stringify(this.filterValues);
  }

  onEdit(car: Cardetails, additionalText: string): void {
    this.router.navigate(['/car-form', car.car_id], { queryParams: { text: additionalText } });
  }
  createFilter(): (data: Cardetails, filter: string) => boolean {
    return (data: Cardetails, filter: string): boolean => {
      const searchTerms = JSON.parse(filter);
  
      const statusMatch = searchTerms.status
        ? data.status.toLowerCase().includes(searchTerms.status.toLowerCase())
        : true;
  
      const makeMatch = searchTerms.make
        ? data.make.toLowerCase().includes(searchTerms.make.toLowerCase())
        : true;
  
      const modelMatch = searchTerms.model
        ? data.model.toLowerCase().includes(searchTerms.model.toLowerCase())
        : true;
  
      return statusMatch && makeMatch && modelMatch;
    };
  }
  onDelete(car: Cardetails): void {
    console.log(car);
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: { 
        title: 'Confirm Deletion', 
        message: `Are you sure you want to delete car with VIN ${car.vin}?` 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.http.delete(`https://carrental-0zt3.onrender.com/api/cars/${car.car_id}`).subscribe({
          next: () => {
            this.loadCars(); // Refresh the list
          },
          error: (error) => {
            this.error = 'Failed to delete car';
            console.error('Error:', error);
          }
        });
      }
    });
  }

  onRent(car: Cardetails): void {
    this.router.navigate(['/rent', car.car_id], {
      state: { car: car }
    });
  }
  clearStatusFilter(): void {
    this.filterValues.status = '';
    this.cars.filter = JSON.stringify(this.filterValues);
  }

  clearMakeFilter(): void {
    this.filterValues.make = '';
    this.cars.filter = JSON.stringify(this.filterValues);
  }

  clearModelFilter(): void {
    this.filterValues.model = '';
    this.cars.filter = JSON.stringify(this.filterValues);
  }

}