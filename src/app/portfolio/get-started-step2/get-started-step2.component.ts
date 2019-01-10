import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { HeaderService } from '../../shared/header/header.service';
import { NavbarService } from '../../shared/navbar/navbar.service';
import { PORTFOLIO_ROUTE_PATHS } from '../portfolio-routes.constants';
import { FooterService } from '../../shared/footer/footer.service';
@Component({
  selector: 'app-get-started-step2',
  templateUrl: './get-started-step2.component.html',
  styleUrls: ['./get-started-step2.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GetStartedStep2Component implements OnInit {
  title = this.translate.instant('GETSTARTED_STEP2.TITLE');
  description = this.translate.instant('GETSTARTED_STEP2.CAPTION');
  img = 'assets/images/portfolio/risk-step-2.svg';
  description2 = this.translate.instant('GETSTARTED_STEP2.DESCRIPTION');
  tab = '2';

  constructor(
    public readonly translate: TranslateService,
    public navbarService: NavbarService,
    private router: Router,
    private _location: Location,
    public headerService: HeaderService,
    public footerService: FooterService
  ) {
    this.translate.use('en');
    this.translate.get('COMMON').subscribe((result: string) => {
      this.title = this.translate.instant('GETSTARTED_STEP2.TITLE');
      this.description = this.translate.instant('GETSTARTED_STEP2.CAPTION');
      this.description2 = this.translate.instant('GETSTARTED_STEP2.DESCRIPTION');
    });
  }

  ngOnInit() {
    this.navbarService.setNavbarDirectGuided(false);
    this.footerService.setFooterVisibility(false);
  }
  goBack() {
    this._location.back();
  }
  goNext() {
    this.router.navigate([PORTFOLIO_ROUTE_PATHS.RISK_ASSESSMENT]);
  }

}
