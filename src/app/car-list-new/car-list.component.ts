import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { Cardetails } from '../interfaces/Cardetails.interface';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-car-list',
  templateUrl: './car-list.component.html',
  styleUrls: ['./car-list.component.scss']
})
export class CarListComponent implements OnInit,AfterViewInit {
  displayedColumns: string[] = ['actions', 'make', 'model', 'vin', 'color', 'status', 'procure_date'];
  cars = new MatTableDataSource<Cardetails>([]);
  loading = true;
  error = '';
  statusOptions: string[] = [];
  makeOptions: string[] = []; // Replace with actual makes
  modelOptions: string[] = []; // Replace with actual models
  filterValues = {
    search: '',
    status: '',
    make: '',
    model: '',
    vin:''
  };
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.loadCars();
    this.cars.filterPredicate = (data: Cardetails, filter: string): boolean => {
      const searchTerms = JSON.parse(filter);
      return (
        (!searchTerms.vin || data.vin?.toString().toLowerCase().includes(searchTerms.vin)) &&
        (!searchTerms.status || data.status.toLowerCase() === searchTerms.status.toLowerCase()) &&
        (!searchTerms.make || data.make.toLowerCase() === searchTerms.make.toLowerCase()) &&
        (!searchTerms.model || data.model.toLowerCase() === searchTerms.model.toLowerCase())
      );
      
    };//this.createFilter(); 
    
  }
  ngAfterViewInit(): void {
    console.log('Paginator:', this.paginator);
    console.log('Customers:', this.cars);
  
    if (this.paginator) {
      this.cars.paginator = this.paginator;
      console.log('Paginator connected successfully');
    } else {
      console.error('Paginator is not ready in ngAfterViewInit');
    }
  
    //this.cdr.detectChanges();
  }
  createFilter(): (data: Cardetails, filter: string) => boolean {
    return (data: Cardetails, filter: string): boolean => {
      let searchTerms;
      try {
        searchTerms = JSON.parse(filter); // Parse the filter string as JSON
      } catch (e) {
        console.error('Error parsing filter JSON:', e);
        return false;
      }
  
      // Check if each field matches the search terms
      return (
        (!searchTerms.search || data.make?.toLowerCase().includes(searchTerms.search) ||
          data.model?.toLowerCase().includes(searchTerms.search) ||
          data.vin?.toLowerCase().includes(searchTerms.search) ||
          data.color?.toLowerCase().includes(searchTerms.search) ||
          data.status?.toLowerCase().includes(searchTerms.search) ||
          data.procure_date?.toLowerCase().includes(searchTerms.search)) &&
        (!searchTerms.status || data.status?.toLowerCase() === searchTerms.status) &&
        (!searchTerms.make || data.make?.toLowerCase() === searchTerms.make) &&
        (!searchTerms.model || data.model?.toLowerCase() === searchTerms.model)
      );
    };
  }

  private loadCars(): void {
    this.loading = true;
    this.http.get<any>('https://carrental-0zt3.onrender.com/api/cars').subscribe({
      next: (response) => {
        this.cars.data = response.data;
        const statusSet = new Set<string>();
        const makeSet = new Set<string>();
        const modelSet = new Set<string>();

        this.cars.data.forEach((data: Cardetails) => {
          statusSet.add(data.status);
          makeSet.add(data.make);
          modelSet.add(data.model);
        });

        this.statusOptions = Array.from(statusSet);
        this.makeOptions = Array.from(makeSet);
        this.modelOptions = Array.from(modelSet);
        this.loading = false;
             // Assign paginator after data is loaded
             if (this.paginator) {
              this.cars.paginator = this.paginator;
              console.log('Paginator assigned:', this.paginator);
            } else {
              console.error('Paginator is not available');
            }
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
    this.filterValues.vin = filterValue.trim().toLowerCase();
    this.cars.filter = JSON.stringify(this.filterValues);
  }
  applyStatusFilter(event: any): void {
   // const filterValue = event.value;
   // this.filterValues.status = filterValue.trim().toLowerCase();
    this.cars.filter = JSON.stringify(this.filterValues);
  }

  applyMakeFilter(event: any): void {
   // const filterValue = event.value;
   // this.filterValues.make = filterValue.trim().toLowerCase();
    this.cars.filter = JSON.stringify(this.filterValues);
  }

  applyModelFilter(event: any): void {
   // const filterValue = event.value;
   // this.filterValues.model = filterValue.trim().toLowerCase();
    this.cars.filter = JSON.stringify(this.filterValues);
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

  
  onEdit(car: Cardetails, additionalText: string): void {
    this.router.navigate(['/car-form', car.car_id], { queryParams: { text: additionalText } });
  }

  onDelete(car: Cardetails): void {
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
    this.router.navigate(['/rent', car.car_id], 
      { queryParams: { text: 'rent' } }
    );
  }
  clearVinFilter(): void {
    this.filterValues.vin = '';
    this.cars.filter = JSON.stringify(this.filterValues);
  }

  addNewCar(): void {
    this.router.navigate(['/addCar'], { queryParams: { text: 'Add' } });

  }
}