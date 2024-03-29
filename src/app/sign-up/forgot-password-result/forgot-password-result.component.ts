import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { appConstants } from './../../app.constants';

import { NavbarService } from '../../shared/navbar/navbar.service';
import { SIGN_UP_ROUTE_PATHS } from '../sign-up.routes.constants';
import { SignUpService } from '../sign-up.service';
import { FooterService } from './../../shared/footer/footer.service';
import { AppService } from './../../app.service';

@Component({
  selector: 'app-forgot-password-result',
  templateUrl: './forgot-password-result.component.html',
  styleUrls: ['./forgot-password-result.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ForgotPasswordResultComponent implements OnInit {
  verifyEmail = false;
  organisationEnabled = false;
  constructor(
    public readonly translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private signUpService: SignUpService,
    public navbarService: NavbarService,
    public footerService: FooterService,
    private appService: AppService
  ) {
    this.translate.use('en');
    this.translate.get('COMMON').subscribe((result: string) => {
    });
    if (this.route.snapshot.data[0]) {
      this.organisationEnabled = this.route.snapshot.data[0]['organisationEnabled'];
    }
  }

  ngOnInit() {
    this.navbarService.setNavbarVisibility(true);
    this.navbarService.setNavbarMode(101);
    this.navbarService.setNavbarMobileVisibility(false);
    this.navbarService.setNavbarShadowVisibility(false);
    this.footerService.setFooterVisibility(false);
    if (this.route.snapshot.data[0]) {
      this.verifyEmail = this.route.snapshot.data[0]['verifyEmail'];
    }

  }
  redirectToLogin() {
    if (this.signUpService.getUserType() === appConstants.USERTYPE.FINLIT) {
      this.router.navigate([SIGN_UP_ROUTE_PATHS.FINLIT_LOGIN]);
    } else if (this.organisationEnabled) {
      this.router.navigate([SIGN_UP_ROUTE_PATHS.CORPORATE_LOGIN], { queryParams: { orgID: this.appService.getCorporateDetails().uuid } });
    } else {
      this.router.navigate([SIGN_UP_ROUTE_PATHS.LOGIN]);
    }

  }
}
