import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditInvestmentModalComponent } from './edit-investment-modal.component';

describe('EditInvestmentModalComponent', () => {
  let component: EditInvestmentModalComponent;
  let fixture: ComponentFixture<EditInvestmentModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditInvestmentModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditInvestmentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
