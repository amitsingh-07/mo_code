import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { appConstants } from './../../app.constants';

import { NavbarService } from '../../shared/navbar/navbar.service';
import { SIGN_UP_ROUTE_PATHS } from '../sign-up.routes.constants';
import { SignUpService } from '../sign-up.service';
import { FooterService } from './../../shared/footer/footer.service';

@Component({
  selector: 'app-success-message',
  templateUrl: './success-message.component.html',
  styleUrls: ['./success-message.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SuccessMessageComponent implements OnInit {
  buttonTitle;
  message;
  redirectTo;
  queryParams;

  constructor(
    // tslint:disable-next-line
    public navbarService: NavbarService,
    public footerService: FooterService,
    private signUpService: SignUpService,
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService) {
    this.translate.use('en');
    this.translate.get('COMMON').subscribe((result: string) => {
    });
  }

  ngOnInit() {
    this.navbarService.setNavbarDirectGuided(false);
    this.footerService.setFooterVisibility(false);
    this.queryParams = this.route.snapshot.queryParams;
  }
  redirectToLogin() {
    this.router.navigate([SIGN_UP_ROUTE_PATHS.LOGIN]);
  }
}
