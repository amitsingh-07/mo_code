import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { FooterService } from '../../shared/footer/footer.service';
import { NavbarService } from '../../shared/navbar/navbar.service';
import { SIGN_UP_ROUTE_PATHS } from '../sign-up.routes.constants';

@Component({
  selector: 'app-corpbiz-upgrade-screen',
  templateUrl: './corpbiz-upgrade-screen.component.html',
  styleUrls: ['./corpbiz-upgrade-screen.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CorpbizUpgradeScreenComponent implements OnInit {
  subscription : Subscription;
  constructor(
    private footerService: FooterService,
    private navbarService: NavbarService,
    private router: Router,
    private readonly translate: TranslateService,
  ) {
    this.translate.use('en');
   }

   ngOnInit(): void {
    this.navbarService.setNavbarMode(106);
    this.footerService.setFooterVisibility(false);
    // To prevent browser back button
    this.subscription = this.navbarService.preventBackButton().subscribe();
    // To remove navbar in mobile view for coprbiz upgrade screen
    this.navbarService.displayingWelcomeFlowContent$.next(true);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.navbarService.displayingWelcomeFlowContent$.next(false);
  }

  goNext() {
    this.navbarService.upgradeScreenShown = true;
    this.router.navigate([SIGN_UP_ROUTE_PATHS.DASHBOARD]);
  }

}