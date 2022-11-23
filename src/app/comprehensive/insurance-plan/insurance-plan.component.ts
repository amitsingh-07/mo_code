import { Component, OnDestroy, OnInit, ViewEncapsulation, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { ConfigService } from '../../config/config.service';
import { NavbarService } from '../../shared/navbar/navbar.service';
import { ComprehensiveApiService } from '../comprehensive-api.service';
import { COMPREHENSIVE_ROUTE_PATHS } from '../comprehensive-routes.constants';
import { HospitalPlan, IHospitalPlanList, IInsurancePlan, IMyLiabilities } from '../comprehensive-types';
import { ComprehensiveService } from '../comprehensive.service';
import { ProgressTrackerService } from './../../shared/modal/progress-tracker/progress-tracker.service';
import { AboutAge } from './../../shared/utils/about-age.util';
import { COMPREHENSIVE_CONST } from './../comprehensive-config.constants';
import { Util } from '../../shared/utils/util';
import { LoaderService } from './../../shared/components/loader/loader.service';


@Component({
  selector: 'app-insurance-plan',
  templateUrl: './insurance-plan.component.html',
  styleUrls: ['./insurance-plan.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class InsurancePlanComponent implements OnInit, OnDestroy {
  pageTitle: any;
  pageId: string;
  menuClickSubscription: Subscription;
  subscription: Subscription;
  insurancePlanForm: FormGroup;
  insurancePlanFormValues: IInsurancePlan;
  longTermInsurance = false;
  showLongTermInsurance = false;
  haveHDB = false;
  submitted = false;
  insurancePlanningDependantModal: any;
  insurancePlanningNonDependantModal: any;
  summaryRouterFlag: boolean;
  hospitalType: string;
  hospitalPlanList: IHospitalPlanList[];
  DownLuck: HospitalPlan;
  viewMode: boolean;
  liabilitiesDetails: IMyLiabilities;
  careShieldTitle: string;
  careShieldMessage: string;
  userAgeCriteria: any;
  saveData: any;
  radioLabelValue = [{
    name: this.translate.instant('CMP.FORM_LABEL.YES_LABEL'),
    value: true,
    conditionalClass: { matchValue : true, applyClass: 'mr5' }
  }, {
    name: this.translate.instant('CMP.FORM_LABEL.NO_LABEL'),
    value: false
  }];
  radioLabelValueRider = [{
    name: this.translate.instant('CMP.FORM_LABEL.YES_LABEL'),
    value: '1',
    conditionalClass: { matchValue : true, applyClass: 'mr5' }
  }, {
    name: this.translate.instant('CMP.FORM_LABEL.NO_LABEL'),
    value: '0'
  }, {
    name: this.translate.instant('CMP.FORM_LABEL.NOT_SURE'),
    value: '2'
  }];
  radioLabelValueLTESAmt = [{
    name: this.translate.instant('CMP.FORM_LABEL.YES_LABEL'),
    value: '300',
    conditionalClass: { matchValue : true, applyClass: 'full-width' }
  }, {
    name: this.translate.instant('CMP.FORM_LABEL.NO_LABEL'),
    value: '400',
    conditionalClass: { matchValue : true, applyClass: 'full-width' }
  }];
  defaultRadioStyleClass = 'btn-outline-primary fixed-btn--sm-comprehensive';

  constructor(
    private navbarService: NavbarService, private progressService: ProgressTrackerService,
    private translate: TranslateService,
    private formBuilder: FormBuilder, private configService: ConfigService, private router: Router,
    private comprehensiveService: ComprehensiveService, private comprehensiveApiService: ComprehensiveApiService,
    private age: AboutAge, private route: ActivatedRoute, private loaderService: LoaderService) {
    this.summaryRouterFlag = COMPREHENSIVE_CONST.SUMMARY_CALC_CONST.ROUTER_CONFIG.STEP3;
    this.configService.getConfig().subscribe((config: any) => {
      this.translate.setDefaultLang(config.language);
      this.translate.use(config.language);
      this.viewMode = this.comprehensiveService.getViewableMode();
      this.translate.get(config.common).subscribe((result: string) => {
        // meta tag and title
        this.pageTitle = this.translate.instant('CMP.COMPREHENSIVE_STEPS.STEP_3_TITLE');
        this.setPageTitle(this.pageTitle);
        this.insurancePlanningDependantModal = this.translate.instant('CMP.MODAL.INSURANCE_PLANNING_MODAL.DEPENDANTS');
        this.insurancePlanningNonDependantModal = this.translate.instant('CMP.MODAL.INSURANCE_PLANNING_MODAL.NO_DEPENDANTS');
        this.careShieldTitle = this.translate.instant('CARE_SHIELD_TITLE');
        this.careShieldMessage = this.translate.instant('CARE_SHIELD_MESSAGE');
        this.saveData = this.translate.instant('COMMON_LOADER.SAVE_DATA');
      });
    });

    this.hospitalType = this.comprehensiveService.getDownOnLuck().hospitalPlanName;
    this.insurancePlanFormValues = this.comprehensiveService.getInsurancePlanningList();
    if (this.insurancePlanFormValues && this.insurancePlanFormValues.haveLongTermPopup) {
      this.showToolTipModal(this.careShieldTitle, this.careShieldMessage)
    }
    const userAge = this.age.calculateAge(this.comprehensiveService.getMyProfile().dateOfBirth, new Date());
    const userYear = this.age.getBirthYear(this.comprehensiveService.getMyProfile().dateOfBirth);
    if ((userAge > COMPREHENSIVE_CONST.INSURANCE_PLAN.LONG_TERM_INSURANCE_AGE && userYear >
      COMPREHENSIVE_CONST.INSURANCE_PLAN.LONG_TERM_INSURANCE_YEAR) &&
      ((this.comprehensiveService.getComprehensiveEnquiry().reportStatus != COMPREHENSIVE_CONST.REPORT_STATUS.SUBMITTED) || (this.insurancePlanFormValues.shieldType === COMPREHENSIVE_CONST.LONG_TERM_SHIELD_TYPE.CARE_SHIELD))) {
      this.longTermInsurance = true;
    }
    if (userAge > COMPREHENSIVE_CONST.INSURANCE_PLAN.LONG_TERM_INSURANCE_AGE) {
      this.showLongTermInsurance = true;
      if ((this.comprehensiveService.getComprehensiveEnquiry().reportStatus === COMPREHENSIVE_CONST.REPORT_STATUS.SUBMITTED) && Util.isEmptyOrNull(this.insurancePlanFormValues.shieldType) && (userAge <
        COMPREHENSIVE_CONST.INSURANCE_PLAN.LONG_TERM_INSURANCE_AGE_OLD)) {
        this.showLongTermInsurance = false;
      }
    }
    if (userAge < COMPREHENSIVE_CONST.INSURANCE_PLAN.LIFE_PROTECTION_AMOUNT_AGE_SIXTY) {
      this.userAgeCriteria = COMPREHENSIVE_CONST.INSURANCE_PLAN.LIFE_PROTECTION_AMOUNT_AGE_LESS_THAN_SIXTY;
    }
    else if (userAge >= COMPREHENSIVE_CONST.INSURANCE_PLAN.LIFE_PROTECTION_AMOUNT_AGE_SIXTY && userAge <= COMPREHENSIVE_CONST.INSURANCE_PLAN.LIFE_PROTECTION_AMOUNT_AGE_SIXTY_FIVE) {
      this.userAgeCriteria = COMPREHENSIVE_CONST.INSURANCE_PLAN.LIFE_PROTECTION_AMOUNT_AGE_SIXTY_TO_SIXTYFIVE;
    }
    else {
      this.userAgeCriteria = COMPREHENSIVE_CONST.INSURANCE_PLAN.LIFE_PROTECTION_AMOUNT_AGE_ABOVE_SIXTY_FIVE;
    }
    this.liabilitiesDetails = this.comprehensiveService.getMyLiabilities();
    this.buildInsuranceForm();
    const cmpSummary = this.comprehensiveService.getComprehensiveSummary();
    if (cmpSummary.comprehensiveSpending && cmpSummary.comprehensiveSpending.HLtypeOfHome) {
      if (cmpSummary.comprehensiveSpending.HLtypeOfHome.toLocaleLowerCase() !== 'private'
        || (cmpSummary.comprehensiveSpending.mortgageTypeOfHome &&
          cmpSummary.comprehensiveSpending.mortgageTypeOfHome.toLocaleLowerCase() !== 'private')) {
        this.haveHDB = true;
      } else {
        this.resetHDBScheme();
      }
    }
    if (this.insurancePlanFormValues && this.insurancePlanFormValues.haveCPFDependentsProtectionScheme !== 1) {
      this.resetLifeProtectionAmount();
    }
    this.progressService.setProgressTrackerData(this.comprehensiveService.generateProgressTrackerData());
  }

  buildInsuranceForm() {
    let homeLoanOutstandingAmount = this.insurancePlanFormValues ? this.insurancePlanFormValues.homeProtectionCoverageAmount : 0;
    if (this.comprehensiveService.getHomeLoanChanges()) {
      homeLoanOutstandingAmount = this.liabilitiesDetails.homeLoanOutstandingAmount;
    }
    this.insurancePlanForm = this.formBuilder.group({
      haveHospitalPlan: [{
        value: this.insurancePlanFormValues ? this.insurancePlanFormValues.haveHospitalPlan
          : '', disabled: this.viewMode
      }, [Validators.required]],
      haveHospitalPlanWithRider: [{
        value: this.insurancePlanFormValues ? this.insurancePlanFormValues.haveHospitalPlanWithRider
          : '', disabled: this.viewMode
      }, [Validators.required]],
      haveCPFDependentsProtectionScheme: [{
        value: this.insurancePlanFormValues ?
          this.insurancePlanFormValues.haveCPFDependentsProtectionScheme : '', disabled: this.viewMode
      }, [Validators.required]],
      lifeProtectionAmount: [{
        value: this.insurancePlanFormValues ? this.insurancePlanFormValues.lifeProtectionAmount :
          this.userAgeCriteria,
        disabled: this.viewMode
      }, [Validators.required]],
      haveHDBHomeProtectionScheme: [{
        value: this.insurancePlanFormValues ? this.insurancePlanFormValues.haveHDBHomeProtectionScheme : '',
        disabled: this.viewMode
      }, [Validators.required]],
      homeProtectionCoverageAmount: [{
        value: homeLoanOutstandingAmount,
        disabled: this.viewMode
      }, [Validators.required]],
      otherLifeProtectionCoverageAmount: [{
        value: this.insurancePlanFormValues ?
          this.insurancePlanFormValues.otherLifeProtectionCoverageAmount : 0, disabled: this.viewMode
      }, [Validators.required]],
      criticalIllnessCoverageAmount: [{
        value: this.insurancePlanFormValues ? this.insurancePlanFormValues.criticalIllnessCoverageAmount :
          0, disabled: this.viewMode
      }, [Validators.required]],
      disabilityIncomeCoverageAmount: [{
        value: this.insurancePlanFormValues ?
          this.insurancePlanFormValues.disabilityIncomeCoverageAmount : 0, disabled: this.viewMode
      }],
      haveLongTermElderShield: [{
        value: this.insurancePlanFormValues ? this.insurancePlanFormValues.haveLongTermElderShield :
          '', disabled: this.viewMode
      }, [Validators.required]],
      longTermElderShieldAmount: [{
        value: this.insurancePlanFormValues ? this.insurancePlanFormValues.longTermElderShieldAmount
          : 0, disabled: this.viewMode
      }, [Validators.required]],
      otherLongTermCareInsuranceAmount: [{
        value: this.insurancePlanFormValues ? this.insurancePlanFormValues.otherLongTermCareInsuranceAmount
          : 0, disabled: this.viewMode
      }, []]
    });
    if (this.viewMode) {
      this.defaultRadioStyleClass = `${this.defaultRadioStyleClass} view-mode`;
    }
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
  }

  resetLifeProtectionAmount() {
    this.insurancePlanForm.controls['lifeProtectionAmount'].setValue(this.userAgeCriteria);
  }
  resetHDBScheme() {
    this.insurancePlanForm.controls['haveHDBHomeProtectionScheme'].setValue('');
    this.insurancePlanForm.controls['homeProtectionCoverageAmount'].setValue(0);
  }
  resetLongTermShieldAmount() {
    this.insurancePlanForm.controls['longTermElderShieldAmount'].setValue('');
    this.insurancePlanForm.controls['otherLongTermCareInsuranceAmount'].setValue(0);
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.menuClickSubscription.unsubscribe();
    this.navbarService.unsubscribeBackPress();
    this.navbarService.unsubscribeMenuItemClick();
  }

  /**
   * Set the page title
   *
   * @param {string} title
   * @memberof InsurancePlanComponent
   */
  setPageTitle(title: string) {
    this.navbarService.setPageTitleWithIcon(title, { id: this.pageId, iconClass: 'navbar__menuItem--journey-map' });
  }
  goToNext(form) {
    if (this.viewMode) {
      this.showSummaryModal();
    } else {
      const cmpSummary = this.comprehensiveService.getComprehensiveSummary();
      if (!form.pristine || cmpSummary.comprehensiveInsurancePlanning === null ||
        this.comprehensiveService.getReportStatus() === COMPREHENSIVE_CONST.REPORT_STATUS.NEW || this.comprehensiveService.getReportStatus() === COMPREHENSIVE_CONST.REPORT_STATUS.EDIT) {
        if (!form.controls.homeProtectionCoverageAmount.pristine) {
          this.comprehensiveService.setHomeLoanChanges(false);
        }
        if (form.value.haveHDBHomeProtectionScheme !== 1 || form.value.homeProtectionCoverageAmount == '') {
          form.value.homeProtectionCoverageAmount = 0;
        }
        if (form.value.haveLongTermElderShield !== 1 || form.value.longTermElderShieldAmount == '') {

          form.value.longTermElderShieldAmount = 0;
          if (form.value.otherLongTermCareInsuranceAmount == '') {
            form.value.otherLongTermCareInsuranceAmount = 0;
          }
        }
        if (!form.value.haveHospitalPlan) {
          form.value.haveHospitalPlanWithRider = 0;
        }

        form.value.enquiryId = this.comprehensiveService.getEnquiryId();

        if (form.value.haveCPFDependentsProtectionScheme !== 1 || form.value.lifeProtectionAmount == '') {
          form.value.lifeProtectionAmount = 0;
        }

        if (this.showLongTermInsurance) {
          if (this.longTermInsurance) {
            form.value.haveLongTermElderShield = null;
            form.value.longTermElderShieldAmount = null;
            form.value.shieldType = COMPREHENSIVE_CONST.LONG_TERM_SHIELD_TYPE.CARE_SHIELD;
          } else {
            form.value.shieldType = COMPREHENSIVE_CONST.LONG_TERM_SHIELD_TYPE.ELDER_SHIELD;
            form.value.longTermElderShieldAmount = (form.value.haveLongTermElderShield === 1 && form.value.longTermElderShieldAmount) ? form.value.longTermElderShieldAmount : 0;
            form.value.otherLongTermCareInsuranceAmount = (form.value.haveLongTermElderShield === 1 && form.value.otherLongTermCareInsuranceAmount) ? form.value.otherLongTermCareInsuranceAmount : 0;
          }
        } else {
          form.value.haveLongTermElderShield = null;
          form.value.longTermElderShieldAmount = null;
          form.value.otherLongTermCareInsuranceAmount = null;
          form.value.shieldType = COMPREHENSIVE_CONST.LONG_TERM_SHIELD_TYPE.NO_SHIELD;

        }

        this.loaderService.showLoader({ title: this.saveData });
        this.comprehensiveApiService.saveInsurancePlanning(form.value).subscribe((data) => {
          if (form.value.haveCPFDependentsProtectionScheme !== 1) {
            form.value.lifeProtectionAmount = this.userAgeCriteria;
          }
          this.comprehensiveService.setInsurancePlanningList(form.value);
          if (this.insurancePlanFormValues && this.insurancePlanFormValues.haveLongTermPopup) {
            this.comprehensiveService.setCareshieldFlag(false);
          }

          if (this.comprehensiveService.getMySteps() === 2
            && this.comprehensiveService.getMySubSteps() < 1) {
            this.comprehensiveService.setStepCompletion(2, 1).subscribe((data1: any) => {
              this.loaderService.hideLoader();
              this.showSummaryModal();
            });
          } else {
            this.loaderService.hideLoader();
            this.showSummaryModal();
          }
        });
      } else {
        this.showSummaryModal();
      }
    }
  }
  showSummaryModal() {
    const fireProofingDetails = this.comprehensiveService.getCurrentFireProofing();
    if (!fireProofingDetails.dependant) {
      const summaryModalDetails = {
        setTemplateModal: 3,
        contentObj: this.insurancePlanningDependantModal,
        dependantModelSel: true,
        nextPageURL: (COMPREHENSIVE_ROUTE_PATHS.STEPS) + '/4',
        routerEnabled: this.summaryRouterFlag
      };
      this.comprehensiveService.openSummaryPopUpModal(summaryModalDetails);
    } else {
      this.loaderService.showLoader({ title: this.saveData });
      this.comprehensiveApiService.getInsurancePlanning().subscribe(
        (data: any) => {
          this.loaderService.hideLoader();
          if (data && data[fireProofingDetails.gender][fireProofingDetails.age]) {
            const termLifeDetails = data[fireProofingDetails.gender][fireProofingDetails.age];
            const Regexp = new RegExp('[,]', 'g');
            const wholeLifeInsurance: any = (termLifeDetails['WHOLELIFE'] + '').replace(Regexp, '');
            const summaryModalDetails = {
              setTemplateModal: 3,
              contentObj: this.insurancePlanningNonDependantModal,
              dependantModelSel: false,
              estimatedCost: COMPREHENSIVE_CONST.SUMMARY_CALC_CONST.INSURANCE_PLAN.ESTIMATED_COST,
              termInsurance: termLifeDetails['TERM'],
              wholeLife: wholeLifeInsurance,
              nextPageURL: (COMPREHENSIVE_ROUTE_PATHS.STEPS) + '/4',
              routerEnabled: this.summaryRouterFlag
            };
            this.comprehensiveService.openSummaryPopUpModal(summaryModalDetails);
          }
        }
      );
    }
  }
  showToolTipModal(toolTipTitle, toolTipMessage) {
    const toolTipParams = {
      TITLE: this.translate.instant('CMP.INSURANCE_PLAN.TOOLTIP.' + toolTipTitle),
      DESCRIPTION: this.translate.instant('CMP.INSURANCE_PLAN.TOOLTIP.' + toolTipMessage)
    };
    this.comprehensiveService.openTooltipModal(toolTipParams);
  }
}
