import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { Cardetails } from '../interfaces/Cardetails.interface';
import { Car } from '../interfaces/Car.interface';
import { Router } from '@angular/router';
import { environment } from 'src/environment';
import { LoaderService } from '../shared/loader.service';



@Component({
  selector: 'app-car-list',
  templateUrl: './car-list.component.html',
  styleUrls: ['./car-list.component.scss']
})
export class CarListComponent implements OnInit {
  cars: Cardetails[] = [];
  loading = true;
  error = '';

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    public router: Router,
    public loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    this.loadCars();
    this.loaderService.isLoading$.subscribe((loading) => {
      this.loading = false;
    })
  }

  private loadCars(): void {
    this.loading = false;
    this.http.get<any>(`${environment.apiBaseUrl}/cars`).subscribe({
      next: (response) => {
        this.cars = response.data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load cars';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  onEdit(car: Cardetails): void {
    this.router.navigate(['/car-form', car.car_id]);
    // Add edit functionality
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
        this.http.delete(`${environment.apiBaseUrl}/cars/${car.car_id}`).subscribe({
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
  onRent(car: Car): void {
    this.router.navigate(['/rent', car.car_id], {
      state: { car: car }
    });
  }
}