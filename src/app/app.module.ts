import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BikesComponent } from './components/bikes/bikes.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
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
//import { CarListComponent } from './car-list/car-list.component';
//import { CustomerListComponent } from './customer-list/customer-list.component';
import { RentFormComponent } from './rent-form/rent-form.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { RentalListComponent } from './rental-list/rental-list.component';
import { MatTableModule } from '@angular/material/table';
import { CarListComponent } from './car-list-new/car-list.component';
import { CustomerListComponent } from './customer-list-new/customer-list.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RentalCarDashboardComponent } from './rental-car-dashboard/rental-car-dashboard.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { PaymentFormComponent } from './/payment-form/payment-form.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatChipsModule } from '@angular/material/chips';
import { PaymentListComponent } from './payment-list/payment-list.component';
import { PaymentLinkingComponent } from './payment-linking/payment-linking.component';
import { LoaderComponent } from './shared/loader/loader.component';import { HttpLoaderInterceptor } from './shared/http-loader.interceptor';
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
    RentalListComponent,
    RentalCarDashboardComponent,
    PaymentFormComponent,
    PaymentListComponent,
    PaymentLinkingComponent,
    LoaderComponent,
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
    MatTableModule,
    MatDividerModule,
    MatListModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatRadioModule ,
    MatChipsModule
  ],
  
  providers: [ValidationService,
    {provide:HTTP_INTERCEPTORS,useClass:HttpLoaderInterceptor,multi:true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
