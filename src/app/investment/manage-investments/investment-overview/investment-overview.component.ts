import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { LoaderService } from '../../../shared/components/loader/loader.service';
import { FooterService } from '../../../shared/footer/footer.service';
import { HeaderService } from '../../../shared/header/header.service';
import { AuthenticationService } from '../../../shared/http/auth/authentication.service';
import { ErrorModalComponent } from '../../../shared/modal/error-modal/error-modal.component';
import { NavbarService } from '../../../shared/navbar/navbar.service';
import { SignUpApiService } from '../../../sign-up/sign-up.api.service';
import { SIGN_UP_ROUTE_PATHS } from '../../../sign-up/sign-up.routes.constants';
import { SignUpService } from '../../../sign-up/sign-up.service';
import { InvestmentAccountService } from '../../investment-account/investment-account-service';
import {
  INVESTMENT_COMMON_ROUTE_PATHS
} from '../../investment-common/investment-common-routes.constants';
import { MANAGE_INVESTMENTS_ROUTE_PATHS } from '../manage-investments-routes.constants';
import { MANAGE_INVESTMENTS_CONSTANTS } from '../manage-investments.constants';
import { ManageInvestmentsService } from '../manage-investments.service';
import { environment } from './../../../../environments/environment';
import { CarouselModalComponent } from './../../../shared/modal/carousel-modal/carousel-modal.component';
import { INVESTMENT_COMMON_CONSTANTS } from './../../investment-common/investment-common.constants';
import { Util } from '../../../shared/utils/util';

