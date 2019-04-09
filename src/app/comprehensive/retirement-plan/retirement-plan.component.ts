import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NouisliderComponent } from 'ng2-nouislider';
import { Subscription } from 'rxjs';
import { ConfigService } from '../../config/config.service';
import { ProgressTrackerService } from '../../shared/modal/progress-tracker/progress-tracker.service';
import { NavbarService } from '../../shared/navbar/navbar.service';
import { ComprehensiveApiService } from '../comprehensive-api.service';
import { COMPREHENSIVE_ROUTE_PATHS } from '../comprehensive-routes.constants';
import { IMySummaryModal } from '../comprehensive-types';
import { ComprehensiveService } from '../comprehensive.service';
import { COMPREHENSIVE_CONST } from './../comprehensive-config.constants';

@Component({
  selector: 'app-retirement-plan',
  templateUrl: './retirement-plan.component.html',
  styleUrls: ['./retirement-plan.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RetirementPlanComponent implements OnInit , AfterViewInit {
  SliderValue = 45;
  pageTitle: any;
  pageId: string;
  menuClickSubscription: Subscription;
  summaryModalDetails: IMySummaryModal;
  retireModal: any;
  summaryRouterFlag: boolean;
  routerEnabled =  false;
  @ViewChild('ciMultiplierSlider') ciMultiplierSlider: NouisliderComponent;
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
  constructor(private navbarService: NavbarService,  private progressService: ProgressTrackerService,
              private translate: TranslateService,
              private formBuilder: FormBuilder, private configService: ConfigService,
              private comprehensiveService: ComprehensiveService, private comprehensiveApiService: ComprehensiveApiService,
              private router: Router, private route: ActivatedRoute) {
    this.routerEnabled = this.summaryRouterFlag = COMPREHENSIVE_CONST.SUMMARY_CALC_CONST.ROUTER_CONFIG.STEP4;
    this.configService.getConfig().subscribe((config: any) => {
      this.translate.setDefaultLang(config.language);
      this.translate.use(config.language);
      this.translate.get(config.common).subscribe((result: string) => {
        // meta tag and title
        this.pageTitle = this.translate.instant('CMP.COMPREHENSIVE_STEPS.STEP_4_TITLE_NAV');
        this.setPageTitle(this.pageTitle);
        this.retireModal = this.translate.instant('CMP.MODAL.RETIREMENT_MODAL');
        if (this.route.snapshot.paramMap.get('summary') === 'summary' && this.summaryRouterFlag === true) {
          this.routerEnabled =  !this.summaryRouterFlag;
          this.showSummaryModal();
        }
      });
    });
    this.progressService.setProgressTrackerData(this.comprehensiveService.generateProgressTrackerData());
   }

  ngOnInit() {
    this.navbarService.setNavbarComprehensive(true);
    this.menuClickSubscription = this.navbarService.onMenuItemClicked.subscribe((pageId) => {
        if (this.pageId === pageId) {
            this.progressService.show();
        }
    });
  }
  ngAfterViewInit() {
    this.ciMultiplierSlider.writeValue(45);
    this.SliderValue = 45;
  }
  onSliderChange(value): void {
    this.SliderValue = value;
  }
  setPageTitle(title: string) {
    this.navbarService.setPageTitleWithIcon(title, { id: this.pageId, iconClass: 'navbar__menuItem--journey-map' });
  }
  goToNext(SliderValue) {
    this.showSummaryModal();
  }
  showSummaryModal() {
    if (this.routerEnabled) {
      this.router.navigate([COMPREHENSIVE_ROUTE_PATHS.RETIREMENT_PLAN + '/summary']);
    } else {
      this.summaryModalDetails = {
              setTemplateModal: 4,
              contentObj: this.retireModal,
              nextPageURL: (COMPREHENSIVE_ROUTE_PATHS.RESULT),
              routerEnabled: this.summaryRouterFlag
          };
      this.comprehensiveService.openSummaryPopUpModal(this.summaryModalDetails);
    }
  }
}
