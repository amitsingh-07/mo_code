import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import {
    INVESTMENT_ENGAGEMENT_JOURNEY_ROUTE_PATHS
} from '../../investment-engagement-journey/investment-engagement-journey-routes.constants';
import { ProfileIcons } from '../../investment-engagement-journey/recommendation/profileIcons';
import { InvestmentAccountService } from '../../investment-account/investment-account-service';
import { FooterService } from '../../../shared/footer/footer.service';
import { HeaderService } from '../../../shared/header/header.service';
import { AuthenticationService } from '../../../shared/http/auth/authentication.service';
import { ErrorModalComponent } from '../../../shared/modal/error-modal/error-modal.component';
import {
    ModelWithButtonComponent
} from '../../../shared/modal/model-with-button/model-with-button.component';
import { NavbarService } from '../../../shared/navbar/navbar.service';
import { SignUpApiService } from '../../../sign-up/sign-up.api.service';
import { SignUpService } from '../../../sign-up/sign-up.service';
import { MANAGE_INVESTMENTS_ROUTE_PATHS } from '../manage-investments-routes.constants';
import { MANAGE_INVESTMENTS_CONSTANTS } from '../manage-investments.constants';
import { ManageInvestmentsService } from '../manage-investments.service';
import { ToastService } from './../../../shared/components/toast/toast.service';
@Component({
  selector: 'app-investment-overview',
  templateUrl: './investment-overview.component.html',
  styleUrls: ['./investment-overview.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class InvestmentOverviewComponent implements OnInit {
  totalPortfolio;
  welcomeInfo;
  investmentoverviewlist: any;
  portfolioList;
  totalReturns: any;
  cashAccountBalance: any;
  totalValue: any;
  selectedDropDown;
  pageTitle: string;
  moreList: any;
  PortfolioValues;
  portfolios;
  userProfileInfo;
  riskProfileImg: any;
  portfolio;
  productCode;
  entitlements: any;

  showAlretPopUp = false;
  selected;

  // transfer instructions
  bankDetails;
  paynowDetails;
  transferInstructionModal;
  isToastMessageShown;
  toastMsg;
  investParam = {
    profileName: 'Miya\'s University Fund'
  };
  constructor(
    public readonly translate: TranslateService,
    public headerService: HeaderService,
    private formBuilder: FormBuilder,
    public authService: AuthenticationService,
    private router: Router,
    public navbarService: NavbarService,
    private modal: NgbModal,
    public footerService: FooterService,
    private currencyPipe: CurrencyPipe,
    public signUpService: SignUpService,
    public activeModal: NgbActiveModal,
    public manageInvestmentsService: ManageInvestmentsService,
    private investmentAccountService: InvestmentAccountService,
    private signUpApiService: SignUpApiService,
    private toastService: ToastService
  ) {
    this.translate.use('en');
    this.translate.get('COMMON').subscribe((result: string) => {
      this.pageTitle = this.translate.instant('YOUR_INVESTMENT.TITLE');
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
    this.getMoreList();
    this.getInvestmentOverview();
    this.userProfileInfo = this.signUpService.getUserProfileInfo();
    this.getTransferDetails();
   // this.toastService.showToast({toastMessage:'Portfolio "Miya\'s University Fund" has been added', toastLink:'View'});

  }
  getMoreList() {
    this.moreList = MANAGE_INVESTMENTS_CONSTANTS.INVESTMENT_OVERVIEW.MORE_LIST;
  }
  addPortfolio() {
    this.router.navigate([INVESTMENT_ENGAGEMENT_JOURNEY_ROUTE_PATHS.GET_STARTED_STEP1]);
  }
  yourPortfolio(portfolio) {
    if (portfolio.portfolioStatus !== 'EXPIRED') {
      this.manageInvestmentsService.setPortfolioValues(portfolio);
      this.manageInvestmentsService.setHoldingValues(portfolio.dpmsDetailsDisplay);
      this.router.navigate([MANAGE_INVESTMENTS_ROUTE_PATHS.YOUR_PORTFOLIO]);
    }
  }
  getInvestmentOverview() {
    this.manageInvestmentsService.getInvestmentOverview().subscribe((data) => {
      if (data.responseMessage.responseCode >= 6000) {
        this.investmentoverviewlist = data.objectList;
        this.totalReturns = this.investmentoverviewlist.data.totalReturns
          ? this.investmentoverviewlist.data.totalReturns
          : 0;
        this.cashAccountBalance = this.investmentoverviewlist.data.cashAccountDetails.availableBalance
          ? this.investmentoverviewlist.data.cashAccountDetails.availableBalance
          : 0;
        this.totalValue = this.investmentoverviewlist.data.totalValue
          ? this.investmentoverviewlist.data.totalValue
          : 0;
        this.portfolioList = this.investmentoverviewlist.data.portfolios;
        this.totalPortfolio = this.portfolioList.length;
        this.welcomeInfo = {
          name: this.userProfileInfo.firstName,
          total: this.totalPortfolio
        };
        this.manageInvestmentsService.setUserPortfolioList(this.portfolioList);
        if (this.investmentoverviewlist.data.cashAccountDetails) {
          this.manageInvestmentsService.setUserCashBalance(
            this.investmentoverviewlist.data.cashAccountDetails.availableBalance
          );
        }
        /* First portfolio's entitlement is considered for now as global entitlement,
            need to change when multiple portfolio logic is implemented */
        this.entitlements = this.manageInvestmentsService.getEntitlementsFromPortfolio(this.portfolioList[0]);
      } else if (
        data.objectList &&
        data.objectList.length &&
        data.objectList[data.objectList.length - 1].serverStatus &&
        data.objectList[data.objectList.length - 1].serverStatus.errors &&
        data.objectList[data.objectList.length - 1].serverStatus.errors.length
      ) {
        this.showCustomErrorModal(
          'Error!',
          data.objectList[data.objectList.length - 1].serverStatus.errors[0].msg
        );
      } else if (data.responseMessage && data.responseMessage.responseDescription) {
        const errorResponse = data.responseMessage.responseDescription;
        this.showCustomErrorModal('Error!', errorResponse);
      } else {
        this.investmentAccountService.showGenericErrorModal();
      }
    },
    (err) => {
      this.investmentAccountService.showGenericErrorModal();
    });
  }

  showTotalReturnPopUp() {
    const ref = this.modal.open(ErrorModalComponent, { centered: true });
    ref.componentInstance.errorTitle = this.translate.instant(
      'YOUR_PORTFOLIO.MODAL.TOTAL_RETURNS.TITLE'
    );
    ref.componentInstance.errorMessage = this.translate.instant(
      'YOUR_PORTFOLIO.MODAL.TOTAL_RETURNS.MESSAGE'
    );
  }
  ViewTransferInst(productCode) {
    this.productCode = productCode;
    this.getPortfolioHoldingList(productCode);   // SET PORTFOLIO CODE
  }

  getPortfolioHoldingList(portfolioid) {   // CALLING THE API
    this.manageInvestmentsService
      .getIndividualPortfolioDetails(portfolioid)
      .subscribe((data) => {
        this.portfolio = data.objectList;
        const fundingParams = this.constructFundingParams(data.objectList);
        this.manageInvestmentsService.setFundingDetails(fundingParams);
        this.router.navigate([MANAGE_INVESTMENTS_ROUTE_PATHS.FUNDING_INSTRUCTIONS]);
      },
      (err) => {
        this.investmentAccountService.showGenericErrorModal();
      });
  }

  constructFundingParams(data) {   // SET FUND DETAILS VAlUES
    return {
      source: 'FUNDING',
      redirectTo: 'PORTFOLIO',
      portfolio: {
        productName: data.portfolioName,
        riskProfile: data.riskProfile
      },
      oneTimeInvestment: data.initialInvestment,
      monthlyInvestment: data.monthlyInvestment,
      fundingType: '',
      isAmountExceedBalance: 0,
      exceededAmount: 0
    };
  }
  // tslint:disable-next-line
  showCashAccountPopUp() {
    const ref = this.modal.open(ErrorModalComponent, { centered: true });
    ref.componentInstance.errorTitle = this.translate.instant(
      'YOUR_PORTFOLIO.MODAL.CASH_ACCOUNT_BALANCE.TITLE'
    );
    ref.componentInstance.errorMessage = this.translate.instant(
      'YOUR_PORTFOLIO.MODAL.CASH_ACCOUNT_BALANCE.MESSAGE'
    );
  }

  getImg(i) {
    const riskProfileImg = ProfileIcons[i - 1]['icon'];
    return riskProfileImg;
  }
  alertPopUp(i, event) {
    event.stopPropagation();
    this.selected = i;
    this.showAlretPopUp = true;
  }
  ClosedPopup() {
    this.showAlretPopUp = false;
  }
  deletePortfolio(portfolio) {
    const ref = this.modal.open(ModelWithButtonComponent, { centered: true });
    ref.componentInstance.errorTitle = this.translate.instant('YOUR_INVESTMENT.DELETE');
    // tslint:disable-next-line:max-line-length
    ref.componentInstance.errorMessage = this.translate.instant(
      'YOUR_INVESTMENT.DELETE_TXT'
    );
    ref.componentInstance.yesOrNoButton = 'Yes';
    ref.componentInstance.yesClickAction.subscribe(() => {
      this.manageInvestmentsService.deletePortfolio(portfolio).subscribe((data) => {
        if (data.responseMessage.responseCode < 6000) {
          if (
            data.objectList &&
            data.objectList.length &&
            data.objectList[data.objectList.length - 1].serverStatus &&
            data.objectList[data.objectList.length - 1].serverStatus.errors &&
            data.objectList[data.objectList.length - 1].serverStatus.errors.length
          ) {
            this.showCustomErrorModal(
              'Error!',
              data.objectList[data.objectList.length - 1].serverStatus.errors[0].msg
            );
          } else if (data.responseMessage && data.responseMessage.responseDescription) {
            const errorResponse = data.responseMessage.responseDescription;
            this.showCustomErrorModal('Error!', errorResponse);
          } else {
            this.investmentAccountService.showGenericErrorModal();
          }
        } else {
          this.authService.saveEnquiryId(null);
          const translateParams = {
            portfolioName: portfolio.riskProfile.type
          };
          const toastMsg = this.translate.instant('YOUR_INVESTMENT.PORTFOLIO_DELETE_MESSAGE', translateParams);
          this.showToastMessage(toastMsg);
          this.getInvestmentOverview();
          this.getUserProfileInfo();
        }
      },
      (err) => {
        this.investmentAccountService.showGenericErrorModal();
      });
    });
    ref.componentInstance.noClickAction.subscribe(() => { });
  }

  selectOption(option) {
    this.manageInvestmentsService.showMenu(option);
  }
  formatReturns(value) {
    return this.investmentAccountService.formatReturns(value);
  }

  showCustomErrorModal(title, desc) {
    const ref = this.modal.open(ErrorModalComponent, { centered: true });
    ref.componentInstance.errorTitle = title;
    ref.componentInstance.errorMessage = desc;
  }

/*
* Method to get transfer details
*/
 getTransferDetails() {
  this.manageInvestmentsService.getTransferDetails().subscribe((data) => {
    this.manageInvestmentsService.setBankPayNowDetails(data.objectList[0]);
  },
  (err) => {
    this.investmentAccountService.showGenericErrorModal();
  });
 }

/*
* Method to show transfer instruction steps modal
*/
showTransferInstructionModal() {
  this.manageInvestmentsService.showTransferInstructionModal();
}

/*
* Method to show recipients/entity name instructions modal
*/
showPopUp() {
  this.manageInvestmentsService.showPopUp();
}

  showToastMessage(msg) {
    this.isToastMessageShown = true;
    this.toastMsg = msg;
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 1);
    setTimeout(() => {
      this.isToastMessageShown = false;
    }, 3000);
  }

  investAgain(portfolio) {
    this.manageInvestmentsService.setPortfolioValues(portfolio);
    this.router.navigate([MANAGE_INVESTMENTS_ROUTE_PATHS.TOPUP]);
  }

  startPortfolio() {
    this.authService.saveEnquiryId(null);
    this.router.navigate([INVESTMENT_ENGAGEMENT_JOURNEY_ROUTE_PATHS.GET_STARTED_STEP1]);
  }
  gotoTopUp() {  // GO TO TOP-UP
    this.router.navigate([MANAGE_INVESTMENTS_ROUTE_PATHS.TOPUP]);
  }

  getUserProfileInfo() {
    this.signUpApiService.getUserProfileInfo().subscribe((userInfo) => {
      if (userInfo.responseMessage.responseCode < 6000) {
        // ERROR SCENARIO
        if (
          userInfo.objectList &&
          userInfo.objectList.length &&
          userInfo.objectList[userInfo.objectList.length - 1].serverStatus &&
          userInfo.objectList[userInfo.objectList.length - 1].serverStatus.errors &&
          userInfo.objectList[userInfo.objectList.length - 1].serverStatus.errors.length
        ) {
          this.showCustomErrorModal(
            'Error!',
            userInfo.objectList[userInfo.objectList.length - 1].serverStatus.errors[0].msg
          );
        } else if (userInfo.responseMessage && userInfo.responseMessage.responseDescription) {
          const errorResponse = userInfo.responseMessage.responseDescription;
          this.showCustomErrorModal('Error!', errorResponse);
        } else {
          this.investmentAccountService.showGenericErrorModal();
        }
      } else {
        this.signUpService.setUserProfileInfo(userInfo.objectList);
        /* First portfolio's entitlement is considered for now as global entitlement, 
            need to change when multiple portfolio logic is implemented */
        this.entitlements = this.manageInvestmentsService.getEntitlementsFromPortfolio(this.portfolioList[0]);
      }
    },
    (err) => {
      this.investmentAccountService.showGenericErrorModal();
    });
  }

  getEntitlementsFromPortfolio(portfolio) {
    return this.manageInvestmentsService.getEntitlementsFromPortfolio(portfolio);
  }

  scrollTop() {
    window.scrollTo(0, 0);
  }
}
