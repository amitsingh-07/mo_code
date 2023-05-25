import { Location } from "@angular/common";
import { Component, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin as observableForkJoin } from 'rxjs';
import { AppService } from '../../app.service';
import { ComprehensiveApiService } from '../../comprehensive/comprehensive-api.service';
import { COMPREHENSIVE_CONST } from '../../comprehensive/comprehensive-config.constants';
import { COMPREHENSIVE_ROUTE_PATHS } from '../../comprehensive/comprehensive-routes.constants';
import { IMyProfile } from '../../comprehensive/comprehensive-types';
import { ComprehensiveService } from '../../comprehensive/comprehensive.service';
import { ConfigService } from '../../config/config.service';
import { DIRECT_ROUTE_PATHS } from '../../direct/direct-routes.constants';
import { GuideMeApiService } from '../../guide-me/guide-me.api.service';
import { GuideMeService } from '../../guide-me/guide-me.service';
import { INVESTMENT_ACCOUNT_ROUTE_PATHS } from '../../investment/investment-account/investment-account-routes.constants';
import { InvestmentAccountService } from '../../investment/investment-account/investment-account-service';
import { INVESTMENT_COMMON_ROUTE_PATHS } from '../../investment/investment-common/investment-common-routes.constants';
import { InvestmentCommonService } from '../../investment/investment-common/investment-common.service';
import { INVESTMENT_ENGAGEMENT_JOURNEY_ROUTE_PATHS } from '../../investment/investment-engagement-journey/investment-engagement-journey-routes.constants';
import { LoaderService } from '../../shared/components/loader/loader.service';
import { RefereeComponent } from '../../shared/modal/referee/referee.component';
import { NavbarService } from '../../shared/navbar/navbar.service';
import { SelectedPlansService } from '../../shared/Services/selected-plans.service';
import { SIGN_UP_ROUTE_PATHS } from '../../sign-up/sign-up.routes.constants';
import { SIGN_UP_CONFIG } from '../sign-up.constant';
import { SignUpService } from '../sign-up.service';
import { CapacitorUtils } from "../../shared/utils/capacitor.util";



