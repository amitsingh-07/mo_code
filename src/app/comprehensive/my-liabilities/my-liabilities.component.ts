import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { COMPREHENSIVE_CONST } from '../comprehensive-config.constants';
import { COMPREHENSIVE_FORM_CONSTANTS } from '../comprehensive-form-constants';
import { COMPREHENSIVE_ROUTE_PATHS } from '../comprehensive-routes.constants';
import { IMyLiabilities, IMySummaryModal } from '../comprehensive-types';
import { ConfigService } from './../../config/config.service';
import { LoaderService } from './../../shared/components/loader/loader.service';
import { ProgressTrackerService } from './../../shared/modal/progress-tracker/progress-tracker.service';
import { NavbarService } from './../../shared/navbar/navbar.service';
import { Util } from './../../shared/utils/util';
import { ComprehensiveApiService } from './../comprehensive-api.service';
import { ComprehensiveService } from './../comprehensive.service';

@Component({
  selector: 'app-my-liabilities',
  templateUrl: './my-liabilities.component.html',
  styleUrls: ['./my-liabilities.component.scss']
})
export class MyLiabilitiesComponent implements OnInit, OnDestroy {
  pageTitle: string;
  myLiabilitiesForm: FormGroup;
  submitted: boolean;
  propertyLoan = true;
  liabilitiesDetails: IMyLiabilities;
  summaryModalDetails: IMySummaryModal;
  totalOutstanding = 0;
  menuClickSubscription: Subscription;
  subscription: Subscription;
  pageId: string;
  validationFlag: boolean;
  financeModal: any;
  summaryRouterFlag: boolean;
  bucketImage: string;
  viewMode: boolean;
  saveData: string;
  constructor(
    private route: ActivatedRoute, private router: Router, public navbarService: NavbarService,
    private translate: TranslateService, private formBuilder: FormBuilder, private configService: ConfigService,
    private comprehensiveService: ComprehensiveService, private comprehensiveApiService: ComprehensiveApiService,
    private progressService: ProgressTrackerService, private loaderService: LoaderService) {
    this.pageId = this.route.routeConfig.component.name;
    this.configService.getConfig().subscribe((config: any) => {
      this.translate.setDefaultLang(config.language);
      this.translate.use(config.language);
      this.saveData = this.translate.instant('COMMON_LOADER.SAVE_DATA');
    });
    this.viewMode = this.comprehensiveService.getViewableMode();
    this.summaryRouterFlag = COMPREHENSIVE_CONST.SUMMARY_CALC_CONST.ROUTER_CONFIG.STEP2;
    this.translate.get('COMMON').subscribe((result: string) => {
      // meta tag and title
      this.pageTitle = this.translate.instant('CMP.COMPREHENSIVE_STEPS.STEP_2_TITLE');
      this.setPageTitle(this.pageTitle);
      this.validationFlag = this.translate.instant('CMP.MY_LIABILITIES.OPTIONAL_VALIDATION_FLAG');
      this.financeModal = this.translate.instant('CMP.MODAL.FINANCES_MODAL');
    });
    this.liabilitiesDetails = this.comprehensiveService.getMyLiabilities();
  }

