import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { ConfigService } from '../../config/config.service';
import { ApiService } from '../../shared/http/api.service';
import { NavbarService } from '../../shared/navbar/navbar.service';
import { ComprehensiveApiService } from '../comprehensive-api.service';
import { COMPREHENSIVE_ROUTE_PATHS } from '../comprehensive-routes.constants';
import { HospitalPlan, IHospitalPlanList, IInsurancePlan } from '../comprehensive-types';
import { ComprehensiveService } from '../comprehensive.service';
import { ProgressTrackerService } from './../../shared/modal/progress-tracker/progress-tracker.service';
import { AboutAge } from './../../shared/utils/about-age.util';
import { COMPREHENSIVE_CONST } from './../comprehensive-config.constants';

@Component({
  selector: 'app-insurance-plan',
  templateUrl: './insurance-plan.component.html',
  styleUrls: ['./insurance-plan.component.scss']
})
export class InsurancePlanComponent implements OnInit, OnDestroy {
  pageTitle: any;
  pageId: string;
  menuClickSubscription: Subscription;
  subscription: Subscription;
  insurancePlanForm: FormGroup;
  insurancePlanFormValues: IInsurancePlan;
  longTermInsurance = true;
  haveHDB = false;
  submitted = false;
  insurancePlanningDependantModal: any;
  insurancePlanningNonDependantModal: any;
  summaryRouterFlag: boolean;
  routerEnabled = false;
  hospitalType: string;
  hospitalPlanList: IHospitalPlanList[];
  DownLuck: HospitalPlan;
  viewMode: boolean;
  constructor(
    private navbarService: NavbarService, private progressService: ProgressTrackerService,
    private translate: TranslateService,
    private formBuilder: FormBuilder, private configService: ConfigService, private router: Router,
    private comprehensiveService: ComprehensiveService, private comprehensiveApiService: ComprehensiveApiService,
    private age: AboutAge, private route: ActivatedRoute, private apiService: ApiService) {
    this.routerEnabled = this.summaryRouterFlag = COMPREHENSIVE_CONST.SUMMARY_CALC_CONST.ROUTER_CONFIG.STEP3;
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
        if (this.route.snapshot.paramMap.get('summary') === 'summary' && this.summaryRouterFlag === true) {
          this.routerEnabled = !this.summaryRouterFlag;
          this.showSummaryModal();
        }
      });
      if (this.comprehensiveService.getMySpendings().HLtypeOfHome === 'HDB') {
        this.haveHDB = true;
      }
    });
    if (this.comprehensiveService.getMyProfile() &&
      this.age.calculateAge(this.comprehensiveService.getMyProfile().dateOfBirth, new Date()) < 41) {
      this.longTermInsurance = false;
    }
    this.hospitalPlanList = this.comprehensiveService.getHospitalPlan();
    if (this.hospitalPlanList.length === 0) {
      this.apiService.getHospitalPlanList().subscribe((hospitalPlanData: any) => {
        this.hospitalPlanList = hospitalPlanData.objectList;
        this.comprehensiveService.setHospitalPlan(hospitalPlanData.objectList);
      });
    }
    this.hospitalType = this.comprehensiveService.getDownOnLuck().hospitalPlanName;
    this.insurancePlanFormValues = this.comprehensiveService.getInsurancePlanningList();
    this.buildInsuranceForm();
    this.progressService.setProgressTrackerData(this.comprehensiveService.generateProgressTrackerData());
  }

  buildInsuranceForm() {
    this.insurancePlanForm = this.formBuilder.group({
      haveHospitalPlan: [{
        value: this.insurancePlanFormValues ? this.insurancePlanFormValues.haveHospitalPlan
          : '', disabled: this.viewMode
      }, [Validators.required]],
      haveCPFDependentsProtectionScheme: [{
        value: this.insurancePlanFormValues ?
          this.insurancePlanFormValues.haveCPFDependentsProtectionScheme : '', disabled: this.viewMode
      }, [Validators.required]],
      lifeProtectionAmount: [{
        value: this.insurancePlanFormValues ? this.insurancePlanFormValues.lifeProtectionAmount : '', disabled: this.viewMode
      }, [Validators.required]],
      haveHDBHomeProtectionScheme: [{
        value: this.insurancePlanFormValues ? this.insurancePlanFormValues.haveHDBHomeProtectionScheme : '',
        disabled: this.viewMode
      }, [Validators.required]],
      homeProtectionCoverageAmount: [{
        value: this.insurancePlanFormValues ? this.insurancePlanFormValues.homeProtectionCoverageAmount : '',
        disabled: this.viewMode
      }, [Validators.required]],
      otherLifeProtectionCoverageAmount: [{
        value: this.insurancePlanFormValues ?
          this.insurancePlanFormValues.otherLifeProtectionCoverageAmount : '', disabled: this.viewMode
      }, [Validators.required]],
      criticalIllnessCoverageAmount: [this.insurancePlanFormValues ? this.insurancePlanFormValues.criticalIllnessCoverageAmount :
        '', [Validators.required]],
      disabilityIncomeCoverageAmount: [{
        value: this.insurancePlanFormValues ?
          this.insurancePlanFormValues.disabilityIncomeCoverageAmount : '', disabled: this.viewMode
      }, [Validators.required]],
      haveLongTermElderShield: [{
        value: this.insurancePlanFormValues ? this.insurancePlanFormValues.haveLongTermElderShield :
          '', disabled: this.viewMode
      }, [Validators.required]],
      longTermElderShieldAmount: [{
        value: this.insurancePlanFormValues ? this.insurancePlanFormValues.longTermElderShieldAmount
          : '', disabled: this.viewMode
      }, [Validators.required]],
    });
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
      if (!form.pristine || cmpSummary.comprehensiveInsurancePlanning === null) {
        form.value.enquiryId = this.comprehensiveService.getEnquiryId();
        this.comprehensiveService.setInsurancePlanningList(form.value);
        this.comprehensiveApiService.saveInsurancePlanning(form.value).subscribe((data) => {
          this.showSummaryModal();
        });
      } else {
        this.showSummaryModal();
      }
    }
  }
  showSummaryModal() {
    if (this.routerEnabled) {
      this.router.navigate([COMPREHENSIVE_ROUTE_PATHS.INSURANCE_PLAN + '/summary']);
    } else {
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
        this.comprehensiveApiService.getInsurancePlanning().subscribe(
          (data: any) => {
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
  }
  showToolTipModal(toolTipTitle, toolTipMessage) {
    const toolTipParams = {
      TITLE: this.translate.instant('CMP.INSURANCE_PLAN.TOOLTIP.' + toolTipTitle),
      DESCRIPTION: this.translate.instant('CMP.INSURANCE_PLAN.TOOLTIP.' + toolTipMessage)
    };
    this.comprehensiveService.openTooltipModal(toolTipParams);
  }
}
