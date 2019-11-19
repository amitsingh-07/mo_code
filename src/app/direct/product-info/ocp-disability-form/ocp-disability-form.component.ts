import {
  AfterViewInit,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbDateParserFormatter, NgbDatepickerConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NouisliderComponent } from 'ng2-nouislider';

import { ErrorModalComponent } from '../../../shared/modal/error-modal/error-modal.component';
import { NgbDateCustomParserFormatter } from '../../../shared/utils/ngb-date-custom-parser-formatter';
import { DirectService } from '../../direct.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ocp-disability-form',
  templateUrl: './ocp-disability-form.component.html',
  styleUrls: ['./ocp-disability-form.component.scss'],
  providers: [{ provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter }],
  encapsulation: ViewEncapsulation.None
})
export class OcpDisabilityFormComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() formSubmitted: EventEmitter<any> = new EventEmitter();
  defaultEmployee = '';
  categorySub: any;
  @ViewChild('ocpDisabilityFormSlider') ocpDisabilityFormSlider: NouisliderComponent;
  ocpDisabilityForm: FormGroup;
  formValues: any;
  employmentTypeList;
  duration = '';
  durationValues;
  coverageMax = 75;
  coveragePercent = 75;
  doberror = false;

  minDate;
  maxDate;
  private userInfoSubscription: Subscription;

  ciSliderConfig: any = {
    behaviour: 'snap',
    start: 0,
    connect: [true, false],
    format: {
      to: (value) => {
        return Math.round(value);
      },
      from: (value) => {
        return Math.round(value);
      }
    }
  };
  constructor(
    private directService: DirectService, private modal: NgbModal,
    private parserFormatter: NgbDateParserFormatter,
    private translate: TranslateService,
    private formBuilder: FormBuilder, private config: NgbDatepickerConfig) {
    const today: Date = new Date();
    this.minDate = { year: (today.getFullYear() - 100), month: (today.getMonth() + 1), day: today.getDate() };
    this.maxDate = { year: today.getFullYear(), month: (today.getMonth() + 1), day: today.getDate() };
    config.outsideDays = 'collapsed';
    this.translate.use('en');
    this.translate.get('COMMON').subscribe((result: string) => {
      this.employmentTypeList = this.translate.instant('OCCUPATIONAL_DISABILITY.EMPLOYMENT_TYPE_LIST');
      this.durationValues = this.translate.instant('OCCUPATIONAL_DISABILITY.DURATION_VALUES');
    });
  }

  ngOnInit() {
    this.formValues = this.directService.getOcpDisabilityForm();
    if (this.formValues.employmentType) {
      this.defaultEmployee = this.formValues.employmentType;
    }
    if (this.formValues.duration) {
      this.duration = this.formValues.duration;
    }
    this.ocpDisabilityForm = this.formBuilder.group({
      gender: [this.formValues.gender, Validators.required],
      dob: [this.formValues.dob, Validators.required],
      smoker: [this.formValues.smoker],
      employmentType: [this.defaultEmployee, Validators.required],
      monthlySalary: [this.formValues.monthlySalary, Validators.required],
      percentageCoverage: [this.formValues.percentageCoverage],
      duration: [this.formValues.duration, Validators.required]
    });

    this.categorySub = this.directService.searchBtnTrigger.subscribe((data) => {
      if (data !== '' && data === '3') {
        if (this.save()) {
          this.formSubmitted.emit(this.summarizeDetails());
          this.directService.setMinProdInfo(this.summarizeDetails());
        }
      }
    });
    this.userInfoSubscription = this.directService.userInfoSet.subscribe((data) => {
      this.ocpDisabilityForm.controls.gender.setValue(data['gender']);
      this.ocpDisabilityForm.controls.dob.setValue(data['dob']);
    });
  }

  onGenderChange() {
    const userInfo = this.directService.getUserInfo();
    userInfo.gender = this.ocpDisabilityForm.controls.gender.value;
    this.directService.updateUserInfo(userInfo);
  }

  onDobChange() {
    if (this.ocpDisabilityForm.controls.dob.valid) {
      const userInfo = this.directService.getUserInfo();
      userInfo.dob = this.ocpDisabilityForm.controls.dob.value;
      this.directService.updateUserInfo(userInfo);
    }
  }

  ngAfterViewInit() {
    if (this.formValues.employmentType !== undefined) {
      this.selectEmployeeType(this.formValues.employmentType, true);
    }
    if (this.formValues.duration !== undefined) {
      this.selectDuration(this.formValues.duration);
    }

    this.ocpDisabilityFormSlider.writeValue(this.coveragePercent);
  }

  ngOnDestroy(): void {
    this.categorySub.unsubscribe();
    this.userInfoSubscription.unsubscribe();
  }

  selectDuration(selectedDuration) {
    this.duration = selectedDuration;
    this.ocpDisabilityForm.controls.duration.setValue(this.duration);
  }

  onSliderChange(value) {
    this.coveragePercent = value;
  }

  selectEmployeeType(status, setSlider) {
    this.defaultEmployee = status;
    this.coverageMax = this.defaultEmployee === 'Salaried' ? 75 : 65;
    this.ocpDisabilityForm.controls.employmentType.setValue(this.defaultEmployee);
    if (setSlider) {
      this.setSliderValues(this.coverageMax);
    }
  }

  setSliderValues(value) {
    this.coveragePercent = value;
    this.onSliderChange(value);
    this.ocpDisabilityFormSlider.writeValue(value);
    this.ocpDisabilityFormSlider.slider.updateOptions({ range: { min: 0, max: value } });
  }

  summarizeDetails() {
    let sum_string = '';
    let monthlySalaryValue = this.ocpDisabilityForm.controls['monthlySalary'].value;
    if (!monthlySalaryValue) {
      monthlySalaryValue = 0;
    }
    sum_string += '$' + (monthlySalaryValue * this.coveragePercent / 100) + ' / mth, ';
    sum_string += this.duration;
    return sum_string;
  }

  save() {
    const form = this.ocpDisabilityForm;
    if (form.controls.monthlySalary.value < 1
      || isNaN(form.controls.monthlySalary.value)) {
      form.controls['monthlySalary'].setErrors({ required: true });
    }
    if (!form.valid) {
      Object.keys(form.controls).forEach((key) => {
        form.get(key).markAsDirty();
      });
      if (!form.controls['dob'].valid && form.controls['gender'].valid) {
        this.doberror = true;
      }
      const ref = this.modal.open(ErrorModalComponent, { centered: true });
      ref.componentInstance.errorTitle = this.directService.currentFormError(form)['errorTitle'];
      ref.componentInstance.errorMessage = this.directService.currentFormError(form)['errorMessage'];
      return false;
    }
    form.value.smoker = 'nonsmoker';
    form.value.employmentType = this.defaultEmployee;
    form.value.duration = this.duration;
    form.value.percentageCoverage = this.coveragePercent;
    this.directService.setOcpDisabilityForm(form.value);
    return true;
  }

}
