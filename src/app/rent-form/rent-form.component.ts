import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { concatMap, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-rent-form',
  templateUrl: './rent-form.component.html',
  styleUrls: ['./rent-form.component.scss']
})
export class RentFormComponent implements OnInit {
  rentForm!: FormGroup;
  carId: string | null = null;
  filteredPhoneNumbers: String[] = [];
  additionalText: string | null='';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['carId']) {
        let car = +params['carId'];
        console.log('Car data received:', car); // Log car data for debugging
        this.carId = car.toString();
        console.log('Car ID:', this.carId);
        this.loadCarData(car); // Log car ID for debugging
      } else {
        console.error('No car data received');
      }
    });
    this.route.queryParamMap.subscribe(params => {
      this.additionalText = params.get('text');
    });
    if (this.additionalText === 'edit') {
      this.rentForm.enable();
    } else {
      this.rentForm.disable();
    }
  }

  private loadCarData(id: number | null): void {
    this.http.get(`https://carrental-0zt3.onrender.com/api/cars/${id}`).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.rentForm.patchValue({
            carDtaForm: {
              vin: response.data.vin, // Assuming inventory_id is the VIN from car data
              model: response.data.model,
              color: response.data.color,
              make: response.data.make
            },
            rentalDetailsForm: {
              inventory_id: response.data.car_id_formatted, // Assuming inventory_id is the VIN from car data
            }
          });
        }
      },
      error: (error) => console.error('Error loading car:', error)
    });
    this.rentForm.get('phNo')?.valueChanges.pipe(
      debounceTime(1000),
      distinctUntilChanged(),
      switchMap(value => this.searchPhoneNumbers(value))
    ).subscribe(phoneNumbers => {
      this.filteredPhoneNumbers = phoneNumbers;
    });
  }

  private initForm(): void {
    this.rentForm = this.fb.group({
      carDtaForm: this.fb.group({
        vin: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
        model: ['', [Validators.required, Validators.maxLength(50)]],
        make: ['', [Validators.required, Validators.maxLength(50)]],
        color: ['', [Validators.required, Validators.maxLength(30)]],
      }),
      userData: this.fb.group({
        phNo: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
        name: ['', [Validators.required, Validators.maxLength(50)]],
        dlNumber: ['', [Validators.required, Validators.maxLength(30)]],
      }),
      rentalDetailsForm: this.fb.group({
        inventory_id: ['', Validators.required],
        customer_id: ['', Validators.required],
        ins_company: ['', [Validators.required, Validators.maxLength(50)]],
        ins_policy_no: ['', [Validators.required, Validators.maxLength(30)]],
        ins_expiry_dt: ['', Validators.required],
        start_date: ['', Validators.required],
        end_date: ['', Validators.required],
        rate: ['', [Validators.required, Validators.min(0)]],
        discount: [0, [Validators.min(0), Validators.max(100)]],
        pay_method: ['', Validators.required],
        adv_amnt: [0, Validators.min(0)],
        ref_amnt: [0, Validators.min(0)],
        ref_name: ['', Validators.maxLength(50)],
        ref_ph: ['', [Validators.maxLength(15), Validators.pattern(/^\d{3}-\d{3}-\d{4}$/)]],
      })
    });
  }

  get carDetailsForm(): FormGroup {
    return this.rentForm.get('carDtaForm') as FormGroup;
  }

  get rentalDetailsForm(): FormGroup {
    return this.rentForm.get('rentalDetailsForm') as FormGroup;
  }

  get userData(): FormGroup {
    return this.rentForm.get('userData') as FormGroup;
  }

  onSubmit(): void {
    if (this.rentForm.valid) {
      this.http.post('https://carrental-0zt3.onrender.com/api/rentals', [this.userData.value, this.rentalDetailsForm.value, this.carDetailsForm.value]).pipe(
        concatMap((response: any) => {
          if (response.success) {
            const invId = response.data[0].inventory_id;
            console.log(invId);
            return this.http.put(`https://carrental-0zt3.onrender.com/api/cars/updateStatus/${invId}`, {});
          } else {
            throw new Error('Failed to create rental');
          }
        })
      ).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.router.navigate(['/car-list']);
          }
        },
        error: (error) => console.error('Error:', error)
      });
    }
  }

  onPhoneNumberInput(): void {
    const phoneNumber = this.userData.get('phNo')?.value;
    if (phoneNumber && phoneNumber.length >= 3) {
      this.filteredPhoneNumbers = [];
      this.searchPhoneNumbers(phoneNumber)?.subscribe(usersdata => {
        console.log(usersdata);
        usersdata.forEach((data: any) => {
          this.filteredPhoneNumbers.push(data.phone_no);
        });
      });
    }
  }

  private searchPhoneNumbers(query: string): Observable<any> {
    return this.http.get<{ success: boolean, data: string[] }>(`https://carrental-0zt3.onrender.com/api/customers/phone-number/${query}`)
      .pipe(
        map(response => response.data)
      );
  }

  onPhoneNumberSelected(phoneNumber: string): void {
    this.http.get<{ success: boolean, data: any[] }>(`https://carrental-0zt3.onrender.com/api/customers/phone-number/${phoneNumber}`)
      .subscribe(response => {
        if (response.success && response.data.length === 1) {
          const customer = response.data[0];
          console.log(response.data.map((element: any) => element.dl_no));
          this.rentForm.patchValue({
            userData: {
              name: customer.name,
              email: customer.email_id,
              dlNumber: customer.dl_no,
            },
            rentalDetailsForm: {
              customer_id: customer.customer_id_formatted
            }
          });
        } else {
          console.error('Multiple or no customers found');
        }
      });
  }
}