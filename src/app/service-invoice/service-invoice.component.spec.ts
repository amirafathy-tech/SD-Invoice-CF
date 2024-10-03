import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceInvoiceComponent } from './service-invoice.component';

describe('ServiceInvoiceComponent', () => {
  let component: ServiceInvoiceComponent;
  let fixture: ComponentFixture<ServiceInvoiceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ServiceInvoiceComponent]
    });
    fixture = TestBed.createComponent(ServiceInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
