import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-product-create',
  templateUrl: './product-create.component.html',
  styleUrls: ['./product-create.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule]
})
export class ProductCreateComponent {
  product = {
    name: '',
    description: '',
    price: 0,
    category: '',
    image: null as File | null
  };

  previewUrl: string | null = null;
  created: boolean=false;

  constructor(private http: HttpClient) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    this.product.image = file;
    this.previewUrl = URL.createObjectURL(file);
  }

  onSubmit() {
    const formData = new FormData();
    formData.append('name', this.product.name);
    formData.append('description', this.product.description);
    formData.append('price', this.product.price.toString());
    formData.append('category', this.product.category);
    if (this.product.image) {
      formData.append('image', this.product.image);
    }

    this.http.post('http://localhost:3000/api/products', formData)
      .subscribe({
        next: (response) => {
          console.log('Product created successfully', response);
          // Reset form or navigate away
        },
        error: (error) => {
          console.error('Error creating product', error);
        }
      });
      this.created=true
  }
} 