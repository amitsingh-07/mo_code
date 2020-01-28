
import { filter } from 'rxjs/operators';

import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import { LoaderService } from '../../../shared/components/loader/loader.service';
import { FooterService } from '../../../shared/footer/footer.service';
import { HeaderService } from '../../../shared/header/header.service';
import { AuthenticationService } from '../../../shared/http/auth/authentication.service';
import { ErrorModalComponent } from '../../../shared/modal/error-modal/error-modal.component';
import {
  ModelWithButtonComponent
} from '../../../shared/modal/model-with-button/model-with-button.component';
import {
  ReviewBuyRequestModalComponent
} from '../../../shared/modal/review-buy-request-modal/review-buy-request-modal.component';
import { NavbarService } from '../../../shared/navbar/navbar.service';
import { FormatCurrencyPipe } from '../../../shared/Pipes/format-currency.pipe';
import { InvestmentAccountService } from '../../investment-account/investment-account-service';
import { IInvestmentCriteria } from '../../investment-common/investment-common-form-data';
import {
  INVESTMENT_COMMON_ROUTE_PATHS
} from '../../investment-common/investment-common-routes.constants';
import { InvestmentCommonService } from '../../investment-common/investment-common.service';
import { MANAGE_INVESTMENTS_ROUTE_PATHS } from '../manage-investments-routes.constants';
import { MANAGE_INVESTMENTS_CONSTANTS } from '../manage-investments.constants';
import { ManageInvestmentsService } from '../manage-investments.service';

