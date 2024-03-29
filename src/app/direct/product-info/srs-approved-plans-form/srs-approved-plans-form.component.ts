import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbDateParserFormatter, NgbDatepickerConfig, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import { ErrorModalComponent } from './../../../shared/modal/error-modal/error-modal.component';
import { NgbDateCustomParserFormatter } from './../../../shared/utils/ngb-date-custom-parser-formatter';
import { DirectService } from './../../direct.service';
import { Subscription } from 'rxjs';
import { SRS_APPROVED_PLANS_CONST } from '../../direct.constants';

@Component({
  selector: 'app-srs-approved-plans-form',
  templateUrl: './srs-approved-plans-form.component.html',
  styleUrls: ['./srs-approved-plans-form.component.scss'],
  providers: [{ provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter }],
  encapsulation: ViewEncapsulation.None
})
export class SrsApprovedPlansFormComponent implements OnInit, OnDestroy {
  @Output() formSubmitted: EventEmitter<any> = new EventEmitter();
  categorySub: any;
  modalRef: NgbModalRef;
  srsApprovedPlansForm: FormGroup;
  formValues: any;
  payoutStartAge = '';
  singlePremium = '';
  age;
  payoutStartAgeList = SRS_APPROVED_PLANS_CONST.PAYOUT_AGE_LIST;
  singlePremiumAmountList = SRS_APPROVED_PLANS_CONST.PREMIUM_AMOUNT_LIST;
  payoutTypeList;
  payoutType;
  doberror = false;

  dpMinDate;
  dpMaxDate;
  private userInfoSubscription: Subscription;
  radioLabelValue = [];
  defaultRadioStyleClass = 'direct-form-btn--radio btn';

  constructor(
    private directService: DirectService, private modal: NgbModal, private translate: TranslateService,
    private formBuilder: FormBuilder, private config: NgbDatepickerConfig) {
    const today: Date = new Date();
    this.dpMinDate = { year: (today.getFullYear() - 100), month: (today.getMonth() + 1), day: today.getDate() };
    this.dpMaxDate = { year: today.getFullYear(), month: (today.getMonth() + 1), day: today.getDate() };
    config.outsideDays = 'collapsed';
    this.translate.use('en');
    this.translate.get('COMMON').subscribe((result: string) => {
      this.payoutTypeList = this.translate.instant('SRS_SELECTED_PLANS.SINGLE_PREMIUM_LIST');
      this.payoutType = '';
      this.radioLabelValue = [{
        name: this.translate.instant('COMMON.LBL_MALE'),
        value: this.translate.instant('COMMON.LBL_MALE_VALUE')
      }, {
        name: this.translate.instant('COMMON.LBL_FEMALE'),
        value: this.translate.instant('COMMON.LBL_FEMALE_VALUE')
      }];
    });
  }

  ngOnInit() {
    /* Building the form */
    this.formValues = this.directService.getSrsApprovedPlansForm();
    this.formValues.singlePremium = this.formValues.singlePremium ? this.formValues.singlePremium : '';
    this.singlePremium = this.formValues.singlePremium;
    this.srsApprovedPlansForm = this.formBuilder.group({
      gender: [this.formValues.gender, Validators.required],
      dob: [this.formValues.dob, Validators.required],
      singlePremium: [this.formValues.singlePremium, Validators.required],
      payoutStartAge: [this.formValues.payoutStartAge, Validators.required],
      // payoutType: [this.formValues.payoutType, Validators.required]
    });
    if (this.formValues.payoutType !== undefined) {
      this.selectPayoutType(this.formValues.payoutType);
    }
    if (this.formValues.payoutStartAge !== undefined) {
      this.selectPayoutStartAge(this.formValues.payoutStartAge);
    }
    this.categorySub = this.directService.searchBtnTrigger.subscribe((data) => {
      if (data !== '' && data === '8') {
        if (this.save()) {
          this.formSubmitted.emit(this.summarizeDetails());
          this.directService.setMinProdInfo(this.summarizeDetails());
        }
      }
    });
    this.userInfoSubscription = this.directService.userInfoSet.subscribe((data) => {
      this.srsApprovedPlansForm.controls.gender.setValue(data['gender']);
      if (data['dob']) {
        this.srsApprovedPlansForm.controls.dob.setValue(data['dob']);
      }
    });
  }

  onGenderChange() {
    const userInfo = this.directService.getUserInfo();
    userInfo.gender = this.srsApprovedPlansForm.controls.gender.value;
    this.directService.updateUserInfo(userInfo);
  }

  onDobChange() {
    if (this.srsApprovedPlansForm.controls.dob.valid) {
      const userInfo = this.directService.getUserInfo();
      userInfo.dob = this.srsApprovedPlansForm.controls.dob.value;
      this.directService.updateUserInfo(userInfo);
    }
  }

  ngOnDestroy(): void {
    this.categorySub.unsubscribe();
    this.userInfoSubscription.unsubscribe();
  }
  calculate_age(dob) {
    const diff_ms = Date.now() - dob.getTime();
    const age_dt = new Date(diff_ms);
    return Math.abs(age_dt.getUTCFullYear() - 1970);
  }
  getAge() {
    const year = this.srsApprovedPlansForm.controls.dob.value.year;
    const month = this.srsApprovedPlansForm.controls.dob.value.month;
    const day = this.srsApprovedPlansForm.controls.dob.value.day;
    this.age = this.calculate_age(new Date(year, month, day));
  }
  selectPayoutStartAge(payoutStartAge) {
    this.payoutStartAge = payoutStartAge;
    this.srsApprovedPlansForm.controls.payoutStartAge.setValue(this.payoutStartAge);
  }
  selectSinglePremiumAmount(amount) {
    this.singlePremium = amount;
    this.srsApprovedPlansForm.controls.singlePremium.setValue(this.singlePremium);
  }
  dobErrorModal() {
    const ref = this.modal.open(ErrorModalComponent, { centered: true });
    ref.componentInstance.errorTitle = 'Invalid Payout age';
    ref.componentInstance.errorMessage = 'Payout age must be greater than the current age of the user';
    return false;
  }
  selectPayoutType(payoutType) {
    this.payoutType = payoutType;
    this.srsApprovedPlansForm.controls.payoutType.setValue(this.payoutType);
  }

  summarizeDetails() {
    let sum_string = '';
    sum_string += this.translate.instant('CRITICAL_ILLNESS.COVERAGE_AMT.DOLLAR') + this.srsApprovedPlansForm.value.singlePremium + ', ';
    sum_string += 'Payout Age of ' + this.payoutStartAge;
    return sum_string;
  }

  save() {
    const form = this.srsApprovedPlansForm;
    if (form.controls.singlePremium.value < 1 || isNaN(form.controls.singlePremium.value)) {
      form.controls['singlePremium'].setErrors({ required: true });
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
    this.getAge();
    if (this.age >= form.controls.payoutStartAge.value) {
      this.dobErrorModal();
      return false;
    }
    this.directService.setSrsApprovedPlansForm(form.value);
    return true;
  }
}
