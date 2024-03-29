import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsureAssessmentComponent } from './insure-assessment.component';

describe('InsureAssessmentComponent', () => {
  let component: InsureAssessmentComponent;
  let fixture: ComponentFixture<InsureAssessmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsureAssessmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsureAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should render step-title in a .p__step-title', async(() => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('.p__step-title').textContent).toContain('Step 2');
  }));
  it('should render start-title in a .p__start-title', async(() => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('.p__start-title').textContent).toContain('Insurance Needs Assessment');
  }));
  it('should render sub-title in a .p__start-sub-title', async(() => {
    const compiled = fixture.debugElement.nativeElement;
    // tslint:disable-next-line:max-line-length
    expect(compiled.querySelector('.p__start-sub-title').textContent).toContain('In the next step, we will ask you a few simple questions to assess your needs.');
  }));
  it('testing the proceed button', async(() => {
    spyOn(component, 'goNext');
    const button = fixture.debugElement.nativeElement.querySelector('button');
    button.click();
    fixture.whenStable().then(() => {
      expect(component.goNext).toHaveBeenCalled();
    });
  }));
});
