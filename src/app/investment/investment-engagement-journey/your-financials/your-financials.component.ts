import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import { LoaderService } from '../../../shared/components/loader/loader.service';
import { FooterService } from '../../../shared/footer/footer.service';
import { AuthenticationService } from '../../../shared/http/auth/authentication.service';
import { IPageComponent } from '../../../shared/interfaces/page-component.interface';
import { ErrorModalComponent } from '../../../shared/modal/error-modal/error-modal.component';
import {
  ModelWithButtonComponent
} from '../../../shared/modal/model-with-button/model-with-button.component';
import { NavbarService } from '../../../shared/navbar/navbar.service';
import { INVESTMENT_ACCOUNT_ROUTE_PATHS } from '../../investment-account/investment-account-routes.constants';
import { InvestmentAccountService } from '../../investment-account/investment-account-service';
import { INVESTMENT_COMMON_ROUTE_PATHS } from '../../investment-common/investment-common-routes.constants';
import { InvestmentCommonService } from '../../investment-common/investment-common.service';
import {
  INVESTMENT_ENGAGEMENT_JOURNEY_ROUTE_PATHS
} from '../investment-engagement-journey-routes.constants';
import {
  INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS
} from '../investment-engagement-journey.constants';
import { InvestmentEngagementJourneyService } from '../investment-engagement-journey.service';

