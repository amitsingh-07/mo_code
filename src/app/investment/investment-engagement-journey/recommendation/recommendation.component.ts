import {
    AfterViewInit, ChangeDetectorRef, Component, OnInit, Renderer2, ViewEncapsulation
} from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import { FooterService } from '../../../shared/footer/footer.service';
import { HeaderService } from '../../../shared/header/header.service';
import { NavbarService } from '../../../shared/navbar/navbar.service';
import { INVESTMENT_ENGAGEMENT_JOURNEY_ROUTE_PATHS } from '../investment-engagement-journey-routes.constants';
import { INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS } from '../investment-engagement-journey.constants';
import { InvestmentEngagementJourneyService } from '../investment-engagement-journey.service';
import { ProfileIcons } from './profileIcons';
import { RiskProfile } from './riskprofile';

@Component({
  selector: 'app-recommendation',
  templateUrl: './recommendation.component.html',
  styleUrls: ['./recommendation.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RecommendationComponent implements OnInit, AfterViewInit {
  animateStaticModal = false;
  hideStaticModal = false;
  iconImage;
  profileid: number;
  riskProfile: string;
  htmlDescription: string;
  selectedRiskProfile: RiskProfile;
  formValues;
  pageTitle: string;
  secondIcon;
  showTwoPortfolio = false;
  showSinglePortfolio = false;
  showNoPortfolio = false;
  time;
  selectedRiskProfileId;
  portfolioButtonLabel;

  constructor(
    public readonly translate: TranslateService,
    public activeModal: NgbActiveModal,
    private router: Router,
    public headerService: HeaderService,
    private investmentEngagementJourneyService: InvestmentEngagementJourneyService,
    public navbarService: NavbarService,
    public footerService: FooterService,
    private modal: NgbModal,
    private cd: ChangeDetectorRef,
    private renderer: Renderer2
  ) {
    this.translate.use('en');
    this.translate.get('COMMON').subscribe((result: string) => {
      this.pageTitle = this.translate.instant('RISK_PROFILE.TITLE');
      this.setPageTitle(this.pageTitle);
    });
  }

  ngOnInit() {
    this.navbarService.setNavbarMobileVisibility(true);
    this.navbarService.setNavbarMode(6);
    this.footerService.setFooterVisibility(false);
    this.selectedRiskProfile = this.investmentEngagementJourneyService.getRiskProfile();
    this.iconImage = ProfileIcons[this.selectedRiskProfile.riskProfileId - 1]['icon'];
    if (this.selectedRiskProfile.alternateRiskProfileId) {
    this.secondIcon = ProfileIcons[this.selectedRiskProfile.alternateRiskProfileId - 1]['icon'];
  }
    this.showButton();
    this. buttonLabel();
  }

  ngAfterViewInit() {
    if (this.investmentEngagementJourneyService.getPortfolioRecommendationModalCounter() === 0) {
      this.renderer.addClass(document.body, 'modal-open'); // disable scroll to body
      this.investmentEngagementJourneyService.setPortfolioSplashModalCounter(1);
      this.time = setTimeout(() => {
        this.animateStaticModal = true;
      }, 3000);

      setTimeout(() => {
        this.hideStaticModal = true;
        this.renderer.removeClass(document.body, 'modal-open'); // enable scroll to body
      }, 4000);
    } else {
      this.hideStaticModal = true;
    }
    this.cd.detectChanges();
  }
  dismissFlashScreen() {
    clearTimeout(this.time);
    this.animateStaticModal = true;
    this.hideStaticModal = true;
    this.renderer.removeClass(document.body, 'modal-open'); // enable scroll to body
   }
  goToNext(RiskProfileID) {
    this.investmentEngagementJourneyService.setSelectedRiskProfileId(RiskProfileID);
    this.router.navigate([INVESTMENT_ENGAGEMENT_JOURNEY_ROUTE_PATHS.PORTFOLIO_RECOMMENDATION]);
  }
  goToHomepage() {
    this.router.navigate(['home']);
  }
 setPageTitle(title: string) {
    this.navbarService.setPageTitle(title);
  }

  canProceed() {
    return (
      this.selectedRiskProfile.riskProfileId !==
      INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.risk_profile.should_not_invest_id
    );
  }
  showButton() {
    if (this.selectedRiskProfile.riskProfileId === INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.risk_profile.should_not_invest_id) {
      this.showNoPortfolio = true;
    } else if (this.selectedRiskProfile.riskProfileId && this.selectedRiskProfile.alternateRiskProfileId) {
       // #this.showTwoPortfolio = true;
        this.showSinglePortfolio = true;
    } else {
      this.showSinglePortfolio = true;
    }
  }
  buttonLabel() {
    this.portfolioButtonLabel = {
      firstPortfolio: this.selectedRiskProfile.riskProfileName,
      secondPortfolio: this.selectedRiskProfile.alternateRiskProfileType,
     };
  }
}
