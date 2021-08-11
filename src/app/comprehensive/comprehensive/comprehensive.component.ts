import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { RegexConstants } from '../../shared/utils/api.regex.constants';
import { APP_ROUTES } from '../../app-routes.constants';
import { appConstants } from '../../app.constants';
import { AppService } from '../../app.service';
import { LoaderService } from '../../shared/components/loader/loader.service';
import { ErrorModalComponent } from '../../shared/modal/error-modal/error-modal.component';
import { SignUpService } from '../../sign-up/sign-up.service';
import { ComprehensiveApiService } from '../comprehensive-api.service';
import { COMPREHENSIVE_CONST } from '../comprehensive-config.constants';
import { COMPREHENSIVE_ROUTE_PATHS } from '../comprehensive-routes.constants';
import { IMyProfile } from '../comprehensive-types';
import { ComprehensiveService } from '../comprehensive.service';
import { environment } from './../../../environments/environment';
import { ConfigService } from './../../config/config.service';
import { FooterService } from './../../shared/footer/footer.service';
import { AuthenticationService } from './../../shared/http/auth/authentication.service';
import {
  LoginCreateAccountModelComponent
} from './../../shared/modal/login-create-account-model/login-create-account-model.component';
import { NavbarService } from './../../shared/navbar/navbar.service';

