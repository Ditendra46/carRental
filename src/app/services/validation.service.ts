import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  getErrorMessage(control: AbstractControl | null, fieldName: string): string {
    if (!control || !control.errors) return '';

    const errors = control.errors;
    
    if (errors['required']) {
      return `${this.formatFieldName(fieldName)} is required`;
    }
    if (errors['maxlength']) {
      const maxLength = errors['maxlength'].requiredLength;
      return `${this.formatFieldName(fieldName)} cannot exceed ${maxLength} characters`;
    }
    if (errors['pattern']) {
      if (fieldName === 'phone_no' || fieldName === 'referr_phno') {
        return 'Phone number format should be: XXX-XXX-XXXX';
      }
      if (fieldName === 'zipcd') {
        return 'Zip code must be 5 digits';
      }
    }
    if (errors['email']) {
      return 'Invalid email format';
    }
    
    return '';
  }

  private formatFieldName(key: string): string {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}