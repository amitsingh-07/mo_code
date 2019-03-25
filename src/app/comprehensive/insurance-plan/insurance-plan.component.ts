import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { ConfigService } from '../../config/config.service';
import { NavbarService } from '../../shared/navbar/navbar.service';
import { ComprehensiveApiService } from '../comprehensive-api.service';
import { COMPREHENSIVE_ROUTE_PATHS } from '../comprehensive-routes.constants';
import { IInsurancePlan } from '../comprehensive-types';
import { ComprehensiveService } from '../comprehensive.service';
import { ProgressTrackerService } from './../../shared/modal/progress-tracker/progress-tracker.service';

@Component({
  selector: 'app-insurance-plan',
  templateUrl: './insurance-plan.component.html',
  styleUrls: ['./insurance-plan.component.scss']
})
export class InsurancePlanComponent implements OnInit {
  pageTitle: any;
  pageId: string;
  menuClickSubscription: Subscription;
  insurancePlanForm: FormGroup;
  insurancePlanFormValues: IInsurancePlan;
  submitted = false;

  constructor(private navbarService: NavbarService, private progressService: ProgressTrackerService,
              private translate: TranslateService,
              private formBuilder: FormBuilder, private configService: ConfigService, private router: Router,
              private comprehensiveService: ComprehensiveService, private comprehensiveApiService: ComprehensiveApiService, ) {

    this.configService.getConfig().subscribe((config: any) => {
      this.translate.setDefaultLang(config.language);
      this.translate.use(config.language);
      this.translate.get(config.common).subscribe((result: string) => {
        // meta tag and title
        this.pageTitle = this.translate.instant('CMP.COMPREHENSIVE_STEPS.STEP_3_TITLE');
        this.setPageTitle(this.pageTitle);
      });
    });
    this.comprehensiveApiService.getInsurancePlanning().subscribe((data: IInsurancePlan) => {
      this.insurancePlanFormValues = data;
      this.buildInsuranceForm();
    });
    // Above Service Will be deleted once API is Ready
    // this.insurancePlanFormValues = this.comprehensiveService.getInsurancePlanningList();
    this.buildInsuranceForm();
    this.progressService.setProgressTrackerData(this.comprehensiveService.generateProgressTrackerData());
  }
  buildInsuranceForm() {
    this.insurancePlanForm = this.formBuilder.group({
      haveHospitalPlan: [this.insurancePlanFormValues ? this.insurancePlanFormValues.haveHospitalPlan ? 'true' : 'false'
       : '' , [Validators.required]],
      haveCPFDependentsProtectionScheme: [this.insurancePlanFormValues ? this.insurancePlanFormValues.haveCPFDependentsProtectionScheme
         : '', [Validators.required]],
      life_protection_amount: [this.insurancePlanFormValues ? this.insurancePlanFormValues.
        life_protection_amount : '', [Validators.required]],
      other_life_protection_amount: [this.insurancePlanFormValues ? this.insurancePlanFormValues.other_life_protection_amount : '',
       [Validators.required]],
      criticalIllnessCoverageAmount: [this.insurancePlanFormValues ?  this.insurancePlanFormValues.criticalIllnessCoverageAmount :
         '', [Validators.required]],
      disabilityIncomeCoverageAmount: [this.insurancePlanFormValues ?  this.insurancePlanFormValues.disabilityIncomeCoverageAmount : '' ,
       [Validators.required]],
      haveLongTermElderShield: [this.insurancePlanFormValues ?  this.insurancePlanFormValues.haveLongTermElderShield :
        '', [Validators.required]],
      longTermElderShieldAmount: [this.insurancePlanFormValues ?  this.insurancePlanFormValues.longTermElderShieldAmount
        : '', [Validators.required]],
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
  }
  setPageTitle(title: string) {
    this.navbarService.setPageTitleWithIcon(title, { id: this.pageId, iconClass: 'navbar__menuItem--journey-map' });
  }
  goToNext(form) {
    form.value.enquiryId = this.comprehensiveService.getEnquiryId();
    this.comprehensiveService.setInsurancePlanningList(form.value);
    this.router.navigate([COMPREHENSIVE_ROUTE_PATHS.RETIREMENT_PLAN]);
  }
}
