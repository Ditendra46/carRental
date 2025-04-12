import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentLinkingComponent } from './payment-linking.component';

describe('PaymentLinkingComponent', () => {
  let component: PaymentLinkingComponent;
  let fixture: ComponentFixture<PaymentLinkingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PaymentLinkingComponent]
    });
    fixture = TestBed.createComponent(PaymentLinkingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
