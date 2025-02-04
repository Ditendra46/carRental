import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  products: any[] = []
value='backend/src/assets/product-1737751550734.png'
  constructor(private productService: ProductService, private router: Router) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe(data => {
      this.products = data;
    });
  }

  addToCart(productId: number): void {
    // Logic to add the product to the cart
    console.log(`Product with ID ${productId} added to cart.`);
  }

  rentCar(licensePlate: string, event: Event) {
    event.stopPropagation(); // Prevent the click event from bubbling up
    console.log(`Renting car with license plate: ${licensePlate}`);
    this.router.navigate(['/booking', licensePlate]); // Navigate to booking with license plate
}
goToSpecifications(car: any) {
  this.router.navigate(['/bike-dashboard']);//, car.license_plate]); // Navigate to specifications page
}
nanvigateToEditCar(lic_plate:string,event:any){
console.log(lic_plate,event)
this.router.navigate(['/edit-car', lic_plate]);
}
} 