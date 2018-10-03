
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import { HeaderService } from '../../shared/header/header.service';
import { ErrorModalComponent } from '../../shared/modal/error-modal/error-modal.component';
import { RegexConstants } from '../../shared/utils/api.regex.constants';
import { INVESTMENT_ACCOUNT_ROUTE_PATHS } from '../investment-account-routes.constants';
import { InvestmentAccountService } from '../investment-account-service';

import { PortfolioService } from '../../portfolio/portfolio.service';

import { PortfolioFormData } from '../../portfolio/portfolio-form-data';

@Component({
  selector: 'app-finanical-details',
  templateUrl: './finanical-details.component.html',
  styleUrls: ['./finanical-details.component.scss']
})
export class FinanicalDetailsComponent implements OnInit {
  pageTitle: string;
  financialDetails: FormGroup;
  formValues;
  annualHouseHoldIncomeRange: any;
  numberOfHouseHoldMembers: string;
  annualHouseHoldIncomeRanges: any =
    [
      '$2,000',
      '$2,001 to $4,000',
      '$4,001 to $6,000',
      '$6,001 to $8,000',
      '$8,001 to $10,000',
      '$10,001 to $12,000',
      '$12,001 to $14,000',
      '$14,000 to $16,000',
      '$16,001 to $18,000',
      'Above $18,001'];
  numberOfHouseHoldMembersList = Array(11).fill(0).map((x, i) => i);

  constructor(
    public readonly translate: TranslateService,
    private formBuilder: FormBuilder,
    private router: Router,
    public headerService: HeaderService,
    public portfolioService: PortfolioService,
    private modal: NgbModal,
    public investmentAccountService: InvestmentAccountService) {
    this.translate.use('en');
    this.translate.get('COMMON').subscribe((result: string) => {
      this.pageTitle = this.translate.instant('FINANCIAL_DETAILS.TITLE');
      this.setPageTitle(this.pageTitle);
    });
  }

  ngOnInit() {
    this.formValues = this.portfolioService.getMyFinancials();
    this.financialDetails = this.formBuilder.group({
      annualHouseHoldIncome: [this.formValues.annualHouseHoldIncome, Validators.required],
      numberOfHouseHoldMembers: [this.formValues.numberOfHouseHoldMembers, Validators.required],
      financialMonthlyIncome: [ this.formValues.monthlyIncome, Validators.required],
      financialPercentageOfSaving: [this.formValues.percentageOfSaving, Validators.required],
      financialTotalAssets: [this.formValues.totalAssets, Validators.required],
      financialTotalLiabilities: [this.formValues.totalLiabilities, Validators.required],

    });
  }
  setPageTitle(title: string) {
    this.headerService.setPageTitle(title);
  }
  setAnnualHouseHoldIncomeRange(annualHouseHoldIncome) {
    this.annualHouseHoldIncomeRange = annualHouseHoldIncome;
    this.financialDetails.controls['annualHouseHoldIncome'].setValue( this.annualHouseHoldIncomeRange);

  }
  setnumberOfHouseHoldMembers(HouseHoldMembers) {
    this.numberOfHouseHoldMembers = HouseHoldMembers;
    this.financialDetails.controls['numberOfHouseHoldMembers'].setValue(this.numberOfHouseHoldMembers);
  }
  markAllFieldsDirty(form) {
    Object.keys(form.controls).forEach((key) => {
      if (form.get(key).controls) {
        Object.keys(form.get(key).controls).forEach((nestedKey) => {
          form.get(key).controls[nestedKey].markAsDirty();
        });
      } else {
        form.get(key).markAsDirty();
      }
    });
  }
  goToNext(form) {
    if (!form.valid) {
      this.markAllFieldsDirty(form);
      const error = this.investmentAccountService.getFormErrorList(form);
      const ref = this.modal.open(ErrorModalComponent, { centered: true });
      ref.componentInstance.errorTitle = error.title;
      ref.componentInstance.errorMessageList = error.errorMessages;
      return false;
    } else {
      this.investmentAccountService.setFinancialFormData(form.value);
      this.router.navigate([INVESTMENT_ACCOUNT_ROUTE_PATHS.TAX_INFO]);
    }
  }

}
