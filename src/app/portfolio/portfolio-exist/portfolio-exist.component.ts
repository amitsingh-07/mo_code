import { Component, OnInit , ViewEncapsulation } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FooterService } from 'src/app/shared/footer/footer.service';
import { NavbarService } from '../../shared/navbar/navbar.service';
import { TOPUP_AND_WITHDRAW_ROUTE_PATHS } from '../../topup-and-withdraw/topup-and-withdraw-routes.constants';
import { PortfolioService } from '../portfolio.service';
import { INVESTMENT_API_BASE_URL } from './../../shared/http/api.constants';

@Component({
  selector: 'app-portfolio-exist',
  templateUrl: './portfolio-exist.component.html',
  styleUrls: ['./portfolio-exist.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PortfolioExistComponent implements OnInit {
  pageTitle: string;
  constructor(
    private router: Router,
    private portfolioService: PortfolioService,
    private formBuilder: FormBuilder,
    public navbarService: NavbarService,
    public footerService: FooterService,
    public readonly translate: TranslateService) {
    this.translate.use('en');
    const self = this;
    this.translate.get('COMMON').subscribe((result: string) => {
      self.pageTitle = 'Portfolio Already Exist';
      this.setPageTitle(self.pageTitle);
    });
  }
  setPageTitle(title: string) {
    this.navbarService.setPageTitle(title);
  }

  ngOnInit() {
    this.navbarService.setNavbarMobileVisibility(true);
    this.navbarService.setNavbarMode(6);
    this.footerService.setFooterVisibility(false);
  }
  proceed() {
    this.router.navigate([TOPUP_AND_WITHDRAW_ROUTE_PATHS.YOUR_INVESTMENT]);
  }

}
