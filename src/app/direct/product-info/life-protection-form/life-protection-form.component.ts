import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbDateParserFormatter, NgbDatepickerConfig, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ErrorModalComponent } from './../../../shared/modal/error-modal/error-modal.component';
import { NgbDateCustomParserFormatter } from './../../../shared/utils/ngb-date-custom-parser-formatter';
import { DirectService } from './../../direct.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-life-protection-form',
  templateUrl: './life-protection-form.component.html',
  styleUrls: ['./life-protection-form.component.scss'],
  providers: [{ provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter }],
  encapsulation: ViewEncapsulation.None
})
export class LifeProtectionFormComponent implements OnInit, OnDestroy {
  @Output() formSubmitted: EventEmitter<any> = new EventEmitter();
  dobValue;
  categorySub: any;
  modalRef: NgbModalRef;
  lifeProtectionForm: FormGroup;
  formValues: any;
  coverage_amt = '';
  ci_coverage_amt = '';
  duration = '';
  doberror = false;
  isEarlyDisabled = true;

  coverageAmtValuesTemp: number[] = Array(10).fill(100000).map((x, i) => x += i * 100000);
  coverageAmtValues = Array(12);
  ciCoverageAmtValues = [];
  durationValues = ['5 Years', '10 Years', 'Till Age 55',
    'Till Age 60', 'Till Age 65', 'Till Age 70',
    'Whole Life', 'Whole life w/Multiplier'];
  minDate;
  maxDate;

  private userInfoSubscription: Subscription;
  radioLabelValue = [];
  radioLabelValueIsEarlyCI = [];
  defaultRadioStyleClass = 'direct-form-btn--radio btn';

  constructor(
    private directService: DirectService, private modal: NgbModal,
    private translate: TranslateService,
    private formBuilder: FormBuilder, private config: NgbDatepickerConfig) {
    const today: Date = new Date();
    this.minDate = { year: (today.getFullYear() - 100), month: (today.getMonth() + 1), day: today.getDate() };
    this.maxDate = { year: today.getFullYear(), month: (today.getMonth() + 1), day: today.getDate() };
    config.outsideDays = 'collapsed';
    this.translate.use('en');
    this.translate.get('COMMON').subscribe((result: string) => {
      this.radioLabelValue = [{
        name: this.translate.instant('COMMON.LBL_MALE'),
        value: this.translate.instant('COMMON.LBL_MALE_VALUE')
      }, {
        name: this.translate.instant('COMMON.LBL_FEMALE'),
        value: this.translate.instant('COMMON.LBL_FEMALE_VALUE')
      }];
      this.radioLabelValueIsEarlyCI = [{
        name: this.translate.instant('COMMON.LBL_YES'),
        value: this.translate.instant('COMMON.LBL_YES_VALUE')
      }, {
        name: this.translate.instant('COMMON.LBL_NO'),
        value: this.translate.instant('COMMON.LBL_NO_VALUE')
      }];
    });
    this.coverageAmtValuesTemp.push(1500000);
    this.coverageAmtValuesTemp.push(2000000);
  }

  ngOnInit() {
    /* Building the form */
    this.coverageAmtValuesTemp.forEach((element, index) => {
      this.coverageAmtValues[index] = this.directService.convertToCurrency(element);
    });
    const ciAdditionalValue = [50000];

    const ciCoverageAmtValuesTemp = ciAdditionalValue.concat(this.coverageAmtValuesTemp);
    ciCoverageAmtValuesTemp.forEach((element, index) => {
      this.ciCoverageAmtValues[index] = this.directService.convertToCurrency(element);
    });
    this.formValues = JSON.parse(JSON.stringify(this.directService.getLifeProtectionForm()));
    this.formValues.gender = this.formValues.gender;
    this.formValues.smoker = this.formValues.smoker;
    this.formValues.premiumWaiver = this.formValues.premiumWaiver;
    if (this.formValues.premiumWaiver !== undefined) {
      this.formValues.premiumWaiver = this.formValues.premiumWaiver === true ? 'yes' : 'no';
    }
    if (this.formValues.isEarlyCI !== undefined) {
      this.formValues.premiumWaiver = this.formValues.premiumWaiver === true ? 'yes' : 'no';
    }

    this.lifeProtectionForm = this.formBuilder.group({
      gender: [this.formValues.gender, Validators.required],
      dob: [this.formValues.dob, Validators.required],
      smoker: [this.formValues.smoker],
      coverageAmt: [this.formValues.coverageAmt, Validators.required],
      duration: [this.formValues.duration, Validators.required],
      premiumWaiver: [false],
      ciCoverageAmount: [this.formValues.ciCoverageAmount],
      isEarlyCI: [this.formValues.isEarlyCI],
    });

    if (this.formValues.duration !== undefined) {
      this.selectDuration(this.formValues.duration);
    }
    if (this.formValues.coverageAmt !== undefined) {
      this.selectCoverageAmt(this.formValues.coverageAmt);
    }
    if (this.formValues.ciCoverageAmount !== undefined) {
      this.selectCICoverageAmt(this.formValues.ciCoverageAmount);
    }

    this.categorySub = this.directService.searchBtnTrigger.subscribe((data) => {
      if (data !== '' && data === '1') {
        if (this.save()) {
          this.formSubmitted.emit(this.summarizeDetails());
          this.directService.setMinProdInfo(this.summarizeDetails());
        }
      }
    });

    this.userInfoSubscription = this.directService.userInfoSet.subscribe((data) => {
      this.lifeProtectionForm.controls.gender.setValue(data['gender']);
      if (data['dob']) {
        this.lifeProtectionForm.controls.dob.setValue(data['dob']);
      }
    });
  }

