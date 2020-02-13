import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { ConfigService } from '../../config/config.service';
import { LoaderService } from '../../shared/components/loader/loader.service';
import { ProgressTrackerService } from '../../shared/modal/progress-tracker/progress-tracker.service';
import { NavbarService } from '../../shared/navbar/navbar.service';
import { ComprehensiveApiService } from '../comprehensive-api.service';
import { COMPREHENSIVE_CONST } from '../comprehensive-config.constants';
import { COMPREHENSIVE_ROUTE_PATHS } from '../comprehensive-routes.constants';
import { ComprehensiveService } from '../comprehensive.service';
import { PAYMENT_ROUTE_PATHS } from './../../payment/payment-routes.constants';
import { PaymentService } from './../../payment/payment.service';

@Component({
  selector: 'app-comprehensive-review',
  templateUrl: './comprehensive-review.component.html',
  styleUrls: ['./comprehensive-review.component.scss']
})
export class ComprehensiveReviewComponent implements OnInit, OnDestroy {
  pageId: string;
  pageTitle: string;
  menuClickSubscription: Subscription;
  subscription: Subscription;
  isPaymentEnabled = false;
  comprehensiveJourneyMode:boolean;
  requireToPay = false;

  constructor(
    private activatedRoute: ActivatedRoute, public navbarService: NavbarService,
    private translate: TranslateService,
    private configService: ConfigService, private router: Router,
    private progressService: ProgressTrackerService,
    private comprehensiveService: ComprehensiveService,
    private comprehensiveApiService: ComprehensiveApiService,
    private paymentService: PaymentService,
    private loaderService: LoaderService) {
    this.pageId = this.activatedRoute.routeConfig.component.name;
    this.configService.getConfig().subscribe((config: any) => {
      // Payment enabled > Payment Bypass > Not Require to Pay
      // Payment enabled > Payment Not Bypass > Require to Pay
      if (config.paymentEnabled && !this.activatedRoute.snapshot.data['paymentBypass']) {
        this.paymentService.getLastSuccessfulSubmittedTs().subscribe((res) => {
          if (res['last_submit_ts'].length === 0) {
            this.requireToPay = true;
          }
        }, (error) => {
          this.requireToPay = false;
        });
      }
      this.isPaymentEnabled = config.paymentEnabled;
      this.translate.setDefaultLang(config.language);
      this.translate.use(config.language);
      this.translate.get(config.common).subscribe((result: string) => {
        // meta tag and title
        this.pageTitle = this.translate.instant('CMP.REVIEW.TITLE');
        this.setPageTitle(this.pageTitle);
      });
    });
    this.comprehensiveJourneyMode = this.comprehensiveService.getComprehensiveVersion();
    this.subscription = this.navbarService.subscribeBackPress().subscribe((event) => {
      if (event && event !== '') {
        if (this.comprehensiveJourneyMode) {
          this.router.navigate([COMPREHENSIVE_ROUTE_PATHS.RETIREMENT_PLAN_SUMMARY + '/summary']);
        } else {
          this.router.navigate([COMPREHENSIVE_ROUTE_PATHS.RISK_PROFILE + '/4']);
        }

      }
    });
  }

  ngOnInit() {

    this.loaderService.hideLoaderForced();
    this.progressService.setProgressTrackerData(this.comprehensiveService.generateProgressTrackerData());
    this.progressService.setReadOnly(false);
    this.navbarService.setNavbarComprehensive(true);
    this.menuClickSubscription = this.navbarService.onMenuItemClicked.subscribe((pageId) => {
      if (this.pageId === pageId) {
        this.progressService.show();
      }
    });
    const reportStatus = this.comprehensiveService.getReportStatus();
    if (reportStatus === COMPREHENSIVE_CONST.REPORT_STATUS.SUBMITTED) {
      this.initiateReport();
    } else if (!this.comprehensiveService.checkResultData()) {
      this.router.navigate([COMPREHENSIVE_ROUTE_PATHS.VALIDATE_RESULT]);
    }
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.menuClickSubscription.unsubscribe();
    this.navbarService.unsubscribeBackPress();
    this.navbarService.unsubscribeMenuItemClick();
  }
  setPageTitle(title: string) {
    this.navbarService.setPageTitleWithIcon(title, { id: this.pageId, iconClass: 'navbar__menuItem--journey-map' });
  }
  goToReviewInput() {
    this.router.navigate([COMPREHENSIVE_ROUTE_PATHS.GETTING_STARTED]);
  }
  goToNext() {
    const reportStatus = this.comprehensiveService.getReportStatus();
    if (reportStatus === COMPREHENSIVE_CONST.REPORT_STATUS.SUBMITTED) {
      this.router.navigate([COMPREHENSIVE_ROUTE_PATHS.RESULT]);
    } else if (this.comprehensiveService.checkResultData()) {
      const currentStep = this.comprehensiveService.getMySteps();
      if (currentStep === 4) {
        if (this.isPaymentEnabled && this.comprehensiveJourneyMode) {
          // If payment is enabled and user has not paid, go payment else initiate report gen
            this.router.navigate([PAYMENT_ROUTE_PATHS.CHECKOUT]).then((result) => {
              if (result === false) {
                this.loaderService.showLoader({ title: 'Loading', autoHide: false });
                this.initiateReport();
              }
            });
        } else {
          this.loaderService.showLoader({ title: 'Loading', autoHide: false });
          this.initiateReport();
          this.loaderService.hideLoaderForced();
        }
      } else {
        this.router.navigate([COMPREHENSIVE_ROUTE_PATHS.STEPS + '/' + currentStep]);
      }
    } else {
      this.router.navigate([COMPREHENSIVE_ROUTE_PATHS.VALIDATE_RESULT]);
    }
  }
  initiateReport() {
    const enquiryId = { enquiryId: this.comprehensiveService.getEnquiryId() };
    this.comprehensiveApiService.generateComprehensiveReport(enquiryId).subscribe((data) => {
      let reportStatus = COMPREHENSIVE_CONST.REPORT_STATUS.READY;
      let viewMode = false;
      if (this.comprehensiveJourneyMode) {
        reportStatus = COMPREHENSIVE_CONST.REPORT_STATUS.SUBMITTED;
        viewMode = true;

      }
      this.comprehensiveService.setReportStatus(reportStatus);
      this.comprehensiveService.setLocked(true);
      this.comprehensiveService.setViewableMode(viewMode);
      this.router.navigate([COMPREHENSIVE_ROUTE_PATHS.RESULT]);
      this.loaderService.hideLoaderForced();
    //   // const payload = { enquiryId: this.comprehensiveService.getEnquiryId() }
    //   // this.comprehensiveApiService.createReportRequest(payload).subscribe((reportDataStatus: any) => {
    //   //   this.comprehensiveService.setReportId(reportDataStatus.reportId);
    //   //   this.router.navigate([COMPREHENSIVE_ROUTE_PATHS.RESULT]);
    //   // });

   });
  }
}
