// src/app/login/login.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { UserService } from '../user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private userService: UserService, private router: Router) {}

  onSubmit() {
    const credentials = {
      email: this.email,
      password: this.password,
    };

    this.userService.login(credentials).subscribe({
      next:response => {
        // Store user data in local storage or handle session
        localStorage.setItem('user', JSON.stringify(response));
        this.userService.updateUser(response.username)
        this.router.navigate(['/']); // Redirect to home page
      },
      error:error => {
        console.error('Error logging in', error);
      }
    }
    );
  }
}