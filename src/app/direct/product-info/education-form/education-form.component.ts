import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbDateParserFormatter, NgbDatepickerConfig, NgbDropdown, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgbDateCustomParserFormatter } from './../../../shared/utils/ngb-date-custom-parser-formatter';

import { DirectService } from './../../direct.service';

@Component({
  selector: 'app-education-form',
  templateUrl: './education-form.component.html',
  styleUrls: ['./education-form.component.scss']
})
export class EducationFormComponent implements OnInit {
  dobValue;
  categorySub: any;
  modalRef: NgbModalRef;
  educationForm: FormGroup;
  formValues: any;
  contribution = '100';
  isSelfFormEnabled = true;
  selectedunivercityEntryAge = this.formValues && this.formValues.gender === 'male' ? '20' : '18';
  monthlyContribution = Array(9).fill(100).map((x, i) => x += i * 50);
  univercityEntryAge = Array(4).fill(18).map((x, i) => x += i);
  constructor(
    private directService: DirectService, private modal: NgbModal,
    private parserFormatter: NgbDateParserFormatter,
    private formBuilder: FormBuilder, private config: NgbDatepickerConfig) {
      const today: Date = new Date();
      config.minDate = { year: (today.getFullYear() - 100), month: (today.getMonth() + 1), day: today.getDate() };
      config.maxDate = { year: today.getFullYear(), month: (today.getMonth() + 1), day: today.getDate() };
      config.outsideDays = 'collapsed';
     }

  ngOnInit() {
    this.directService.setProdCategoryIndex(5);
    this.formValues = this.directService.getDirectFormData();
    //this.formValues.gender = this.formValues.gender ? this.formValues.gender : 'male';
    this.formValues.smoker = this.formValues.smoker ? this.formValues.smoker : 'nonsmoker';
    this.formValues.premiumWaiver = this.formValues.premiumWaiver ? this.formValues.premiumWaiver : 'yes';
    if (this.formValues.contribution !== undefined ) {
      this.selectCoverageAmt(this.formValues.monthlyContribution);
    }
    if (this.formValues.selectedunivercityEntryAge !== undefined ) {
      this.selectEntryAge(this.formValues.selectedunivercityEntryAge);
    }
    this.educationForm = this.formBuilder.group({
      selfgender: [this.formValues.selfgender, Validators.required],
      childgender: [this.formValues.childgender, Validators.required],
      selfdob: [this.formValues.selfdob, Validators.required],
      childdob: [this.formValues.childdob, Validators.required],
      smoker: [this.formValues.smoker, Validators.required],
      contribution: [this.formValues.contribution],
      selectedunivercityEntryAge: [this.formValues.selectedunivercityEntryAge],
      premiumWaiver: [this.formValues.premiumWaiver]
    });
    this.categorySub = this.directService.searchBtnTrigger.subscribe((data) => {
      if (data !== '') {
        this.save();
        this.directService.triggerSearch('');
      }
    });
  }
  selectCoverageAmt(contribution) {
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
  }

  setselfform() {
    this.isSelfFormEnabled = this.educationForm.controls['premiumWaiver'].value === 'yes' ? true : false;
  }
  summarizeDetails() {
    let sum_string = '';
    sum_string += this.educationForm.value.childgender + ', ';
    sum_string += this.educationForm.value.selectedunivercityEntryAge + ', ';
    sum_string += this.educationForm.value.contribution;
    if (this.educationForm.value.premiumWaiver === 'yes') {
      sum_string += ', Premium Waiver Rider';
    }
    return sum_string;
  }
  save() {
    this.directService.setLifeProtectionForm(this.educationForm);
    this.directService.setMinProdInfo(this.summarizeDetails());
  }

  showPremiumWaiverModal() {

  }
}
