import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { NouisliderComponent } from 'ng2-nouislider';
import { LoaderService } from '../../shared/components/loader/loader.service';
import { ApiService } from '../../shared/http/api.service';
import { ComprehensiveApiService } from '../comprehensive-api.service';
import { COMPREHENSIVE_FORM_CONSTANTS } from '../comprehensive-form-constants';
import { COMPREHENSIVE_ROUTE_PATHS } from '../comprehensive-routes.constants';
import { HospitalPlan } from '../comprehensive-types';
import { ConfigService } from './../../config/config.service';
import { NavbarService } from './../../shared/navbar/navbar.service';
import { ComprehensiveService } from './../comprehensive.service';

@Component({
  selector: 'app-bad-mood-fund',
  templateUrl: './bad-mood-fund.component.html',
  styleUrls: ['./bad-mood-fund.component.scss']
})
export class BadMoodFundComponent implements OnInit, OnDestroy, AfterViewInit {
  SliderValue = 0;
  bucketImage: string;
  @ViewChild('ciMultiplierSlider') ciMultiplierSlider: NouisliderComponent;
  pageTitle: any;
  pageId: string;
  menuClickSubscription: Subscription;
  pageSubTitle: string;

  hospitalPlanForm: FormGroup;
  hospitalPlanFormValues: HospitalPlan;
  hospitalPlanList: any[];
  isFormValid = false;
  ciSliderConfig: any = {
    behaviour: 'snap',
    start: 0,
    connect: [true, false],
    format: {
      to: (value) => {
        return Math.round(value);
      },
      from: (value) => {
        return Math.round(value);
      }
    }
  };
  constructor(private route: ActivatedRoute, private router: Router, public navbarService: NavbarService,
              private loaderService: LoaderService, private apiService: ApiService,
              private translate: TranslateService, private formBuilder: FormBuilder, private configService: ConfigService,
              private comprehensiveService: ComprehensiveService, private comprehensiveApiService: ComprehensiveApiService,
  ) {
    this.pageId = this.route.routeConfig.component.name;
    this.configService.getConfig().subscribe((config: any) => {
      this.translate.setDefaultLang(config.language);
      this.translate.use(config.language);
      this.translate.get(config.common).subscribe((result: string) => {
        // meta tag and title
        this.pageTitle = this.translate.instant('CMP.COMPREHENSIVE_STEPS.STEP_2_TITLE');
        this.bucketImage = this.translate.instant('CMP.YOUR_FINANCES.BAD_MOOD_FUND_BUCKET');
        this.setPageTitle(this.pageTitle);
      });
    });
  }
  setPageTitle(title: string) {
    this.navbarService.setPageTitleWithIcon(title, { id: this.pageId, iconClass: 'navbar__menuItem--journey-map' });
  }
  onSliderChange(value): void {
    this.SliderValue = value;
  }
  ngOnInit() {
    this.navbarService.setNavbarComprehensive(true);
    this.menuClickSubscription = this.navbarService.onMenuItemClicked.subscribe((pageId) => {
      if (this.pageId === pageId) {
      }
    });
    this.hospitalPlanFormValues = this.comprehensiveService.getHospitalPlan();
    this.hospitalPlanForm = new FormGroup({
      hospitalPlanId: new FormControl(this.hospitalPlanFormValues.hospitalClassId + '', Validators.required),
      badMoodMonthlyAmount: new FormControl(this.SliderValue, Validators.required)
    });
    if (this.hospitalPlanFormValues.hospitalClassId) {
      this.isFormValid = true;
    }
    this.apiService.getHospitalPlanList().subscribe((data) => {
      this.hospitalPlanList = data.objectList; // Getting the information from the API
    });
  }

  ngAfterViewInit() {
    this.ciMultiplierSlider.writeValue(0);

  }
  validateForm(hospitalPlan) {
    this.hospitalPlanFormValues = {
      hospitalClass: hospitalPlan.hospitalClass,
      hospitalClassDescription: hospitalPlan.hospitalClassDescription,
      hospitalClassId: hospitalPlan.id
    } as HospitalPlan;
    this.isFormValid = true;
  }
  ngOnDestroy() {
    this.navbarService.unsubscribeMenuItemClick();
    this.menuClickSubscription.unsubscribe();
  }
  goToNext(form) {
    form.value.badMoodMonthlyAmount = this.SliderValue;
    form.value.enquiryId = this.comprehensiveService.getComprehensiveSummary().comprehensiveEnquiry.enquiryId;
    console.log(form.value);
    this.comprehensiveService.setDownOnLuck(form.value);
    this.comprehensiveApiService.saveDownOnLuck(form.value).subscribe((data:
      any) => {

    });
    // this.router.navigate([COMPREHENSIVE_ROUTE_PATHS.MY_ASSETS]);
  }
}
