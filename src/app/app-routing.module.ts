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
//import { CarListComponent } from './car-list/car-list.component';
//import { CustomerListComponent } from './customer-list/customer-list.component';
import { RentFormComponent } from './rent-form/rent-form.component';
import { RentalListComponent } from './rental-list/rental-list.component';
import { CarListComponent } from './car-list-new/car-list.component';
import { CustomerListComponent } from './customer-list-new/customer-list.component';
import { RentalCarDashboardComponent } from './rental-car-dashboard/rental-car-dashboard.component';
import { PaymentFormComponent } from './payment-form/payment-form.component';
import { PaymentListComponent } from './payment-list/payment-list.component';
import { PaymentLinkingComponent } from './payment-linking/payment-linking.component';
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
    { path: 'addcustomers', component: CustomerFormComponent },
    { path: 'addCar', component: CarFormComponent },
    { path: 'car-form/:id', component: CarFormComponent },
    { path: 'customers', component: CustomerListComponent },
    { path: 'customer-form/:id', component: CustomerFormComponent },
    { path: 'rent/:carId', component: RentFormComponent },
    { path: 'rental-list', component: RentalListComponent},
    { path: 'rental-dashboard', component: RentalCarDashboardComponent},
    {path:'payment-form',component:PaymentFormComponent},
    {path:'payment-list',component:PaymentListComponent},
    {path:'payment-link',component:PaymentLinkingComponent},
    {path:'payment-link/:cus_id',component:PaymentLinkingComponent}


  ]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
