// src/app/user.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userSource = new BehaviorSubject<string | null>(null);
  currentUser = this.userSource.asObservable();

  private apiUrl = `${environment.apiBaseUrl}`;

  constructor(private http: HttpClient) {   // Load user from local storage if available
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      this.userSource.next(parsedUser.username); // Set the initial username
    }
  }

  updateUser(username: string | null) {
    this.userSource.next(username);
  }
  

  signUp(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }
logOutUser(){
    this.userSource.next(null);
}
updateCar(licensePlate: string, carData: any): Observable<any> {
  return this.http.put(`${environment.apiBaseUrl}/cars/${licensePlate}`, carData);
}
deleteCar(licensePlate: string): Observable<any> {
  return this.http.delete(`${environment.apiBaseUrl}/cars/${licensePlate}`);
}
getCars():Observable<any[]>{
  return this.http.get<any[]>('http://localhost:3000/api/products')
}
}