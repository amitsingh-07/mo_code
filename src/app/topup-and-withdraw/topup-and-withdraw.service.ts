import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { InvestmentAccountFormData } from '../investment-account/investment-account-form-data';
import { ApiService } from '../shared/http/api.service';
import { AuthenticationService } from '../shared/http/auth/authentication.service';
import { TopUPFormError } from './top-up/top-up-form-error';
import { TopUpAndWithdrawFormData } from './topup-and-withdraw-form-data';
import { TopUpAndWithdrawFormError } from './topup-and-withdraw-form-error';
import { TOPUPANDWITHDRAW_CONFIG } from './topup-and-withdraw.constants';

const SESSION_STORAGE_KEY = 'app_withdraw-session';
@Injectable({
  providedIn: 'root'
})

export class TopupAndWithDrawService {
  constructor(private http: HttpClient, private apiService: ApiService, public authService: AuthenticationService) {
    this.getAllDropDownList();
    this.getTopUpFormData();
    this.getTopupInvestmentList();
    this.topUpAndWithdrawFormData.withdrawMode = TOPUPANDWITHDRAW_CONFIG.WITHDRAW.DEFAULT_WITHDRAW_MODE;
  }
  private topUpAndWithdrawFormData: TopUpAndWithdrawFormData = new TopUpAndWithdrawFormData();
  private investmentAccountFormData: InvestmentAccountFormData = new InvestmentAccountFormData();
  private topUPFormError: any = new TopUPFormError();
  private topUpAndWithdrawFormError: any = new TopUpAndWithdrawFormError();

  commit() {
    if (window.sessionStorage) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(this.topUpAndWithdrawFormData));
    }
  }

  // Return the entire Form Data
  getTopUpFormData() {
    if (window.sessionStorage && sessionStorage.getItem(SESSION_STORAGE_KEY)) {
      this.topUpAndWithdrawFormData = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY));
    }
    return this.topUpAndWithdrawFormData;
  }
  getAllDropDownList() {
    return this.apiService.getAllDropdownList();
  }

  getTopupInvestmentList() {
    return this.apiService.getTopupInvestmentList();

  }

  getPortfolioList() {
    return this.apiService.getPortfolioList();

  }
  doFinancialValidations(form) {
    const invalid = [];
    // tslint:disable-next-line:triple-equals
    if (Number(form.value.oneTimeInvestmentAmount) <= 100 &&
      form.value.Investment === 'One-time Investment') {
      invalid.push(this.topUPFormError.formFieldErrors['topupValidations']['zero']);
      return this.topUPFormError.formFieldErrors['topupValidations']['zero'];
      // tslint:disable-next-line:max-line-length
    } else if (Number(form.value.MonthlyInvestmentAmount) <= 50 &&
      form.value.Investment === 'Monthly Investment') {
      invalid.push(this.topUPFormError.formFieldErrors['topupValidations']['more']);
      return this.topUPFormError.formFieldErrors['topupValidations']['more'];
      // tslint:disable-next-line:max-line-length
    } else {
      return false;
    }
  }

  // removeCommas(str) {
  // if(str.lenght>3)
  // {
  //   while (str.search(',') >= 0) {
  //     str = (str + '').replace(',', '');
  //   }
  // }
  //   return str;
  // }

  getTopUp() {
    return {
      portfolio: this.topUpAndWithdrawFormData.portfolio,
      oneTimeInvestmentAmount: this.topUpAndWithdrawFormData.oneTimeInvestmentAmount,
      MonthlyInvestmentAmount: this.topUpAndWithdrawFormData.MonthlyInvestmentAmount,
      Investment: this.topUpAndWithdrawFormData.Investment,
      topupportfolioamount: this.topUpAndWithdrawFormData.topupportfolioamount

    };
  }
  setTopUp(data) {
    this.topUpAndWithdrawFormData.portfolio = data.portfolio;
    this.topUpAndWithdrawFormData.oneTimeInvestmentAmount = data.oneTimeInvestmentAmount;
    this.topUpAndWithdrawFormData.MonthlyInvestmentAmount = data.MonthlyInvestmentAmount;
    this.topUpAndWithdrawFormData.Investment = data.Investment;
    this.topUpAndWithdrawFormData.topupportfolioamount = data.topupportfolioamount;
    this.commit();
  }

  setFundingDetails(fundDetails) {
    this.investmentAccountFormData.fundDetails = fundDetails;
    this.commit();
  }

  getFundingDetails() {
    return this.investmentAccountFormData.fundDetails;
  }

  // tslint:disable-next-line
  getFormErrorList(form) {
    const controls = form.controls;
    const errors: any = {};
    errors.errorMessages = [];
    errors.title = this.topUpAndWithdrawFormError.formFieldErrors.errorTitle;
    for (const name in controls) {
      if (controls[name].invalid) {
        // HAS NESTED CONTROLS ?
        if (controls[name].controls) {
          const nestedControls = controls[name].controls;
          for (const nestedControlName in nestedControls) {
            if (nestedControls[nestedControlName].invalid) {
              // tslint:disable-next-line
              errors.errorMessages.push(this.topUpAndWithdrawFormError.formFieldErrors[nestedControlName][Object.keys(nestedControls[nestedControlName]['errors'])[0]].errorMessage);
            }
          }
        } else { // NO NESTED CONTROLS
          // tslint:disable-next-line
          errors.errorMessages.push(this.topUpAndWithdrawFormError.formFieldErrors[name][Object.keys(controls[name]['errors'])[0]].errorMessage);
        }
      }
    }
    return errors;
  }

  setWithdrawalTypeFormData(data) {
    this.topUpAndWithdrawFormData.withdrawType = data.withdrawType;
    this.topUpAndWithdrawFormData.withdrawAmount = data.withdrawAmount;
    this.topUpAndWithdrawFormData.withdrawPortfolio = data.withdrawPortfolio;
    this.commit();
  }

  setWithdrawalPaymentFormData(data) {
    this.topUpAndWithdrawFormData.withdrawMode = data.withdrawMode;
    this.topUpAndWithdrawFormData.withdrawBank = data.withdrawBank;
    this.commit();
  }

  getUserBankList() {
    return this.apiService.getUserBankList();
  }

  saveNewBank(data) {
    const payload = this.constructSaveNewBankRequest(data);
    return this.apiService.saveNewBank(payload);
  }

  constructSaveNewBankRequest(data) {
    const request = {};
    request['accountHolderName'] = data.accountHolderName;
    request['bank'] = data.bank.id;
    request['accountNo'] = data.accountNo;
    return request;
  }

  saveWithdrawalRequest(data) {
    const payload = this.constructWithdrawalRequestParams(data);
    return this.apiService.saveNewBank(payload);
  }

  constructWithdrawalRequestParams(data) {
    const request = {};
    request['type'] = (data.withdrawType) ? data.withdrawType.id : null;
    request['portfolio'] = (data.withdrawPortfolio) ? data.withdrawPortfolio.id : null;
    request['amount'] = data.withdrawAmount;
    request['mode'] = data.withdrawMode;
    request['bank'] = (data.withdrawBank) ? data.withdrawBank.id : null;
    return request;
  }
}