@Component({
  selector: 'app-top-up',
  templateUrl: './top-up.component.html',
  styleUrls: ['./top-up.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TopUpComponent implements OnInit, OnDestroy {
  pageTitle: string;
  portfolio;
  portfolioList;
  isAmountExceedBalance = false;
  topupAmount: any;
  showOnetimeInvestmentAmount = true;
  showMonthlyInvestmentAmount = false;
  formValues;
  topForm: FormGroup;
  enteringAmount;
  cashBalance;
  fundDetails;
  currentMonthlyInvAmount; // current monthly rsp amount
  currentOneTimeInvAmount; // current monthly rsp amount
  isRequestSubmitted = false;
  srsAccountDetails;
  awaitingOrPendingAmount;
  topupTypes = MANAGE_INVESTMENTS_CONSTANTS.TOPUP.TOPUP_TYPES;
  investmentCriteria: IInvestmentCriteria;

  constructor(
    public readonly translate: TranslateService,
    public headerService: HeaderService,
    private formBuilder: FormBuilder,
    public authService: AuthenticationService,
    private router: Router,
    public navbarService: NavbarService,
    public footerService: FooterService,
    private modal: NgbModal,
    public manageInvestmentsService: ManageInvestmentsService,
    private investmentAccountService: InvestmentAccountService,
    private formatCurrencyPipe: FormatCurrencyPipe,
    private loaderService: LoaderService,
    private investmentCommonService: InvestmentCommonService
  ) {
    this.translate.use('en');
    this.translate.get('COMMON').subscribe((result: string) => {
      this.pageTitle = this.translate.instant('TOPUP.TITLE');
      this.setPageTitle(this.pageTitle);
    });
  }

  setPageTitle(title: string) {
    this.navbarService.setPageTitle(title);
  }

  ngOnInit() {
    this.navbarService.setNavbarMobileVisibility(true);
    this.navbarService.setNavbarMode(103);
    this.footerService.setFooterVisibility(false);
    this.getPortfolioList();
    this.cashBalance = this.manageInvestmentsService.getUserCashBalance();
    this.fundDetails = this.manageInvestmentsService.getFundingDetails();
    this.formValues = this.manageInvestmentsService.getTopUpFormData();
    this.getInvestmentCriteria();
    this.topForm = this.formBuilder.group({
      portfolio: [this.formValues.selectedCustomerPortfolio, Validators.required],
      Investment: [
        this.formValues.Investment ? this.formValues.Investment : 'One-time Investment',
        Validators.required
      ],
      oneTimeInvestmentAmount: [
        this.formValues.oneTimeInvestmentAmount,
        Validators.required
      ]
    });
    if (this.formValues['selectedCustomerPortfolio']) {
      this.getMonthlyInvestmentInfo(this.formValues['selectedCustomerPortfolioId']);
      this.getAwaitingOrPendingInfo(this.formValues['selectedCustomerPortfolioId'],
        this.awaitingOrPendingReq(this.formValues.selectedCustomerPortfolio.fundingTypeValue));
    }
    if (this.formValues['selectedCustomerPortfolio'] &&
      (this.formValues['selectedCustomerPortfolio'].fundingTypeValue === MANAGE_INVESTMENTS_CONSTANTS.TOPUP.FUNDING_METHODS.SRS)) {
      this.getSrsAccountDetails();
    }
    this.buildFormInvestment();
    this.setSelectedPortfolio();
  }

  ngOnDestroy() {
    // On page destroy, set the top up values back to default
    this.manageInvestmentsService.clearTopUpData();
  }
  //  #get the SRS Details
  getSrsAccountDetails() {
    this.manageInvestmentsService.getSrsAccountDetails().subscribe((data) => {
      if (data) {
        this.srsAccountDetails = data;
      } else {
        this.srsAccountDetails = null;
      }
    });
  }

  // set the selected portfolio if there when page loaded
  setSelectedPortfolio() {
    if (this.formValues['selectedCustomerPortfolioId']) {
      const value = this.portfolioList.find((data) => {
        return data.customerPortfolioId === this.formValues['selectedCustomerPortfolioId'];
      });
      this.setDropDownValue('portfolio', value);
    }
  }
  getPortfolioList() {
    this.portfolioList = this.manageInvestmentsService.getUserPortfolioList();
  }

  setDropDownValue(key, value) {
    this.topForm.controls[key].setValue(value);
    this.getMonthlyInvestmentInfo(value['customerPortfolioId']);
    this.getAwaitingOrPendingInfo(value['customerPortfolioId'],
      this.awaitingOrPendingReq(value.fundingTypeValue));
    if (value.fundingTypeValue.toUpperCase() === MANAGE_INVESTMENTS_CONSTANTS.TOPUP.FUNDING_METHODS.SRS) {
      this.getSrsAccountDetails();
    }
  }

  getInvestmentCriteria() {
    this.investmentCommonService.getInvestmentCriteria().subscribe((data) => {
      this.investmentCriteria = data;
      this.setOnetimeMinAmount(data);
    });
  }

  validateAmount(amount) {
    if (amount > this.cashBalance) {
      this.topupAmount = amount - this.cashBalance;
      this.isAmountExceedBalance = true;
    } else {
      this.isAmountExceedBalance = false;
    }
  }

  selectedInvestment(investmentType, minAmount) {
    this.manageInvestmentsService.setInvestmentValue(minAmount);
    this.formValues.Investment = investmentType;
    this.isAmountExceedBalance = false;
    this.topupAmount = 0;
    this.buildFormInvestment();
  }

  buildFormInvestment() {
    if (this.formValues.Investment === MANAGE_INVESTMENTS_CONSTANTS.TOPUP.MONTHLY_INVESTMENT) {
      this.topForm.addControl(
        'MonthlyInvestmentAmount',
        new FormControl('', Validators.required)
      );
      this.topForm.removeControl('oneTimeInvestmentAmount');
      this.showOnetimeInvestmentAmount = false;
      this.showMonthlyInvestmentAmount = true;
      this.exceedAmountMonthly();
      if (this.currentMonthlyInvAmount) { // If monthly investment already exists, allow zero
        this.topForm.get('MonthlyInvestmentAmount').clearValidators();
        this.topForm.get('MonthlyInvestmentAmount').updateValueAndValidity();
      }
    } else {
      this.topForm.addControl(
        'oneTimeInvestmentAmount',
        new FormControl('', Validators.required)
      );
      this.topForm.removeControl('MonthlyInvestmentAmount');
      this.showOnetimeInvestmentAmount = true;
      this.showMonthlyInvestmentAmount = false;
      this.exceedAmountOneTime();
    }
  }

  exceedAmountOneTime() {
    if (this.topForm.get('oneTimeInvestmentAmount')) {
      this.topForm.get('oneTimeInvestmentAmount').valueChanges.subscribe((value) => {
        this.validateAmount(value);
      });
      this.topForm
        .get('oneTimeInvestmentAmount')
        .setValue(this.formValues.oneTimeInvestmentAmount); // SETTING VALUE TO MOCK CHANGE EVENT
    }
  }

  exceedAmountMonthly() {
    if (this.topForm.get('MonthlyInvestmentAmount')) {
      this.topForm.get('MonthlyInvestmentAmount').valueChanges.subscribe((value) => {
        this.validateAmount(value);
      });
      this.topForm
        .get('MonthlyInvestmentAmount')
        .setValue(this.formValues.MonthlyInvestmentAmount); // SETTING VALUE TO MOCK CHANGE EVENT
    }
  }
  setOnetimeMinAmount(data) {
    if (this.formValues.Investment === 'Monthly Investment') {
      this.manageInvestmentsService.setInvestmentValue(data.monthlyInvestmentMinimum);
    } else {
      this.manageInvestmentsService.setInvestmentValue(data.oneTimeInvestmentMinimum);
    }
  }

  goToNext(form) {
    if (!form.valid) {
      Object.keys(form.controls).forEach((key) => {
        form.get(key).markAsDirty();
      });
      const error = this.manageInvestmentsService.getFormErrorList(form);
      const ref = this.modal.open(ErrorModalComponent, { centered: true });
      ref.componentInstance.errorTitle = error.title;
      ref.componentInstance.errorMessageList = error.errorMessages;
      return false;
    } else {
      const allowZero = (this.currentMonthlyInvAmount > 0);
      const error = this.manageInvestmentsService.doFinancialValidations(form, allowZero);
      if (error) {
        // tslint:disable-next-line:no-commented-code
        const ref = this.modal.open(ModelWithButtonComponent, { centered: true });
        ref.componentInstance.errorTitle = error.errorTitle;
        ref.componentInstance.errorMessage = error.errorMessage
          .replace('$ONE_TIME_INVESTMENT$', this.investmentCriteria.oneTimeInvestmentMinimum)
          .replace('$MONTHLY_INVESTMENT$', this.investmentCriteria.monthlyInvestmentMinimum);
        // tslint:disable-next-line:triple-equals
      } else {
        this.saveAndProceed(form);
      }
    }
  }

  saveAndProceed(form: any) {
    form.value.topupAmount = this.topupAmount;
    this.manageInvestmentsService.setTopUp(form.value);
    // Save all the details of the top up before proceed
    this.saveFundingDetails();
    // Open up show review buy request pop up
    this.showReviewBuyRequestModal(form);
  }
  saveFundingDetails() {
    if (this.formValues.oneTimeInvestmentAmount) {
      this.topupAmount = this.formValues.oneTimeInvestmentAmount - this.formValues.portfolio['cashAccountBalance'];
    } else {
      this.topupAmount = (Number(this.formValues.MonthlyInvestmentAmount) || 0) - this.formValues.portfolio['cashAccountBalance'];
    }
    const topupValues = {
      source: MANAGE_INVESTMENTS_CONSTANTS.FUNDING_INSTRUCTIONS.TOPUP,
      portfolio: this.formValues.portfolio,
      oneTimeInvestment: this.formValues.oneTimeInvestmentAmount, // topup
      monthlyInvestment: this.formValues.MonthlyInvestmentAmount ? this.formValues.MonthlyInvestmentAmount : 0, // topup
      fundingType: this.formValues.Investment === 'Monthly Investment'
        ? MANAGE_INVESTMENTS_CONSTANTS.FUNDING_INSTRUCTIONS.MONTHLY
        : MANAGE_INVESTMENTS_CONSTANTS.FUNDING_INSTRUCTIONS.ONETIME,
      isAmountExceedBalance: this.topupAmount > 0 ? true : false,
      exceededAmount: this.topupAmount,
      srsDetails: this.srsAccountDetails    // SRS Details
    };
    // Set and also update the fund details for use in this component
    this.manageInvestmentsService.setFundingDetails(topupValues);
    this.fundDetails = this.manageInvestmentsService.getFundingDetails();
  }

  getMonthlyInvestmentInfo(customerPortfolioId) {
    this.manageInvestmentsService.getMonthlyInvestmentInfo(customerPortfolioId).subscribe((response) => {
      if (response.responseMessage.responseCode >= 6000) {
        this.currentMonthlyInvAmount = response.objectList.monthlyInvestment;
        // If monthly investment already exists, allow zero
        if (this.currentMonthlyInvAmount && this.topForm.get('MonthlyInvestmentAmount')) {
          this.topForm.get('MonthlyInvestmentAmount').clearValidators();
          this.topForm.get('MonthlyInvestmentAmount').updateValueAndValidity();
        }
      } else {
        this.investmentAccountService.showGenericErrorModal();
      }
    },
      (err) => {
        this.investmentAccountService.showGenericErrorModal();
      });
  }

  awaitingOrPendingReq(fundingType) {
    if (fundingType.toUpperCase() === MANAGE_INVESTMENTS_CONSTANTS.TOPUP.FUNDING_METHODS.CASH) {
      return 'awaiting';
    }
    return 'pending';
  }

  getAwaitingOrPendingInfo(customerProfileId, awaitingOrPendingParam) {
    if (customerProfileId && awaitingOrPendingParam) {
      this.manageInvestmentsService.getAwaitingOrPendingInfo(customerProfileId, awaitingOrPendingParam).subscribe((response) => {
        if (response.responseMessage.responseCode >= 6000) {
          const oneTimePendingInfo = response.objectList ?
            response.objectList.filter((array) => array.transactionFrequency === 'ONE_TIME') : null;
          this.awaitingOrPendingAmount = oneTimePendingInfo && oneTimePendingInfo[0] &&
            oneTimePendingInfo[0].amount ? oneTimePendingInfo[0].amount : 0;
        } else {
          this.investmentAccountService.showGenericErrorModal();
        }
      },
        (err) => {
          this.investmentAccountService.showGenericErrorModal();
        });
    }
  }

  showConfirmOverwriteModal(form, invAmount: number, formName: string, descText: string) {
    const translateParams = {
      existingOrderAmount: this.formatCurrencyPipe.transform(invAmount),
      newOrderAmount: this.formatCurrencyPipe.transform(
        this.topForm.get(formName).value ? this.topForm.get(formName).value : 0
      )
    };
    const ref = this.modal.open(ModelWithButtonComponent, { centered: true });
    ref.componentInstance.errorTitle = this.translate.instant('TOPUP.CONFIRM_OVERWRITE_MODAL.TITLE');
    ref.componentInstance.errorMessage = this.translate.instant(descText, translateParams);
    ref.componentInstance.yesOrNoButton = true;
    ref.componentInstance.closeBtn = false;
    ref.componentInstance.yesClickAction.subscribe((emittedValue) => {
      ref.close();
      this.buyPortfolio();
    });
    ref.componentInstance.noClickAction.subscribe((emittedValue) => {
      ref.close();
    });
  }

  showReviewBuyRequestModal(form) {
    const ref = this.modal.open(ReviewBuyRequestModalComponent, { centered: true, windowClass: 'review-buy-request-modal' });
    ref.componentInstance.fundDetails = this.fundDetails;
    ref.componentInstance.submitRequest.subscribe((emittedValue) => {
      this.checkIfExistingBuyRequest(form);
    });
  }

  checkIfExistingBuyRequest(form) {
    if (this.formValues.Investment === 'Monthly Investment' && this.currentMonthlyInvAmount) {
      this.showConfirmOverwriteModal(form, this.currentMonthlyInvAmount, 'MonthlyInvestmentAmount',
        'TOPUP.CONFIRM_OVERWRITE_MODAL.DESC');
    } else if ((this.formValues.Investment === 'One-time Investment' || !this.formValues.Investment)
      && this.awaitingOrPendingAmount) {
      if (this.fundDetails.portfolio.fundingTypeValue.toUpperCase() === MANAGE_INVESTMENTS_CONSTANTS.TOPUP.FUNDING_METHODS.CASH) {
        this.showConfirmOverwriteModal(form, this.awaitingOrPendingAmount, 'oneTimeInvestmentAmount',
          'TOPUP.CONFIRM_OVERWRITE_MODAL.ONE_TIME_DESC');
      } else if (this.fundDetails.portfolio.fundingTypeValue.toUpperCase() === MANAGE_INVESTMENTS_CONSTANTS.TOPUP.FUNDING_METHODS.SRS) {
        this.showMessage(this.awaitingOrPendingAmount, 'TOPUP.CONFIRM_OVERWRITE_MODAL.SRS_ONE_TIME');
      }
    } else {
      this.buyPortfolio();
    }
  }

  showMessage(amount, descText) {
    const translateParams = {
      existingOrderAmount: this.formatCurrencyPipe.transform(amount),
    };
    const ref = this.modal.open(ErrorModalComponent, { centered: true });
    ref.componentInstance.errorTitle = this.translate.instant('TOPUP.CONFIRM_OVERWRITE_MODAL.TITLE');
    ref.componentInstance.errorMessage = this.translate.instant(descText, translateParams);
  }

  buyPortfolio() {
    if (this.fundDetails.oneTimeInvestment) {
      this.topUpOneTime();
    } else {
      this.topUpMonthly();
    }
  }
  // ONETIME INVESTMENT
  topUpOneTime() {
    if (!this.isRequestSubmitted) {
      this.isRequestSubmitted = true;
      this.showLoader();
      this.manageInvestmentsService.buyPortfolio(this.fundDetails).subscribe(
        (response) => {
          this.successHandler(response);
        },
        (err) => {
          this.errorHandler();
        }
      );
    }
  }
  // MONTHLY INVESTMENT
  topUpMonthly() {
    if (!this.isRequestSubmitted) {
      this.isRequestSubmitted = true;
      this.showLoader();
      this.manageInvestmentsService.monthlyInvestment(this.fundDetails).subscribe(
        (response) => {
          this.successHandler(response);
        },
        (err) => {
          this.errorHandler();
        }
      );
    }
  }

  showLoader() {
    this.isRequestSubmitted = true;
    this.loaderService.showLoader({
      title: this.translate.instant('TOPUP.TOPUP_REQUEST_LOADER.TITLE'),
      desc: this.translate.instant('TOPUP.TOPUP_REQUEST_LOADER.DESC')
    });
  }

  showCustomErrorModal(title, desc) {
    const ref = this.modal.open(ErrorModalComponent, { centered: true });
    ref.componentInstance.errorTitle = title;
    ref.componentInstance.errorMessage = desc;
  }

  successHandler(response) {
    this.isRequestSubmitted = false;
    this.loaderService.hideLoader();
    if (response.responseMessage.responseCode < 6000) {
      if (
        response.objectList &&
        response.objectList.length &&
        response.objectList[response.objectList.length - 1].serverStatus &&
        response.objectList[response.objectList.length - 1].serverStatus.errors &&
        response.objectList[response.objectList.length - 1].serverStatus.errors.length
      ) {
        this.showCustomErrorModal(
          'Error!',
          response.objectList[response.objectList.length - 1].serverStatus.errors[0].msg
        );
      } else if (response.responseMessage && response.responseMessage.responseDescription) {
        const errorResponse = response.responseMessage.responseDescription;
        this.showCustomErrorModal('Error!', errorResponse);
      } else {
        this.investmentAccountService.showGenericErrorModal();
      }
    } else if (this.fundDetails.portfolio.fundingTypeValue.toUpperCase() === MANAGE_INVESTMENTS_CONSTANTS.TOPUP.FUNDING_METHODS.CASH) {
      if (!this.fundDetails.isAmountExceedBalance) {
        this.router.navigate([
          MANAGE_INVESTMENTS_ROUTE_PATHS.TOPUP_STATUS + '/success'
        ]);
      } else {
        this.router.navigate([
          MANAGE_INVESTMENTS_ROUTE_PATHS.TOPUP_STATUS + '/pending'
        ]);
      }
    } else {
      this.router.navigate([
        MANAGE_INVESTMENTS_ROUTE_PATHS.TOPUP_STATUS + '/success'
      ]);
    }
  }

  errorHandler() {
    this.isRequestSubmitted = false;
    this.loaderService.hideLoader();
    this.investmentAccountService.showGenericErrorModal();
  }

}
