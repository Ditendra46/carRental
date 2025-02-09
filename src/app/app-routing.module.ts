import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BikesComponent } from './components/bikes/bikes.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProductCreateComponent } from './components/product-create/product-create.component';
import { ProductsComponent } from './components/products/products.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { CarDetailsComponent } from './components/car-details/car-details.component';
import { EditCarComponent } from './edit-car/edit-car.component';
import { BookingComponent } from './booking/booking.component';
import { CustomerFormComponent } from './customer-form/customer-form.component';
import { CarFormComponent } from './car-form/car-form.component';
import { CarListComponent } from './car-list/car-list.component';
import { CustomerListComponent } from './customer-list/customer-list.component';
import { RentFormComponent } from './rent-form/rent-form.component';
import { RentalListComponent } from './rental-list/rental-list.component';
const routes: Routes = [
  {path:'',children:[
    {path:'',component:ProductsComponent},
    {path:'login',component:LoginComponent},
    {path:'bike-dashboard',component:DashboardComponent},
    {path:'product-create',component:ProductCreateComponent},
    { path: 'signup', component: SignupComponent },
    { path: 'car-details', component: CarDetailsComponent },
    { path: 'edit-car/:licensePlate', component: EditCarComponent }, 
    { path: 'booking/:licensePlate', component: BookingComponent },
    { path: 'customer-form', component: CustomerFormComponent },
    { path: 'car-form', component: CarFormComponent},
    {path:'car-list',component:CarListComponent},
    { path: 'customers/add', component: CustomerFormComponent },
    { path: 'cars/add', component: CarFormComponent },
    { path: 'car-form/:id', component: CarFormComponent },
    { path: 'customers', component: CustomerListComponent },
    { path: 'customer-form/:id', component: CustomerFormComponent },
    { path: 'rent/:carId', component: RentFormComponent },
    { path: 'rental-list', component: RentalListComponent}
  ]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
