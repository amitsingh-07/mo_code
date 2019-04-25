import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { NavbarService } from '../../shared/navbar/navbar.service';
import { COMPREHENSIVE_CONST } from '../comprehensive-config.constants';
import { COMPREHENSIVE_ROUTE_PATHS } from '../comprehensive-routes.constants';
import { IMyProfile } from '../comprehensive-types';
import { ConfigService } from './../../config/config.service';
import { ComprehensiveApiService } from './../comprehensive-api.service';
import { ComprehensiveService } from './../comprehensive.service';

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
  currentStep: number;
  stepDetails = {hasDependents: 1, hasEndowments: 2};
  items: any;
  constructor(private route: ActivatedRoute, private router: Router, private translate: TranslateService,
              private configService: ConfigService, private comprehensiveService: ComprehensiveService,
              private comprehensiveApiService: ComprehensiveApiService, private datePipe: DatePipe,
              private navbarService: NavbarService) {
    this.configService.getConfig().subscribe((config) => {
      this.translate.setDefaultLang(config.language);
      this.translate.use(config.language);
    });
    this.items = [0, 1, 2, 3, 4];
    this.navbarService.setNavbarVisibility(true);
    this.navbarService.setNavbarMode(100);
    this.navbarService.setNavbarMobileVisibility(false);
    /**
     * 0 - Waiting for report
     * 1 - Completed & View Report
     * 2 - Completed & View Report with advisor
     * 3 - Not Completed
     */
    this.comprehensivePlanning = 4;
    this.comprehensiveApiService.getComprehensiveSummary().subscribe((data: any) => {
        if (data) {
          this.comprehensiveService.setComprehensiveSummary(data.objectList[0]);
          this.userDetails = this.comprehensiveService.getMyProfile();
          this.getComprehensiveSummary = this.comprehensiveService.getComprehensiveSummary();
          this.userName = this.userDetails.firstName;
          this.advisorStatus = false;
          const reportDateAPI = new Date();
          this.reportDate = this.datePipe.transform(reportDateAPI, 'dd MMM` yyyy');
          this.reportStatus = (this.getComprehensiveSummary && this.getComprehensiveSummary.comprehensiveEnquiry.reportStatus
            && this.getComprehensiveSummary.comprehensiveEnquiry.reportStatus !== null)
            ? this.getComprehensiveSummary.comprehensiveEnquiry.reportStatus : 'new';
          if (this.reportStatus === COMPREHENSIVE_CONST.REPORT_STATUS.NEW) {
            this.comprehensivePlanning = 3;
          } else if (this.reportStatus === COMPREHENSIVE_CONST.REPORT_STATUS.SUBMITTED) {
            this.comprehensivePlanning = 0;
          } else if (this.reportStatus === COMPREHENSIVE_CONST.REPORT_STATUS.READY) {
            this.comprehensivePlanning = (this.advisorStatus) ? 2 : 1;
          }
          this.currentStep = (this.getComprehensiveSummary && this.getComprehensiveSummary.comprehensiveEnquiry.stepCompleted
            && this.getComprehensiveSummary.comprehensiveEnquiry.stepCompleted !== null )
            ? this.getComprehensiveSummary.comprehensiveEnquiry.stepCompleted : 0;
        }
      });
  }

  ngOnInit() {

  }

  goToEditProfile() {
    this.router.navigate([COMPREHENSIVE_ROUTE_PATHS.GETTING_STARTED]);
  }

  goToCurrentStep() {
    if (this.currentStep >= 0  && this.currentStep < 4 ) {
      this.router.navigate([COMPREHENSIVE_ROUTE_PATHS.STEPS + '/' + (this.currentStep + 1)]);
    } else if (this.currentStep === 4) {
      this.router.navigate([COMPREHENSIVE_ROUTE_PATHS.STEPS + '/' + (this.currentStep)]);
    }
  }
  goToEditComprehensivePlan(viewMode: boolean) {
    this.comprehensiveService.setViewableMode(viewMode);
    this.router.navigate([COMPREHENSIVE_ROUTE_PATHS.GETTING_STARTED]);
  }
  getCurrentComprehensiveStep() {
    if (this.getComprehensiveSummaryEnquiry) {
    for ( const i in this.stepDetails ) {
      if (this.getComprehensiveSummaryEnquiry[i] !== true) {
        break;
      } else {
        this.currentStep = this.stepDetails[i];
      }
    }
    }
  }
}
