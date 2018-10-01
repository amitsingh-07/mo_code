import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import { HeaderService } from '../../shared/header/header.service';
import { PORTFOLIO_ROUTE_PATHS, PORTFOLIO_ROUTES } from '../portfolio-routes.constants';
import { PortfolioService } from '../portfolio.service';
import { RiskProfile } from '../risk-profile/riskprofile';
import { ProfileIcons } from './profileIcons';

@Component({
  selector: 'app-risk-profile',
  templateUrl: './risk-profile.component.html',
  styleUrls: ['./risk-profile.component.scss']
})
export class RiskProfileComponent implements OnInit, AfterViewInit {
  animateStaticModal = false;
  hideStaticModal = false;
  iconImage;
  profileid: number;
  riskProfile: string;
  htmlDescription: string;
  selectedRiskProfile: RiskProfile;
  formValues;
  pageTitle: string;

  constructor(
    public readonly translate: TranslateService,
    private router: Router,
    public headerService: HeaderService,
    private portfolioService: PortfolioService,
    private modal: NgbModal) {
    this.translate.use('en');
    this.translate.get('COMMON').subscribe((result: string) => {
      this.pageTitle = this.translate.instant('RISK_PROFILE.TITLE');
      this.setPageTitle(this.pageTitle);
    });
  }

  ngOnInit() {
    this.selectedRiskProfile = this.portfolioService.getRiskProfile();
    this.iconImage = ProfileIcons[this.selectedRiskProfile.riskProfileId - 1]['icon'];
  }

  ngAfterViewInit() {
    if (this.portfolioService.getPortfolioRecommendationModalCounter() === 0) {
      this.portfolioService.setPortfolioSplashModalCounter(1);
      setInterval(() => {
        this.animateStaticModal = true;
      }, 2000);

      setInterval(() => {
        this.hideStaticModal = true;
      }, 3000);
    } else {
      this.hideStaticModal = true;
    }
  }

  goToNext() {
    this.router.navigate([PORTFOLIO_ROUTE_PATHS.PORTFOLIO_RECOMMENDATION]);
  }
  setPageTitle(title: string) {
    this.headerService.setPageTitle(title);
  }

}
