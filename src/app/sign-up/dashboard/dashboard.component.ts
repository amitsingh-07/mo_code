import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin as observableForkJoin } from 'rxjs';

import { ConfigService, IConfig } from '../../config/config.service';
import { GuideMeApiService } from '../../guide-me/guide-me.api.service';
import { GuideMeService } from '../../guide-me/guide-me.service';
import {
  INVESTMENT_ACCOUNT_ROUTE_PATHS
} from '../../investment/investment-account/investment-account-routes.constants';
import {
  InvestmentAccountService
} from '../../investment/investment-account/investment-account-service';
import {
  INVESTMENT_COMMON_ROUTE_PATHS
} from '../../investment/investment-common/investment-common-routes.constants';
import {
  InvestmentCommonService
} from '../../investment/investment-common/investment-common.service';
import {
  INVESTMENT_ENGAGEMENT_JOURNEY_ROUTE_PATHS
} from '../../investment/investment-engagement-journey/investment-engagement-journey-routes.constants';
import {
  MANAGE_INVESTMENTS_ROUTE_PATHS
} from '../../investment/manage-investments/manage-investments-routes.constants';
import {
  ManageInvestmentsService
} from '../../investment/manage-investments/manage-investments.service';
import { FooterService } from '../../shared/footer/footer.service';
import { AuthenticationService } from '../../shared/http/auth/authentication.service';
import { CustomErrorHandlerService } from '../../shared/http/custom-error-handler.service';
import { CarouselModalComponent } from '../../shared/modal/carousel-modal/carousel-modal.component';
import { ErrorModalComponent } from '../../shared/modal/error-modal/error-modal.component';
import { NavbarService } from '../../shared/navbar/navbar.service';
import { SelectedPlansService } from '../../shared/Services/selected-plans.service';
import { WILL_WRITING_ROUTE_PATHS } from '../../will-writing/will-writing-routes.constants';
import { WillWritingApiService } from '../../will-writing/will-writing.api.service';
import { WillWritingService } from '../../will-writing/will-writing.service';
import { SignUpApiService } from '../sign-up.api.service';
import { SIGN_UP_CONFIG } from '../sign-up.constant';
import { SIGN_UP_ROUTE_PATHS } from '../sign-up.routes.constants';
import { SignUpService } from '../sign-up.service';
import { environment } from './../../../environments/environment';
import { INVESTMENT_COMMON_CONSTANTS } from '../../investment/investment-common/investment-common.constants';
import { ComprehensiveService } from '../../comprehensive/comprehensive.service';
import { Util } from '../../shared/utils/util';
import { appConstants } from '../../app.constants';
import { InvestmentEngagementJourneyService } from '../../investment/investment-engagement-journey/investment-engagement-journey.service';
import { INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS } from '../../investment/investment-engagement-journey/investment-engagement-journey.constants';
import { InvestModalComponent } from '../invest-modal/invest-modal.component';
import { FileUtil } from '../../shared/utils/file.util';
import { CapacitorUtils } from '../../shared/utils/capacitor.util';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit {
  userProfileInfo: any;
  showPortfolioPurchased = false;
  showStartInvesting = false;
  showInvestmentDetailsSaved = false;
  showCddCheckOngoing = false;
  showSuspendedAccount = false;
  showBlockedNationalityStatus = false;
  showSetupAccount = false;
  showCddCheckFail = false;
  showEddCheckFailStatus = false;
  isInvestmentEnabled = false;
  isInvestmentConfigEnabled = false;
  totalValue: any;
  totalReturns: any;
  availableBalance: any;
  portfolioExists = false;

  // Will Writing
  showWillWritingSection = false;
  wills: any = {};

  // Insurance
  showInsuranceSection = false;
  insurance: any = {};

  // transfer instructions
  bankDetails;
  paynowDetails;
  transferInstructionModal;
  investmentsSummary;

  isComprehensiveEnabled = false;
  portfolioCategory: any;

  // iFast Maintenance
  iFastMaintenance = false;
  getReferralInfo: any;
  cardCategory: { investment: any; insurance: any; comprehensiveInfo: any; };
  showFixedToastMessage: boolean;
  showModalStartDate = appConstants.SHOW_NEWUPDATES_MODAL_START_DATE;
  showModalEndDate = appConstants.SHOW_NEWUPDATES_MODAL_END_DATE;

  constructor(
    private router: Router,
    private configService: ConfigService,
    private signUpApiService: SignUpApiService,
    private investmentAccountService: InvestmentAccountService,
    private investmentCommonService: InvestmentCommonService,
    public readonly translate: TranslateService,
    private signUpService: SignUpService,
    public navbarService: NavbarService,
    public footerService: FooterService,
    private willWritingApiService: WillWritingApiService,
    private willWritingService: WillWritingService,
    private guideMeApiService: GuideMeApiService,
    public modal: NgbModal,
    public manageInvestmentsService: ManageInvestmentsService,
    public authService: AuthenticationService,
    public errorHandler: CustomErrorHandlerService,
    private guideMeService: GuideMeService,
    private selectedPlansService: SelectedPlansService,
    private comprehensiveService: ComprehensiveService,
    private investmentEngagementService: InvestmentEngagementJourneyService,
    private fileUtil: FileUtil
  ) {
    this.translate.use('en');
    this.translate.get('COMMON').subscribe((result: string) => {
      const initialMessage = this.investmentAccountService.getInitialMessageToShowDashboard();
      if (initialMessage && initialMessage.dashboardInitMessageShow) {
        this.investmentAccountService.setDashboardInitialMessage(null);
        const ref = this.modal.open(ErrorModalComponent, { centered: true });
        ref.componentInstance.errorTitle = initialMessage.dashboardInitMessageTitle;
        ref.componentInstance.errorMessage = initialMessage.dashboardInitMessageDesc;
      }
    });
    this.configService.getConfig().subscribe((config: IConfig) => {
      this.isInvestmentConfigEnabled = config.investmentEnabled;
      this.isComprehensiveEnabled = config.comprehensiveEnabled;
    });
    this.portfolioCategory = INVESTMENT_COMMON_CONSTANTS.PORTFOLIO_CATEGORY;
    this.getReferralCodeData();
  }

  ngOnInit() {
    this.navbarService.setNavbarVisibility(true);
    this.navbarService.setNavbarMobileVisibility(false);
    this.footerService.setFooterVisibility(false);
    if (environment.hideHomepage) {
      this.navbarService.setNavbarMode(9);
    } else {
      this.navbarService.setNavbarMode(100);
    }
    this.loadOptionListCollection();
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
        this.userProfileInfo = this.signUpService.getUserProfileInfo();
      }
    },
      (err) => {
        this.investmentAccountService.showGenericErrorModal();
      });

    // Will Writing
    this.willWritingApiService.getWill().subscribe((data) => {
      this.showWillWritingSection = true;
      if (data.responseMessage && data.responseMessage.responseCode === 6000) {
        this.wills.hasWills = true;
        this.wills.completedWill = data.objectList[0].willProfile.hasWills === 'Y';
        this.wills.lastUpdated = data.objectList[0].willProfile.profileLastUpdatedDate;
        if (!this.willWritingService.getIsWillCreated()) {
          this.willWritingService.convertWillFormData(data.objectList[0]);
          this.willWritingService.setIsWillCreated(true);
        }
      } else if (data.responseMessage && data.responseMessage.responseCode === 6004) {
        this.wills.hasWills = false;
      }
    });

    // Insurance
    this.guideMeApiService.getCustomerInsuranceDetails().subscribe((data) => {
      this.showInsuranceSection = true;
      if (data.responseMessage && data.responseMessage.responseCode === 6000) {
        this.insurance.hasInsurance = true;
        this.insurance.isGuidedJourney = data.objectList[0].financialStatusMapping !== null;
        const lastTransact = new Date(data.objectList[0].lastEnquiredDate.split(' ')[0]);
        this.insurance.lastTransactionDate = lastTransact;
        if (!this.guideMeService.checkGuidedDataLoaded() && this.insurance.isGuidedJourney) {
          this.guideMeService.convertResponseToGuideMeFormData(data.objectList[0]);
        }
      } else if (data.responseMessage && data.responseMessage.responseCode === 5003) {
        this.selectedPlansService.setInsuranceNewUser();
        this.insurance.hasInsurance = false;
      }
    });
    this.getInvestmentsSummary();
    this.getEmail();
    this.investmentAccountService.deactivateReassess();
    const toastMessage = this.comprehensiveService.getToastMessage();
    if (toastMessage) {
      this.showCopyToast();
    }
  }


  getReferralCodeData() {
    this.signUpService.getReferralCodeData().subscribe((data) => {
      this.getReferralInfo = data.objectList;
      this.cardCategory = this.getRefereeInfo(this.getReferralInfo);
    });
  }

  getEmail(){
    let email: string = '';
    if(window.sessionStorage){
      email = sessionStorage.getItem('email');
      console.log("Inside the condition block "+ email);
    }
    console.log("Outside the condition block "+email);
  }

  getRefereeInfo(refereeInfo) {
    if (refereeInfo && refereeInfo.referralVoucherList) {
      const investment = this.findCategory(refereeInfo.referralVoucherList, SIGN_UP_CONFIG.REFEREE_REWARDS.INVESTMENT);
      const insurance = this.findCategory(refereeInfo.referralVoucherList, SIGN_UP_CONFIG.REFEREE_REWARDS.INSURANCE);
      const comprehensive = this.findCategory(refereeInfo.referralVoucherList, SIGN_UP_CONFIG.REFEREE_REWARDS.CFP);
      return {
        investment: investment,
        insurance: insurance,
        comprehensiveInfo: comprehensive
      }
    } else {
      return {
        investment: [],
        insurance: [],
        comprehensiveInfo: []
      };
    }
  }

  findCategory(elementList, category) {
    const filteredData = elementList.filter(
      (element) => element.category.toUpperCase() === category.toUpperCase());
    if (filteredData && filteredData[0]) {
      return filteredData;
    } else {
      return [];
    }
  }

  loadOptionListCollection() {
    this.investmentAccountService.getAllDropDownList().subscribe((data) => {
      this.investmentAccountService.setOptionList(data.objectList);
    });
  }

  getInvestmentsSummary() {
    this.investmentAccountService.getInvestmentsSummary().subscribe((data) => {
      if (data && data.responseMessage && data.responseMessage.responseCode === 6000) {
        this.investmentsSummary = data.objectList;
        const accStatusInfoFromSession = this.investmentCommonService.getInvestmentCommonFormData().accountCreationActions;
        if (this.investmentsSummary && this.investmentsSummary.investmentAccountStatus && accStatusInfoFromSession) {
          this.investmentCommonService.setAccountCreationActionsToSession(this.investmentsSummary.investmentAccountStatus);
        }
        this.setInvestmentsSummary(this.investmentsSummary);
        this.getInvestmentStatus();
      } else {
        this.investmentAccountService.showGenericErrorModal();
      }
    },
      (err) => {
        this.investmentAccountService.showGenericErrorModal();
      });
  }

  goToEngagement() {
    if (this.portfolioExists) {
      this.router.navigate([INVESTMENT_ENGAGEMENT_JOURNEY_ROUTE_PATHS.SELECT_PORTFOLIO_TYPE]);
    }
    else {
      this.router.navigate([INVESTMENT_ENGAGEMENT_JOURNEY_ROUTE_PATHS.ROOT]);
    }
  }

  goToEditProfile() {
    if (this.authService.isSignedUser()) {
      this.router.navigate([SIGN_UP_ROUTE_PATHS.EDIT_PROFILE]);
    } else {
      this.navbarService.logoutUser();
      this.errorHandler.handleAuthError();
      this.router.navigate([SIGN_UP_ROUTE_PATHS.LOGIN]);
    }
  }

  goToInvOverview(selectedPortfolio: any) {
    this.manageInvestmentsService.setSelectedPortfolioCategory(selectedPortfolio);
    this.router.navigate([MANAGE_INVESTMENTS_ROUTE_PATHS.YOUR_INVESTMENT]);
  }

  // tslint:disable-next-line:cognitive-complexity
  goToDocUpload() {
    observableForkJoin(
      this.signUpService.getDetailedCustomerInfo(),
      this.investmentAccountService.getNationalityCountryList()
    ).subscribe((response) => {
      const customerData = response[0];
      const nationalityData = response[1];
      const nationalityList = nationalityData.objectList;
      const countryList = this.investmentAccountService.getCountryList(nationalityData.objectList);
      this.investmentAccountService.setNationalitiesCountries(nationalityList, countryList);
      this.investmentAccountService.setInvestmentAccountFormData(customerData.objectList);
      const beneficialOwner = customerData.objectList.additionalDetails
        && customerData.objectList.additionalDetails.beneficialOwner ? customerData.objectList.additionalDetails.beneficialOwner : false;
      const myInfoVerified = customerData.objectList.isMyInfoVerified ?
        customerData.objectList.isMyInfoVerified : false;
      this.investmentAccountService.setMyInfoStatus(customerData.objectList.isMyInfoVerified);
      if (myInfoVerified) {
        if (beneficialOwner) {
          this.router.navigate([INVESTMENT_ACCOUNT_ROUTE_PATHS.UPLOAD_DOCUMENTS_BO]);
        } else {
          this.router.navigate([INVESTMENT_COMMON_ROUTE_PATHS.CONFIRM_PORTFOLIO]);
        }
      } else {
        this.router.navigate([INVESTMENT_ACCOUNT_ROUTE_PATHS.UPLOAD_DOCUMENTS]);
      }
    });
  }

  goToInvestmentAccount() {
    this.router.navigate([INVESTMENT_ACCOUNT_ROUTE_PATHS.ROOT]);
  }

  setInvestmentsSummary(investmentsSummary) {
    this.investmentCommonService.setInvestmentsSummary(investmentsSummary);
  }

  getInvestmentStatus() {
    const investmentStatus = this.investmentCommonService.getInvestmentStatus();
    this.showInvestmentsSummary(investmentStatus);
  }

  showInvestmentsSummary(investmentStatus) {
    switch (investmentStatus) {
      case SIGN_UP_CONFIG.INVESTMENT.PROPOSED:
      case SIGN_UP_CONFIG.INVESTMENT.RECOMMENDED:
      case SIGN_UP_CONFIG.INVESTMENT.ACCEPTED_NATIONALITY: {
        this.showSetupAccount = true;
        this.enableInvestment();
        break;
      }
      case SIGN_UP_CONFIG.INVESTMENT.BLOCKED_NATIONALITY: {
        this.showBlockedNationalityStatus = true;
        this.enableInvestment();
        break;
      }
      case SIGN_UP_CONFIG.INVESTMENT.INVESTMENT_ACCOUNT_DETAILS_SAVED:
      case SIGN_UP_CONFIG.INVESTMENT.DOCUMENTS_UPLOADED:
      case SIGN_UP_CONFIG.INVESTMENT.PORTFOLIO_CONFIRMED: {
        this.showInvestmentDetailsSaved = true;
        this.enableInvestment();
        break;
      }
      case SIGN_UP_CONFIG.INVESTMENT.CDD_CHECK_PENDING:
      case SIGN_UP_CONFIG.INVESTMENT.EDD_CHECK_CLEARED:
      case SIGN_UP_CONFIG.INVESTMENT.EDD_CHECK_PENDING:
      case SIGN_UP_CONFIG.INVESTMENT.CKA_PENDING: {
        this.showCddCheckOngoing = true;
        this.enableInvestment();
        break;
      }
      case SIGN_UP_CONFIG.INVESTMENT.EDD_CHECK_FAILED: {
        this.showEddCheckFailStatus = true;
        this.enableInvestment();
        break;
      }
      case SIGN_UP_CONFIG.INVESTMENT.CDD_CHECK_FAILED:
      case SIGN_UP_CONFIG.INVESTMENT.ACCOUNT_CREATION_FAILED: {
        this.showCddCheckFail = true;
        this.enableInvestment();
        break;
      }
      case SIGN_UP_CONFIG.INVESTMENT.ACCOUNT_CREATED:
      case SIGN_UP_CONFIG.INVESTMENT.ACCOUNT_FUNDED:
      case SIGN_UP_CONFIG.INVESTMENT.PORTFOLIO_PURCHASED: {
        this.showPortfolioPurchased = true;
        if (this.showPortfolioCards()) {
          this.showPortfolioPurchased = false;
          this.showStartInvesting = true;
          this.portfolioExists = true;
        }
        this.enableInvestment();
        if (this.investmentsSummary.portfolioSummary && this.investmentsSummary.portfolioSummary.numberOfPortfolios > 0) {
          this.navbarService.setMenuItemInvestUser(true);
        }
        break;
      }
      case SIGN_UP_CONFIG.INVESTMENT.ACCOUNT_SUSPENDED: {
        this.showSuspendedAccount = true;
        this.enableInvestment();
        break;
      }
      default: {
        if (this.isInvestmentConfigEnabled) {
          this.showStartInvesting = true;
          this.enableInvestment();
        } else {
          this.showStartInvesting = false;
        }
        break;
      }
    }
  }

  verifyCustomerDetails() {
    observableForkJoin(
      this.signUpService.getDetailedCustomerInfo(),
      this.investmentAccountService.getNationalityCountryList()
    ).subscribe((response) => {
      const customerData = response[0];
      const nationalityData = response[1];
      const nationalityList = nationalityData.objectList;
      const countryList = this.investmentAccountService.getCountryList(nationalityData.objectList);
      this.investmentAccountService.setNationalitiesCountries(nationalityList, countryList);
      this.investmentAccountService.setInvestmentAccountFormData(customerData.objectList);
      this.router.navigate([INVESTMENT_ACCOUNT_ROUTE_PATHS.SELECT_NATIONALITY]);
    });
  }

  formatReturns(value) {
    return this.investmentAccountService.formatReturns(value);
  }

  async enableInvestment() {
    // Check if iFast is in maintenance
    if (await this.configService.checkIFastUnderMaintenance()) {
      this.iFastMaintenance = true;
    } else {
      this.isInvestmentEnabled = true;
    }
  }

  // Will-writing
  redirectTo(page: string) {
    if (page === 'edit') {
      this.router.navigate([WILL_WRITING_ROUTE_PATHS.CONFIRMATION]);
    } else {
      this.router.navigate([WILL_WRITING_ROUTE_PATHS.INTRODUCTION]);
    }
  }
  downloadWill() {
    let newWindow;
    if (CapacitorUtils.isIosWeb) {
      newWindow = window.open();
    }
    this.willWritingApiService.downloadWill().subscribe((res: any) => {
      this.fileUtil.downloadPDF(res, newWindow, this.translate.instant('DASHBOARD.WILL_WRITING.WILLS_PDF_NAME'));
    }, (error) => {
      this.showCustomErrorModal('Error!', error);
    });
  }

  showCustomErrorModal(title, desc) {
    const ref = this.modal.open(ErrorModalComponent, { centered: true });
    ref.componentInstance.errorTitle = title;
    ref.componentInstance.errorMessage = desc;
  }

  // Show new updates Modal if first time login
  openNewUpdatesModal() {
    const ref = this.modal.open(CarouselModalComponent, { centered: true, windowClass: 'srs-dashboard-modal' });
    if (this.authService.isUserTypeCorporate) {
      ref.componentInstance.slides = this.translate.instant('DASHBOARD.SRS_JOINT_ACCOUNT.SRS_JOINT_ACCOUNT_SLIDES_CORP');
    } else {
      ref.componentInstance.slides = this.translate.instant('DASHBOARD.SRS_JOINT_ACCOUNT.SRS_JOINT_ACCOUNT_SLIDES');
    }
    ref.componentInstance.startBtnTxt = this.translate.instant('DASHBOARD.SRS_JOINT_ACCOUNT.START_BTN');
    ref.componentInstance.endBtnTxt = this.translate.instant('DASHBOARD.SRS_JOINT_ACCOUNT.END_BTN');
  }

  showModalCheck(start, end) {
    const startDateTime = new Date(start);
    const endDateTime = new Date(end);

    if (Date.now() >= startDateTime.valueOf() && Date.now() <= endDateTime.valueOf()) {
      return true;
    } else {
      return false;
    }
  }

  existingPortfolio() {
    this.manageInvestmentsService.setSelectedCustomerPortfolioId(null);
    this.manageInvestmentsService.setSelectedCustomerPortfolio(null);
    this.manageInvestmentsService.getInvestmentOverview().subscribe((data) => {
      if (data.responseMessage.responseCode >= 6000) {
        const investmentoverviewlist = (data.objectList) ? data.objectList : {};
        const portfolioList = (investmentoverviewlist.portfolios) ? investmentoverviewlist.portfolios : [];
        this.manageInvestmentsService.setUserPortfolioList(portfolioList);
        this.router.navigate([MANAGE_INVESTMENTS_ROUTE_PATHS.TOPUP]);
      }
    });
  }

  newPortfolio() {
    this.authService.removeEnquiryId();
    this.investmentCommonService.clearFundingDetails();
    this.investmentCommonService.clearJourneyData();
    if (this.authService.accessCorporateUserFeature('CREATE_JOINT_ACCOUNT')) {
      this.router.navigate([INVESTMENT_ENGAGEMENT_JOURNEY_ROUTE_PATHS.SELECT_PORTFOLIO_TYPE]);
    } else {
      this.investmentEngagementService.setUserPortfolioType(INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.PORTFOLIO_TYPE.PERSONAL_ACCOUNT_ID);
      this.router.navigate([INVESTMENT_ENGAGEMENT_JOURNEY_ROUTE_PATHS.SELECT_PORTFOLIO]);
    }
  }

  showCashAccountPopUp() {
    const ref = this.modal.open(ErrorModalComponent, { centered: true });
    ref.componentInstance.errorTitle = this.translate.instant(
      'DASHBOARD.INVESTMENT.CASH_ACCOUNT_BALANCE_TITLE'
    );
    ref.componentInstance.errorMessage = this.translate.instant(
      'DASHBOARD.INVESTMENT.CASH_ACCOUNT_BALANCE_MESSAGE'
    );
  }
  openRefereeModal() {
    this.router.navigate([SIGN_UP_ROUTE_PATHS.REFER_REDIRECT + '/' + SIGN_UP_CONFIG.REFEREE_REWARDS.DASHBOARD], { skipLocationChange: true });
  }

  showCopyToast() {
    this.showFixedToastMessage = true;
    this.hideToastMessage();
  }

  hideToastMessage() {
    setTimeout(() => {
      this.showFixedToastMessage = false;
      this.comprehensiveService.setToastMessage(false);
    }, 3000);
  }

  // show Start investing button if no portfolio but user has iFast account
  showPortfolioCards() {
    return Util.isEmptyOrNull(this.investmentsSummary.portfolioSummary.investmentPortfolio)
      && Util.isEmptyOrNull(this.investmentsSummary.portfolioSummary.cpfPortfolio)
      && Util.isEmptyOrNull(this.investmentsSummary.portfolioSummary.wiseIncomePortfolio)
      && Util.isEmptyOrNull(this.investmentsSummary.portfolioSummary.wiseSaverPortfolio)
  }

  openInvestMenuModal() {
    this.modal.open(InvestModalComponent, { centered: true });
  }

  goToInsuranceJourney(page: string){
    if (page === 'direct') {
      this.router.navigate(['/direct']);
    } else {
      this.router.navigate(['/guideme']);
    }
  }
}


