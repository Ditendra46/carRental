import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BikesComponent } from './components/bikes/bikes.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HttpClientModule } from '@angular/common/http';
import { ProductsComponent } from './components/products/products.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { LoginComponent } from './login/login.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SignupComponent } from './signup/signup.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { MatIconModule } from '@angular/material/icon';
import { CarDetailsComponent } from './components/car-details/car-details.component';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { EditCarComponent } from './edit-car/edit-car.component';
import { MatDialogModule } from '@angular/material/dialog';
import { DeleteConfirmationComponent } from './delete-confirmation/delete-confirmation.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { BookingComponent } from './booking/booking.component';
import { CustomerFormComponent } from './customer-form/customer-form.component';
import { CarFormComponent } from './car-form/car-form.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { ValidationService } from './services/validation.service';
import { CarListComponent } from './car-list/car-list.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CustomerListComponent } from './customer-list/customer-list.component';
import { RentFormComponent } from './rent-form/rent-form.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { RentalListComponent } from './rental-list/rental-list.component';
import { MatTableModule } from '@angular/material/table';

@NgModule({
  declarations: [
    AppComponent,
    BikesComponent,
    DashboardComponent,
    ProductsComponent,
    LoginComponent,
    SignupComponent,
    NavBarComponent,
    CarDetailsComponent,
    EditCarComponent,
    DeleteConfirmationComponent,
    BookingComponent,
    CustomerFormComponent,
    CarFormComponent,
    ConfirmationDialogComponent,
    CarListComponent,
    CustomerListComponent,
    RentFormComponent,
    RentalListComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatIconModule,
    MatOptionModule,
    MatSelectModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSidenavModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    MatTableModule
  ],
  providers: [ValidationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
