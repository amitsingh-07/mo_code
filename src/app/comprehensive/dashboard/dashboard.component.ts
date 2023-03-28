import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from '../../app.service';
import { NavbarService } from '../../shared/navbar/navbar.service';
import { FileUtil } from '../../shared/utils/file.util';
import { SIGN_UP_CONFIG } from '../../sign-up/sign-up.constant';
import { SignUpService } from '../../sign-up/sign-up.service';
import { COMPREHENSIVE_CONST } from '../comprehensive-config.constants';
import { COMPREHENSIVE_ROUTE_PATHS } from '../comprehensive-routes.constants';
import { IMyProfile } from '../comprehensive-types';
import { environment } from './../../../environments/environment';
import { ConfigService } from './../../config/config.service';
import { LoaderService } from './../../shared/components/loader/loader.service';
import { ComprehensiveApiService } from './../comprehensive-api.service';
import { ComprehensiveService } from './../comprehensive.service';
import { PAYMENT_ROUTE_PATHS } from '../../payment/payment-routes.constants';
import { ModelWithButtonComponent } from '../../shared/modal/model-with-button/model-with-button.component';
import { ErrorModalComponent } from '../../shared/modal/error-modal/error-modal.component';
import { AuthenticationService } from '../../shared/http/auth/authentication.service';
import { CapacitorUtils } from '../../shared/utils/capacitor.util';

