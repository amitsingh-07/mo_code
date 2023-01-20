import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbDateParserFormatter, NgbDatepickerConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import { ErrorModalComponent } from '../../../shared/modal/error-modal/error-modal.component';
import { NgbDateCustomParserFormatter } from '../../../shared/utils/ngb-date-custom-parser-formatter';
import { DirectService } from '../../direct.service';
import { Subscription } from 'rxjs';
import { LONG_TERM_CARE_SHIELD } from '../../direct.constants';
import { AboutAge } from '../../../shared/utils/about-age.util';

@Component({
  selector: 'app-long-term-care-form',
  templateUrl: './long-term-care-form.component.html',
  styleUrls: ['./long-term-care-form.component.scss'],
  providers: [{ provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter }],
  encapsulation: ViewEncapsulation.None
})
export class LongTermCareFormComponent implements OnInit, OnDestroy {
  @Output() formSubmitted: EventEmitter<any> = new EventEmitter();
  categorySub: any;
  formValues: any;
  longTermCareForm: FormGroup;
  monthlyPayoutList = Array(21).fill(500).map((x, i) => x += i * 100);
  selectedMonthlyPayout = '';
  doberror = false;
  minDate;
  maxDate;
  private userInfoSubscription: Subscription;
  payoutEnabled = false;
  radioLabelValue = [];
  radioLabelValuePayoutType = [];
  defaultRadioStyleClass = 'direct-form-btn--radio btn';


  constructor(
    private directService: DirectService, private modal: NgbModal,
    private parserFormatter: NgbDateParserFormatter,
    private translate: TranslateService,
    private formBuilder: FormBuilder,
    private config: NgbDatepickerConfig,
    private aboutAge: AboutAge) {
    this.translate.use('en');
    this.translate.get('COMMON').subscribe((result: string) => {
      this.radioLabelValue = [{
        name: this.translate.instant('COMMON.LBL_MALE'),
        value: this.translate.instant('COMMON.LBL_MALE_VALUE')
      }, {
        name: this.translate.instant('COMMON.LBL_FEMALE'),
        value: this.translate.instant('COMMON.LBL_FEMALE_VALUE')
      }];
      this.radioLabelValuePayoutType = [{
        name: this.translate.instant('LONG_TERM_CARE.PAYOUT_TYPE_1'),
        value: this.translate.instant('LONG_TERM_CARE.PAYOUT_TYPE_1')
      }, {
        name: this.translate.instant('LONG_TERM_CARE.PAYOUT_TYPE_2'),
        value: this.translate.instant('LONG_TERM_CARE.PAYOUT_TYPE_2')
      }];
    });
    const today: Date = new Date();
    this.minDate = { year: (today.getFullYear() - 100), month: (today.getMonth() + 1), day: today.getDate() };
    this.maxDate = { year: today.getFullYear(), month: (today.getMonth() + 1), day: today.getDate() };
    config.outsideDays = 'collapsed';
  }

  ngOnInit() {
    this.formValues = this.directService.getLongTermCareForm();
    this.formValues.gender = this.formValues.gender;
    if (this.formValues.monthlyPayout) {
      this.selectedMonthlyPayout = this.formValues.monthlyPayout;
    }
    this.longTermCareForm = this.formBuilder.group({
      gender: [this.formValues.gender, Validators.required],
      dob: [this.formValues.dob, Validators.required],
      monthlyPayout: [this.formValues.monthlyPayout, Validators.required],
      payoutType: [this.formValues.payoutType]
    });
    this.categorySub = this.directService.searchBtnTrigger.subscribe((data) => {
      if (data !== '' && data === '5') {
        if (this.save()) {
          this.formSubmitted.emit(this.summarizeDetails());
          this.directService.setMinProdInfo(this.summarizeDetails());
        }
      }
    });
    this.userInfoSubscription = this.directService.userInfoSet.subscribe((data) => {
      this.longTermCareForm.controls.gender.setValue(data['gender']);
      if (data['dob']) {
        this.longTermCareForm.controls.dob.setValue(data['dob']);
        this.setPayoutType();
      }
    });
  }

  onGenderChange() {
    const userInfo = this.directService.getUserInfo();
    userInfo.gender = this.longTermCareForm.controls.gender.value;
    this.directService.updateUserInfo(userInfo);
  }

  onDobChange() {
    if (this.longTermCareForm.controls.dob.valid) {
      const userInfo = this.directService.getUserInfo();
      userInfo.dob = this.longTermCareForm.controls.dob.value;
      this.directService.updateUserInfo(userInfo);
      this.setPayoutType();
    }
  }

  ngOnDestroy(): void {
    this.categorySub.unsubscribe();
    this.userInfoSubscription.unsubscribe();
  }

  selectMonthlyPayout(selectedMonthlyPayout) {
    this.selectedMonthlyPayout = selectedMonthlyPayout;
    this.longTermCareForm.controls.monthlyPayout.setValue(this.selectedMonthlyPayout);
  }

  summarizeDetails() {
    let sum_string = '';
    sum_string += '$' + this.selectedMonthlyPayout + ' / mth';
    return sum_string;
  }

  save() {
    const form = this.longTermCareForm;
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
    form.value.monthlyPayout = this.selectedMonthlyPayout;
    this.directService.setLongTermCareForm(form.value);
    return true;
  }

  showMonthlyPayoutModal() {
    this.directService.showToolTipModal(
      this.translate.instant('LONG_TERM_CARE.TOOLTIP.LONG_TERM_CARE.TITLE'),
      this.translate.instant('LONG_TERM_CARE.TOOLTIP.LONG_TERM_CARE.MESSAGE')
    );
  }

  setPayoutType() {
    const today: Date = new Date();
    const inputDateFormat = this.parserFormatter.format(this.longTermCareForm.controls.dob.value);
    const getAge = this.aboutAge.calculateAge(inputDateFormat, today);
    const payoutTypeControl = this.longTermCareForm.controls.payoutType;
    if (this.longTermCareForm.controls.dob.value && (getAge >= LONG_TERM_CARE_SHIELD.AGE) && (this.longTermCareForm.controls.dob.value.year >= LONG_TERM_CARE_SHIELD.MIN_YEAR)) {
      payoutTypeControl.setValue(this.formValues.payoutType);
      payoutTypeControl.setValidators([Validators.required]);
      payoutTypeControl.updateValueAndValidity();
      this.payoutEnabled = true;
    } else {
      payoutTypeControl.markAsDirty();
      payoutTypeControl.setValue('');
      payoutTypeControl.setValidators([]);
      payoutTypeControl.updateValueAndValidity();
      this.payoutEnabled = false;
    }
  }

}
