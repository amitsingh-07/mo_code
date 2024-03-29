import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EmailEnquirySuccessComponent } from './email-enquiry-success.component';

describe('EmailEnquirySuccessComponent', () => {
  let component: EmailEnquirySuccessComponent;
  let fixture: ComponentFixture<EmailEnquirySuccessComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailEnquirySuccessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailEnquirySuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
