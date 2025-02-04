// src/app/signup/signup.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../user.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  constructor(private router: Router, private http: HttpClient,private userService: UserService) {}
  username = '';
  email = '';
  password = '';
  onSubmit() {
    const userData = {
      username: this.username,
      email: this.email,
      password: this.password,
    };

    this.userService.signUp(userData).subscribe(
      response => {
        console.log('User registered successfully', response);
        this.router.navigate(['/login']); // Redirect to login page
      },
      error => {
        console.error('Error registering user', error);
      }
    );
  }
}