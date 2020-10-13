import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ConfigService } from '../../config/config.service';
import { LoaderService } from '../../shared/components/loader/loader.service';
import { ProgressTrackerService } from '../../shared/modal/progress-tracker/progress-tracker.service';
import { NavbarService } from '../../shared/navbar/navbar.service';
import { SignUpService } from '../../sign-up/sign-up.service';
import { COMPREHENSIVE_ROUTE_PATHS } from '../comprehensive-routes.constants';
import { ComprehensiveService } from '../comprehensive.service';
import { COMPREHENSIVE_CONST } from '../comprehensive-config.constants';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit, OnDestroy {
  pageId: string;
  pageTitle: string;
  menuClickSubscription: Subscription;
  subscription: Subscription;
  emailID: string;
  alertTitle: string;
  alertMessage: string;
  comprehensiveJourneyMode: boolean;
  isPayment: boolean;
  @Output() backPressed: EventEmitter<any> = new EventEmitter();
  constructor(private activatedRoute: ActivatedRoute, public navbarService: NavbarService,
    private translate: TranslateService,
    private configService: ConfigService, private router: Router,
    private progressService: ProgressTrackerService,
    private comprehensiveService: ComprehensiveService, private signUpService: SignUpService,
    private loaderService: LoaderService) {
    this.pageId = this.activatedRoute.routeConfig.component.name;
    this.configService.getConfig().subscribe((config: any) => {
      this.translate.setDefaultLang(config.language);
      this.translate.use(config.language);
      this.translate.get(config.common).subscribe((result: string) => {
        // meta tag and title
        this.pageTitle = this.translate.instant('CMP.COMPREHENSIVE_STEPS.STEP_5_TITLE_NAV');
        this.alertTitle = this.translate.instant('CMP.RESULT.TOOLTIP_TITLE');
        this.alertMessage = this.translate.instant('CMP.RESULT.TOOLTIP_MESSAGE');
        this.setPageTitle(this.pageTitle);
      });
    });
    this.emailID = this.signUpService.getUserProfileInfo().emailAddress;
    this.subscription = this.navbarService.subscribeBackPress().subscribe((event) => {
      if (event && event !== '') {
        this.showToolTipModal();
      }
    });
  }

  ngOnInit() {
    this.comprehensiveJourneyMode = this.comprehensiveService.getComprehensiveVersion();
    if (this.comprehensiveJourneyMode) {
      this.paymentStatus();
    }
    this.loaderService.hideLoaderForced();
    this.progressService.setProgressTrackerData(this.comprehensiveService.generateProgressTrackerData());
    this.progressService.setReadOnly(true);
    this.navbarService.setNavbarComprehensive(true);
    this.menuClickSubscription = this.navbarService.onMenuItemClicked.subscribe((pageId) => {
      if (this.pageId === pageId) {
        this.progressService.show();
      }
    });
  }
  paymentStatus() {
    let comprehensiveData = this.comprehensiveService.getComprehensiveEnquiry();
    if (comprehensiveData.paymentStatus === null || comprehensiveData.paymentStatus.toLowerCase() === COMPREHENSIVE_CONST.PAYMENT_STATUS.PENDING
    || comprehensiveData.paymentStatus.toLowerCase() === COMPREHENSIVE_CONST.PAYMENT_STATUS.PARTIAL_PENDING || comprehensiveData.reportStatus.toLowerCase() === COMPREHENSIVE_CONST.REPORT_STATUS.NEW) {
      this.isPayment = true;
    } else {
      this.isPayment = false;
    }

  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.menuClickSubscription.unsubscribe();
    this.navbarService.unsubscribeBackPress();
    this.navbarService.unsubscribeMenuItemClick();
  }
  showToolTipModal() {
    const toolTipParams = {
      TITLE: this.alertTitle,
      DESCRIPTION: this.alertMessage
    };
    this.comprehensiveService.openTooltipModal(toolTipParams);
  }
  setPageTitle(title: string) {
    this.navbarService.setPageTitleWithIcon(title, { id: this.pageId, iconClass: 'navbar__menuItem--journey-map' });
  }
  goToNext() {
    this.router.navigate([COMPREHENSIVE_ROUTE_PATHS.DASHBOARD]);
  }
}