@Component({
  selector: 'app-referal-redirecting-part',
  templateUrl: './referal-redirecting-part.component.html',
  styleUrls: ['./referal-redirecting-part.component.scss']
})
export class ReferalRedirectingPartComponent implements OnInit {
  investmentsSummary: any;
  isInvestmentEnabled: boolean;
  iFastMaintenance: boolean;
  // comprehensive 
  userName: string;
  comprehensivePlanning: number;
  userDetails: IMyProfile;
  getComprehensiveSummary: any;
  reportStatus: any; // new submitted ready
  advisorStatus: boolean;
  submittedDate: any;
  currentStep: number;
  isLoadComplete = false;
  islocked: boolean;
  getCurrentVersionType = COMPREHENSIVE_CONST.VERSION_TYPE.FULL;
  getComprehensiveSummaryDashboard: any;
  isCFPGetStarted = false;
  enquiryId: any;
  isReportGenerated = false;
  fetchData: string;
  paymentInstructions = false;
  showInsuranceSection: boolean;
  insurance: any = {};
  reDirectiveUrl: string;
  refereeInfo: any;
  cardCategory: any;
  referralInfo: any;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public navbarService: NavbarService,
    public modal: NgbModal,
    private translate: TranslateService,
    private signUpService: SignUpService,
    private investmentAccountService: InvestmentAccountService,
    private investmentCommonService: InvestmentCommonService,
    private configService: ConfigService,
    private comprehensiveApiService: ComprehensiveApiService,
    private loaderService: LoaderService,
    private comprehensiveService: ComprehensiveService,
    private guideMeApiService: GuideMeApiService,
    private selectedPlansService: SelectedPlansService,
    public location: Location
  ) {
    this.translate.use('en');
    this.translate.get('COMMON').subscribe((result: string) => {
    });

  }
  ngOnInit(): void {
    this.getReferralCodeData();
  }

  getReferralCodeData() {
    this.signUpService.getReferralCodeData().subscribe((data) => {
      if (data.responseMessage && data.responseMessage.responseCode === 6000) {
        this.referralInfo = data.objectList;
        this.cardCategory = this.getReferInfo(this.referralInfo);
        this.redirectPath(this.referralInfo, this.cardCategory);
      } else {
        this.router.navigate([this.reDirectiveUrl]);
      }
    });
  }

  redirectPath(refereeInfo, cardCategory) {
    if (this.route.snapshot.paramMap.get('term') === SIGN_UP_CONFIG.REFEREE_REWARDS.REFER_A_FRIEND) {
      this.reDirectiveUrl = SIGN_UP_ROUTE_PATHS.REFER_FRIEND;
      this.openRefereeModal(this.reDirectiveUrl, refereeInfo, cardCategory);
    }
    else if (this.route.snapshot.paramMap.get('term') === SIGN_UP_CONFIG.REFEREE_REWARDS.DASHBOARD) {
      this.reDirectiveUrl = SIGN_UP_ROUTE_PATHS.DASHBOARD;
      this.openRefereeModal(this.reDirectiveUrl, refereeInfo, cardCategory);
    } else {
      this.router.navigate([SIGN_UP_ROUTE_PATHS.DASHBOARD])
    }
  }

  findCategory(elementList, category) {
    return elementList.filter(
      (element) => element.category.toUpperCase() === category.toUpperCase())[0];
  }

  getReferInfo(refereeInfo) {
    if (refereeInfo && refereeInfo.referralVoucherList) {
      const investment = this.findCategory(this.referralInfo.referralVoucherList, SIGN_UP_CONFIG.REFEREE_REWARDS.INVESTMENT);
      const insurance = this.findCategory(this.referralInfo.referralVoucherList, SIGN_UP_CONFIG.REFEREE_REWARDS.INSURANCE);
      const comprehensive = this.findCategory(this.referralInfo.referralVoucherList, SIGN_UP_CONFIG.REFEREE_REWARDS.CFP);
      return {
        investment: investment,
        insurance: insurance,
        comprehensive: comprehensive
      }
    }
  }

  openRefereeModal(reDirectiveUrl, refereeInfo, cardCategory) {
    const ref = this.modal.open(RefereeComponent, { centered: true });
    ref.componentInstance.refereeInfo = refereeInfo;
    ref.componentInstance.cardCategory = cardCategory;
    ref.componentInstance.comprehensiveAction.subscribe(() => {
      this.loaderService.showLoader({ title: 'Loading', autoHide: false });
      this.getComprehensive();
    });
    ref.componentInstance.investmentAction.subscribe(() => {
      this.loaderService.showLoader({ title: 'Loading', autoHide: false });
      this.getInvestmentsSummary();
    });
    ref.componentInstance.insuranceAction.subscribe(() => {
      this.loaderService.showLoader({ title: 'Loading', autoHide: false });
      this.getInsurance();
    });
    ref.componentInstance.closeAction.subscribe(() => {
      this.redirectPathOnModalClose(reDirectiveUrl);
    });
    ref.result.then(
      (result) => { },
      (reason) => {
        if (reason === 0) {
          this.redirectPathOnModalClose(reDirectiveUrl);
        }
      });
  }

  redirectPathOnModalClose(redirectUrl) {
    if (CapacitorUtils.isApp) {
      this.navbarService.goBack();
    } else {
      this.router.navigate([redirectUrl]);
    }
  }

  //  INVESTMENT RE DIRECTION  FLOW 
  getInvestmentsSummary() {
    this.investmentAccountService.getInvestmentsSummary().subscribe((data) => {
      if (data && data.responseMessage && data.responseMessage.responseCode === 6000) {
        this.investmentsSummary = data.objectList;
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

  setInvestmentsSummary(investmentsSummary) {
    this.investmentCommonService.setInvestmentsSummary(investmentsSummary);
  }
  getInvestmentStatus() {
    const investmentStatus = this.investmentCommonService.getInvestmentStatus();
    this.showInvestmentsSummary(investmentStatus);

  }
  async enableInvestment() {
    this.isInvestmentEnabled = true;
    // Check if iFast is in maintenance
    if (await this.configService.checkIFastUnderMaintenance()) {
      this.iFastMaintenance = true;
      this.isInvestmentEnabled = false;
    }
  }
  showInvestmentsSummary(investmentStatus) {
    switch (investmentStatus) {
      case SIGN_UP_CONFIG.INVESTMENT.PROPOSED:
      case SIGN_UP_CONFIG.INVESTMENT.RECOMMENDED:
      case SIGN_UP_CONFIG.INVESTMENT.ACCEPTED_NATIONALITY: {
        this.enableInvestment();
        this.loaderService.hideLoaderForced();
        this.router.navigate([INVESTMENT_ACCOUNT_ROUTE_PATHS.ROOT]);
        break;
      }
      case SIGN_UP_CONFIG.INVESTMENT.BLOCKED_NATIONALITY:
      case SIGN_UP_CONFIG.INVESTMENT.CDD_CHECK_PENDING:
      case SIGN_UP_CONFIG.INVESTMENT.EDD_CHECK_CLEARED:
      case SIGN_UP_CONFIG.INVESTMENT.EDD_CHECK_PENDING:
      case SIGN_UP_CONFIG.INVESTMENT.EDD_CHECK_FAILED:
      case SIGN_UP_CONFIG.INVESTMENT.ACCOUNT_SUSPENDED: {
        this.enableInvestment();
        this.loaderService.hideLoaderForced();
        this.router.navigate([SIGN_UP_ROUTE_PATHS.DASHBOARD]);
        break;
      }
      case SIGN_UP_CONFIG.INVESTMENT.INVESTMENT_ACCOUNT_DETAILS_SAVED:
      case SIGN_UP_CONFIG.INVESTMENT.DOCUMENTS_UPLOADED:
      case SIGN_UP_CONFIG.INVESTMENT.PORTFOLIO_CONFIRMED: {
        this.enableInvestment();
        this.goToDocUpload();
        break;
      }
      case SIGN_UP_CONFIG.INVESTMENT.CDD_CHECK_FAILED:
      case SIGN_UP_CONFIG.INVESTMENT.ACCOUNT_CREATION_FAILED: {
        this.enableInvestment();
        this.verifyCustomerDetails();
        break;
      }
      case SIGN_UP_CONFIG.INVESTMENT.ACCOUNT_CREATED:
      case SIGN_UP_CONFIG.INVESTMENT.ACCOUNT_FUNDED:
      case SIGN_UP_CONFIG.INVESTMENT.PORTFOLIO_PURCHASED: {
        this.enableInvestment();
        if (this.investmentsSummary.portfolioSummary && this.investmentsSummary.portfolioSummary.numberOfPortfolios > 0) {
          this.navbarService.setMenuItemInvestUser(true);
        }
        this.loaderService.hideLoaderForced();
        this.router.navigate([SIGN_UP_ROUTE_PATHS.DASHBOARD]);
        break;
      }
      default: {
        this.loaderService.hideLoaderForced();
        this.router.navigate([INVESTMENT_ENGAGEMENT_JOURNEY_ROUTE_PATHS.ROOT]);
        break;
      }
    }
  }

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
        this.loaderService.hideLoaderForced();
        if (beneficialOwner) {
          this.router.navigate([INVESTMENT_ACCOUNT_ROUTE_PATHS.UPLOAD_DOCUMENTS_BO]);
        } else {
          this.router.navigate([INVESTMENT_COMMON_ROUTE_PATHS.CONFIRM_PORTFOLIO]);
        }
      } else {
        this.loaderService.hideLoaderForced();
        this.router.navigate([INVESTMENT_ACCOUNT_ROUTE_PATHS.UPLOAD_DOCUMENTS]);
      }
    });
  }

  //
  verifyCustomerDetails() {
    observableForkJoin(
      this.signUpService.getDetailedCustomerInfo(),
      this.investmentAccountService.getNationalityCountryList()
    ).subscribe((response) => {
      this.loaderService.hideLoaderForced();
      const customerData = response[0];
      const nationalityData = response[1];
      const nationalityList = nationalityData.objectList;
      const countryList = this.investmentAccountService.getCountryList(nationalityData.objectList);
      this.investmentAccountService.setNationalitiesCountries(nationalityList, countryList);
      this.investmentAccountService.setInvestmentAccountFormData(customerData.objectList);
      this.router.navigate([INVESTMENT_ACCOUNT_ROUTE_PATHS.SELECT_NATIONALITY]);
    });
  }

  // COMPREHENSIVE REDIRECT 
  getComprehensive() {
    this.isLoadComplete = false;
    this.comprehensivePlanning = 4;
    this.islocked = null;
    this.reportStatus = null;
    this.advisorStatus = false;
    this.getComprehensiveSummaryDashboard = '';
    this.currentStep = -1;
    this.paymentInstructions = false;
    this.comprehensiveApiService.getComprehensiveSummaryDashboard().subscribe((dashboardData: any) => {
      if (dashboardData && dashboardData.objectList[0]) {
        this.getComprehensiveSummaryDashboard = this.comprehensiveService.filterDataByInput(dashboardData.objectList, 'type', this.getCurrentVersionType);
        if (this.getComprehensiveSummaryDashboard !== '') {
          this.islocked = this.getComprehensiveSummaryDashboard.isLocked;
          this.paymentInstructions = (this.getComprehensiveSummaryDashboard.paymentStatus
            && (this.getComprehensiveSummaryDashboard.paymentStatus.toLowerCase() === COMPREHENSIVE_CONST.PAYMENT_STATUS.PENDING ||
              this.getComprehensiveSummaryDashboard.paymentStatus.toLowerCase() === COMPREHENSIVE_CONST.PAYMENT_STATUS.PARTIAL_PENDING)
            && this.getCurrentVersionType === this.getComprehensiveSummaryDashboard.type);
          this.isCFPGetStarted = this.getComprehensiveSummaryDashboard.isCFPGetStarted;
          this.reportStatus = this.getComprehensiveSummaryDashboard.reportStatus;
          this.enquiryId = this.getComprehensiveSummaryDashboard.enquiryId;
          this.currentStep = (this.getComprehensiveSummaryDashboard.stepCompleted !== null)
            ? this.getComprehensiveSummaryDashboard.stepCompleted : 0;
          if ((this.reportStatus === COMPREHENSIVE_CONST.REPORT_STATUS.NEW || this.reportStatus === COMPREHENSIVE_CONST.REPORT_STATUS.EDIT) && (this.islocked === null || !this.islocked)) {
            this.comprehensivePlanning = 3;
            this.loaderService.hideLoaderForced();
            this.goToCurrentStep();
          } else if (this.reportStatus === COMPREHENSIVE_CONST.REPORT_STATUS.SUBMITTED && !this.islocked) {
            this.comprehensivePlanning = 5;
            this.loaderService.hideLoaderForced();
            this.router.navigate([SIGN_UP_ROUTE_PATHS.DASHBOARD]);

          } else if (this.reportStatus === COMPREHENSIVE_CONST.REPORT_STATUS.SUBMITTED) {
            this.comprehensivePlanning = 0;
            this.loaderService.hideLoaderForced();
            this.router.navigate([SIGN_UP_ROUTE_PATHS.DASHBOARD]);
          }
          // not required  error means need go error.
          else if (this.reportStatus === COMPREHENSIVE_CONST.REPORT_STATUS.READY || this.reportStatus === COMPREHENSIVE_CONST.REPORT_STATUS.ERROR) {
            this.comprehensivePlanning = 1;
            this.loaderService.hideLoaderForced();
            this.router.navigate([SIGN_UP_ROUTE_PATHS.DASHBOARD]);
          }
          else if (this.comprehensivePlanning === 4) {
            this.loaderService.hideLoaderForced();
            this.goToEditProfile();
          }
          this.isLoadComplete = true;
        } else {
          this.loaderService.hideLoaderForced();
          this.goToEditProfile();
        }
      } else {
        this.isLoadComplete = true;
        this.loaderService.hideLoaderForced();
        this.goToEditProfile();
      }
    });
  }

  setComprehensiveSummary(routerEnabled: boolean, routerUrlPath: any) {
    if (routerEnabled) {
      this.loaderService.showLoader({ title: this.fetchData });
    } else {
      this.isLoadComplete = false;
    }
    this.comprehensivePlanning = 4;
    this.comprehensiveApiService.getComprehensiveSummary().subscribe((summaryData: any) => {
      if (summaryData && summaryData.objectList[0]) {
        this.comprehensiveService.setComprehensiveSummary(summaryData.objectList[0]);
        this.userDetails = this.comprehensiveService.getMyProfile();
        this.getComprehensiveSummary = this.comprehensiveService.getComprehensiveSummary();
        this.islocked = this.getComprehensiveSummary.comprehensiveEnquiry !== null &&
          this.getComprehensiveSummary.comprehensiveEnquiry.isLocked;
        this.userName = this.userDetails.firstName;
        this.advisorStatus = false;
        this.reportStatus = (this.getComprehensiveSummary && this.getComprehensiveSummary.comprehensiveEnquiry.reportStatus
          && this.getComprehensiveSummary.comprehensiveEnquiry.reportStatus !== null && this.userDetails.nationalityStatus)
          ? this.getComprehensiveSummary.comprehensiveEnquiry.reportStatus : null;
        if (this.reportStatus === COMPREHENSIVE_CONST.REPORT_STATUS.NEW && (this.islocked === null || !this.islocked)) {
          this.comprehensivePlanning = 3;
        } else if (this.reportStatus === COMPREHENSIVE_CONST.REPORT_STATUS.SUBMITTED && !this.islocked) {
          this.comprehensivePlanning = 5;
          if (this.getComprehensiveSummary.comprehensiveEnquiry &&
            this.getComprehensiveSummary.comprehensiveEnquiry.reportSubmittedTimeStamp) {
            this.submittedDate = this.getComprehensiveSummary.comprehensiveEnquiry.reportSubmittedTimeStamp;
          }
        } else if (this.reportStatus === COMPREHENSIVE_CONST.REPORT_STATUS.SUBMITTED) {
          this.comprehensivePlanning = 0;
        }
        else if (this.reportStatus === COMPREHENSIVE_CONST.REPORT_STATUS.READY ||
          this.reportStatus === COMPREHENSIVE_CONST.REPORT_STATUS.ERROR) {
          this.comprehensivePlanning = 1;
          if (this.getComprehensiveSummary.comprehensiveEnquiry &&
            this.getComprehensiveSummary.comprehensiveEnquiry.reportSubmittedTimeStamp) {
            this.submittedDate = this.getComprehensiveSummary.comprehensiveEnquiry.reportSubmittedTimeStamp;
            this.isReportGenerated = this.getComprehensiveSummary.comprehensiveEnquiry.reportStatus;
          }
        }
        this.currentStep = (this.getComprehensiveSummary && this.getComprehensiveSummary.comprehensiveEnquiry.stepCompleted
          && this.getComprehensiveSummary.comprehensiveEnquiry.stepCompleted !== null)
          ? this.getComprehensiveSummary.comprehensiveEnquiry.stepCompleted : 0;
        if (this.reportStatus === COMPREHENSIVE_CONST.REPORT_STATUS.SUBMITTED
          || this.reportStatus === COMPREHENSIVE_CONST.REPORT_STATUS.READY) {
          this.comprehensiveService.setViewableMode(true);
        } else {
          this.comprehensiveService.setViewableMode(false);
        }
        if (routerEnabled) {
          this.loaderService.hideLoader();
          this.comprehensiveService.setRiskQuestions().subscribe((riskQues) => {
            this.router.navigate([routerUrlPath]);
          });
        } else {
          this.isLoadComplete = true;
        }
      } else {
        if (routerEnabled) {
          this.loaderService.hideLoader();
          this.router.navigate([COMPREHENSIVE_ROUTE_PATHS.ROOT]);
        } else {
          this.isLoadComplete = true;
        }
      }
    });
  }


  goToCurrentStep() {
    if (this.currentStep === 0 && this.getComprehensiveSummaryDashboard.isDobUpdated) {
      this.goToEditProfile();
    } else if (this.currentStep >= 0 && this.currentStep < 5) {
      const routerURL = COMPREHENSIVE_ROUTE_PATHS.STEPS + '/' + (this.currentStep + 1);
      this.setComprehensiveSummary(true, routerURL);
    } else if (this.currentStep === 5) {
      const routerURL = COMPREHENSIVE_ROUTE_PATHS.STEPS + '/' + (this.currentStep);
      this.setComprehensiveSummary(true, routerURL);
    }
  }


  goToEditProfile() {
    if (this.comprehensivePlanning === 4 && !this.isCFPGetStarted) {
      this.router.navigate([COMPREHENSIVE_ROUTE_PATHS.ROOT]);
    } else {
      this.setComprehensiveSummary(true, COMPREHENSIVE_ROUTE_PATHS.GETTING_STARTED);
    }
  }


  // INSURANCE 
  getInsurance() {
    this.guideMeApiService.getCustomerInsuranceDetails().subscribe((data) => {
      this.showInsuranceSection = true;
      if (data.responseMessage && data.responseMessage.responseCode === 6000) {
        this.loaderService.hideLoaderForced();
        this.insurance.hasInsurance = true;
        this.insurance.isGuidedJourney = data.objectList[0].financialStatusMapping !== null;
        const lastTransact = new Date(data.objectList[0].lastEnquiredDate.split(' ')[0]);
        this.insurance.lastTransactionDate = lastTransact;
        if ((data.objectList[0] && data.objectList[0].enquiryData &&
          data.objectList[0].enquiryData.createdTimeStamp) || this.insurance.lastTransactionDate) {
          this.loaderService.hideLoaderForced();
          this.router.navigate([SIGN_UP_ROUTE_PATHS.DASHBOARD]);
        } else{
          this.loaderService.hideLoaderForced();
          this.router.navigate([DIRECT_ROUTE_PATHS.COMPARE_PLANS]);
        }
      } else if (data.responseMessage && data.responseMessage.responseCode === 5003) {
        this.selectedPlansService.setInsuranceNewUser();
        this.insurance.hasInsurance = false;
        this.loaderService.hideLoaderForced();
        this.router.navigate([DIRECT_ROUTE_PATHS.COMPARE_PLANS]);
      } else {
        this.loaderService.hideLoaderForced();
        this.router.navigate([DIRECT_ROUTE_PATHS.COMPARE_PLANS]);
      }
    });
  }
  
}
