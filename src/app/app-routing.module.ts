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
    { path: 'car-form', component: CarFormComponent}
  ]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
