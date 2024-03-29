import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from '../../../shared/http/auth/authentication.service';

import { FooterService } from '../../../shared/footer/footer.service';
import { HeaderService } from '../../../shared/header/header.service';
import { NavbarService } from '../../../shared/navbar/navbar.service';
import { INVESTMENT_COMMON_ROUTE_PATHS } from '../investment-common-routes.constants';

@Component({
  selector: 'app-acknowledgement',
  templateUrl: './acknowledgement.component.html',
  styleUrls: ['./acknowledgement.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AcknowledgementComponent implements OnInit {
  constructor(
    public headerService: HeaderService,
    public navbarService: NavbarService,
    public activeModal: NgbActiveModal,
    private router: Router,
    public footerService: FooterService,
    public readonly translate: TranslateService,
    public authService: AuthenticationService,
  ) {
    this.translate.use('en');
    this.translate.get('COMMON').subscribe(() => {
    });
  }

  ngOnInit() {
    this.navbarService.setNavbarMobileVisibility(true);
    this.navbarService.setNavbarMode(6);
    this.footerService.setFooterVisibility(false);
  }
  goNext() {
    this.router.navigate([INVESTMENT_COMMON_ROUTE_PATHS.CONFIRM_PORTFOLIO]);
  }
}
