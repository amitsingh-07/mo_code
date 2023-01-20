import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbDateParserFormatter, NgbDatepickerConfig, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import { ErrorModalComponent } from '../../../shared/modal/error-modal/error-modal.component';
import { NgbDateCustomParserFormatter } from './../../../shared/utils/ngb-date-custom-parser-formatter';
import { DirectService } from './../../direct.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-education-form',
  templateUrl: './education-form.component.html',
  styleUrls: ['./education-form.component.scss'],
  providers: [{ provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter }],
  encapsulation: ViewEncapsulation.None
})
export class EducationFormComponent implements OnInit, OnDestroy {
  @Output() formSubmitted: EventEmitter<any> = new EventEmitter();
  categorySub: any;
  modalRef: NgbModalRef;
  educationForm: FormGroup;
  formValues: any;
  contribution = '';
  isSelfFormEnabled = true;
  selectedunivercityEntryAge = '';
  monthlyContribution = Array(9).fill(100).map((x, i) => x += i * 50);
  univercityEntryAge = Array(5).fill(18).map((x, i) => x += i);
  doberror = false;
  minDate;
  maxDate;
  private userInfoSubscription: Subscription;
  radioLabelValue = [];
  defaultRadioStyleClass = 'direct-form-btn--radio btn';

  constructor(
    private directService: DirectService, private modal: NgbModal,
    private formBuilder: FormBuilder, private translate: TranslateService, private config: NgbDatepickerConfig) {
    const today: Date = new Date();
    this.minDate = { year: (today.getFullYear() - 100), month: (today.getMonth() + 1), day: today.getDate() };
    this.maxDate = { year: today.getFullYear(), month: (today.getMonth() + 1), day: today.getDate() };
    config.outsideDays = 'collapsed';
    this.translate.get('COMMON').subscribe((result: string) => {
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
    this.formValues = this.directService.getEducationForm();
    this.educationForm = this.formBuilder.group({
      childgender: [this.formValues.childgender, Validators.required],
      childdob: [this.formValues.childdob, Validators.required],
      contribution: [this.formValues.contribution, Validators.required],
      selectedunivercityEntryAge: [this.formValues.selectedunivercityEntryAge, Validators.required]
    });
    if (this.formValues.contribution !== undefined) {
      this.selectMonthlyContribution(this.formValues.contribution);
    }
    if (this.formValues.selectedunivercityEntryAge !== undefined) {
      this.selectEntryAge(this.formValues.selectedunivercityEntryAge);
    }
    this.categorySub = this.directService.searchBtnTrigger.subscribe((data) => {
      if (data !== '' && data === '6') {
        if (this.save()) {
          this.formSubmitted.emit(this.summarizeDetails());
          this.directService.setMinProdInfo(this.summarizeDetails());
        }
      }
    });
    this.userInfoSubscription = this.directService.userInfoSet.subscribe((data) => {
      this.educationForm.controls.childgender.setValue(data['gender']);
      if (data['dob']) {
        this.educationForm.controls.childdob.setValue(data['dob']);
      }
    });
  }

  onGenderChange() {
    const userInfo = this.directService.getUserInfo();
    userInfo.gender = this.educationForm.controls.childgender.value;
    this.directService.updateUserInfo(userInfo);
  }

  onDobChange() {
    if (this.educationForm.controls.childdob.valid) {
      const userInfo = this.directService.getUserInfo();
      userInfo.dob = this.educationForm.controls.childdob.value;
      this.directService.updateUserInfo(userInfo);
    }
  }

  ngOnDestroy(): void {
    this.categorySub.unsubscribe();
    this.userInfoSubscription.unsubscribe();
  }

  selectMonthlyContribution(contribution) {
    this.contribution = contribution;
    this.educationForm.controls.contribution.setValue(this.contribution);
  }
  selectEntryAge(EntryAge) {
    this.selectedunivercityEntryAge = EntryAge;
    this.educationForm.controls.selectedunivercityEntryAge.setValue(this.selectedunivercityEntryAge);
  }
  setdefaultUniversityAge() {
    this.selectedunivercityEntryAge = this.educationForm.controls['childgender'].value === 'male' ? '20' : '18';
    this.educationForm.controls.selectedunivercityEntryAge.setValue(this.selectedunivercityEntryAge);
    this.onGenderChange();
  }

  setselfform() {
    this.isSelfFormEnabled = this.educationForm.controls['premiumWaiver'].value === 'yes' ? true : false;
  }
  summarizeDetails() {
    let sum_string = '';
    sum_string += 'Save $' + this.educationForm.value.contribution + '/ mth, ';
    if (this.educationForm.value.selectedunivercityEntryAge) {
      sum_string += 'Uni Entry Age of ' + this.educationForm.value.selectedunivercityEntryAge;
    }
    return sum_string;
  }
  save() {
    const form = this.educationForm;
    if (!form.valid) {
      Object.keys(form.controls).forEach((key) => {
        form.get(key).markAsDirty();
      });
      if (!form.controls['childdob'].valid && form.controls['childgender'].valid) {
        this.doberror = true;
      }
      const ref = this.modal.open(ErrorModalComponent, { centered: true });
      ref.componentInstance.errorTitle = this.directService.currentFormError(form)['errorTitle'];
      ref.componentInstance.errorMessage = this.directService.currentFormError(form)['errorMessage'];
      return false;
    }
    form.value.contribution = this.contribution;
    form.value.selectedunivercityEntryAge = this.selectedunivercityEntryAge;
    this.directService.setEducationForm(form.value);
    return true;
  }
  showPremiumWaiverModal() {
    this.directService.showToolTipModal(
      this.translate.instant('DIRECT_LIFE_PROTECTION.PREMIUM_WAIVER.TOOLTIP.TITLE'),
      this.translate.instant('DIRECT_LIFE_PROTECTION.PREMIUM_WAIVER.TOOLTIP.MESSAGE')
    );
  }
}