@Component({
  selector: 'app-your-financials',
  templateUrl: './your-financials.component.html',
  styleUrls: ['./your-financials.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class YourFinancialsComponent implements IPageComponent, OnInit {
  myFinancialForm: FormGroup;
  financialFormValue;
  modalData: any;
  helpData: any;
  pageTitle: string;
  form: any;
  translator: any;
  loaderTitle: string;
  loaderDesc: string;
  selectedPortfolioType;
  loaderDescTwo: string;
  userPortfolioType: any;


  constructor(
    private router: Router,
    private modal: NgbModal,
    public investmentEngagementJourneyService: InvestmentEngagementJourneyService,
    public navbarService: NavbarService,
    public footerService: FooterService,
    public authService: AuthenticationService,
    public readonly translate: TranslateService,
    private investmentAccountService: InvestmentAccountService,
    public investmentCommonService: InvestmentCommonService,
    private loaderService: LoaderService
  ) {
    this.translate.use('en');
    const self = this;
    this.translate.get('COMMON').subscribe((result: string) => {
      self.pageTitle = this.translate.instant('MY_FINANCIALS.TITLE');
      self.modalData = this.translate.instant('MY_FINANCIALS.modalData');
      self.helpData = this.translate.instant('MY_FINANCIALS.helpData');
      self.translator = this.translate.instant('MY_FINANCIALS');
      self.loaderTitle = this.translate.instant('MY_FINANCIALS.RESPONSE_LOADER.TITLE');
      self.loaderDesc = this.translate.instant('MY_FINANCIALS.RESPONSE_LOADER.DESC');
      self.loaderDescTwo = this.translate.instant('MY_FINANCIALS.RESPONSE_LOADER.DESC_TWO');
      this.setPageTitle(self.pageTitle);
    });
    this.userPortfolioType = investmentEngagementJourneyService.getUserPortfolioType();
  }

  setPageTitle(title: string) {
    const stepLabel = this.translate.instant('MY_FINANCIALS.STEP_1_LABEL');
    this.navbarService.setPageTitle(
      title,
      undefined,
      undefined,
      undefined,
      undefined,
      stepLabel
    );
  }

  ngOnInit() {
    this.navbarService.setNavbarMobileVisibility(true);
    this.navbarService.setNavbarMode(6);
    this.footerService.setFooterVisibility(false);
    this.financialFormValue = this.investmentEngagementJourneyService.getPortfolioFormData();
    if (this.isLoggedInUser() && this.isFirstTimeUser()) {
      this.getFinancialDetails();

    }
    this.buildFrom();
  }

  buildFrom() {
    this.myFinancialForm = new FormGroup({
      monthlyIncome: new FormControl(this.financialFormValue.monthlyIncome),
      percentageOfSaving: new FormControl(this.financialFormValue.percentageOfSaving),
      totalAssets: new FormControl(this.financialFormValue.totalAssets),
      totalLiabilities: new FormControl(this.financialFormValue.totalLiabilities),
      suffEmergencyFund: new FormControl(
        INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.my_financials.sufficient_emergency_fund)
    });
  }

  showEmergencyFundModal() {
    const ref = this.modal.open(ModelWithButtonComponent, { centered: true });
    ref.componentInstance.errorTitle = this.modalData.modalTitle;
    ref.componentInstance.errorMessage = this.modalData.modalMessage;
    ref.componentInstance.primaryActionLabel = this.translator.RETURN_HOME;
    ref.componentInstance.primaryAction.subscribe((emittedValue) => {
      window.open('/', '_self');
    });
  }

  showHelpModal() {
    const ref = this.modal.open(ErrorModalComponent, { centered: true });
    ref.componentInstance.errorTitle = this.helpData.modalTitle;
    ref.componentInstance.errorDescription = this.helpData.modalDesc;
    return false;
  }

  goToNext(form) {
    if (this.myFinancialForm.controls.suffEmergencyFund.value === 'no') {
      this.showEmergencyFundModal();
      return;
    }
    if (!form.valid) {
      Object.keys(form.controls).forEach((key) => {
        form.get(key).markAsDirty();
      });
    }
    else {
      this.saveAndProceed(form);
    }
  }

  saveAndProceed(form: any) {
    const invCommonFormValues = this.investmentCommonService.getInvestmentCommonFormData();
    this.selectedPortfolioType = this.investmentEngagementJourneyService.getSelectPortfolioType();
    const selectedPortfolioType = (this.selectedPortfolioType === INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.SELECT_POROFOLIO_TYPE.WISEINCOME_PORTFOLIO) ? INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.SELECT_POROFOLIO_TYPE.WISEINCOME : INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.SELECT_POROFOLIO_TYPE.INVESTMENT;
    let portfolioTypeArray = this.investmentCommonService.getPortfolioType();
    let portfolioType = this.investmentEngagementJourneyService.filterDataByInput(portfolioTypeArray.portfolioType, 'name', selectedPortfolioType);
    form.value.portfolioTypeId = portfolioType.id;
    this.investmentEngagementJourneyService.setYourFinancial(form.value);
    this.investmentEngagementJourneyService.savePersonalInfo(invCommonFormValues).subscribe((data) => {
      this.investmentCommonService.clearAccountCreationActions();
      if (data) {
        this.authService.saveEnquiryId(data.objectList.enquiryId);
        if (selectedPortfolioType === INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.SELECT_POROFOLIO_TYPE.WISEINCOME) {
          if (this.authService.isSignedUser()) {
            this.getPortfolioAllocationDetails();
          } else {
            this.router.navigate([INVESTMENT_ENGAGEMENT_JOURNEY_ROUTE_PATHS.PORTFOLIO_RECOMMENDATION]);
          }
        } else {
          if (this.investmentAccountService.isReassessActive()) {
            this.router.navigate([INVESTMENT_COMMON_ROUTE_PATHS.CONFIRM_PORTFOLIO]);
          } else {
            this.router.navigate([INVESTMENT_ENGAGEMENT_JOURNEY_ROUTE_PATHS.GET_STARTED_STEP2]);
          }
        }
      }
    },
      (err) => {
        this.investmentAccountService.showGenericErrorModal();
      });
  }

  redirectToNextPage() {
    this.investmentCommonService.getAccountCreationActions().subscribe((data) => {
      if (this.investmentCommonService.isUserNotAllowed(data)) {
        this.investmentCommonService.goToDashboard();
      } else if (this.investmentAccountService.isReassessActive()) {
        this.router.navigate([INVESTMENT_COMMON_ROUTE_PATHS.CONFIRM_PORTFOLIO]);
      } else if (this.investmentCommonService.isUsersFirstPortfolio(data)) {
        this.router.navigate([INVESTMENT_ACCOUNT_ROUTE_PATHS.START]);
      } else {
        this.router.navigate([INVESTMENT_COMMON_ROUTE_PATHS.CONFIRM_PORTFOLIO]);
      }
    });
  }

  getPortfolioAllocationDetails() {
    this.loaderService.showLoader({
      title: this.loaderTitle,
      desc: this.loaderDescTwo
    });
    const params: any = this.constructParamsWithUserPortfolioType();
    if (params && params.enquiryId && params.jaAccountId) {
      this.investmentEngagementJourneyService.getJAPortfolioAllocationDetails(params).subscribe((data) => {
        let secondaryHolderMajorData = this.investmentEngagementJourneyService.getMajorSecondaryHolderData();
        let secondaryHolderMinorData = this.investmentEngagementJourneyService.getMinorSecondaryHolderData();
        if(secondaryHolderMajorData) {
          secondaryHolderMajorData.customerPortfolioId = data.objectList.customerPortfolioId;
          this.investmentEngagementJourneyService.setMajorSecondaryHolderData(secondaryHolderMajorData);
        }
        if(secondaryHolderMinorData) {
          secondaryHolderMinorData.customerPortfolioId = data.objectList.customerPortfolioId;
          this.investmentEngagementJourneyService.setMinorSecondaryHolderData(secondaryHolderMinorData);
        }
        this.loaderService.hideLoader();
        this.redirectToNextPage();
      },
        (err) => {
          this.loaderService.hideLoader();
          this.investmentAccountService.showGenericErrorModal();
        });
    } else if (params && params.enquiryId) {
      this.investmentEngagementJourneyService.getPortfolioAllocationDetails(params).subscribe((data) => {
        this.loaderService.hideLoader();
        this.redirectToNextPage();
      },
        (err) => {
          this.loaderService.hideLoader();
          this.investmentAccountService.showGenericErrorModal();
        });
    } else {
      this.navbarService.logoutUser();
    }
  }

  constructGetAllocationParamsWithJAAccountId() {
    const majorHolderData = this.investmentEngagementJourneyService.getMajorSecondaryHolderData();
    const minorHolderData = this.investmentEngagementJourneyService.getMinorSecondaryHolderData();
    let jaAccountId;
    if (majorHolderData && majorHolderData.jaAccountId) {
      jaAccountId = majorHolderData.jaAccountId;
    } else if (minorHolderData && minorHolderData.jaAccountId) {
      jaAccountId = minorHolderData.jaAccountId;
    }
    return {
      enquiryId: this.authService.getEnquiryId(),
      jaAccountId: jaAccountId
    };
  }

  constructGetAllocationParams() {
    return {
      enquiryId: this.authService.getEnquiryId()
    };
  }

  constructParamsWithUserPortfolioType() {
    if (this.userPortfolioType === INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.PORTFOLIO_TYPE.JOINT_ACCOUNT_ID) {
      return this.constructGetAllocationParamsWithJAAccountId();
    } else {
      return this.constructGetAllocationParams();
    }
  }

  goBack(form) {
    this.investmentEngagementJourneyService.setYourFinancial(form.value);
    this.router.navigate([INVESTMENT_ENGAGEMENT_JOURNEY_ROUTE_PATHS.INVESTMENT_AMOUNT]);
  }

  isLoggedInUser() {
    return this.authService.isSignedUser();
  }

  getFinancialDetails() {
    this.loaderService.showLoader({
      title: this.loaderTitle,
      desc: this.loaderDesc
    });
    this.investmentEngagementJourneyService.getUserFinancialDetails().subscribe((data) => {
      this.loaderService.hideLoader();
      if (data.responseMessage.responseCode >= 6000) {
        this.investmentEngagementJourneyService.setFinancialDetails(data.objectList);
        this.setControlValues(data.objectList);
      }
    },
      (err) => {
        this.loaderService.hideLoader();
        this.investmentAccountService.showGenericErrorModal();
      });
  }

  isFirstTimeUser() {
    if (typeof this.financialFormValue.firstTimeUser === 'undefined') {
      this.financialFormValue.firstTimeUser = true;
      return true;
    }
    return false;
  }

  setControlValues(financialDetails) {
    if (financialDetails) {
      this.myFinancialForm.controls.monthlyIncome.setValue(financialDetails.monthlyIncome);
      this.myFinancialForm.controls.percentageOfSaving.setValue(financialDetails.incomePercentageSaved);
      this.myFinancialForm.controls.totalAssets.setValue(financialDetails.totalAssets);
      this.myFinancialForm.controls.totalLiabilities.setValue(financialDetails.totalLoans);
    }
  }
}
