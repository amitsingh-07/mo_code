import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbDateParserFormatter, NgbDatepickerConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import { ErrorModalComponent } from '../../../shared/modal/error-modal/error-modal.component';
import { NgbDateCustomParserFormatter } from '../../../shared/utils/ngb-date-custom-parser-formatter';
import { DirectService } from '../../direct.service';
import { Subscription } from 'rxjs';
import { RETIREMENT_INCOME_CONST } from '../../direct.constants';

@Component({
  selector: 'app-retirement-income-form',
  templateUrl: './retirement-income-form.component.html',
  styleUrls: ['./retirement-income-form.component.scss'],
  providers: [{ provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter }],
  encapsulation: ViewEncapsulation.None
})
export class RetirementIncomeFormComponent implements OnInit, OnDestroy {
  @Output() formSubmitted: EventEmitter<any> = new EventEmitter();
  retirementIncomeForm: FormGroup;
  categorySub: any;
  formValues: any;
  payoutFeature = '';
  payoutDuration = '';
  retirementIncomeList = Array(11).fill(500).map((x, i) => x += i * 100);
  selectedRetirementIncome = '';
  payoutAgeList = RETIREMENT_INCOME_CONST.PAYOUT_AGE_LIST;
  selectedPayoutAge = '';
  payoutFeatureList;
  doberror = false;
  premiumDuration = '';
  premiumDurationList = RETIREMENT_INCOME_CONST.PREMIUM_DURATION_LIST;
  payoutDurationList = RETIREMENT_INCOME_CONST.PAYOUT_DURATION_LIST;