@Component({
  selector: 'app-investment-overview',
  templateUrl: './investment-overview.component.html',
  styleUrls: ['./investment-overview.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class InvestmentOverviewComponent implements OnInit, OnDestroy {
  totalPortfolio;
  welcomeInfo;
  investmentoverviewlist: any;
  portfolioList;
  cashAccountBalance: any;
  totalValue: any;
  selectedDropDown;
  pageTitle: string;
  moreList: any;
  PortfolioValues;
  portfolios;
  userProfileInfo;
  riskProfileImg: any;
  entitlements: any;
  showAlretPopUp = false;
  selected;
  showMpPopup = false;
  showAnimation = false;
  showFullContent = false;
  // transfer instructions
  bankDetails;
  paynowDetails;
  transferInstructionModal;
  isToastMessageShown;
  toastMsg;
  private subscription: Subscription;
  portfolioCategories;
  selectedCategory;
  wiseIncomeInfo: any;
  readLess: any;
  readMore: any;
  wiseIncomePortfolio: any[];
  showBannerInfo = false;
  wiseIncomeInfoMonth: any;
  backPressSubscription : Subscription;
  constructor(
    public readonly translate: TranslateService,
    public headerService: HeaderService,
    public authService: AuthenticationService,
    private router: Router,
    public navbarService: NavbarService,
    private modal: NgbModal,
    public footerService: FooterService,
    public signUpService: SignUpService,
    public activeModal: NgbActiveModal,
    public manageInvestmentsService: ManageInvestmentsService,
    private investmentAccountService: InvestmentAccountService,
    private signUpApiService: SignUpApiService,
    private loaderService: LoaderService
  ) {
      
    this.translate.use('en');
    this.translate.get('COMMON').subscribe((result: string) => {
      this.pageTitle = this.translate.instant('YOUR_INVESTMENT.TITLE');
      this.wiseIncomeInfoMonth = this.translate.instant('YOUR_INVESTMENT.WISE_INCOME_INFO');
      this.readMore = this.translate.instant('YOUR_INVESTMENT.READ_MORE');
      this.readLess = this.translate.instant('YOUR_INVESTMENT.READ_LESS');
      this.setPageTitle(this.pageTitle);
      MANAGE_INVESTMENTS_CONSTANTS.INVESTMENT_OVERVIEW.WISE_INCOME_TIME_INTERVALS.forEach(wiseIncome => {
        if (!this.showBannerInfo) {
          this.checkWiseIncomeStatus(wiseIncome.startTime, wiseIncome.endTime, wiseIncome.month);
        }
      });
    });

  }

  setPageTitle(title: string) {
    this.navbarService.setPageTitle(title);
  }

  ngOnInit() {
    if (environment.hideHomepage) {
      this.navbarService.setNavbarMode(105);
    } else {
      this.navbarService.setNavbarMode(103);
    }
    this.navbarService.setNavbarMobileVisibility(false);
    this.footerService.setFooterVisibility(false);
    this.getInvestmentOverview(false);
    this.headerSubscription();
    this.getMoreList();
    this.userProfileInfo = this.signUpService.getUserProfileInfo();
    this.checkMpPopStatus();
    this.toastMsg = this.manageInvestmentsService.getToastMessage();

    this.portfolioCategories = INVESTMENT_COMMON_CONSTANTS.PORTFOLIO_CATEGORY;
    /** Redirects to Dashboard on click of Device Back*/
    this.backPressSubscription = this.navbarService
      .subscribeDeviceBackPress$
      .subscribe(() => {
        this.router.navigate([SIGN_UP_ROUTE_PATHS.DASHBOARD]);
      });  
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.backPressSubscription.unsubscribe();
    this.navbarService.unsubscribeBackPress();
  }

  getMoreList() {
    this.moreList = MANAGE_INVESTMENTS_CONSTANTS.INVESTMENT_OVERVIEW.MORE_LIST;
  }

  selectToastMessageDetail(url) {
    if (this.toastMsg && this.toastMsg['portfolio']) {
      this.router.navigate(url);
    }
  }

  yourPortfolio(portfolio) {
    if (portfolio.portfolioStatus !== 'EXPIRED') {
      this.manageInvestmentsService.setSelectedCustomerPortfolioId(portfolio.customerPortfolioId);
      this.router.navigate([MANAGE_INVESTMENTS_ROUTE_PATHS.YOUR_PORTFOLIO]);
    }
  }

  yourPortfolioDynamic() {
    if (this.toastMsg) {
      this.manageInvestmentsService.setSelectedCustomerPortfolioId(this.toastMsg.id);
      this.router.navigate([this.toastMsg.link_url]);
    }
  }

  getInvestmentOverview(isToastMsgEnabled: boolean) {
    this.translate.get('COMMON').subscribe((result: string) => {
      this.loaderService.showLoader({
        title: this.translate.instant('YOUR_PORTFOLIO.MODAL.INVESTMENT_OVERVIEW.TITLE'),
        desc: this.translate.instant('YOUR_PORTFOLIO.MODAL.INVESTMENT_OVERVIEW.MESSAGE'),
        autoHide: false
      });
    });
    this.manageInvestmentsService.getInvestmentOverview().subscribe((data) => {
      this.loaderService.hideLoaderForced();
      if (isToastMsgEnabled) {
        this.toastMsg = this.manageInvestmentsService.getToastMessage();
        this.showToastMessage();
      }
      if (data.responseMessage.responseCode >= 6000) {
        this.setInvestmentData(data);
      } else if (
        data.objectList &&
        data.objectList['length'] &&
        data.objectList[data.objectList['length'] - 1].serverStatus &&
        data.objectList[data.objectList['length'] - 1].serverStatus.errors &&
        data.objectList[data.objectList['length'] - 1].serverStatus.errors.length
      ) {
        this.showCustomErrorModal(
          'Error!',
          data.objectList[data.objectList['length'] - 1].serverStatus.errors[0].msg
        );
      } else if (data.responseMessage && data.responseMessage.responseDescription) {
        const errorResponse = data.responseMessage.responseDescription;
        this.showCustomErrorModal('Error!', errorResponse);
      } else {
        this.investmentAccountService.showGenericErrorModal();
      }
    },
      (err) => {
        this.loaderService.hideLoaderForced();
        this.investmentAccountService.showGenericErrorModal();
      });
  }

  setInvestmentData(data) {
    this.investmentoverviewlist = (data.objectList) ? data.objectList : {};
    this.setSelectedCategory(this.manageInvestmentsService.selectedPortfolioCategory);
    this.portfolioList = (this.investmentoverviewlist.portfolios) ? this.investmentoverviewlist.portfolios : [];
    this.totalPortfolio = this.portfolioList.length;
    if (this.portfolioList) {
      this.filterWiseIncomePortfolio(this.portfolioList);
    }
    // Toggle show/hide promo code/wrap fee link in menu
    if (this.totalPortfolio !== 0) {
      this.navbarService.setMenuItemInvestUser(true);
    } else {
      this.navbarService.setMenuItemInvestUser(false);
    }
    this.welcomeInfo = {
      name: this.userProfileInfo.firstName,
      total: this.totalPortfolio
    };
    this.manageInvestmentsService.setJointAccountUser(this.investmentoverviewlist.jauser);
    this.manageInvestmentsService.setUserPortfolioList(this.portfolioList);
    if (this.investmentoverviewlist.cashAccountDetails) {
      this.manageInvestmentsService.setUserCashBalance(
        this.investmentoverviewlist.cashAccountDetails.availableBalance
      );
    }
    this.showToastMessage();
  }

  filterWiseIncomePortfolio(portfolioList) {
    this.wiseIncomePortfolio = []
    portfolioList.forEach(portfolio => {
      if (portfolio.portfolioCategory.toUpperCase() ===
        INVESTMENT_COMMON_CONSTANTS.PORTFOLIO_CATEGORY_TYPE.WISEINCOME.toUpperCase()) {
        this.wiseIncomePortfolio.push(portfolio);
      }
      return this.wiseIncomePortfolio;
    });
  }

  ViewTransferInst(productCode) {
    this.getCustomerPortfolioDetailsById(productCode);   // SET PORTFOLIO CODE
  }

  getCustomerPortfolioDetailsById(portfolioid) {   // CALLING THE API
    this.manageInvestmentsService.getCustomerPortfolioDetailsById(portfolioid).subscribe((data) => {
      const fundingParams = this.constructFundingParams(data.objectList);
      this.manageInvestmentsService.setFundingDetails(fundingParams);
      this.router.navigate([INVESTMENT_COMMON_ROUTE_PATHS.FUNDING_INSTRUCTIONS]);
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

  showCashAccountPopUp() {
    const ref = this.modal.open(ErrorModalComponent, { centered: true });
    ref.componentInstance.errorTitle = this.translate.instant(
      'YOUR_PORTFOLIO.MODAL.CASH_ACCOUNT_BALANCE.TITLE'
    );
    ref.componentInstance.errorMessage = this.translate.instant(
      'YOUR_PORTFOLIO.MODAL.CASH_ACCOUNT_BALANCE.MESSAGE'
    );
  }

  alertPopUp(i, event) {
    event.stopPropagation();
    this.selected = i;
    this.showAlretPopUp = true;
  }

  ClosedPopup() {
    this.showAlretPopUp = false;
  }

  formatReturns(value) {
    return this.investmentAccountService.formatReturns(value);
  }

  showCustomErrorModal(title, desc) {
    const ref = this.modal.open(ErrorModalComponent, { centered: true });
    ref.componentInstance.errorTitle = title;
    ref.componentInstance.errorMessage = desc;
  }

  showToastMessage() {
    if (this.toastMsg && this.toastMsg['isShown']) {
      this.isToastMessageShown = true;
      this.manageInvestmentsService.clearToastMessage();
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 1);
      setTimeout(() => {
        this.isToastMessageShown = false;
        this.toastMsg = null;
      }, 3000);
    }
  }

  investAgain(portfolio) {
    this.manageInvestmentsService.setSelectedCustomerPortfolio(portfolio);
    this.router.navigate([MANAGE_INVESTMENTS_ROUTE_PATHS.TOPUP]);
  }

  verticalScrollPresent() {
    return (document.documentElement.scrollHeight > document.documentElement.clientHeight);
  }

  gotoTopUp(portfolio?) {
    // Added check if got portfolio, set it as selected one else set null for the main top up button
    if (portfolio) {
      this.manageInvestmentsService.setSelectedCustomerPortfolioId(portfolio['customerPortfolioId']);
      this.manageInvestmentsService.setSelectedCustomerPortfolio(portfolio);
    } else {
      this.manageInvestmentsService.setSelectedCustomerPortfolioId(null);
      this.manageInvestmentsService.setSelectedCustomerPortfolio(null);
    }
    // GO TO TOP-UP
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
      }
    },
      (err) => {
        this.investmentAccountService.showGenericErrorModal();
      });
  }

  scrollTop() {
    window.scrollTo(0, 0);
  }

  headerSubscription() {
    this.subscription = this.navbarService.subscribeBackPress().subscribe((event) => {
      if (event && event !== '') {
        this.router.navigate([SIGN_UP_ROUTE_PATHS.DASHBOARD]);
      }
    });
  }

  // Check if user is first time seeing SRS popup
  checkMpPopStatus() {
    if (this.userProfileInfo.id) {
      this.signUpApiService.getPopupStatus(this.userProfileInfo.id, 'WS_POP').subscribe((status) => {
        // Check if track_status is available or false
        if (!status.objectList || !status.objectList['trackStatus']) {
          this.showMpPopup = true;
          this.checkAnimation();
        }
      }, (error) => console.log('ERROR: ', error));
    }
  }

  // Check if user has seen the animation before
  checkAnimation() {
    const customerId = this.userProfileInfo.id;
    let parsedArray = [];
    if (window.localStorage.getItem('MP_ANIMATION') !== null) {
      parsedArray = JSON.parse(window.localStorage.getItem('MP_ANIMATION'));
    }
    if (window.localStorage.getItem('MP_ANIMATION') === null || !parsedArray.includes(customerId)) {
      this.showAnimation = true;
      parsedArray.push(customerId);
      window.localStorage.setItem('MP_ANIMATION', JSON.stringify(parsedArray));
    }
  }

  // Show Multi Portfolio Walkthrough Popup
  openMPWalkthrough() {
    const ref = this.modal.open(CarouselModalComponent, { centered: true, windowClass: 'mp-walkthrough-modal' });
    ref.componentInstance.slides = this.translate.instant('YOUR_INVESTMENT.MP_WALKTHROUGH.MP_WALKTHROUGH_SLIDES');
    ref.componentInstance.startBtnTxt = this.translate.instant('YOUR_INVESTMENT.MP_WALKTHROUGH.START_BTN');
    ref.componentInstance.endBtnTxt = this.translate.instant('YOUR_INVESTMENT.MP_WALKTHROUGH.END_BTN');
    ref.componentInstance.imgClass = 'mp-walkthrough-img';
    ref.componentInstance.imgTitleClass = 'mp-walkthrough-img-title';
    ref.componentInstance.textStyle = { 'margin-top': '10px', 'padding': '0 30px' };
    ref.componentInstance.btnDivStyle = { 'padding-bottom': '40px' };
    ref.componentInstance.closeAction.subscribe((emittedValue) => {
      this.closeMpPopup();
    });
  }

  // Set the status to true as user don't want to see this popup anymore
  closeMpPopup(event?) {
    if (this.userProfileInfo.id) {
      this.signUpApiService.setPopupStatus(this.userProfileInfo.id, 'WS_POP').subscribe((status) => {
        if (status.responseMessage.responseCode === 6000) {
          this.showMpPopup = false;
        }
      }, (error) => console.log('ERROR: ', error));
    }
    if (event) {
      event.stopPropagation();
    }
  }

  backDashboard(event?) {
    this.router.navigate([SIGN_UP_ROUTE_PATHS.DASHBOARD]);
    if (event) {
      event.stopPropagation();
    }
  }

  // Set the selected category base on dashboard click and category filter change
  setSelectedCategory(category) {
    this.selectedCategory = category;
    this.manageInvestmentsService.setSelectedPortfolioCategory(category);
    switch (category) {
      case INVESTMENT_COMMON_CONSTANTS.PORTFOLIO_CATEGORY.ALL:
        this.cashAccountBalance = this.investmentoverviewlist['overallCashAccountBalance']
          ? this.investmentoverviewlist['overallCashAccountBalance'] : 0;
        this.totalValue = this.investmentoverviewlist['overallPortfolioValue']
          ? this.investmentoverviewlist['overallPortfolioValue'] : 0;
        this.scrollFilterIntoView(INVESTMENT_COMMON_CONSTANTS.PORTFOLIO_CATEGORY.ALL);
        break;
      case INVESTMENT_COMMON_CONSTANTS.PORTFOLIO_CATEGORY.INVESTMENT:
        this.cashAccountBalance = this.investmentoverviewlist['totalCashAccountBalance']
          ? this.investmentoverviewlist['totalCashAccountBalance'] : 0;
        this.totalValue = this.investmentoverviewlist['totalValue']
          ? this.investmentoverviewlist['totalValue'] : 0;
        this.scrollFilterIntoView(INVESTMENT_COMMON_CONSTANTS.PORTFOLIO_CATEGORY.INVESTMENT);
        break;
      case INVESTMENT_COMMON_CONSTANTS.PORTFOLIO_CATEGORY.WISEINCOME:
        this.cashAccountBalance = this.investmentoverviewlist['wiseIncomeTotalCashAccountBalance']
          ? this.investmentoverviewlist['wiseIncomeTotalCashAccountBalance'] : 0;
        this.totalValue = this.investmentoverviewlist['wiseIncomeTotalValue']
          ? this.investmentoverviewlist['wiseIncomeTotalValue'] : 0;
        this.scrollFilterIntoView(INVESTMENT_COMMON_CONSTANTS.PORTFOLIO_CATEGORY.WISEINCOME);
        break;
      case INVESTMENT_COMMON_CONSTANTS.PORTFOLIO_CATEGORY.WISESAVER:
        this.cashAccountBalance = this.investmentoverviewlist['wisesaverTotalCashAccountBalance']
          ? this.investmentoverviewlist['wisesaverTotalCashAccountBalance'] : 0;
        this.totalValue = this.investmentoverviewlist['wisesaverTotalValue']
          ? this.investmentoverviewlist['wisesaverTotalValue'] : 0;
        this.scrollFilterIntoView(INVESTMENT_COMMON_CONSTANTS.PORTFOLIO_CATEGORY.WISESAVER);
        break;
      case INVESTMENT_COMMON_CONSTANTS.PORTFOLIO_CATEGORY.CPF:
        this.cashAccountBalance = this.investmentoverviewlist['cpfTotalCashAccountBalance']
          ? this.investmentoverviewlist['cpfTotalCashAccountBalance'] : 0;
        this.totalValue = this.investmentoverviewlist['cpfTotalValue']
          ? this.investmentoverviewlist['cpfTotalValue'] : 0;
        this.scrollFilterIntoView(INVESTMENT_COMMON_CONSTANTS.PORTFOLIO_CATEGORY.CPF);
        break;
    }
  }
  // Auto scroll the category filter into view
  scrollFilterIntoView(filter) {
    const ele = document.querySelector('label[for="' + filter + '"]');
    if (ele) {
      ele.scrollIntoView({ behavior: "smooth", block: "end", inline: "center" });
    }
  }
  showText() {
    this.showFullContent = !this.showFullContent
  }

  checkWiseIncomeStatus(startTime, endTime, month) {
    const startDateTime = new Date(startTime);
    const endDateTime = new Date(endTime);
    if (Date.now() >= startDateTime.valueOf() && Date.now() <= endDateTime.valueOf()) {
      this.showBannerInfo = true;
      this.wiseIncomeInfo = this.wiseIncomeInfoMonth + month;
    }
  }

  emitToastMessage($event) {
    if ($event) {
      if (environment.hideHomepage) {
        this.navbarService.setNavbarMode(105);
      } else {
        this.navbarService.setNavbarMode(103);
      }
      this.getInvestmentOverview(true);
    } else {
      this.toastMsg = this.manageInvestmentsService.getToastMessage();
      this.showToastMessage();
    }
  }

  emitMessage(event) {
    if (event.action == MANAGE_INVESTMENTS_CONSTANTS.JOINT_ACCOUNT.REFRESH) {
      if (environment.hideHomepage) {
        this.navbarService.setNavbarMode(105);
      } else {
        this.navbarService.setNavbarMode(103);
      }
      this.getInvestmentOverview(false);
    }
  }

  checkIfInvestedWiseIncomePortfolio(wiseIncPortfolio) {
    let showWIBanner = false;
    if (wiseIncPortfolio && wiseIncPortfolio.length) {
      for (const portfolio of wiseIncPortfolio) {
        if (!Util.isEmptyOrNull(portfolio.wiPayoutEligible) && portfolio.wiPayoutEligible) {
          showWIBanner = true;
          break;
        }
      }
    }
    return showWIBanner;
  }
}