@Component({
  selector: 'app-comprehensive',
  templateUrl: './comprehensive.component.html',
  styleUrls: ['./comprehensive.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ComprehensiveComponent implements OnInit {

  loginModalTitle: string;
  modalRef: NgbModalRef;
  safeURL: any;
  userDetails: IMyProfile;
  promoCodeForm: FormGroup;
  promoCodeSuccess: string;
  promoValidated: string;
  
  getComprehensiveSummaryDashboard: any;
  isBannerNoteVisible: boolean;
  includingGst = false;
  fetchData: string;
  loading: string;


  constructor(
    private appService: AppService, private cmpService: ComprehensiveService,
    private route: ActivatedRoute, private router: Router, public translate: TranslateService,
    public navbarService: NavbarService, private configService: ConfigService,
    private authService: AuthenticationService, public modal: NgbModal,
    private loaderService: LoaderService, private signUpService: SignUpService,
    private formBuilder: FormBuilder,
    public footerService: FooterService, private sanitizer: DomSanitizer, private comprehensiveApiService: ComprehensiveApiService) {
    this.configService.getConfig().subscribe((config: any) => {
      this.translate.setDefaultLang(config.language);
      this.translate.use(config.language);
      this.translate.get(config.common).subscribe((result: string) => {
        this.loginModalTitle = this.translate.instant('CMP.MODAL.LOGIN_SIGNUP_TITLE');
        this.promoCodeSuccess = this.translate.instant('CMP.MODAL.PROMO_CODE_SUCCESS');
        this.promoValidated = this.translate.instant('CMP.MODAL.PROMO_CODE_VALIDATED');
        this.fetchData = this.translate.instant('MYINFO.FETCH_MODAL_DATA.TITLE');
        this.loading = this.translate.instant('COMMON_LOADER.TITLE');
        this.safeURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.translate.instant('CMP.COMPREHENSIVE.VIDEO_LINK'));
        this.navbarService.setPageTitle(this.translate.instant('CMP.COMPREHENSIVE.PAGE_TITLE'), '', false);

        const isUnsupportedNoteShown = this.signUpService.getUnsupportedNoteShownFlag();
        this.signUpService.mobileOptimizedObservable$.subscribe((mobileOptimizedView) => {
          if (!this.signUpService.isMobileDevice() && !mobileOptimizedView && !isUnsupportedNoteShown) {
            this.signUpService.showUnsupportedDeviceModal();
            this.signUpService.setUnsupportedNoteShownFlag();
          }
        });
      });
    });
  }

  ngOnInit() {
    this.navbarService.setNavbarComprehensive(true);
    this.footerService.setFooterVisibility(false);
    this.appService.setJourneyType(appConstants.JOURNEY_TYPE_COMPREHENSIVE);
    if (this.authService.isSignedUser()) {
      const action = this.appService.getAction();
      this.loaderService.showLoader({ title: this.fetchData, autoHide: false });
      const getCurrentVersionType = COMPREHENSIVE_CONST.VERSION_TYPE.FULL;

      this.comprehensiveApiService.getComprehensiveSummaryDashboard().subscribe((dashboardData: any) => {
        if (dashboardData && dashboardData.objectList[0]) {
          // tslint:disable-next-line: max-line-length
          this.getComprehensiveSummaryDashboard = this.cmpService.filterDataByInput(dashboardData.objectList, 'type', COMPREHENSIVE_CONST.VERSION_TYPE.FULL);
          if (this.getComprehensiveSummaryDashboard !== '') {
            if (action === COMPREHENSIVE_CONST.PROMO_CODE.VALIDATE) {
              this.getStarted();
            } else if (!getCurrentVersionType) {
              this.redirect();
            } else {
              setTimeout(() => {
                this.loaderService.hideLoaderForced();
              }, 500);
            }
          } else {
            if (action === COMPREHENSIVE_CONST.PROMO_CODE.VALIDATE) {
              this.getStarted();
            } else {
              setTimeout(() => {
                this.loaderService.hideLoaderForced();
              }, 500);
            }
          }
        } else {
          if (action === COMPREHENSIVE_CONST.PROMO_CODE.VALIDATE) {
            this.getStarted();
          } else {
            setTimeout(() => {
              this.loaderService.hideLoaderForced();
            }, 500);
          }
        }
      });

    } else {
      this.authService.authenticate().subscribe((data: any) => {  
        this.authService.clearAuthDetails();
      });

    }
    this.isBannerNoteVisible = this.isCurrentDateInRange(COMPREHENSIVE_CONST.BANNER_NOTE_START_TIME,
      COMPREHENSIVE_CONST.BANNER_NOTE_END_TIME);
  }

  /**
   * Navigate to the `redirectUrl` if set, else navigate to the `Getting Started` page.
   */
  redirect() {
    this.appService.clearPromoCode();
    const redirectUrl = this.signUpService.getRedirectUrl();
    if (this.getComprehensiveSummaryDashboard &&
      this.getComprehensiveSummaryDashboard.reportStatus === COMPREHENSIVE_CONST.REPORT_STATUS.SUBMITTED &&
      (this.getComprehensiveSummaryDashboard.isCFPGetStarted)) {
      this.router.navigate([COMPREHENSIVE_ROUTE_PATHS.DASHBOARD]);
    } else if (redirectUrl && (this.getComprehensiveSummaryDashboard && this.getComprehensiveSummaryDashboard.isCFPGetStarted)) {
      this.router.navigate([redirectUrl]);
    } else if (this.getComprehensiveSummaryDashboard && this.getComprehensiveSummaryDashboard.isCFPGetStarted) {
      this.comprehensiveApiService.getComprehensiveSummary().subscribe((data: any) => {
        if (data && data.objectList[0]) {
          this.cmpService.setComprehensiveSummary(data.objectList[0]);
          this.router.navigate([COMPREHENSIVE_ROUTE_PATHS.GETTING_STARTED]);
        }
      });
    }

    setTimeout(() => {
      this.loaderService.hideLoaderForced();
    }, 500);
  }

  getStarted() {
    this.appService.setAction(COMPREHENSIVE_CONST.PROMO_CODE.VALIDATE);
    if (this.authService.isSignedUser()) {
      const promoCode = {
        sessionId: this.authService.getSessionId()
      };
      if (this.getComprehensiveSummaryDashboard && this.getComprehensiveSummaryDashboard.isCFPGetStarted) {
        this.redirect();
      } else {
        this.loaderService.showLoader({ title: this.loading, autoHide: false });
        this.comprehensiveApiService.generateComprehensiveEnquiry(promoCode).subscribe((data: any) => {
          if (data && data.objectList[0].isCFPGetStarted) {
            this.comprehensiveApiService.getComprehensiveSummary().subscribe((summaryData: any) => {
              if (summaryData && summaryData.objectList[0]) {
                this.cmpService.setComprehensiveSummary(summaryData.objectList[0]);
                this.router.navigate([COMPREHENSIVE_ROUTE_PATHS.GETTING_STARTED]);
              }
            });
          }
        }, (err) => {
          setTimeout(() => {
            this.loaderService.hideLoaderForced();
          }, 500);
        });

      }
    } else {
      this.showLoginOrSignUpModal();
    }
  }
   
  showLoginOrSignUpModal() {
    this.cmpService.clearFormData();
    this.cmpService.setStartingPage(APP_ROUTES.COMPREHENSIVE);
    this.modalRef = this.modal.open(LoginCreateAccountModelComponent, {
      windowClass: 'position-bottom',
      centered: true
    });
    this.modalRef.componentInstance.title = this.loginModalTitle;
  }

  isCurrentDateInRange(START_TIME, END_TIME) {
    return (new Date() >= new Date(START_TIME)
      && new Date() <= new Date(END_TIME));
  }
  
}