  minDate;
  maxDate;
  private userInfoSubscription: Subscription;
  radioLabelValue = [];
  defaultRadioStyleClass: any;

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
      this.payoutFeatureList = this.translate.instant('RETIREMENT_INCOME.PAYOUT_FEATURE_LIST');
      this.radioLabelValue = [{
        name: this.translate.instant('COMMON.LBL_MALE'),
        value: 'male',
      }, {
        name: this.translate.instant('COMMON.LBL_FEMALE'),
        value: 'female'
      }];
      this.defaultRadioStyleClass = 'direct-form-btn--radio btn';
    });
  }

  ngOnInit() {
    this.formValues = this.directService.getRetirementIncomeForm();
    this.formValues.smoker = this.formValues.smoker;

    this.retirementIncomeForm = this.formBuilder.group({
      gender: [this.formValues.gender, Validators.required],
      dob: [this.formValues.dob, Validators.required],
      smoker: [this.formValues.smoker],
      retirementIncome: [this.formValues.retirementIncome, Validators.required],
      payoutAge: [this.formValues.payoutAge, Validators.required],
      payoutDuration: [this.formValues.payoutDuration, Validators.required],
      payoutFeature: [this.formValues.payoutFeature, Validators.required],
      premiumDuration: [this.formValues.premiumDuration, Validators.required]
    });
    if (this.formValues.retirementIncome !== undefined && this.formValues.retirementIncome !== '') {
      this.selectRetirementIncome(this.formValues.retirementIncome);
    } else {
      this.selectRetirementIncome(RETIREMENT_INCOME_CONST.DEFAULT_VALUES.RETIREMENT_INCOME);
    }
    if (this.formValues.payoutAge !== undefined && this.formValues.payoutAge !== '') {
      this.selectPayoutAge(this.formValues.payoutAge);
    } else {
      this.selectPayoutAge(RETIREMENT_INCOME_CONST.DEFAULT_VALUES.PAYOUT_AGE);
    }
    if (this.formValues.payoutDuration !== undefined && this.formValues.payoutDuration !== '') {
      this.selectPayoutDuration(this.formValues.payoutDuration);
    } else {
      this.selectPayoutDuration(RETIREMENT_INCOME_CONST.DEFAULT_VALUES.PAYOUT_DURATION);
    }
    if (this.formValues.payoutFeature !== undefined && this.formValues.payoutFeature !== '') {
      this.selectPayoutFeature(this.formValues.payoutFeature);
    } else {
      this.selectPayoutFeature(RETIREMENT_INCOME_CONST.DEFAULT_VALUES.PAYOUT_FEATURE);
    }
    if (this.formValues.premiumDuration !== undefined && this.formValues.premiumDuration !== '') {
      this.selectPremiumDuration(this.formValues.premiumDuration);
    } else {
      this.selectPremiumDuration(RETIREMENT_INCOME_CONST.DEFAULT_VALUES.PREMIUM_DURATION);
    }
    this.categorySub = this.directService.searchBtnTrigger.subscribe((data) => {
      if (data !== '' && data === '7') {
        if (this.save()) {
          this.formSubmitted.emit(this.summarizeDetails());
          this.directService.setMinProdInfo(this.summarizeDetails());
        }
      }
    });
    this.userInfoSubscription = this.directService.userInfoSet.subscribe((data) => {
      this.retirementIncomeForm.controls.gender.setValue(data['gender']);
      if (data['dob']) {
        this.retirementIncomeForm.controls.dob.setValue(data['dob']);
      }
    });
  }

  onGenderChange() {
    const userInfo = this.directService.getUserInfo();
    userInfo.gender = this.retirementIncomeForm.controls.gender.value;
    this.directService.updateUserInfo(userInfo);
  }

  onDobChange() {
    if (this.retirementIncomeForm.controls.dob.valid) {
      const userInfo = this.directService.getUserInfo();
      userInfo.dob = this.retirementIncomeForm.controls.dob.value;
      this.directService.updateUserInfo(userInfo);
    }
  }

  ngOnDestroy(): void {
    this.categorySub.unsubscribe();
    this.userInfoSubscription.unsubscribe();
  }

  selectRetirementIncome(selectedRetirementIncome) {
    this.selectedRetirementIncome = selectedRetirementIncome;
    this.retirementIncomeForm.controls.retirementIncome.setValue(this.selectedRetirementIncome);
  }

  selectPayoutAge(selectedPayoutAge) {
    this.selectedPayoutAge = selectedPayoutAge;
    this.retirementIncomeForm.controls.payoutAge.setValue(this.selectedPayoutAge);
  }

  selectPayoutDuration(payoutDuration) {
    this.payoutDuration = payoutDuration;
    this.retirementIncomeForm.controls.payoutDuration.setValue(this.payoutDuration);
  }
  selectPayoutFeature(payoutFeature) {
    this.payoutFeature = payoutFeature;
    this.retirementIncomeForm.controls.payoutFeature.setValue(this.payoutFeature);
  }
  selectPremiumDuration(premiumDuration) {
    this.premiumDuration = premiumDuration;
    this.retirementIncomeForm.controls.premiumDuration.setValue(this.premiumDuration);
  }

  showPayoutFeatureModal() {
    this.directService.showToolTipModal(
      this.translate.instant('RETIREMENT_INCOME.FIXED_TOOLTIP.TITLE'),
      this.translate.instant('RETIREMENT_INCOME.FIXED_TOOLTIP.MESSAGE'));
  }

  summarizeDetails() {
    let sum_string = '';
    sum_string += '$' + this.selectedRetirementIncome + ' / mth,  ';
    sum_string += 'Payout Age ' + this.selectedPayoutAge + ', ';
    sum_string += 'Payout For ' + this.payoutDuration;
    return sum_string;
  }

  save() {
    const form = this.retirementIncomeForm;
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
    form.value.retirementIncome = this.selectedRetirementIncome;
    form.value.payoutAge = this.selectedPayoutAge;
    form.value.payoutDuration = this.payoutDuration;
    form.value.payoutFeature = this.payoutFeature;
    form.value.premiumDuration = this.premiumDuration;
    this.directService.setRetirementIncomeForm(form.value);
    return true;
  }
}