@Component({
  selector: 'app-comprehensive-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class ComprehensiveDashboardComponent implements OnInit {
  userName: string;
  comprehensivePlanning: number;
  userDetails: IMyProfile;
  getComprehensiveSummary: any;
  getComprehensiveSummaryEnquiry: any;
  reportStatus: any; // new submitted ready
  advisorStatus: boolean;
  reportDate: any;
  submittedDate: any;
  currentStep: number;
  stepDetails = { hasDependents: 1, hasEndowments: 2 };
  items: any;
  isLoadComplete = false;
  islocked: boolean;
  isComprehensiveEnabled = false;
  isComprehensiveLiveEnabled = false;
  getComprehensiveDashboard: any;
  getCurrentVersionType = '';
  comprehensiveLiteEnabled: boolean;
  getComprehensiveSummaryDashboard: any;
  isCFPGetStarted = false;
  enquiryId: any;
  isReportGenerated = false;
  fetchData: string;
  paymentInstructions = false;
  showFixedToastMessage: boolean;
  toastMsg: any;
  getReferralInfo: any;
  comprehensiveInfo: any;
  paymentWaived = false;
  isCorporate: boolean;
  isSpeakToAdvisor = false;
  isAdvisorAppointment = false;
  reportStatusTypes: any;

  constructor(
    private router: Router,
    private translate: TranslateService,
    private configService: ConfigService,
    private comprehensiveService: ComprehensiveService,
    private comprehensiveApiService: ComprehensiveApiService,
    private datePipe: DatePipe,
    private navbarService: NavbarService,
    private downloadfile: FileUtil,
    private loaderService: LoaderService, private appService: AppService,
    private signUpService: SignUpService,
    private modal: NgbModal,
    private authService: AuthenticationService) {
    this.appService.clearPromoCode();
    this.configService.getConfig().subscribe((config) => {
      this.translate.setDefaultLang(config.language);
      this.translate.use(config.language);
      this.isComprehensiveEnabled = config.comprehensiveEnabled;
      this.isComprehensiveLiveEnabled = config.comprehensiveLiveEnabled;
      this.fetchData = this.translate.instant('MYINFO.FETCH_MODAL_DATA.TITLE');
    });
    this.navbarService.setNavbarVisibility(true);
    if (environment.hideHomepage) {
      this.navbarService.setNavbarMode(9);
    } else {
      this.navbarService.setNavbarMode(100);
    }
    this.navbarService.setNavbarMobileVisibility(false);
    /**
     * 0 - Waiting for report
     * 1 - Completed & View Report
     * 2 - Completed & View Report with advisor
     * 3 - Not Completed
     */
    this.comprehensivePlanning = 4;
    this.comprehensiveLiteEnabled = false;
    this.getCurrentVersionType = COMPREHENSIVE_CONST.VERSION_TYPE.FULL;
    this.isCorporate = this.comprehensiveService.isCorporateRole();
    this.setComprehensivePlan();
    if (!this.authService.isUserTypeCorporate) {
      this.getReferralCodeData();
    }
    this.reportStatusTypes = COMPREHENSIVE_CONST.REPORT_STATUS;
  }

  ngOnInit() {
  }

  generateReport() {
    this.comprehensiveApiService.getReport().subscribe((data: any) => {
      this.comprehensiveService.setReportId(data.objectList[0].id);
      const reportDateAPI = new Date(data.objectList[0].lastUpdatedTs);
      this.reportDate = this.datePipe.transform(reportDateAPI, 'dd MMM` yyyy');
    });
  }

  downloadComprehensiveReport() {
    this.loaderService.showLoader({ title: this.fetchData, autoHide: false });
    let newWindow;
    if(CapacitorUtils.isIosWeb) {
      newWindow = window.open();
    }
    const payload = { reportId: this.getComprehensiveSummaryDashboard.reportId, enquiryId: this.enquiryId };
    this.comprehensiveApiService.downloadComprehensiveReport(payload).subscribe((data: any) => {
      this.loaderService.hideLoaderForced();
      if (data && data["objectList"][0]) {
        this.downloadfile.downloadPDF(data["objectList"][0], newWindow, COMPREHENSIVE_CONST.REPORT_PDF_NAME);
      }
    });
  }

  goToEditProfile() {
    if (this.comprehensivePlanning === 4 && !this.isCFPGetStarted) {
      this.router.navigate([COMPREHENSIVE_ROUTE_PATHS.ROOT]);
    } else {
      this.setComprehensiveSummary(true, COMPREHENSIVE_ROUTE_PATHS.GETTING_STARTED);
    }
  }

  goToCurrentStep() {
    if (this.currentStep === 0 && this.getComprehensiveSummaryDashboard.isDobUpdated) {
      this.goToEditProfile();
    } else if (this.currentStep >= 0 && this.currentStep < 5) {
      const routerURL = COMPREHENSIVE_ROUTE_PATHS.STEPS + '/' + (this.currentStep + 1);
      this.setComprehensiveSummary(true, routerURL);
    } else if (this.currentStep === 5) {
      const routerURL = (!this.comprehensiveService.getViewableMode() && this.getCurrentVersionType == COMPREHENSIVE_CONST.VERSION_TYPE.FULL) ? COMPREHENSIVE_ROUTE_PATHS.REVIEW : COMPREHENSIVE_ROUTE_PATHS.STEPS + '/' + (this.currentStep);
      this.setComprehensiveSummary(true, routerURL);
    }
  }

  goToEditComprehensivePlan(viewMode: boolean) {
    if (this.reportStatus === COMPREHENSIVE_CONST.REPORT_STATUS.SUBMITTED || this.reportStatus === COMPREHENSIVE_CONST.REPORT_STATUS.READY) {
      if (!this.islocked) {
        this.getComprehensiveCall();
      } else if (this.getComprehensiveSummaryDashboard.dobPopUpEnable) {
        this.setComprehensiveSummary(false, '');
        const toolTipParams = {
          TITLE: '',
          DESCRIPTION: this.translate.instant('COMPREHENSIVE.DASHBOARD.WARNING_POPUP'),
          URL: COMPREHENSIVE_ROUTE_PATHS.GETTING_STARTED
        };
        this.comprehensiveService.openTooltipModalWithDismiss(toolTipParams);
      } else {
        this.comprehensiveApiService.getComprehensiveSummary().subscribe((data: any) => {
          if (data && data.objectList[0]) {
            this.comprehensiveService.setComprehensiveSummary(data.objectList[0]);
            this.router.navigate([COMPREHENSIVE_ROUTE_PATHS.GETTING_STARTED]);
          }
        });
      }
    } else if (this.reportStatus === COMPREHENSIVE_CONST.REPORT_STATUS.ERROR) {
      this.getComprehensiveCall();
    } else {
      this.comprehensiveApiService.getComprehensiveSummary().subscribe((data: any) => {
        if (data && data.objectList[0]) {
          this.comprehensiveService.setComprehensiveSummary(data.objectList[0]);
          this.router.navigate([COMPREHENSIVE_ROUTE_PATHS.GETTING_STARTED]);
        }
      });
    }

  }

  getComprehensiveCall() {
    this.loaderService.showLoader({ title: this.fetchData, autoHide: false });
    let reportStatusValue = COMPREHENSIVE_CONST.REPORT_STATUS.NEW;
    if ((this.comprehensivePlanning === 0) || this.comprehensivePlanning === 1) {
      reportStatusValue = COMPREHENSIVE_CONST.REPORT_STATUS.EDIT;
    }
    const payload = { enquiryId: this.enquiryId, reportStatus: reportStatusValue };
    this.comprehensiveApiService.updateComprehensiveReportStatus(payload).subscribe((data: any) => {
      if (data) {
        this.comprehensiveApiService.getComprehensiveSummary().subscribe((summaryData: any) => {
          if (summaryData) {
            summaryData.objectList[0].comprehensiveEnquiry.reportStatus = COMPREHENSIVE_CONST.REPORT_STATUS.EDIT;
            this.comprehensiveService.setComprehensiveSummary(summaryData.objectList[0]);
            this.comprehensiveService.setReportStatus(COMPREHENSIVE_CONST.REPORT_STATUS.EDIT);
            this.comprehensiveService.setViewableMode(true);
            this.comprehensiveService.setRiskQuestions().subscribe((riskQues) => {
              this.loaderService.hideLoaderForced();
              this.router.navigate([COMPREHENSIVE_ROUTE_PATHS.GETTING_STARTED]);
            });
          }
        });
      } else {
        this.loaderService.hideLoaderForced();
      }
    });

  }

  getCurrentComprehensiveStep() {
    if (this.getComprehensiveSummaryEnquiry) {
      for (const i in this.stepDetails) {
        if (this.getComprehensiveSummaryEnquiry[i] !== true) {
          break;
        } else {
          this.currentStep = this.stepDetails[i];
        }
      }
    }
  }
  setComprehensivePlan() {
    this.setComprehensiveDashboard();
  }
  setComprehensiveSummary(routerEnabled: boolean, routerUrlPath: any) {
    if (routerEnabled) {
      this.loaderService.showLoader({ title: this.fetchData, autoHide: false });
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
        } else if (this.reportStatus === COMPREHENSIVE_CONST.REPORT_STATUS.SUBMITTED || (this.reportStatus === COMPREHENSIVE_CONST.REPORT_STATUS.READY && this.islocked)) {
          this.comprehensivePlanning = 0;
          if (this.getComprehensiveSummary.comprehensiveEnquiry &&
            this.getComprehensiveSummary.comprehensiveEnquiry.reportSubmittedTimeStamp && this.isCorporate) {
            this.submittedDate = this.getComprehensiveSummary.comprehensiveEnquiry.reportSubmittedTimeStamp;
            this.isReportGenerated = this.getComprehensiveSummary.comprehensiveEnquiry.reportStatus;
          }
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
          this.comprehensiveService.setRiskQuestions().subscribe((riskQues) => {
            this.loaderService.hideLoaderForced();
            this.router.navigate([routerUrlPath]);
          });
        } else {
          this.isLoadComplete = true;
        }
      } else {
        if (routerEnabled) {
          this.loaderService.hideLoaderForced();
          this.router.navigate([COMPREHENSIVE_ROUTE_PATHS.ROOT]);
        } else {
          this.isLoadComplete = true;
        }
      }
    });
  }
  /*
  *Fetch Dashboard API
  */
  setComprehensiveDashboard() {
    this.isLoadComplete = false;
    this.comprehensivePlanning = 4;
    this.islocked = null;
    this.reportStatus = null;
    this.advisorStatus = false;
    this.getComprehensiveSummaryDashboard = '';
    this.currentStep = -1;
    this.paymentInstructions = false;
    this.paymentWaived = false;
    this.isSpeakToAdvisor = false;
    this.isAdvisorAppointment = false;
    this.comprehensiveApiService.getComprehensiveSummaryDashboard().subscribe((dashboardData: any) => {
      if (dashboardData && dashboardData.objectList[0]) {
        this.getComprehensiveSummaryDashboard = this.comprehensiveService.filterDataByInput(dashboardData.objectList, 'type', this.getCurrentVersionType);
        if (this.getComprehensiveSummaryDashboard !== '') {
          if( this.getComprehensiveSummaryDashboard.specialPromoCode ) {
            this.isCorporate = this.getComprehensiveSummaryDashboard.specialPromoCode;
          }
          this.islocked = this.getComprehensiveSummaryDashboard.isLocked;
          this.isSpeakToAdvisor = (this.isCorporate && (this.getComprehensiveSummaryDashboard.advisorPaymentStatus === '' || this.getComprehensiveSummaryDashboard.advisorPaymentStatus === null));
          this.isAdvisorAppointment = (this.islocked && this.isCorporate && this.getComprehensiveSummaryDashboard.advisorPaymentStatus
            && (this.getComprehensiveSummaryDashboard.advisorPaymentStatus.toLowerCase() === COMPREHENSIVE_CONST.PAYMENT_STATUS.PENDING ||
              this.getComprehensiveSummaryDashboard.advisorPaymentStatus.toLowerCase() === COMPREHENSIVE_CONST.PAYMENT_STATUS.WAIVED));
          this.paymentInstructions = ((!this.isCorporate && this.getComprehensiveSummaryDashboard.paymentStatus
            && (this.getComprehensiveSummaryDashboard.paymentStatus.toLowerCase() === COMPREHENSIVE_CONST.PAYMENT_STATUS.PENDING ||
              this.getComprehensiveSummaryDashboard.paymentStatus.toLowerCase() === COMPREHENSIVE_CONST.PAYMENT_STATUS.PARTIAL_PENDING)
          ) || (this.isCorporate && this.getComprehensiveSummaryDashboard.advisorPaymentStatus && this.getComprehensiveSummaryDashboard.advisorPaymentStatus.toLowerCase() === COMPREHENSIVE_CONST.PAYMENT_STATUS.PENDING));
          this.paymentWaived = ((!this.isCorporate && this.getComprehensiveSummaryDashboard.paymentStatus
            && this.getComprehensiveSummaryDashboard.paymentStatus.toLowerCase() === COMPREHENSIVE_CONST.PAYMENT_STATUS.WAIVED
          ) || (this.isCorporate && this.getComprehensiveSummaryDashboard.advisorPaymentStatus
            && this.getComprehensiveSummaryDashboard.advisorPaymentStatus.toLowerCase() === COMPREHENSIVE_CONST.PAYMENT_STATUS.WAIVED));
          this.isCFPGetStarted = this.getComprehensiveSummaryDashboard.isCFPGetStarted;
          this.reportStatus = this.getComprehensiveSummaryDashboard.reportStatus;
          this.enquiryId = this.getComprehensiveSummaryDashboard.enquiryId;
          if ((this.reportStatus === COMPREHENSIVE_CONST.REPORT_STATUS.NEW || this.reportStatus === COMPREHENSIVE_CONST.REPORT_STATUS.EDIT) && (this.islocked === null || !this.islocked)) {
            this.comprehensivePlanning = 3;
          } else if (this.reportStatus === COMPREHENSIVE_CONST.REPORT_STATUS.SUBMITTED && !this.islocked) {
            this.comprehensivePlanning = 5;
            if (this.getComprehensiveSummaryDashboard.reportSubmittedTimeStamp) {
              this.submittedDate = this.getComprehensiveSummaryDashboard.reportSubmittedTimeStamp;
            }
          } else if (this.reportStatus === COMPREHENSIVE_CONST.REPORT_STATUS.SUBMITTED || (this.reportStatus === COMPREHENSIVE_CONST.REPORT_STATUS.READY && this.islocked)) {
            this.comprehensivePlanning = 0;
            if (this.getComprehensiveSummaryDashboard.reportSubmittedTimeStamp && this.isCorporate) {
              this.submittedDate = this.getComprehensiveSummaryDashboard.reportSubmittedTimeStamp;
              this.isReportGenerated = (this.getComprehensiveSummaryDashboard.reportStatus ===
                COMPREHENSIVE_CONST.REPORT_STATUS.READY)
            }
          }
          else if (this.reportStatus === COMPREHENSIVE_CONST.REPORT_STATUS.READY || this.reportStatus === COMPREHENSIVE_CONST.REPORT_STATUS.ERROR) {
            this.comprehensivePlanning = 1;
            if (this.getComprehensiveSummaryDashboard.reportSubmittedTimeStamp) {
              this.submittedDate = this.getComprehensiveSummaryDashboard.reportSubmittedTimeStamp;
              this.isReportGenerated = (this.getComprehensiveSummaryDashboard.reportStatus ===
                COMPREHENSIVE_CONST.REPORT_STATUS.READY);
            }
          }
          this.currentStep = (this.getComprehensiveSummaryDashboard.stepCompleted !== null)
            ? this.getComprehensiveSummaryDashboard.stepCompleted : 0;
        }
        this.isLoadComplete = true;
      } else {
        this.isLoadComplete = true;
      }
    });
  }

  showPaymentModal() {
    this.router.navigate([PAYMENT_ROUTE_PATHS.PAYMENT_INSTRUCTION]);
  }

  showCopyToast(data) {
    this.toastMsg = data;
    this.showFixedToastMessage = true;
    this.hideToastMessage();
  }

  hideToastMessage() {
    setTimeout(() => {
      this.showFixedToastMessage = false;
      this.toastMsg = null;
    }, 3000);
  }

  getReferralCodeData() {
    this.signUpService.getReferralCodeData().subscribe((data) => {
      this.getReferralInfo = data.objectList;
      this.comprehensiveInfo = this.getRefereeInfo(this.getReferralInfo);
    });
  }

  getRefereeInfo(refereeInfo) {
    if (refereeInfo && refereeInfo.referralVoucherList) {
      const comprehensive = this.findCategory(refereeInfo.referralVoucherList, SIGN_UP_CONFIG.REFEREE_REWARDS.CFP);
      return comprehensive;
    } else {
      return [];
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

  speakToAdviserModal() {
    const ref = this.modal.open(ModelWithButtonComponent, { centered: true, windowClass: 'speak-to-adviser-modal' });
    ref.componentInstance.errorTitle = this.translate.instant('COMPREHENSIVE.DASHBOARD.ADVISER_MODAL.TITLE');
    ref.componentInstance.errorMessageHTML = this.translate.instant('COMPREHENSIVE.DASHBOARD.ADVISER_MODAL.DESC');
    ref.componentInstance.primaryActionLabel = this.translate.instant('COMPREHENSIVE.DASHBOARD.ADVISER_MODAL.BTN_LBL');
    ref.componentInstance.primaryAction.subscribe(() => {
      this.setComprehensiveSummary(true, COMPREHENSIVE_ROUTE_PATHS.SPEAK_TO_ADVISOR);
    });
  }
  adviserAppointmentModal() {
    const ref = this.modal.open(ErrorModalComponent, { centered: true, windowClass: 'adivser-appointment-modal' });
    ref.componentInstance.errorTitle = this.translate.instant('COMPREHENSIVE.DASHBOARD.APPOINTMENT_MODAL.TITLE');
    ref.componentInstance.errorMessage = this.translate.instant('COMPREHENSIVE.DASHBOARD.APPOINTMENT_MODAL.DESC');
  }
}