  onGenderChange() {
    const userInfo = this.directService.getUserInfo();
    userInfo.gender = this.lifeProtectionForm.controls.gender.value;
    this.directService.updateUserInfo(userInfo);
  }

  onDobChange() {
    if (this.lifeProtectionForm.controls.dob.valid) {
      const userInfo = this.directService.getUserInfo();
      userInfo.dob = this.lifeProtectionForm.controls.dob.value;
      this.directService.updateUserInfo(userInfo);
    }
  }

  ngOnDestroy(): void {
    this.categorySub.unsubscribe();
    this.userInfoSubscription.unsubscribe();
  }

  selectCICoverageAmt(in_coverage_amt) {
    this.ci_coverage_amt = in_coverage_amt;
    this.lifeProtectionForm.controls.ciCoverageAmount.setValue(this.ci_coverage_amt);
    const isEarlyCIControl = this.lifeProtectionForm.controls.isEarlyCI;
    if (this.ci_coverage_amt === '') {
      this.durationValues = ['5 Years', '10 Years', 'Till Age 55',
        'Till Age 60', 'Till Age 65', 'Till Age 70',
        'Whole Life', 'Whole life w/Multiplier'];
      this.isEarlyDisabled = true;
      isEarlyCIControl.setValue('');
      isEarlyCIControl.setValidators([]);
      isEarlyCIControl.updateValueAndValidity();
    } else {
      this.durationValues = ['5 Years', '10 Years', 'Till Age 55',
        'Till Age 60', 'Till Age 65', 'Till Age 70'];
      this.isEarlyDisabled = false;
      if (this.duration === 'Whole Life' || this.duration === 'Whole life w/Multiplier') {
        this.duration = ''
        this.lifeProtectionForm.controls.duration.setValue(this.duration);
      }
      this.isEarlyDisabled = false;
      isEarlyCIControl.setValidators([Validators.required]);
      isEarlyCIControl.updateValueAndValidity();
    }

  }

  selectCoverageAmt(in_coverage_amt) {
    this.coverage_amt = in_coverage_amt;
    this.lifeProtectionForm.controls.coverageAmt.setValue(this.coverage_amt);
  }

  selectDuration(in_duration) {
    this.duration = in_duration;
    this.lifeProtectionForm.controls.duration.setValue(this.duration);
  }

  showPremiumWaiverModal() {
    this.directService.showToolTipModal(
      this.translate.instant('DIRECT_LIFE_PROTECTION.PREMIUM_WAIVER.TOOLTIP.TITLE'),
      this.translate.instant('DIRECT_LIFE_PROTECTION.PREMIUM_WAIVER.TOOLTIP.MESSAGE')
    );
  }

  summarizeDetails() {
    let sum_string = '';
    sum_string += this.translate.instant('DIRECT_LIFE_PROTECTION.COVERAGE_AMT.DOLLAR') + this.coverage_amt + ', ';
    sum_string += this.duration;
    if (this.lifeProtectionForm.value.premiumWaiver === true || this.lifeProtectionForm.value.premiumWaiver === 'yes') {
      sum_string += ', Premium Waiver Rider';
    }
    return sum_string;
  }

  save() {
    const form = this.lifeProtectionForm;
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
    form.value.coverageAmt = this.coverage_amt;
    form.value.ciCoverageAmount = this.ci_coverage_amt;
    form.value.duration = this.duration;
    const values = form.value;
    values.premiumWaiver = false;
    if (values.isEarlyCI) {
      values.isEarlyCI = (values.isEarlyCI === true || values.isEarlyCI === 'yes') ? true : false;
    }
    this.directService.setLifeProtectionForm(values);
    return true;
  }
  showToolTip(title, desc) {
    this.directService.showToolTipModal(
      this.translate.instant('TOOL_TIP.' + title),
      this.translate.instant('TOOL_TIP.' + desc)
    );
  }
}