  ngOnInit() {
    this.progressService.setProgressTrackerData(this.comprehensiveService.generateProgressTrackerData());
    this.navbarService.setNavbarComprehensive(true);
    this.menuClickSubscription = this.navbarService.onMenuItemClicked.subscribe((pageId) => {
      if (this.pageId === pageId) {
        this.progressService.show();
      }
    });

    this.subscription = this.navbarService.subscribeBackPress().subscribe((event) => {
      if (event && event !== '') {
        const previousUrl = this.comprehensiveService.getPreviousUrl(this.router.url);
        if (previousUrl !== null) {
          this.router.navigate([previousUrl]);
        } else {
          this.navbarService.goBack();
        }
      }
    });

    this.buildMyLiabilitiesForm();
    this.onTotalOutstanding();
    if (this.liabilitiesDetails && this.liabilitiesDetails.otherPropertyLoanOutstandingAmount
      && this.liabilitiesDetails.otherPropertyLoanOutstandingAmount !== null
      && this.liabilitiesDetails.otherPropertyLoanOutstandingAmount > 0) {
      this.addPropertyLoan();
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
  addPropertyLoan() {
    const otherPropertyControl = this.myLiabilitiesForm.controls['otherPropertyLoanOutstandingAmount'];
    if (this.propertyLoan) {
      otherPropertyControl.setValidators([Validators.required, Validators.pattern('^0*[1-9]\\d*$')]);
      otherPropertyControl.updateValueAndValidity();
    } else {
      otherPropertyControl.markAsDirty();
      otherPropertyControl.setValue('');
      otherPropertyControl.setValidators([]);
      otherPropertyControl.updateValueAndValidity();
    }
    this.onTotalOutstanding();
    this.propertyLoan = !this.propertyLoan;
  }
  buildMyLiabilitiesForm() {
    this.myLiabilitiesForm = this.formBuilder.group({
      homeLoanOutstandingAmount: [{
        value: this.liabilitiesDetails ? this.liabilitiesDetails.homeLoanOutstandingAmount : '',
        disabled: this.viewMode
      }, []],
      otherPropertyLoanOutstandingAmount: [{
        value: this.liabilitiesDetails ? this.liabilitiesDetails.otherPropertyLoanOutstandingAmount
          : '', disabled: this.viewMode
      }],
      otherLoanOutstandingAmount: [{
        value: this.liabilitiesDetails ? this.liabilitiesDetails.otherLoanOutstandingAmount : '',
        disabled: this.viewMode
      }, []],
      carLoansAmount: [{
        value: this.liabilitiesDetails ? this.liabilitiesDetails.carLoansAmount : '',
        disabled: this.viewMode
      }, []],
    });
  }
  goToNext(form: FormGroup) {
    if (this.viewMode) {
      this.routerPath();
    } else {
      if (this.validateLiabilities(form)) {
        const liabilitiesData = this.comprehensiveService.getComprehensiveSummary().comprehensiveLiabilities;
        if (!form.pristine || Util.isEmptyOrNull(liabilitiesData) ||
          this.comprehensiveService.getReportStatus() === COMPREHENSIVE_CONST.REPORT_STATUS.NEW || this.comprehensiveService.getReportStatus() === COMPREHENSIVE_CONST.REPORT_STATUS.EDIT) {
          if (!form.controls.homeLoanOutstandingAmount.pristine) {
            this.comprehensiveService.setHomeLoanChanges(true);
          }
          this.liabilitiesDetails = form.value;
          this.liabilitiesDetails[COMPREHENSIVE_CONST.YOUR_FINANCES.YOUR_LIABILITIES.API_TOTAL_BUCKET_KEY] = this.totalOutstanding;
          this.liabilitiesDetails.enquiryId = this.comprehensiveService.getEnquiryId();
          this.loaderService.showLoader({ title: this.saveData });
          this.comprehensiveApiService.saveLiabilities(this.liabilitiesDetails).subscribe((data) => {
            this.comprehensiveService.setMyLiabilities(this.liabilitiesDetails);
            if (this.comprehensiveService.getMySteps() === 1
              && this.comprehensiveService.getMySubSteps() < 6) {
              this.comprehensiveService.setStepCompletion(1, 6).subscribe((data1: any) => {
                this.loaderService.hideLoader();
                this.routerPath();
              });
            } else {
              this.loaderService.hideLoader();
              this.routerPath();
            }
          });
        } else {
          this.routerPath();
        }
      }
    }
  }
  get addLiabilitiesValid() { return this.myLiabilitiesForm.controls; }
  validateLiabilities(form: FormGroup) {
    this.submitted = true;
    if (this.comprehensiveService.getReportStatus() === COMPREHENSIVE_CONST.REPORT_STATUS.NEW) {
      this.myLiabilitiesForm.markAsDirty();
    }
    if (this.validationFlag === true && !form.valid) {
      Object.keys(form.controls).forEach((key) => {
        form.get(key).markAsDirty();
      });
      const error = this.comprehensiveService.getFormError(form, COMPREHENSIVE_FORM_CONSTANTS.MY_LIABILITIES);
      this.comprehensiveService.openErrorModal(error.title, error.errorMessages, false,
        this.translate.instant('CMP.ERROR_MODAL_TITLE.MY_LIABILITIES'));
      return false;
    } else {
      this.submitted = false;
    }
    return true;
  }
  showToolTipModal(toolTipTitle, toolTipMessage) {
    const toolTipParams = {
      TITLE: this.translate.instant('CMP.MY_LIABILITIES.TOOLTIP.' + toolTipTitle),
      DESCRIPTION: this.translate.instant('CMP.MY_LIABILITIES.TOOLTIP.' + toolTipMessage)
    };
    this.comprehensiveService.openTooltipModal(toolTipParams);
  }

  @HostListener('input', ['$event'])
  onChange() {
    this.onTotalOutstanding();
  }

  onTotalOutstanding() {
    this.totalOutstanding = this.comprehensiveService.additionOfCurrency(this.myLiabilitiesForm.value);
    const bucketParams = COMPREHENSIVE_CONST.YOUR_FINANCES.YOUR_LIABILITIES.BUCKET_INPUT_CALC;
    this.bucketImage = this.comprehensiveService.setBucketImage(bucketParams, this.myLiabilitiesForm.value, this.totalOutstanding);
  }
  showSummaryModal() {
    const liquidCash = this.comprehensiveService.getLiquidCash();
    const spareCash = this.comprehensiveService.getComputeSpareCash();
    this.summaryModalDetails = {
      setTemplateModal: 2,
      contentObj: this.financeModal,
      liabilitiesEmergency: (liquidCash > 0),
      liabilitiesLiquidCash: liquidCash,
      liabilitiesMonthlySpareCash: spareCash,
      nextPageURL: (COMPREHENSIVE_ROUTE_PATHS.STEPS) + '/3',
      routerEnabled: this.summaryRouterFlag
    };
    this.comprehensiveService.openSummaryPopUpModal(this.summaryModalDetails);
  }
  routerPath() {
    this.showSummaryModal();
  }
}
